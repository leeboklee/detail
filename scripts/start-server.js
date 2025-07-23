#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const open = require('open');
const { kill } = require('cross-port-killer');

// 색상 코드
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// 로그 함수들
const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`),
  title: (msg) => console.log(`${colors.bright}${colors.cyan}${msg}${colors.reset}`)
};

// 환경 변수 로드
const envPath = path.resolve(__dirname, '../.env.local');
const envLocalExists = fs.existsSync(envPath);
const envExists = fs.existsSync(path.resolve(__dirname, '../.env'));

if (envLocalExists) {
  require('dotenv').config({ path: envPath });
  log.info('.env.local 파일 로드됨');
} else if (envExists) {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  log.info('.env 파일 로드됨');
} else {
  log.warn('환경변수 파일이 없습니다. 기본 설정을 사용합니다.');
}

// 환경 변수 확인
function checkEnvironment() {
  log.title('🔍 환경 변수 확인');
  
  const requiredEnvs = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL'
  ];

  const optionalEnvs = [
    'NODE_ENV',
    'DEBUG_MODE',
    'ENABLE_CLIENT_LOGGING'
  ];

  let hasAllRequired = true;

  // 필수 환경 변수 확인
  requiredEnvs.forEach(env => {
    if (process.env[env]) {
      log.success(`✓ ${env} 설정됨`);
    } else {
      log.error(`✗ ${env} 설정 필요`);
      hasAllRequired = false;
    }
  });

  // 선택적 환경 변수 확인
  optionalEnvs.forEach(env => {
    if (process.env[env]) {
      log.info(`✓ ${env}: ${process.env[env]}`);
    } else {
      log.warn(`- ${env}: 설정되지 않음 (선택사항)`);
    }
  });

  return hasAllRequired;
}

// 포트 사용 확인 및 정리
async function checkPort(port) {
    log.info(`포트 ${port} 정리 시도...`);

    if (process.platform === 'win32') {
      try {
        const command = `for /f "tokens=5" %p in ('netstat -ano ^| findstr :${port}') do taskkill /F /PID %p`;
        execSync(command, { stdio: 'pipe', encoding: 'utf-8' }); // stdio를 pipe로 변경하고 출력을 확인
      } catch (error) {
        // taskkill은 프로세스가 없으면 오류를 반환하므로, 이를 무시하고 계속 진행
        log.warn(`포트 ${port}에서 실행 중인 프로세스를 찾지 못했거나 정리 중 오류 발생. 계속합니다.`);
      }
    } else {
      try {
        await kill(port);
      } catch (error) {
        log.warn(`포트 ${port} 정리 중 오류 발생: ${error.message}. 계속합니다.`);
      }
    }

    log.success(`포트 ${port} 정리 완료 (사용 가능)`);
    return true;
}

// 캐시 정리
function cleanCache() {
  const cleanOptions = process.env.CLEAN_CACHE;
  if (!cleanOptions) return;

  log.title('🧹 캐시 정리');
  
  const cachePaths = [
    '.next',
    'node_modules/.cache',
    '.npm/_cacache'
  ];

  cachePaths.forEach(cachePath => {
    const fullPath = path.resolve(__dirname, '..', cachePath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
      log.success(`${cachePath} 정리됨`);
    }
  });
}

// Prisma 설정 확인
async function checkPrisma() {
  log.title('🗄️ Prisma 설정 확인');
  
  return new Promise((resolve) => {
    const prismaGenerate = spawn('npx', ['prisma', 'generate'], {
      stdio: 'inherit', // 'pipe'에서 'inherit'으로 변경하여 출력을 직접 스트리밍
      shell: true,
      cwd: path.resolve(__dirname, '..')
    });

    prismaGenerate.on('close', (code) => {
      if (code === 0) {
        log.success('Prisma 클라이언트 생성 완료');
        resolve(true);
      } else {
        log.error(`Prisma 생성 실패 (코드: ${code})`);
        resolve(false);
      }
    });
  });
}

// 서버 시작
async function startServer(isCI = false) {
  log.title('🚀 Next.js 개발 서버 시작');
  
  const serverProcess = spawn('npx', ['next', 'dev', '-p', '34343'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.resolve(__dirname, '..')
  });

  // 서버 준비 확인 (반복 시도)
  const startTime = Date.now();
  const timeout = 60000; // 60초
  const interval = 5000;  // 5초 간격

  const checkServerReady = async () => {
    if (Date.now() - startTime > timeout) {
      log.error('서버 시작 시간 초과. 로그를 확인하세요.');
      serverProcess.kill();
      process.exit(1);
    }

    try {
      const response = await fetch('http://localhost:34343');
      if (response.ok) {
        log.success('서버가 성공적으로 시작되었습니다!');
        log.info('\ud83c\udf10 http://localhost:34343');
        
        // CI 모드가 아닐 때만 브라우저 자동 열기
        if (!isCI) {
          try {
            await open('http://localhost:34343');
            log.success('브라우저에서 열렸습니다.');
          } catch (err) {
            log.warn('브라우저 자동 열기 실패, 수동으로 열어주세요.');
          }
        }
      } else {
        // 서버는 켜졌지만 아직 준비 안됨
        setTimeout(checkServerReady, interval);
      }
    } catch (err) {
      // 서버가 아직 켜지지 않음
      log.info('서버 응답 대기 중...');
      setTimeout(checkServerReady, interval);
    }
  };

  // CI 모드가 아닐 때만 서버 준비 상태를 확인하고 브라우저를 엽니다.
  // Playwright와 같은 테스트 러너는 자체적으로 서버 준비 상태를 확인합니다.
  if (!isCI) {
    setTimeout(checkServerReady, interval);
  }


  // 종료 신호 처리
  process.on('SIGINT', () => {
    log.info('서버 종료 중...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log.info('서버 종료 중...');
    serverProcess.kill('SIGTERM');
    process.exit(0);
  });

  serverProcess.on('close', (code) => {
    if (code !== 0) {
      log.error(`서버가 코드 ${code}로 종료되었습니다.`);
    } else {
      log.info('서버가 정상적으로 종료되었습니다.');
    }
    process.exit(code);
  });
}

// 메인 실행 함수
async function main() {
  console.clear();
  log.title('='.repeat(50));
  log.title('🏨 Hotel Detail Page Server');
  log.title('='.repeat(50));

  const isCI = process.argv.includes('--ci');

  try {
    // 1. 환경 변수 확인
    const hasEnv = checkEnvironment();
         if (!hasEnv) {
       log.error('필수 환경 변수가 설정되지 않았습니다.');
       log.info('.env.local 파일을 확인하고 필요한 환경 변수를 설정하세요.');
       process.exit(1);
     }

    // 2. 캐시 정리 (옵션)
    cleanCache();

    // 3. 포트 확인
    const portAvailable = await checkPort(34343);
    if (!portAvailable) {
      log.error('\ud3ec\ud2b8 34343\uc744 \uc0ac\uc6a9\ud560 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.');
      process.exit(1);
    }

    // 4. Prisma 설정 확인
    const prismaReady = await checkPrisma();
    if (!prismaReady) process.exit(1);

    // 5. 서버 시작
    await startServer(isCI);

  } catch (error) {
    log.error(`서버 시작 중 심각한 오류 발생: ${error.message}`);
    process.exit(1);
  }
}

main(); 