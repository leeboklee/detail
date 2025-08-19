const { spawn } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

class AIServerManager {
  constructor(port = 3900) {
    this.port = port;
    this.serverProcess = null;
    this.isRunning = false;
    this.monitorInterval = null;
    this.restartCount = 0;
    this.maxRestarts = 50; // 더 많은 재시작 허용
    this.logFile = path.join(process.cwd(), 'logs', 'ai-server-manager.log');
    
    // 로그 디렉토리 생성
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
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

  async killExistingProcesses() {
    try {
      this.log('🔧 AI: 기존 프로세스 정리 중...');
      await execAsync(`npx cross-port-killer ${this.port}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.log('✅ AI: 프로세스 정리 완료');
    } catch (error) {
      this.log(`⚠️ AI: 프로세스 정리 중 오류 (무시): ${error.message}`);
    }
  }

  async forceKillAllNode() {
    try {
      this.log('🛑 AI: 모든 Node.js 프로세스 강제 종료 중...');
      await execAsync('powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force"');
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.log('✅ AI: Node.js 프로세스 정리 완료');
    } catch (error) {
      this.log(`⚠️ AI: Node.js 프로세스 정리 중 오류 (무시): ${error.message}`);
    }
  }

  startServer() {
    if (this.isRunning) {
      this.log('⚠️ AI: 서버가 이미 실행 중입니다.');
      return;
    }

    this.isRunning = true;
    this.restartCount++;
    
    this.log(`🚀 AI: 서버 시작 중... (재시작 횟수: ${this.restartCount}/${this.maxRestarts})`);
    
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
      this.log(`[서버] ${output.trim()}`);
      
      // 서버 준비 완료 감지
      if (output.includes('Ready') || output.includes('Local:')) {
        this.log('✅ AI: 서버가 성공적으로 시작되었습니다!');
        this.log(`🌐 AI: 접속 주소: http://localhost:${this.port}`);
      }
    });

    this.serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('warn')) {
        this.log(`⚠️ AI: 서버 오류: ${error.trim()}`);
      }
    });

    // 서버 종료 처리
    this.serverProcess.on('close', (code) => {
      this.log(`❌ AI: 서버가 종료되었습니다. (코드: ${code})`);
      this.isRunning = false;
      
      if (this.restartCount < this.maxRestarts) {
        this.log('🔄 AI: 3초 후 자동 재시작...');
        setTimeout(() => {
          this.restartServer();
        }, 3000);
      } else {
        this.log('❌ AI: 최대 재시작 횟수에 도달했습니다. 수동으로 재시작해주세요.');
        this.stop();
      }
    });

    this.serverProcess.on('error', (error) => {
      this.log(`❌ AI: 서버 시작 실패: ${error.message}`);
      this.isRunning = false;
      
      // 서버 시작 실패 시 즉시 재시작
      if (this.restartCount < this.maxRestarts) {
        this.log('🔄 AI: 서버 시작 실패, 즉시 재시작...');
        setTimeout(() => {
          this.restartServer();
        }, 2000);
      }
    });
    
    // 서버 시작 타임아웃 처리
    setTimeout(() => {
      if (!this.isRunning) {
        this.log('⏰ AI: 서버 시작 타임아웃, 재시작...');
        this.restartServer();
      }
    }, 30000); // 30초 타임아웃
  }

  async restartServer() {
    this.log('🔄 AI: 서버 재시작 중...');
    
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    
    await this.killExistingProcesses();
    await this.forceKillAllNode();
    this.startServer();
  }

  async monitor() {
    this.log('🔍 AI: 서버 모니터링 시작...');
    this.log(`📊 AI: 포트 ${this.port} 모니터링 중...`);
    
    // 초기 서버 시작
    await this.killExistingProcesses();
    await this.forceKillAllNode();
    
    // 서버 시작 시도
    this.log('🚀 AI: 초기 서버 시작 시도...');
    this.startServer();
    
    // 서버 시작 확인
    setTimeout(async () => {
      const isPortActive = await this.checkPort();
      if (!isPortActive) {
        this.log('⚠️ AI: 초기 서버 시작 실패, 재시작...');
        this.restartServer();
      }
    }, 10000); // 10초 후 확인
    
    // 주기적으로 포트 상태 확인 (더 자주 확인)
    this.monitorInterval = setInterval(async () => {
      const isPortActive = await this.checkPort();
      
      if (!isPortActive && this.isRunning) {
        this.log('⚠️ AI: 포트가 비활성화되었습니다. 재시작 중...');
        this.restartServer();
      } else if (isPortActive) {
        this.log('✅ AI: 서버 정상 실행 중 (포트: 3900)');
      } else if (!isPortActive && !this.isRunning) {
        this.log('⚠️ AI: 서버가 실행되지 않음, 재시작...');
        this.restartServer();
      }
    }, 10000); // 10초마다 확인 (더 자주)
  }

  stop() {
    this.log('🛑 AI: 서버 중지 중...');
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }
    this.isRunning = false;
    process.exit(0);
  }

  async getStatus() {
    const isPortActive = await this.checkPort();
    const status = {
      port: this.port,
      isRunning: this.isRunning,
      isPortActive: isPortActive,
      restartCount: this.restartCount,
      maxRestarts: this.maxRestarts
    };
    
    this.log(`📊 AI: 서버 상태 - 포트: ${status.port}, 실행중: ${status.isRunning}, 포트활성: ${status.isPortActive}, 재시작횟수: ${status.restartCount}/${status.maxRestarts}`);
    return status;
  }
}

// CLI 사용법
async function main() {
  const args = process.argv.slice(2);
  const manager = new AIServerManager(3900);
  
  // Ctrl+C 처리
  process.on('SIGINT', () => {
    manager.log('\n🛑 AI: 사용자에 의해 중지됨');
    manager.stop();
  });
  
  // 프로세스 종료 처리
  process.on('SIGTERM', () => {
    manager.log('\n🛑 AI: 프로세스 종료 신호 수신');
    manager.stop();
  });
  
  // 예상치 못한 오류 처리
  process.on('uncaughtException', (error) => {
    manager.log(`❌ AI: 예상치 못한 오류: ${error.message}`);
    manager.restartServer();
  });
  
  switch (args[0]) {
    case 'start':
      try {
        await manager.monitor();
      } catch (error) {
        manager.log(`❌ AI: 모니터링 실패: ${error.message}`);
        process.exit(1);
      }
      break;
    case 'status':
      await manager.getStatus();
      break;
    case 'restart':
      await manager.restartServer();
      break;
    case 'stop':
      manager.stop();
      break;
    default:
      manager.log('🤖 AI 서버 관리자');
      manager.log('');
      manager.log('사용법:');
      manager.log('  node scripts/ai-server-manager.cjs start    - AI 모니터링 시작');
      manager.log('  node scripts/ai-server-manager.cjs status   - 서버 상태 확인');
      manager.log('  node scripts/ai-server-manager.cjs restart  - 서버 재시작');
      manager.log('  node scripts/ai-server-manager.cjs stop     - 서버 중지');
      manager.log('');
      manager.log('🤖 AI가 자동으로 서버를 관리합니다!');
  }
}

if (require.main === module) {
  main();
}

module.exports = AIServerManager; 