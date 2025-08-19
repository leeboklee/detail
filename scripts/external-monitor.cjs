const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

class ExternalMonitor {
  constructor() {
    this.port = 3900;
    this.checkInterval = 5000; // 5초마다 확인
    this.serverProcess = null;
    this.isRestarting = false;
    this.restartCount = 0;
    this.maxRestarts = 50;
    this.logFile = path.join(process.cwd(), 'logs', 'external-monitor.log');
    
    // 로그 디렉토리 생성
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(`🔍 [외부감지] ${message}`);
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

  async killPort() {
    try {
      this.log('🔧 포트 정리 중...');
      await execAsync(`npx cross-port-killer ${this.port}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.log('✅ 포트 정리 완료');
    } catch (error) {
      this.log('⚠️ 포트 정리 중 오류 (무시): ' + error.message);
    }
  }

  async startServer() {
    if (this.isRestarting) {
      this.log('⚠️ 이미 재시작 중입니다.');
      return;
    }

    this.isRestarting = true;
    this.restartCount++;

    this.log(`🚀 내부 서버 시작 중... (재시작 횟수: ${this.restartCount}/${this.maxRestarts})`);

    // Next.js 서버 시작
    this.serverProcess = spawn('npx', ['next', 'dev', '-p', this.port.toString()], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd()
    });

    // 서버 출력 처리
    this.serverProcess.stdout.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        this.log(`📤 서버: ${output}`);
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      const error = data.toString().trim();
      if (error) {
        this.log(`❌ 서버오류: ${error}`);
      }
    });

    // 서버 종료 처리
    this.serverProcess.on('close', (code) => {
      this.log(`❌ 내부 서버가 종료되었습니다. (코드: ${code})`);
      this.isRestarting = false;

      if (this.restartCount < this.maxRestarts) {
        this.log('🔄 3초 후 자동 재시작...');
        setTimeout(() => {
          this.restartServer();
        }, 3000);
      } else {
        this.log('❌ 최대 재시작 횟수에 도달했습니다.');
      }
    });

    this.serverProcess.on('error', (error) => {
      this.log('❌ 내부 서버 시작 실패: ' + error.message);
      this.isRestarting = false;

      if (this.restartCount < this.maxRestarts) {
        this.log('🔄 서버 시작 실패, 재시작...');
        setTimeout(() => {
          this.restartServer();
        }, 2000);
      }
    });

    // 서버 시작 확인
    setTimeout(() => {
      this.isRestarting = false;
    }, 10000);
  }

  async restartServer() {
    this.log('🔄 내부 서버 재시작 중...');

    if (this.serverProcess) {
      this.serverProcess.kill();
    }

    await this.killPort();
    await this.startServer();
  }

  async monitor() {
    this.log('🔍 외부 서버 모니터링 시작...');
    this.log(`📊 포트 ${this.port} 감시 중...`);

    // 초기 서버 시작
    await this.startServer();

    // 주기적으로 포트 상태 확인
    setInterval(async () => {
      const isPortActive = await this.checkPort();

      if (!isPortActive && !this.isRestarting) {
        this.log('⚠️ 포트가 비활성화되었습니다. 내부 서버 재시작...');
        this.restartServer();
      } else if (isPortActive) {
        this.log('✅ 내부 서버 정상 실행 중 (포트: 3900)');
      }
    }, this.checkInterval);
  }

  stop() {
    this.log('🛑 외부 모니터링 중지 중...');
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    process.exit(0);
  }
}

// CLI 사용법
async function main() {
  const monitor = new ExternalMonitor();

  // Ctrl+C 처리
  process.on('SIGINT', () => {
    console.log('\n🛑 사용자에 의해 중지됨');
    monitor.stop();
  });

  // 프로세스 종료 처리
  process.on('SIGTERM', () => {
    console.log('\n🛑 프로세스 종료 신호 수신');
    monitor.stop();
  });

  try {
    await monitor.monitor();
  } catch (error) {
    console.error('❌ 외부 모니터링 실패:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = ExternalMonitor; 