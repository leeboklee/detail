import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class ServerWatchdog {
  constructor() {
    this.port = 3900;
    this.checkInterval = 5000; // 5초마다 체크
    this.maxRetries = 10;
    this.retryCount = 0;
    this.isRestarting = false;
    this.serverProcess = null;
    this.healthCheckCount = 0;
    this.maxHealthFailures = 3;
  }

  async checkServerHealth() {
    try {
      const { stdout } = await execAsync(`curl -I http://localhost:${this.port} --connect-timeout 3 --max-time 5`);
      return stdout.includes('HTTP/1.1 200') || stdout.includes('HTTP/2 200');
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
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      const lines = stdout.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[4];
          if (pid && !isNaN(pid)) {
            await execAsync(`taskkill /F /PID ${pid}`);
            console.log(`✅ 포트 ${this.port}의 프로세스 ${pid} 종료`);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ 포트 프로세스 종료 중 오류:', error.message);
    }
  }

  async startServer() {
    try {
      console.log('🚀 서버 시작 중...');
      
      // 포트 정리
      await this.killProcessOnPort();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 서버 시작
      this.serverProcess = spawn('npm', ['run', 'dev'], {
        cwd: process.cwd(),
        stdio: 'pipe',
        env: { 
          ...process.env, 
          NODE_OPTIONS: '--max-old-space-size=4096',
          NEXT_TELEMETRY_DISABLED: '1'
        }
      });
      
      this.serverProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`[서버] ${output}`);
        
        if (output.includes('Ready in') || output.includes('Local:') || output.includes('✓ Ready')) {
          console.log('🎉 서버 시작 완료!');
          this.healthCheckCount = 0;
        }
      });
      
      this.serverProcess.stderr.on('data', (data) => {
        const error = data.toString().trim();
        console.log(`[서버 오류] ${error}`);
      });
      
      this.serverProcess.on('close', (code) => {
        console.log(`[서버 종료] 코드: ${code}`);
        if (code !== 0) {
          console.log('⚠️ 서버가 비정상 종료됨');
          this.scheduleRestart();
        }
      });
      
      this.serverProcess.on('error', (error) => {
        console.log(`[서버 오류] ${error.message}`);
        this.scheduleRestart();
      });
      
      return true;
    } catch (error) {
      console.log('❌ 서버 시작 실패:', error.message);
      return false;
    }
  }

  scheduleRestart() {
    if (this.isRestarting) return;
    
    console.log('🔄 3초 후 서버 재시작...');
    setTimeout(() => {
      this.restartServer();
    }, 3000);
  }

  async restartServer() {
    if (this.isRestarting) return;
    
    this.isRestarting = true;
    this.retryCount++;
    
    console.log(`🔄 서버 재시작 시도 ${this.retryCount}/${this.maxRetries}`);
    
    try {
      // 기존 프로세스 종료
      if (this.serverProcess) {
        this.serverProcess.kill('SIGTERM');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // 포트 정리
      await this.killProcessOnPort();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 서버 재시작
      const success = await this.startServer();
      
      if (success) {
        // 서버 상태 확인
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          if (await this.checkServerHealth()) {
            console.log('✅ 서버 재시작 성공!');
            this.retryCount = 0;
            this.healthCheckCount = 0;
            break;
          }
          
          if (i === 29) {
            console.log('❌ 서버 재시작 실패');
            if (this.retryCount < this.maxRetries) {
              this.scheduleRestart();
            }
          }
        }
      } else {
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
    console.log('🔍 서버 감시 시작...');
    
    setInterval(async () => {
      try {
        const isHealthy = await this.checkServerHealth();
        const portInUse = await this.checkPortUsage();
        
        console.log(`📊 상태: 서버=${isHealthy ? '정상' : '실패'}, 포트=${portInUse ? '사용중' : '비어있음'}`);
        
        if (!isHealthy) {
          this.healthCheckCount++;
          console.log(`⚠️ 서버 비정상 (${this.healthCheckCount}/${this.maxHealthFailures})`);
          
          if (this.healthCheckCount >= this.maxHealthFailures) {
            console.log('🚨 서버 복구 시작');
            await this.restartServer();
          }
        } else {
          this.healthCheckCount = 0;
        }
        
        if (!portInUse && this.healthCheckCount > 0) {
          console.log('🚨 포트 비어있음, 서버 재시작');
          await this.restartServer();
        }
        
      } catch (error) {
        console.log('❌ 모니터링 오류:', error.message);
      }
    }, this.checkInterval);
  }

  async run() {
    console.log('🚀 서버 감시 시스템 시작');
    console.log(`📍 포트: ${this.port}`);
    console.log(`⏰ 체크 간격: ${this.checkInterval/1000}초`);
    console.log(`🔄 최대 재시작: ${this.maxRetries}회`);
    
    // 초기 서버 시작
    await this.startServer();
    
    // 모니터링 시작
    await this.monitor();
    
    // 무한 루프
    while (true) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const watchdog = new ServerWatchdog();
  watchdog.run().catch(error => {
    console.error('❌ 감시 시스템 오류:', error);
    process.exit(1);
  });
}

export default ServerWatchdog; 