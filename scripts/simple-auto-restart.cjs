const { spawn } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class SimpleAutoRestart {
  constructor(port = 3900) {
    this.port = port;
    this.serverProcess = null;
    this.isRunning = false;
    this.restartCount = 0;
    this.maxRestarts = 100;
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
      console.log('🔧 포트 정리 중...');
      await execAsync(`npx cross-port-killer ${this.port}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('✅ 포트 정리 완료');
    } catch (error) {
      console.log('⚠️ 포트 정리 중 오류 (무시):', error.message);
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
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    // 서버 종료 처리
    this.serverProcess.on('close', (code) => {
      console.log(`❌ 서버가 종료되었습니다. (코드: ${code})`);
      this.isRunning = false;
      
      if (this.restartCount < this.maxRestarts) {
        console.log('🔄 3초 후 자동 재시작...');
        setTimeout(() => {
          this.restartServer();
        }, 3000);
      } else {
        console.log('❌ 최대 재시작 횟수에 도달했습니다.');
        process.exit(1);
      }
    });

    this.serverProcess.on('error', (error) => {
      console.log('❌ 서버 시작 실패:', error.message);
      this.isRunning = false;
      
      if (this.restartCount < this.maxRestarts) {
        console.log('🔄 서버 시작 실패, 재시작...');
        setTimeout(() => {
          this.restartServer();
        }, 2000);
      }
    });
  }

  async restartServer() {
    console.log('🔄 서버 재시작 중...');
    
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    
    await this.killPort();
    this.startServer();
  }

  async monitor() {
    console.log('🔍 자동 재시작 모니터링 시작...');
    
    // 초기 서버 시작
    await this.killPort();
    this.startServer();
    
    // 주기적으로 포트 상태 확인
    setInterval(async () => {
      const isPortActive = await this.checkPort();
      
      if (!isPortActive && this.isRunning) {
        console.log('⚠️ 포트가 비활성화되었습니다. 재시작 중...');
        this.restartServer();
      } else if (isPortActive) {
        console.log('✅ 서버 정상 실행 중 (포트: 3900)');
      }
    }, 15000); // 15초마다 확인
  }

  stop() {
    console.log('🛑 서버 중지 중...');
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    this.isRunning = false;
    process.exit(0);
  }
}

// CLI 사용법
async function main() {
  const server = new SimpleAutoRestart(3900);
  
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

module.exports = SimpleAutoRestart; 