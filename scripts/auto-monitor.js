#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 로그 디렉토리
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 로그 파일 경로
const logFile = path.join(logsDir, 'auto-monitor.log');
const errorLogFile = path.join(logsDir, 'auto-monitor-error.log');

// 로그 함수
function log(message, type = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  
  console.log(logMessage);
  
  // 파일에 로그 저장
  fs.appendFileSync(logFile, logMessage + '\n');
  
  if (type === 'ERROR') {
    fs.appendFileSync(errorLogFile, logMessage + '\n');
  }
}

// 서버 상태 확인
async function checkServerStatus() {
  return new Promise((resolve) => {
    exec('ss -tlnp | grep :3900', (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

// 서버 시작
async function startServer() {
  log('🚀 서버 시작 중...');
  
  return new Promise((resolve) => {
    // 기존 서버 프로세스 종료
    exec('pkill -f "next dev"', () => {
      // 잠시 대기
      setTimeout(async () => {
        // pm2로 서버 시작
        const serverProcess = spawn('pm2', ['start', 'ecosystem.config.js'], {
          stdio: 'pipe',
          detached: true
        });
        
        serverProcess.stdout.on('data', (data) => {
          log(`서버 출력: ${data.toString().trim()}`);
        });
        
        serverProcess.stderr.on('data', (data) => {
          log(`서버 오류: ${data.toString().trim()}`, 'ERROR');
        });
        
        serverProcess.on('close', (code) => {
          if (code === 0) {
            log('✅ 서버 시작 완료');
            resolve(true);
          } else {
            log(`❌ 서버 시작 실패 (코드: ${code})`, 'ERROR');
            resolve(false);
          }
        });
        
        // 10초 후 서버 상태 확인
        setTimeout(async () => {
          const isRunning = await checkServerStatus();
          if (isRunning) {
            log('✅ 서버가 정상적으로 실행 중입니다');
            resolve(true);
          } else {
            log('❌ 서버 시작 실패', 'ERROR');
            resolve(false);
          }
        }, 10000);
        
      }, 2000);
    });
  });
}

// 브라우저 자동 실행
async function startBrowser() {
  log('🌐 브라우저 자동 실행 중...');
  
  try {
    // Chrome 브라우저 실행 (headless 모드)
    const browserProcess = spawn('google-chrome', [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--remote-debugging-port=9222',
      'http://localhost:3900/'
    ], {
      stdio: 'pipe',
      detached: true
    });
    
    browserProcess.stdout.on('data', (data) => {
      log(`브라우저 출력: ${data.toString().trim()}`);
    });
    
    browserProcess.stderr.on('data', (data) => {
      log(`브라우저 오류: ${data.toString().trim()}`, 'ERROR');
    });
    
    browserProcess.on('close', (code) => {
      log(`브라우저 프로세스 종료 (코드: ${code})`);
    });
    
    log('✅ 브라우저 자동 실행 완료');
    return true;
    
  } catch (error) {
    log(`❌ 브라우저 실행 실패: ${error.message}`, 'ERROR');
    return false;
  }
}

// 자동 테스트 실행
async function runAutoTest() {
  log('🧪 자동 테스트 실행 중...');
  
  try {
    const testProcess = spawn('npm', ['run', 'test:booking:basic'], {
      stdio: 'pipe',
      detached: true
    });
    
    testProcess.stdout.on('data', (data) => {
      log(`테스트 출력: ${data.toString().trim()}`);
    });
    
    testProcess.stderr.on('data', (data) => {
      log(`테스트 오류: ${data.toString().trim()}`, 'ERROR');
    });
    
    testProcess.on('close', (code) => {
      log(`테스트 완료 (코드: ${code})`);
    });
    
    log('✅ 자동 테스트 실행 완료');
    return true;
    
  } catch (error) {
    log(`❌ 테스트 실행 실패: ${error.message}`, 'ERROR');
    return false;
  }
}

// 상태 모니터링
async function monitorStatus() {
  log('📊 상태 모니터링 시작...');
  
  setInterval(async () => {
    const serverRunning = await checkServerStatus();
    
    if (!serverRunning) {
      log('⚠️ 서버가 중단됨, 자동 재시작 시도...', 'WARN');
      await startServer();
    } else {
      log('✅ 서버 정상 실행 중');
    }
    
    // 메모리 사용량 확인
    exec('free -h', (error, stdout, stderr) => {
      if (!error) {
        const lines = stdout.split('\n');
        const memLine = lines[1];
        if (memLine) {
          const memInfo = memLine.split(/\s+/);
          const used = memInfo[2];
          const total = memInfo[1];
          log(`💾 메모리 사용량: ${used}/${total}`);
        }
      }
    });
    
    // 디스크 사용량 확인
    exec('df -h .', (error, stdout, stderr) => {
      if (!error) {
        const lines = stdout.split('\n');
        const diskLine = lines[1];
        if (diskLine) {
          const diskInfo = diskLine.split(/\s+/);
          const used = diskInfo[4];
          log(`💿 디스크 사용량: ${used}`);
        }
      }
    });
    
  }, 30000); // 30초마다 체크
}

// 메인 실행 함수
async function main() {
  log('🚀 자동 모니터링 시스템 시작...');
  
  try {
    // 1. 서버 시작
    const serverStarted = await startServer();
    if (!serverStarted) {
      log('❌ 서버 시작 실패, 프로그램 종료', 'ERROR');
      process.exit(1);
    }
    
    // 2. 잠시 대기
    log('⏳ 서버 안정화 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
    // 3. 브라우저 시작
    await startBrowser();
    
    // 4. 자동 테스트 실행
    setTimeout(async () => {
      await runAutoTest();
    }, 5000);
    
    // 5. 상태 모니터링 시작
    monitorStatus();
    
    log('🎉 자동 모니터링 시스템이 정상적으로 시작되었습니다!');
    log('💡 시스템은 백그라운드에서 계속 실행됩니다.');
    log('📋 모니터링 로그: logs/auto-monitor.log');
    log('📋 오류 로그: logs/auto-monitor-error.log');
    
  } catch (error) {
    log(`❌ 메인 실행 오류: ${error.message}`, 'ERROR');
    process.exit(1);
  }
}

// 프로세스 종료 처리
process.on('SIGINT', () => {
  log('🛑 프로그램 종료 신호 수신...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  log('🛑 프로그램 종료 신호 수신...');
  process.exit(0);
});

// 예상치 못한 오류 처리
process.on('uncaughtException', (error) => {
  log(`❌ 예상치 못한 오류: ${error.message}`, 'ERROR');
  log(`스택 트레이스: ${error.stack}`, 'ERROR');
});

process.on('unhandledRejection', (reason, promise) => {
  log(`❌ 처리되지 않은 Promise 거부: ${reason}`, 'ERROR');
});

// 메인 실행
if (require.main === module) {
  main().catch(error => {
    log(`❌ 메인 실행 실패: ${error.message}`, 'ERROR');
    process.exit(1);
  });
}

module.exports = { main, startServer, startBrowser, runAutoTest };
