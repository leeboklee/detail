const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

class MonitStyleManager {
  constructor() {
    this.port = 3900;
    this.checkInterval = 3000; // 3초마다 확인 (더 빠른 감지)
    this.serverProcess = null;
    this.isRestarting = false;
    this.restartCount = 0;
    this.maxRestarts = 100;
    this.logFile = path.join(process.cwd(), 'logs', 'monit-manager.log');
    this.pidFile = path.join(process.cwd(), 'logs', 'server.pid');
    
    // 로그 디렉토리 생성
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}] ${message}\n`;
    console.log(`🔍 [Monit] ${message}`);
    fs.appendFileSync(this.logFile, logMessage);
  }

  async checkPort() {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      return stdout.includes(`LISTENING`) && stdout.includes(`:${this.port}`);
    } catch (error) {
      return false;
    }
  }

  async checkProcessHealth() {
    try {
      if (!fs.existsSync(this.pidFile)) {
        return false;
      }
      
      const pid = fs.readFileSync(this.pidFile, 'utf8').trim();
      const { stdout } = await execAsync(`tasklist /fi "PID eq ${pid}" /fo csv`);
      return stdout.includes(pid);
    } catch (error) {
      return false;
    }
  }

  async checkMemoryUsage() {
    try {
      const { stdout } = await execAsync(`tasklist /fi "imagename eq node.exe" /fo csv`);
      const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
      let totalMemory = 0;
      
      lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length > 4) {
          const memory = parseInt(parts[4].replace(/"/g, '').replace(' K', ''));
          if (!isNaN(memory)) {
            totalMemory += memory;
          }
        }
      });
      
      return Math.round(totalMemory / 1024);
    } catch (error) {
      return 0;
    }
  }

  async killPort() {
    try {
      this.log('🔧 포트 정리 중...', 'WARN');
      await execAsync(`npx cross-port-killer ${this.port}`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.log('✅ 포트 정리 완료', 'INFO');
    } catch (error) {
      this.log('⚠️ 포트 정리 중 오류 (무시): ' + error.message, 'WARN');
    }
  }

  async startServer() {
    if (this.isRestarting) {
      this.log('⚠️ 이미 재시작 중입니다.', 'WARN');
      return;
    }

    this.isRestarting = true;
    this.restartCount++;

    this.log(`🚀 서버 시작 중... (재시작 횟수: ${this.restartCount}/${this.maxRestarts})`, 'INFO');

    // Next.js 서버 시작
    this.serverProcess = spawn('npx', ['next', 'dev', '-p', this.port.toString()], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    // PID 파일 저장
    fs.writeFileSync(this.pidFile, this.serverProcess.pid.toString());

    // 서버 출력 처리
    this.serverProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        this.log(`📤 서버: ${output}`, 'DEBUG');
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        this.log(`❌ 서버오류: ${error}`, 'ERROR');
      }
    });

    // 서버 종료 처리
    this.serverProcess.on('close', (code) => {
      this.log(`❌ 서버가 종료되었습니다. (코드: ${code})`, 'ERROR');
      this.isRestarting = false;

      if (this.restartCount < this.maxRestarts) {
        this.log('🔄 2초 후 자동 재시작...', 'INFO');
        setTimeout(() => {
          this.restartServer();
        }, 2000);
      } else {
        this.log('❌ 최대 재시작 횟수에 도달했습니다.', 'ERROR');
      }
    });

    this.serverProcess.on('error', (error) => {
      this.log('❌ 서버 시작 실패: ' + error.message, 'ERROR');
      this.isRestarting = false;

      if (this.restartCount < this.maxRestarts) {
        this.log('🔄 서버 시작 실패, 재시작...', 'WARN');
        setTimeout(() => {
          this.restartServer();
        }, 1000);
      }
    });

    // 서버 시작 확인
    setTimeout(() => {
      this.isRestarting = false;
    }, 5000);
  }

  async restartServer() {
    this.log('🔄 서버 재시작 중...', 'INFO');

    if (this.serverProcess) {
      this.serverProcess.kill();
    }

    await this.killPort();
    await this.startServer();
  }

  async monitor() {
    this.log('🔍 M/Monit 스타일 프로세스 모니터링 시작...', 'INFO');
    this.log(`📊 포트 ${this.port} 감시 중...`, 'INFO');

    // 초기 서버 시작
    await this.startServer();

    // 주기적으로 상태 확인
    setInterval(async () => {
      const isPortActive = await this.checkPort();
      const isProcessHealthy = await this.checkProcessHealth();
      const memoryUsage = await this.checkMemoryUsage();

      // 메모리 사용량 경고
      if (memoryUsage > 500) {
        this.log(`⚠️ 메모리 사용량 높음: ${memoryUsage} MB`, 'WARN');
      }

      // 포트 비활성화 감지
      if (!isPortActive && !this.isRestarting) {
        this.log('⚠️ 포트가 비활성화되었습니다. 서버 재시작...', 'WARN');
        this.restartServer();
      } 
      // 프로세스 비정상 감지
      else if (!isProcessHealthy && !this.isRestarting) {
        this.log('⚠️ 프로세스가 비정상입니다. 서버 재시작...', 'WARN');
        this.restartServer();
      }
      // 정상 상태
      else if (isPortActive && isProcessHealthy) {
        this.log(`✅ 서버 정상 실행 중 (포트: ${this.port}, 메모리: ${memoryUsage} MB)`, 'INFO');
      }
    }, this.checkInterval);
  }

  stop() {
    this.log('🛑 모니터링 중지 중...', 'INFO');
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    if (fs.existsSync(this.pidFile)) {
      fs.unlinkSync(this.pidFile);
    }
    process.exit(0);
  }

  async getStatus() {
    const isPortActive = await this.checkPort();
    const isProcessHealthy = await this.checkProcessHealth();
    const memoryUsage = await this.checkMemoryUsage();

    return {
      port: this.port,
      isPortActive,
      isProcessHealthy,
      memoryUsage: `${memoryUsage} MB`,
      restartCount: this.restartCount,
      isRestarting: this.isRestarting
    };
  }
}

// CLI 사용법
async function main() {
  const args = process.argv.slice(2);
  const manager = new MonitStyleManager();

  switch (args[0]) {
    case 'start':
      // Ctrl+C 처리
      process.on('SIGINT', () => {
        console.log('\n🛑 사용자에 의해 중지됨');
        manager.stop();
      });

      // 프로세스 종료 처리
      process.on('SIGTERM', () => {
        console.log('\n🛑 프로세스 종료 신호 수신');
        manager.stop();
      });

      try {
        await manager.monitor();
      } catch (error) {
        console.error('❌ 모니터링 실패:', error.message);
        process.exit(1);
      }
      break;
    case 'status':
      const status = await manager.getStatus();
      console.log('📊 서버 상태:');
      console.log(`   포트: ${status.port}`);
      console.log(`   포트활성: ${status.isPortActive ? '✅' : '❌'}`);
      console.log(`   프로세스정상: ${status.isProcessHealthy ? '✅' : '❌'}`);
      console.log(`   메모리사용: ${status.memoryUsage}`);
      console.log(`   재시작횟수: ${status.restartCount}`);
      console.log(`   재시작중: ${status.isRestarting ? '✅' : '❌'}`);
      break;
    default:
      console.log('🔍 M/Monit 스타일 프로세스 관리자');
      console.log('');
      console.log('사용법:');
      console.log('  node scripts/monit-config.cjs start   - 모니터링 시작');
      console.log('  node scripts/monit-config.cjs status  - 상태 확인');
      console.log('');
      console.log('💡 M/Monit의 Pro-active 모니터링 기능을 구현했습니다!');
  }
}

if (require.main === module) {
  main();
}

module.exports = MonitStyleManager; 