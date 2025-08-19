import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class SimpleDev {
  constructor() {
    this.port = 3900;
  }

  log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  async killPort() {
    try {
      this.log('🔪 포트 정리 중...');
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      
      if (stdout) {
        const lines = stdout.split('\n').filter(line => line.trim());
        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          if (parts.length >= 5 && parts[3] === 'LISTENING') {
            const pid = parseInt(parts[4]);
            if (pid && pid !== process.pid) {
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

  async fixTailwindConfig() {
    try {
      this.log('🔧 Tailwind 설정 수정 중...');
      const configPath = path.join(process.cwd(), 'tailwind.config.js');
      
      if (fs.existsSync(configPath)) {
        let content = fs.readFileSync(configPath, 'utf8');
        
        // CommonJS → ES Module 변환
        if (content.includes('require(')) {
          content = content.replace(/const\s*{\s*heroui\s*}\s*=\s*require\(/g, 'import { heroui } from');
          content = content.replace(/module\.exports\s*=\s*/g, 'export default ');
          fs.writeFileSync(configPath, content);
          this.log('✅ Tailwind 설정 수정 완료');
        }
      }
    } catch (error) {
      this.log(`❌ Tailwind 설정 수정 실패: ${error.message}`);
    }
  }

  async startServer() {
    try {
      this.log('🚀 서버 시작 중...');
      
      // npm run dev:simple 사용 (Windows 호환)
      const serverProcess = spawn('npm', ['run', 'dev:simple'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        env: { 
          ...process.env, 
          NODE_OPTIONS: '--max-old-space-size=4096',
          NEXT_TELEMETRY_DISABLED: '1'
        }
      });

      serverProcess.on('close', (code) => {
        this.log(`[서버 종료] 코드: ${code}`);
      });

      return serverProcess;
    } catch (error) {
      this.log(`❌ 서버 시작 실패: ${error.message}`);
      return null;
    }
  }

  async run() {
    this.log('🚀 간단한 개발 서버 시작');
    
    try {
      // 1. 포트 정리
      await this.killPort();
      
      // 2. 캐시 정리
      await this.clearCache();
      
      // 3. Tailwind 설정 수정
      await this.fixTailwindConfig();
      
      // 4. 서버 시작
      await this.startServer();
      
    } catch (error) {
      this.log(`❌ 실행 실패: ${error.message}`);
    }
  }
}

// 즉시 실행
const simpleDev = new SimpleDev();
simpleDev.run().catch(error => {
  console.error('❌ 간단한 개발 서버 실패:', error);
  process.exit(1);
});

export default SimpleDev; 