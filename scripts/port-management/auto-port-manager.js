import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class PortManager {
  constructor(port = 3900) {
    this.port = port;
    this.logFile = path.join(__dirname, '../../logs/port-manager.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;
    
    // 콘솔 출력
    console.log(message);
    
    // 파일 로그
    fs.appendFileSync(this.logFile, logMessage);
  }

  // 위험한 명령어 감지 및 경고
  detectDangerousCommand(command) {
    const dangerousPatterns = [
      /taskkill\s+\/f\s+\/im\s+node\.exe/i,
      /taskkill\s+\/f\s+\/im\s+.*\.exe/i,
      /killall\s+node/i,
      /pkill\s+-f\s+node/i
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(command)) {
        this.log(`🚨 위험한 전체 프로세스 킬 명령어 감지: ${command}`, 'WARNING');
        this.log('💡 대신 포트별 정확한 킬을 사용하세요: node scripts/port-management/auto-port-manager.js kill', 'SUGGESTION');
        return true;
      }
    }
    return false;
  }

  // 안전한 포트 킬 실행
  async killPortSpecificProcesses() {
    return new Promise((resolve) => {
      exec(`netstat -ano | findstr :${this.port} | findstr LISTENING`, (error, stdout) => {
        if (error || !stdout.trim()) {
          this.log(`✅ 포트 ${this.port}를 사용하는 프로세스가 없습니다.`);
          resolve(true);
          return;
        }

        const lines = stdout.trim().split('\n');
        const pids = lines.map(line => {
          const match = line.match(/\s+(\d+)$/);
          return match ? match[1] : null;
        }).filter(Boolean);

        if (pids.length === 0) {
          resolve(true);
          return;
        }

        this.log(`🔄 포트 ${this.port} 관련 프로세스 ${pids.length}개 종료 중...`);
        
        const killPromises = pids.map(pid => {
          return new Promise((resolveKill) => {
            exec(`Get-Process -Id ${pid} | Select-Object ProcessName,Id | ConvertTo-Json`,
              { shell: 'powershell.exe' }, (infoError, infoStdout) => {
              if (infoError) {
                this.log(`⚠️ PID ${pid} 정보 확인 실패`);
                resolveKill(false);
                return;
              }

              try {
                const processInfo = JSON.parse(infoStdout);
                this.log(`🔍 PID ${pid} (${processInfo.ProcessName}) 종료 중...`);
                
                exec(`taskkill /f /pid ${pid}`, (killError) => {
                  if (!killError) {
                    this.log(`✅ PID ${pid} (${processInfo.ProcessName}) 종료 완료`);
                  } else {
                    this.log(`❌ PID ${pid} 종료 실패`);
                  }
                  resolveKill(!killError);
                });
              } catch (parseError) {
                this.log(`⚠️ PID ${pid} 정보 파싱 실패`);
                resolveKill(false);
              }
            });
          });
        });

        Promise.all(killPromises).then((results) => {
          const successCount = results.filter(Boolean).length;
          this.log(`📊 포트 ${this.port} 프로세스 종료 결과: ${successCount}/${pids.length} 성공`);
          resolve(successCount > 0);
        });
      });
    });
  }

  // 포트 상태 확인
  async checkPortStatus() {
    return new Promise((resolve) => {
      exec(`netstat -ano | findstr :${this.port} | findstr LISTENING`, (error, stdout) => {
        if (error || !stdout.trim()) {
          this.log(`✅ 포트 ${this.port}가 사용 가능합니다.`);
          resolve({ available: true, processes: [] });
        } else {
          const lines = stdout.trim().split('\n');
          const processes = lines.map(line => {
            const match = line.match(/\s+(\d+)$/);
            return match ? match[1] : null;
          }).filter(Boolean);
          
          this.log(`⚠️ 포트 ${this.port}가 사용 중입니다. (PID: ${processes.join(', ')})`);
          resolve({ available: false, processes });
        }
      });
    });
  }

  // 메인 실행 함수
  async run() {
    const command = process.argv[2];
    
    // 위험한 명령어 감지
    if (this.detectDangerousCommand(process.argv.join(' '))) {
      process.exit(1);
    }

    switch (command) {
      case 'kill':
        this.log('🔍 포트 킬 시작...');
        await this.killPortSpecificProcesses();
        this.log('✅ 포트 킬 완료');
        break;
        
      case 'check':
        this.log('🔍 포트 상태 확인 중...');
        await this.checkPortStatus();
        break;
        
      case 'monitor':
        this.log('📊 포트 모니터링 시작...');
        setInterval(async () => {
          await this.checkPortStatus();
        }, 5000);
        break;
        
      default:
        this.log('❌ 잘못된 명령어입니다. 사용법: node auto-port-manager.js [kill|check|monitor]');
        process.exit(1);
    }
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const portManager = new PortManager();
  portManager.run().catch(error => {
    console.error('❌ 포트 매니저 오류:', error);
    process.exit(1);
  });
}

export default PortManager; 