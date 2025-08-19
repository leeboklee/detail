const { spawn } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class AutoRestartServer {
  constructor(port = process.env.SERVER_PORT || 3900) {
    this.port = port;
    this.serverProcess = null;
    this.restartCount = 0;
    this.maxRestarts = 20; // 재시작 횟수 증가
    this.isRunning = false;
    this.monitorInterval = null;
  }

  async checkPort() {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      return stdout.includes(`LISTENING`) && stdout.includes(`:${this.port}`);
    } catch (error) {
      return false;
    }
  }

  async killExistingProcesses() {
    try {
      console.log('🔧 기존 프로세스 정리 중...');
      await execAsync(`npx cross-port-killer ${this.port}`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // 대기 시간 증가
      console.log('✅ 프로세스 정리 완료');
    } catch (error) {
      console.log('⚠️ 프로세스 정리 중 오류 (무시):', error.message);
    }
  }

  async forceKillAllNode() {
    try {
      console.log('🛑 모든 Node.js 프로세스 강제 종료 중...');
      await execAsync('powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"');
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ Node.js 프로세스 정리 완료');
    } catch (error) {
      console.log('⚠️ Node.js 프로세스 정리 중 오류 (무시):', error.message);
    }
  }

  startServer() {
    if (this.isRunning) {
      console.log('⚠️ 서버가 이미 실행 중입니다.');
      return;
    }

    this.isRunning = true;
    this.restartCount++;
    
    console.log(`🚀 서버 시작 중... (재시작 횟수: ${this.restartCount}/${this.maxRestarts})`);
    
    // Next.js 서버 시작
    this.serverProcess = spawn('npx', ['next', 'dev', '-p', this.port.toString()], {
      stdio: 'pipe',
      shell: true,
      cwd: process.cwd(),
      env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=2048' }
    });

    // 서버 출력 처리
    this.serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output.trim());
      
      // 서버 준비 완료 감지
      if (output.includes('Ready') || output.includes('Local:')) {
        console.log('✅ 서버가 성공적으로 시작되었습니다!');
        console.log(`🌐 접속 주소: http://localhost:${this.port}`);
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('warn')) {
        console.log('⚠️ 서버 오류:', error.trim());
      }
    });

    // 서버 종료 처리
    this.serverProcess.on('close', (code) => {
      console.log(`❌ 서버가 종료되었습니다. (코드: ${code})`);
      this.isRunning = false;
      
      if (this.restartCount < this.maxRestarts) {
        console.log('🔄 5초 후 자동 재시작...'); // 대기 시간 증가
        setTimeout(() => {
          this.restartServer();
        }, 5000);
      } else {
        console.log('❌ 최대 재시작 횟수에 도달했습니다. 수동으로 재시작해주세요.');
        this.stop();
      }
    });

    this.serverProcess.on('error', (error) => {
      console.log('❌ 서버 시작 실패:', error.message);
      this.isRunning = false;
    });
  }

  async restartServer() {
    console.log('🔄 서버 재시작 중...');
    
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    
    await this.killExistingProcesses();
    await this.forceKillAllNode(); // 강제 종료 추가
    this.startServer();
  }

  async monitor() {
    console.log('🔍 서버 모니터링 시작...');
    
    // 초기 서버 시작
    await this.killExistingProcesses();
    await this.forceKillAllNode();
    this.startServer();
    
    // 주기적으로 포트 상태 확인 (더 자주 확인)
    this.monitorInterval = setInterval(async () => {
      const isPortActive = await this.checkPort();
      
      if (!isPortActive && this.isRunning) {
        console.log('⚠️ 포트가 비활성화되었습니다. 재시작 중...');
        this.restartServer();
      } else if (isPortActive) {
        console.log('✅ 서버 정상 실행 중 (포트: 3900)');
      }
    }, 15000); // 15초마다 확인 (더 자주)
  }

  stop() {
    console.log('🛑 서버 중지 중...');
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    this.isRunning = false;
    process.exit(0);
  }
}

// CLI 사용법
async function main() {
  const server = new AutoRestartServer(3900);
  
  // Ctrl+C 처리
  process.on('SIGINT', () => {
    console.log('\n🛑 사용자에 의해 중지됨');
    server.stop();
  });
  
  // 프로세스 종료 처리
  process.on('SIGTERM', () => {
    console.log('\n🛑 프로세스 종료 신호 수신');
    server.stop();
  });
  
  // 예상치 못한 오류 처리
  process.on('uncaughtException', (error) => {
    console.log('❌ 예상치 못한 오류:', error.message);
    server.restartServer();
  });
  
  try {
    await server.monitor();
  } catch (error) {
    console.error('❌ 모니터링 실패:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoRestartServer; 