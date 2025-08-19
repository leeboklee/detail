import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class AutoServerRestart {
  constructor() {
    this.port = 3900;
    this.checkInterval = 10000; // 10초마다 체크
    this.maxRetries = 5;
    this.retryCount = 0;
    this.isRestarting = false;
    this.serverProcess = null;
    this.restartTimeout = null;
  }

  async checkServerHealth() {
    try {
      const { stdout } = await execAsync(`curl -I http://localhost:${this.port} --connect-timeout 5`);
      return stdout.includes('HTTP/1.1 200') || stdout.includes('HTTP/2 200');
    } catch (error) {
      return false;
    }
  }

  async checkNodeProcesses() {
    try {
      const { stdout } = await execAsync('Get-Process | Where-Object {$_.ProcessName -eq "node"} | Measure-Object | Select-Object -ExpandProperty Count');
      return parseInt(stdout.trim()) > 0;
    } catch (error) {
      return false;
    }
  }

  async killAllNodeProcesses() {
    try {
      await execAsync('taskkill /F /IM node.exe');
      console.log('✅ 모든 Node 프로세스 종료 완료');
      return true;
    } catch (error) {
      console.log('⚠️ Node 프로세스 종료 중 오류:', error.message);
      return false;
    }
  }

  async startServer() {
    try {
      console.log('🚀 서버 재시작 중...');
      
      // Prisma 클라이언트 생성 (캐시 활용)
      console.log('📦 Prisma 클라이언트 생성 중...');
      await execAsync('npx prisma generate --schema=./prisma/schema.prisma');
      
      // 서버 프로세스 시작 (컴파일 속도 최적화 옵션 추가)
      console.log('🌐 Next.js 서버 시작 중...');
      this.serverProcess = spawn('npx', ['next', 'dev', '-p', '3900'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        env: { 
          ...process.env, 
          NODE_OPTIONS: '--max-old-space-size=4096',
          NEXT_TELEMETRY_DISABLED: '1',
          NODE_ENV: 'development'
        }
      });
      
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`[서버] ${output}`);
        
        // 서버 준비 완료 감지
        if (output.includes('Ready in') || output.includes('Local:') || output.includes('✓ Ready')) {
          console.log('🎉 서버 시작 완료!');
        }
      });
      
      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        console.log(`[서버 오류] ${error}`);
      });
      
      this.serverProcess.on('close', (code) => {
        console.log(`[서버 종료] 코드: ${code}`);
        if (code !== 0) {
          console.log('⚠️ 서버가 비정상 종료되었습니다.');
          this.scheduleRestart();
        }
      });
      
      this.serverProcess.on('error', (error) => {
        console.log(`[서버 오류] ${error.message}`);
        this.scheduleRestart();
      });
      
      console.log('✅ 서버 시작 명령 실행 완료');
      return true;
    } catch (error) {
      console.log('❌ 서버 시작 실패:', error.message);
      return false;
    }
  }

  scheduleRestart() {
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
    }
    
    console.log('🔄 5초 후 서버 재시작 예약...');
    this.restartTimeout = setTimeout(() => {
      this.restartServer();
    }, 5000);
  }

  async waitForServer() {
    console.log('⏳ 서버 시작 대기 중...');
    for (let i = 0; i < 60; i++) { // 60초 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (await this.checkServerHealth()) {
        console.log('✅ 서버 정상 동작 확인');
        return true;
      }
      
      if (i % 10 === 0) {
        console.log(`⏳ 서버 대기 중... (${i}/60초)`);
      }
    }
    console.log('❌ 서버 시작 시간 초과');
    return false;
  }

  async restartServer() {
    if (this.isRestarting) {
      console.log('⚠️ 이미 재시작 중입니다.');
      return;
    }

    this.isRestarting = true;
    this.retryCount++;

    console.log(`🔄 서버 재시작 시도 ${this.retryCount}/${this.maxRetries}`);

    try {
      // 1. 기존 서버 프로세스 종료
      if (this.serverProcess) {
        console.log('🛑 기존 서버 프로세스 종료 중...');
        this.serverProcess.kill('SIGTERM');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // 2. Node 프로세스 종료
      console.log('🛑 Node 프로세스 종료 중...');
      await this.killAllNodeProcesses();
      
      // 3. 잠시 대기
      console.log('⏳ 잠시 대기 중...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 4. 서버 시작
      console.log('🚀 새 서버 시작 중...');
      const startSuccess = await this.startServer();
      
      if (startSuccess) {
        // 5. 서버 상태 확인
        const serverReady = await this.waitForServer();
        
        if (serverReady) {
          console.log('🎉 서버 재시작 성공!');
          this.retryCount = 0; // 성공 시 카운터 리셋
        } else {
          console.log('❌ 서버 시작 후 응답 없음');
          if (this.retryCount < this.maxRetries) {
            this.scheduleRestart();
          }
        }
      } else {
        console.log('❌ 서버 시작 실패');
        if (this.retryCount < this.maxRetries) {
          this.scheduleRestart();
        }
      }
    } catch (error) {
      console.log('❌ 재시작 중 오류:', error.message);
      if (this.retryCount < this.maxRetries) {
        this.scheduleRestart();
      }
    } finally {
      this.isRestarting = false;
    }
  }

  async monitor() {
    console.log('🔍 서버 모니터링 시작...');
    
    setInterval(async () => {
      const hasNodeProcesses = await this.checkNodeProcesses();
      const isServerHealthy = await this.checkServerHealth();
      
      console.log(`📊 상태 체크 - Node: ${hasNodeProcesses ? '실행 중' : '없음'}, 서버: ${isServerHealthy ? '정상' : '실패'}`);
      
      if (!hasNodeProcesses || !isServerHealthy) {
        console.log('⚠️ 서버 상태 이상 감지');
        console.log(`- Node 프로세스: ${hasNodeProcesses ? '실행 중' : '없음'}`);
        console.log(`- 서버 응답: ${isServerHealthy ? '정상' : '실패'}`);
        
        if (this.retryCount < this.maxRetries) {
          await this.restartServer();
        } else {
          console.log('❌ 최대 재시작 횟수 초과. 모니터링 중단.');
          process.exit(1);
        }
      } else {
        console.log('✅ 서버 상태 정상');
      }
    }, this.checkInterval);
  }

  async run() {
    console.log('🚀 자동 서버 재시작 시스템 시작');
    console.log(`📍 포트: ${this.port}`);
    console.log(`⏰ 체크 간격: ${this.checkInterval/1000}초`);
    console.log(`🔄 최대 재시작: ${this.maxRetries}회`);
    
    // 초기 상태 확인
    const hasNodeProcesses = await this.checkNodeProcesses();
    const isServerHealthy = await this.checkServerHealth();
    
    console.log(`📊 초기 상태 - Node: ${hasNodeProcesses ? '실행 중' : '없음'}, 서버: ${isServerHealthy ? '정상' : '실패'}`);
    
    if (!hasNodeProcesses || !isServerHealthy) {
      console.log('⚠️ 초기 서버 상태 이상. 재시작 시작...');
      await this.restartServer();
    } else {
      console.log('✅ 초기 서버 상태 정상');
    }
    
    // 모니터링 시작
    await this.monitor();
    
    // 무한 루프로 계속 실행
    console.log('🔄 모니터링 루프 시작...');
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const autoRestart = new AutoServerRestart();
  autoRestart.run().catch(error => {
    console.error('❌ 자동 재시작 시스템 오류:', error);
    process.exit(1);
  });
}

export default AutoServerRestart;