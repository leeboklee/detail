import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class ErrorHandler {
  constructor() {
    this.port = 3900;
    this.maxRetries = 5;
    this.retryDelay = 3000;
    this.logFile = path.join(process.cwd(), 'error-handler.log');
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(this.logFile, logMessage);
  }

  async checkServerStatus() {
    try {
      const { stdout } = await execAsync(`curl -I http://localhost:${this.port} --connect-timeout 3 --max-time 5`);
      return {
        isRunning: true,
        statusCode: stdout.includes('HTTP/1.1 200') ? 200 : 
                   stdout.includes('HTTP/1.1 500') ? 500 : 
                   stdout.includes('HTTP/1.1 404') ? 404 : 'unknown',
        response: stdout
      };
    } catch (error) {
      return {
        isRunning: false,
        statusCode: 'connection_failed',
        response: error.message
      };
    }
  }

  async getNodeProcesses() {
    try {
      const { stdout } = await execAsync('tasklist | findstr node');
      return stdout.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return {
            name: parts[0],
            pid: parseInt(parts[1]),
            memory: parts[4]
          };
        });
    } catch (error) {
      return [];
    }
  }

  async getPortProcesses() {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      return stdout.split('\n')
        .filter(line => line.trim())
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return {
            protocol: parts[0],
            localAddress: parts[1],
            foreignAddress: parts[2],
            state: parts[3],
            pid: parseInt(parts[4])
          };
        });
    } catch (error) {
      return [];
    }
  }

  async killProcess(pid) {
    try {
      await execAsync(`taskkill /F /PID ${pid}`);
      this.log(`✅ 프로세스 ${pid} 종료 완료`);
      return true;
    } catch (error) {
      this.log(`❌ 프로세스 ${pid} 종료 실패: ${error.message}`);
      return false;
    }
  }

  async cleanPort() {
    const portProcesses = await this.getPortProcesses();
    for (const process of portProcesses) {
      if (process.pid && process.state === 'LISTENING') {
        await this.killProcess(process.pid);
      }
    }
  }

  async clearCache() {
    try {
      this.log('🧹 캐시 정리 중...');
      
      const cacheDirs = [
        '.next',
        'node_modules/.cache',
        '.turbo'
      ];
      
      for (const dir of cacheDirs) {
        if (fs.existsSync(dir)) {
          await execAsync(`Remove-Item -Recurse -Force "${dir}"`);
          this.log(`✅ ${dir} 캐시 정리 완료`);
        }
      }
    } catch (error) {
      this.log(`⚠️ 캐시 정리 중 오류: ${error.message}`);
    }
  }

  async regeneratePrisma() {
    try {
      this.log('🔄 Prisma 클라이언트 재생성 중...');
      await execAsync('npx prisma generate --schema=./prisma/schema.prisma');
      this.log('✅ Prisma 클라이언트 재생성 완료');
    } catch (error) {
      this.log(`❌ Prisma 재생성 실패: ${error.message}`);
    }
  }

  async startServer() {
    try {
      this.log('🚀 서버 시작 중...');
      
      const serverProcess = spawn('npm', ['run', 'dev:fast'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        env: { 
          ...process.env, 
          NODE_OPTIONS: '--max-old-space-size=4096',
          NEXT_TELEMETRY_DISABLED: '1'
        }
      });

      serverProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        this.log(`[서버] ${output}`);
        
        if (output.includes('Ready in') || output.includes('Local:') || output.includes('✓ Ready')) {
          this.log('🎉 서버 시작 완료!');
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        this.log(`[서버 오류] ${error}`);
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

  async waitForServer(maxWaitTime = 30000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.checkServerStatus();
      
      if (status.isRunning && status.statusCode === 200) {
        this.log('✅ 서버 정상 작동 확인!');
        return true;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    this.log('❌ 서버 시작 시간 초과');
    return false;
  }

  async diagnoseAndFix() {
    this.log('🔍 서버 진단 시작...');
    
    // 1. 현재 상태 확인
    const status = await this.checkServerStatus();
    this.log(`📊 현재 상태: ${JSON.stringify(status)}`);
    
    // 2. Node.js 프로세스 확인
    const nodeProcesses = await this.getNodeProcesses();
    this.log(`📋 Node.js 프로세스: ${nodeProcesses.length}개`);
    
    // 3. 포트 사용 현황 확인
    const portProcesses = await this.getPortProcesses();
    this.log(`🔌 포트 ${this.port} 사용 프로세스: ${portProcesses.length}개`);
    
    // 4. 오류 유형별 처리
    if (status.statusCode === 500) {
      this.log('🚨 HTTP 500 오류 감지 - 서버 재시작');
      await this.handle500Error();
    } else if (status.statusCode === 'connection_failed') {
      this.log('🚨 연결 실패 - 서버 시작');
      await this.handleConnectionError();
    } else if (status.statusCode === 404) {
      this.log('🚨 HTTP 404 오류 - 라우팅 문제');
      await this.handle404Error();
    } else {
      this.log('⚠️ 알 수 없는 오류 - 전체 재시작');
      await this.handleUnknownError();
    }
  }

  async handle500Error() {
    this.log('🔧 500 오류 처리 중...');
    
    // 1. 포트 정리
    await this.cleanPort();
    
    // 2. 캐시 정리
    await this.clearCache();
    
    // 3. Prisma 재생성
    await this.regeneratePrisma();
    
    // 4. 서버 재시작
    const serverProcess = await this.startServer();
    
    // 5. 서버 상태 확인
    const isHealthy = await this.waitForServer();
    
    if (isHealthy) {
      this.log('✅ 500 오류 복구 완료!');
    } else {
      this.log('❌ 500 오류 복구 실패');
    }
  }

  async handleConnectionError() {
    this.log('🔧 연결 오류 처리 중...');
    
    // 1. 모든 Node.js 프로세스 종료
    const nodeProcesses = await this.getNodeProcesses();
    for (const process of nodeProcesses) {
      await this.killProcess(process.pid);
    }
    
    // 2. 포트 정리
    await this.cleanPort();
    
    // 3. 잠시 대기
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. 서버 시작
    const serverProcess = await this.startServer();
    
    // 5. 서버 상태 확인
    const isHealthy = await this.waitForServer();
    
    if (isHealthy) {
      this.log('✅ 연결 오류 복구 완료!');
    } else {
      this.log('❌ 연결 오류 복구 실패');
    }
  }

  async handle404Error() {
    this.log('🔧 404 오류 처리 중...');
    
    // 1. 라우팅 파일 확인
    const routingFiles = [
      'app/page.js',
      'app/layout.js',
      'next.config.js'
    ];
    
    for (const file of routingFiles) {
      if (fs.existsSync(file)) {
        this.log(`✅ ${file} 존재 확인`);
      } else {
        this.log(`❌ ${file} 누락`);
      }
    }
    
    // 2. 서버 재시작
    await this.handle500Error();
  }

  async handleUnknownError() {
    this.log('🔧 알 수 없는 오류 처리 중...');
    
    // 1. 전체 정리
    await this.handleConnectionError();
    
    // 2. 추가 진단
    this.log('🔍 추가 진단 정보:');
    this.log(`- 작업 디렉토리: ${process.cwd()}`);
    this.log(`- Node.js 버전: ${process.version}`);
    this.log(`- 플랫폼: ${process.platform}`);
  }

  async run() {
    this.log('🚀 오류 처리 시스템 시작');
    
    try {
      await this.diagnoseAndFix();
    } catch (error) {
      this.log(`❌ 오류 처리 중 예외 발생: ${error.message}`);
    }
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const errorHandler = new ErrorHandler();
  errorHandler.run().catch(error => {
    console.error('❌ 오류 처리 시스템 실패:', error);
    process.exit(1);
  });
}

export default ErrorHandler; 