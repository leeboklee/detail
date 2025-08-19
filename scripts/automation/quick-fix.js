import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class QuickFix {
  constructor() {
    this.port = 3900;
  }

  log(message) {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  async killAllNode() {
    try {
      this.log('🔪 모든 Node.js 프로세스 종료 중...');
      await execAsync('taskkill /F /IM node.exe');
      this.log('✅ Node.js 프로세스 종료 완료');
    } catch (error) {
      this.log('⚠️ 프로세스 종료 중 오류 (정상)');
    }
  }

  async clearCache() {
    try {
      this.log('🧹 캐시 정리 중...');
      await execAsync('powershell -Command "Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue"');
      await execAsync('powershell -Command "Remove-Item -Recurse -Force node_modules\\.cache -ErrorAction SilentlyContinue"');
      this.log('✅ 캐시 정리 완료');
    } catch (error) {
      this.log('⚠️ 캐시 정리 중 오류');
    }
  }

  async regeneratePrisma() {
    try {
      this.log('🔄 Prisma 재생성 중...');
      await execAsync('npx prisma generate --schema=./prisma/schema.prisma');
      this.log('✅ Prisma 재생성 완료');
    } catch (error) {
      this.log('❌ Prisma 재생성 실패');
    }
  }

  async startServer() {
    try {
      this.log('🚀 서버 시작 중...');
      
      const serverProcess = spawn('npm', ['run', 'dev'], {
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
    this.log('🔧 빠른 오류 복구 시작');
    
    // 1. 모든 프로세스 종료
    await this.killAllNode();
    
    // 2. 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. 캐시 정리
    await this.clearCache();
    
    // 4. Prisma 재생성
    await this.regeneratePrisma();
    
    // 5. 서버 시작
    await this.startServer();
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const quickFix = new QuickFix();
  quickFix.run().catch(error => {
    console.error('❌ 빠른 복구 실패:', error);
    process.exit(1);
  });
}

export default QuickFix; 