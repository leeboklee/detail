import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';
import path from 'path'; // Added for path.join

const execAsync = promisify(exec);

export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return handleGetStatus(req, res);
    case 'POST':
      return handlePostAction(req, res);
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}

// 상태 확인
async function handleGetStatus(req, res) {
  try {
    const status = await getSystemStatus();
    res.status(200).json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 액션 실행
async function handlePostAction(req, res) {
  console.log(`[API] Detail 요청 본문:`, req.body);
  console.log(`[API] Detail Content-Type:`, req.headers['content-type']);
  
  const { action } = req.body || {};
  
  console.log(`[API] Detail 액션 요청: ${action}`);

  if (!action) {
    console.log(`[API] Detail 액션 누락`);
    return res.status(400).json({ 
      error: 'action parameter is required', 
      success: false,
      receivedBody: req.body 
    });
  }

  try {
    let result;
    switch (action) {
      case 'start-server':
        result = await startServer();
        break;
      case 'stop-server':
        result = await stopServer();
        break;
      case 'run-e2e-tests':
        result = await runE2ETests();
        break;
      case 'run-all-tests':
        result = await runAllTests();
        break;
      case 'check-db':
        result = await checkDatabase();
        break;
      default:
        console.log(`[API] Detail 알 수 없는 액션: ${action}`);
        return res.status(400).json({ error: `Unknown action: ${action}`, success: false });
    }
    
    console.log(`[API] Detail 액션 결과:`, result);
    res.status(200).json({ ...result, action, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error(`[API] Detail 액션 오류:`, error);
    res.status(500).json({ 
      error: error.message, 
      action, 
      success: false, 
      timestamp: new Date().toISOString() 
    });
  }
}

// 시스템 모니터링 정보 수집 - 간소화
async function getSystemMonitoring() {
  const monitoring = {
    timestamp: new Date().toISOString(),
    localTime: new Date().toLocaleString('ko-KR', { 
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    uptime: formatUptime(os.uptime()),
    cpu: 0, // CPU 사용률 계산 제거 - 리소스 절약
    memory: Math.round(((os.totalmem() - os.freemem()) / os.totalmem()) * 100),
    temperature: null, // 온도 측정 제거 - 리소스 절약
    processCount: 0,
    networkStatus: '정상'
  };

  // 프로세스 수 계산 제거 - 리소스 절약
  // try {
  //   const { stdout } = await execAsync('tasklist /FI "IMAGENAME eq node.exe" /NH');
  //   const lines = stdout.split('\n').filter(line => line.trim() && line.includes('node.exe'));
  //   monitoring.processCount = lines.length;
  // } catch (error) {
  //   monitoring.processCount = 0;
  // }

  return monitoring;
}

// CPU 사용률 측정
async function getCPUUsage() {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('wmic cpu get loadpercentage /value');
      const match = stdout.match(/LoadPercentage=(\d+)/);
      return match ? parseInt(match[1]) : 0;
    } else {
      const { stdout } = await execAsync('top -bn1 | grep "Cpu(s)" | awk \'{print $2}\' | cut -d\'%\' -f1');
      return parseFloat(stdout) || 0;
    }
  } catch (error) {
    return 0;
  }
}

// 온도 측정 (Windows)
async function getTemperature() {
  try {
    if (process.platform === 'win32') {
      const { stdout } = await execAsync('wmic /namespace:\\\\root\\wmi PATH MSAcpi_ThermalZoneTemperature get CurrentTemperature /value');
      const match = stdout.match(/CurrentTemperature=(\d+)/);
      if (match) {
        // Kelvin을 Celsius로 변환
        const kelvin = parseInt(match[1]) / 10;
        const celsius = kelvin - 273.15;
        return Math.round(celsius);
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 업타임 포맷팅
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}일 ${hours}시간 ${minutes}분`;
  if (hours > 0) return `${hours}시간 ${minutes}분`;
  return `${minutes}분`;
}

// 시스템 상태 확인
async function getSystemStatus() {
  const status = {
    serverRunning: false,
    dbConnected: false,
    monitoring: null
  };

  try {
    // 서버 상태 확인
    const isPortOpen = await checkPort( {process.env.PORT || 34343});
    status.serverRunning = isPortOpen;

    // DB 상태 확인
    try {
      if (process.env.DATABASE_URL) {
        status.dbConnected = true;
      } else {
        // SQLite 파일 존재 확인
        const fs = require('fs');
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        status.dbConnected = fs.existsSync(dbPath);
      }
    } catch (error) {
      status.dbConnected = false;
    }

    // 시스템 모니터링
    status.monitoring = await getSystemMonitoring();

  } catch (error) {
    console.error('시스템 상태 확인 오류:', error);
    status.error = error.message;
  }

  return status;
}

// 포트 확인
async function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const socket = new net.Socket();
    
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    
    socket.connect(port, 'localhost');
  });
}

// 서버 시작
async function startServer() {
  try {
    const { stdout, stderr } = await execAsync('npm run dev', { 
      cwd: process.cwd(),
      detached: true,
      stdio: 'ignore'
    });
    return { message: 'Detail 서버 시작 명령 실행됨', success: true };
  } catch (error) {
    return { message: `Detail 서버 시작 실패: ${error.message}`, success: false };
  }
}

// 서버 중지
async function stopServer() {
  try {
    const { stdout, stderr } = await execAsync('taskkill /F /IM node.exe');
    return { message: 'Detail 서버 중지 명령 실행됨', success: true };
  } catch (error) {
    return { message: `Detail 서버 중지 실패: ${error.message}`, success: false };
  }
}

// E2E 테스트 실행
async function runE2ETests() {
  try {
    const { stdout, stderr } = await execAsync('npx playwright test --reporter=line', { 
      cwd: process.cwd(),
      timeout: 60000
    });
    return { message: 'Detail E2E 테스트 실행 완료', success: true, output: stdout };
  } catch (error) {
    return { message: `Detail E2E 테스트 실패: ${error.message}`, success: false, error: error.stderr };
  }
}

// 전체 테스트 실행
async function runAllTests() {
  try {
    // 서버 시작
    await startServer();
    
    // 10초 대기
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // E2E 테스트 실행
    const testResult = await runE2ETests();
    
    return { 
      message: 'Detail 전체 테스트 실행 완료', 
      success: testResult.success, 
      server: '시작됨',
      tests: testResult
    };
  } catch (error) {
    return { message: `Detail 전체 테스트 실패: ${error.message}`, success: false };
  }
}

// DB 연결 확인
async function checkDatabase() {
  try {
    console.log('[DB] Detail DB 연결 확인 시작...');
    
    if (!process.env.DATABASE_URL) {
      console.log('[DB] Detail DATABASE_URL 미설정');
      return { 
        status: '❌ Detail DATABASE_URL 미설정', 
        success: false, 
        message: 'DATABASE_URL 환경변수가 설정되지 않았습니다.' 
      };
    }

    // 올바른 import 사용
    const { sql } = await import('../../lib/db.js');
    
    if (typeof sql !== 'function') {
      console.log('[DB] Detail sql 함수가 올바르지 않음');
      return { 
        status: '❌ Detail DB 연결 실패: sql 함수 오류', 
        success: false, 
        message: 'sql 함수가 올바르게 로드되지 않았습니다.' 
      };
    }

    console.log('[DB] Detail DB 쿼리 실행 중...');
    const result = await sql`SELECT 1 as test`;
    
    console.log('[DB] Detail DB 연결 성공:', result);
    return { 
      status: '✅ Detail DB 연결 성공', 
      success: true, 
      message: '데이터베이스 연결이 정상입니다.',
      result 
    };
  } catch (error) {
    console.error('[DB] Detail DB 연결 오류:', error);
    return { 
      status: `❌ Detail DB 연결 실패: ${error.message}`, 
      success: false, 
      message: error.message,
      error: error.message 
    };
  }
} 