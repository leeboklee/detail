/**
 * 서버 오류 자동 감지 및 복구 시스템
 * 터미널 로그를 실시간 모니터링하여 오류를 자동으로 감지하고 복구
 * 서버 상태 모니터링 및 자동 재시작 기능 포함
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// 서버 모니터링 설정
const SERVER_CONFIG = {
  port: 3900,
  checkInterval: 10000, // 10초마다 체크
  maxRetries: 3,
  restartDelay: 5000
};

// 오류 패턴 정의
const ERROR_PATTERNS = {
  // Prisma 관련 오류
  prisma: {
    patterns: [
      /@prisma\/client did not initialize yet/,
      /Please run "prisma generate"/,
      /PrismaClientKnownRequestError/,
      /PrismaClientUnknownRequestError/
    ],
    solutions: [
      'npx prisma generate',
      'npx prisma db push',
      'npx prisma migrate dev'
    ]
  },
  
  // 포트 관련 오류
  port: {
    patterns: [
      /EADDRINUSE: address already in use/,
      /Port \d+ is already in use/,
      /listen EADDRINUSE/
    ],
    solutions: [
      'netstat -ano | findstr :3900',
      'taskkill /PID {PID} /F'
    ]
  },
  
  // 메모리 관련 오류
  memory: {
    patterns: [
      /JavaScript heap out of memory/,
      /FATAL ERROR: Ineffective mark-compacts/,
      /Allocation failed/
    ],
    solutions: [
      '--max-old-space-size=4096',
      '--max-old-space-size=8192'
    ]
  },
  
  // 모듈 관련 오류
  module: {
    patterns: [
      /Cannot find module/,
      /Module not found/,
      /Error: Cannot resolve module/
    ],
    solutions: [
      'npm install',
      'npm ci',
      'rm -rf node_modules && npm install'
    ]
  },
  
  // 컴파일 오류
  compile: {
    patterns: [
      /SyntaxError:/,
      /ReferenceError:/,
      /TypeError:/,
      /Compilation failed/
    ],
    solutions: [
      'npm run build',
      'npx next build',
      'npx tsc --noEmit'
    ]
  },
  
  // 서버 종료 감지
  server_shutdown: {
    patterns: [
      /Server closed/,
      /Process exited/,
      /Terminate batch job/,
      /Server stopped/
    ],
    solutions: [
      'npm run dev'
    ]
  }
};

// 로그 디렉토리 생성
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 서버 상태 확인
async function checkServerStatus() {
  try {
    const { stdout } = await execAsync(`netstat -ano | findstr :${SERVER_CONFIG.port}`);
    return stdout.trim().length > 0;
  } catch (error) {
    return false;
  }
}

// 서버 헬스체크
async function checkServerHealth() {
  try {
    const response = await fetch(`http://localhost:${SERVER_CONFIG.port}/api/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 서버 프로세스 종료
async function killServer() {
  try {
    console.log('🔄 서버 프로세스 종료 중...');
    await execAsync(`npx cross-port-killer ${SERVER_CONFIG.port}`);
    console.log('✅ 서버 프로세스 종료 완료');
  } catch (error) {
    console.log('⚠️ 서버 프로세스 종료 실패:', error.message);
  }
}

// 서버 시작
async function startServer() {
  try {
    console.log('🚀 서버 시작 중...');
    
    const child = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: true
    });

    child.stdout.on('data', (data) => {
      console.log(`[서버] ${data.toString().trim()}`);
    });

    child.stderr.on('data', (data) => {
      console.log(`[서버 에러] ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      console.log(`[서버 종료] 코드: ${code}`);
    });

    // 서버 시작 대기
    await new Promise(resolve => setTimeout(resolve, SERVER_CONFIG.restartDelay));
    
    console.log('✅ 서버 시작 완료');
    return true;
  } catch (error) {
    console.log('❌ 서버 시작 실패:', error.message);
    return false;
  }
}

// 서버 재시작
async function restartServer() {
  console.log('🔄 서버 재시작 시도...');
  
  await killServer();
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const success = await startServer();
  
  if (success) {
    console.log('✅ 서버 재시작 성공');
  } else {
    console.log('❌ 서버 재시작 실패');
  }
  
  return success;
}

// 서버 모니터링 시작
async function startServerMonitoring() {
  console.log(`🔍 서버 모니터링 시작 (포트: ${SERVER_CONFIG.port})`);
  console.log(`⏰ 체크 간격: ${SERVER_CONFIG.checkInterval / 1000}초`);
  console.log(`🔄 최대 재시도: ${SERVER_CONFIG.maxRetries}회`);
  console.log('---');

  let retryCount = 0;

  const monitor = async () => {
    try {
      const isRunning = await checkServerStatus();
      
      if (!isRunning) {
        console.log(`❌ 서버가 중단됨 (포트: ${SERVER_CONFIG.port})`);
        
        if (retryCount < SERVER_CONFIG.maxRetries) {
          retryCount++;
          console.log(`🔄 재시작 시도 ${retryCount}/${SERVER_CONFIG.maxRetries}`);
          await restartServer();
        } else {
          console.log('❌ 최대 재시도 횟수 초과. 수동 확인 필요.');
        }
      } else {
        console.log(`✅ 서버 정상 실행 중 (포트: ${SERVER_CONFIG.port})`);
        retryCount = 0; // 성공 시 재시도 카운트 리셋
      }
    } catch (error) {
      console.log('⚠️ 모니터링 오류:', error.message);
    }

    // 다음 체크 예약
    setTimeout(monitor, SERVER_CONFIG.checkInterval);
  };

  // 첫 번째 체크 시작
  monitor();
}

// 오류 감지 및 복구
function detectAndFixError(logLine) {
  for (const [errorType, config] of Object.entries(ERROR_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(logLine)) {
        console.log(`🚨 ${errorType} 오류 감지:`, logLine);
        
        // 복구 솔루션 실행
        config.solutions.forEach(solution => {
          console.log(`🔧 복구 시도: ${solution}`);
          try {
            exec(solution, (error, stdout, stderr) => {
              if (error) {
                console.log(`❌ 복구 실패: ${error.message}`);
              } else {
                console.log(`✅ 복구 성공: ${solution}`);
              }
            });
          } catch (error) {
            console.log(`❌ 복구 실행 오류: ${error.message}`);
          }
        });
        
        return true;
      }
    }
  }
  return false;
}

// 메인 모니터링 함수
async function startMonitoring() {
  console.log('🔍 호텔 관리자 자동 오류 감지 및 복구 시스템 시작');
  console.log('📁 로그 디렉토리:', logsDir);
  console.log('---');

  // 서버 모니터링 시작
  startServerMonitoring();

  // 터미널 로그 모니터링 (옵션)
  if (process.argv.includes('--log-monitor')) {
    console.log('📝 터미널 로그 모니터링 활성화');
    // 여기에 터미널 로그 모니터링 로직 추가
  }
}

// CLI 사용법
if (require.main === module) {
  const args = process.argv.slice(2);
  
  switch (args[0]) {
    case 'start':
      startMonitoring();
      break;
    case 'check':
      checkServerStatus().then(isRunning => {
        console.log(isRunning ? '✅ 서버 실행 중' : '❌ 서버 중단됨');
        process.exit(isRunning ? 0 : 1);
      });
      break;
    case 'restart':
      restartServer();
      break;
    case 'health':
      checkServerHealth().then(isHealthy => {
        console.log(isHealthy ? '✅ 서버 정상' : '❌ 서버 비정상');
        process.exit(isHealthy ? 0 : 1);
      });
      break;
    default:
      console.log('사용법:');
      console.log('  node auto-error-handler.cjs start     # 모니터링 시작');
      console.log('  node auto-error-handler.cjs check     # 서버 상태 확인');
      console.log('  node auto-error-handler.cjs restart   # 서버 재시작');
      console.log('  node auto-error-handler.cjs health    # 서버 헬스체크');
      break;
  }
}

module.exports = {
  checkServerStatus,
  checkServerHealth,
  restartServer,
  startServerMonitoring,
  detectAndFixError,
  startMonitoring
}; 