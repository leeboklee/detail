import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class AutoErrorDetector {
  constructor() {
    this.port = 3900;
    this.serverProcess = null;
    this.isRunning = false;
    this.maxRetries = 3;
    this.retryCount = 0;
    this.watchdogPid = process.pid;
  }

  log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  async checkServerHealth() {
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${this.port}`);
      return stdout.trim() === '200';
    } catch (error) {
      return false;
    }
  }

  async checkPortUsage() {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      return stdout.trim().length > 0;
    } catch (error) {
      return false;
    }
  }

  async killProcessOnPort() {
    try {
      this.log('🔪 포트 정리 중...');
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      
      if (stdout) {
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[3] === 'LISTENING') {
            const pid = parseInt(parts[4]);
            if (pid && pid !== process.pid && pid !== this.watchdogPid) {
              this.log(`🔪 프로세스 ${pid} 종료 중...`);
              await execAsync(`taskkill /F /PID ${pid}`);
            }
          }
        }
      }
      this.log('✅ 포트 정리 완료');
    } catch (error) {
      this.log('⚠️ 포트 정리 중 오류 (정상)');
    }
  }

  async clearCache() {
    try {
      this.log('🧹 캐시 정리 중...');
      if (fs.existsSync('.next')) {
        await execAsync('Remove-Item -Recurse -Force .next');
      }
      this.log('✅ 캐시 정리 완료');
    } catch (error) {
      this.log('⚠️ 캐시 정리 중 오류 (정상)');
    }
  }

  async fixModuleFormatIssues() {
    try {
      this.log('🔧 모듈 형식 문제 수정 중...');
      
      // Tailwind 설정 수정
      const tailwindPath = path.join(process.cwd(), 'tailwind.config.js');
      if (fs.existsSync(tailwindPath)) {
        let content = fs.readFileSync(tailwindPath, 'utf8');
        if (content.includes('require(')) {
          content = content.replace(/const\s*{\s*heroui\s*}\s*=\s*require\(/g, 'import { heroui } from');
          content = content.replace(/module\.exports\s*=\s*/g, 'export default ');
          fs.writeFileSync(tailwindPath, content);
          this.log('✅ Tailwind 설정 수정 완료');
        }
      }
    } catch (error) {
      this.log(`❌ 모듈 형식 수정 실패: ${error.message}`);
    }
  }

  async regeneratePrisma() {
    try {
      this.log('🔄 Prisma 재생성 중...');
      await execAsync('npx prisma generate');
      this.log('✅ Prisma 재생성 완료');
    } catch (error) {
      this.log(`❌ Prisma 재생성 실패: ${error.message}`);
    }
  }

  async startServer() {
    try {
      this.log('🚀 서버 시작 중...');
      
      // 포트 정리
      await this.killProcessOnPort();
      
      // npx를 사용하여 next 실행
      const serverProcess = spawn('npx', ['next', 'dev', '-p', this.port.toString(), '--turbo'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        detached: true,
        env: {
          ...process.env,
          NODE_OPTIONS: '--max-old-space-size=4096',
          NEXT_TELEMETRY_DISABLED: '1'
        }
      });

      serverProcess.unref();
      
      serverProcess.on('close', (code) => {
        this.log(`[서버 종료] 코드: ${code}`);
        this.isRunning = false;
        
        if (code !== 0 && this.retryCount < this.maxRetries) {
          this.log(`🔄 서버 재시작 시도 ${this.retryCount + 1}/${this.maxRetries}`);
          this.retryCount++;
          setTimeout(() => this.handleServerError(), 2000);
        }
      });

      serverProcess.on('error', (error) => {
        this.log(`❌ 서버 오류: ${error.message}`);
        this.isRunning = false;
        this.handleServerError();
      });

      this.serverProcess = serverProcess;
      this.isRunning = true;
      this.retryCount = 0;
      
      return serverProcess;
    } catch (error) {
      this.log(`❌ 서버 시작 실패: ${error.message}`);
      return null;
    }
  }

  async handleServerError() {
    this.log('🛠️ 서버 오류 복구 중...');
    
    try {
      // 1. 모든 Node.js 프로세스 종료
      await this.killAllNodeProcesses();
      
      // 2. 캐시 정리
      await this.clearCache();
      
      // 3. 모듈 형식 문제 수정
      await this.fixModuleFormatIssues();
      
      // 4. Prisma 재생성
      await this.regeneratePrisma();
      
      // 5. 서버 재시작
      await this.startServer();
      
    } catch (error) {
      this.log(`❌ 오류 복구 실패: ${error.message}`);
    }
  }

  async killAllNodeProcesses() {
    try {
      this.log('🔪 모든 Node.js 프로세스 종료 중...');
      const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /FO CSV /NH');
      
      if (stdout && !stdout.includes('INFO')) {
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const match = line.match(/"node\.exe","(\d+)"/);
          if (match) {
            const pid = parseInt(match[1]);
            if (pid !== process.pid && pid !== this.watchdogPid) {
              this.log(`🔪 Node.js 프로세스 ${pid} 종료 중...`);
              await execAsync(`taskkill /F /PID ${pid}`);
            }
          }
        }
      }
      this.log('✅ Node.js 프로세스 정리 완료');
    } catch (error) {
      this.log('⚠️ Node.js 프로세스 정리 중 오류 (정상)');
    }
  }

  async waitForServer() {
    this.log('⏳ 서버 시작 대기 중...');
    
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (await this.checkServerHealth()) {
        this.log('✅ 서버 정상 시작됨!');
        return true;
      }
    }
    
    this.log('❌ 서버 시작 시간 초과');
    return false;
  }

  async monitor() {
    this.log('👁️ 서버 모니터링 시작...');
    
    setInterval(async () => {
      if (!this.isRunning) {
        this.log('⚠️ 서버가 실행되지 않음 - 재시작 시도');
        await this.handleServerError();
        return;
      }
      
      const isHealthy = await this.checkServerHealth();
      if (!isHealthy) {
        this.log('⚠️ 서버 상태 불량 - 복구 시도');
        await this.handleServerError();
      }
    }, 10000); // 10초마다 체크
  }

  async run() {
    this.log('🚀 자동 오류 감지 시스템 시작');
    
    try {
      // 1. 초기 정리
      await this.killAllNodeProcesses();
      await this.clearCache();
      await this.fixModuleFormatIssues();
      
      // 2. 서버 시작
      await this.startServer();
      
      // 3. 서버 시작 대기
      await this.waitForServer();
      
      // 4. 모니터링 시작
      this.monitor();
      
      this.log('✅ 자동 오류 감지 시스템 실행 중...');
      
    } catch (error) {
      this.log(`❌ 시스템 시작 실패: ${error.message}`);
      await this.handleServerError();
    }
  }

  stop() {
    this.log('🛑 자동 오류 감지 시스템 종료');
    this.isRunning = false;
    
    if (this.serverProcess) {
      this.serverProcess.kill();
    }
  }
}

// 즉시 실행
const detector = new AutoErrorDetector();

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  detector.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  detector.stop();
  process.exit(0);
});

detector.run().catch(error => {
  console.error('❌ 자동 오류 감지 시스템 실패:', error);
  process.exit(1);
});

export default AutoErrorDetector; 