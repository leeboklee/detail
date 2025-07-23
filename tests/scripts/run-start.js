const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 지???�수 (Promise 기반)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ?�로???�트 찾기 ?�수
async function findAvailablePort(startPort, maxRetries = 10) {
  console.log(`?�� ?�용 가?�한 ?�트 찾기 ?�작 (?�작 ?�트: ${startPort})...`);
  let port = startPort;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // ?�트 ?�용 ?��? ?�인
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
      console.log(`?�️ ?�트 ${port}???��? ?�용 중입?�다. ?�음 ?�트 ?�인...`);
      port++;
      retries++;
    } catch (error) {
      // ?�류가 발생?�다??것�? ?�트가 ?�용 중이지 ?�다???��?
      console.log(`???�트 ${port}???�용 가?�합?�다.`);
      return port;
    }
  }

  // 기본 ?�트�??�아가�?강제 종료 ?�행
  console.log(`?�️ ${maxRetries}�??�도?��?�??�용 가?�한 ?�트�?찾�? 못했?�니?? 기본 ?�트 강제 ?�제 ?�도...`);
  await terminateProcessesOnPort(startPort);
  return startPort;
}

// ?�트 ?�용 ?�로?�스 종료 ?�수
async function terminateProcessesOnPort(port) {
  console.log(`?�� ${port} ?�트 ?�로?�스 강제 종료 �?..`);
  try {
    // ?�트 ?�용 중인 ?�로?�스 PID 찾기
    const findPIDCommand = `netstat -ano | findstr :${port}`;
    const result = execSync(findPIDCommand, { encoding: 'utf8' });
    
    // 모든 ?�태???�결 ?�인
    const lines = result.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 0) {
      console.log(`발견??${port} ?�트 ?�결: ${lines.length}�?);
      
      // LISTENING ?�태 ?�로?�스 종료
      const listeningLines = lines.filter(line => line.includes('LISTENING'));
      for (const line of listeningLines) {
        const pidMatch = line.match(/(\d+)$/);
        if (pidMatch && pidMatch[1]) {
          const pid = pidMatch[1].trim();
          console.log(`??${port} ?�트(LISTENING) ?�로?�스 발견: PID ${pid}`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
            console.log(`??PID ${pid} 종료 ?�료`);
          } catch (e) {
            console.log(`?�️ PID ${pid} 종료 ?�패: ${e.message}`);
          }
        }
      }
      
      // TIME_WAIT ?�태???�결?� OS가 ?�동?�로 ?�리 (?�간???�요??
      const waitingLines = lines.filter(line => line.includes('TIME_WAIT'));
      if (waitingLines.length > 0) {
        console.log(`??${waitingLines.length}개의 TIME_WAIT ?�태 ?�결 발견. ?�들?� OS???�해 ?�리?�니??`);
        console.log('?�시 ?��?�?.. (5�?');
        await delay(5000);
        console.log('?��??�료');
      }
    } else {
      console.log(`?�️ ${port} ?�트 ?�용 중인 ?�로?�스가 ?�습?�다`);
    }
  } catch (error) {
    console.log(`?�️ ${port} ?�트 ?�용 중인 ?�로?�스가 ?�습?�다`);
  }
  
  // 마�?�??�단: taskkill /F /IM node.exe (모든 Node.js ?�로?�스 종료) - 주석 처리?�여 비활?�화
  /*
  try {
    console.log('?�️ 모든 node.exe ?�로?�스 ?�인 �?..');
    execSync('tasklist /fi "imagename eq node.exe"', { stdio: 'pipe' });
    console.log('?�️ 주의: 모든 Node.js ?�로?�스 종료�??�도?�니??');
    execSync('taskkill /F /IM node.exe', { stdio: 'pipe' });
    console.log('??Node.js ?�로?�스 종료 ?�료');
  } catch (e) {
    console.log('?�️ Node.js ?�로?�스가 ?�거??종료?????�습?�다.');
  }
  */
}

// Git ?�증 관???�경 변???�정
process.env.GIT_TERMINAL_PROMPT = "0";
process.env.GIT_ASKPASS = "echo";
process.env.GIT_SSH_COMMAND = "echo";
process.env.NEXT_TELEMETRY_DISABLED = "1";
process.env.NPM_CONFIG_GIT = "false";
process.env.NPM_CONFIG_GIT_TAG_VERSION = "false";
process.env.NPM_CONFIG_STRICT_SSL = "false";
process.env.GIT_CONFIG_NOSYSTEM = "1";

// 메인 ?�수 ?�행
async function main() {
  try {
    // ?�트 ?�정 �?종료 처리
    // const PORT = process.env.PORT || await findAvailablePort(4200); // 기존 코드 주석 처리
    const PORT = 4200; // ?�트 4200 고정
    console.log(`?? ?�트 ${PORT} ?�용 강제 ?�정`);
    
    // 추�?: ?�버 ?�작 ???�트 ?�리 로직 ?�출
    await terminateProcessesOnPort(PORT);
    
    // .next ?�렉?�리 ??��
    console.log('?�� .next 캐시 ??�� �?..');
    const nextDir = path.join(__dirname, '.next');
    if (fs.existsSync(nextDir)) {
      try {
        execSync('rmdir /s /q .next', { stdio: 'ignore' });
        console.log('??.next 캐시 ??�� ?�료');
      } catch (error) {
        console.log('?�️ .next ?�렉?�리 ??�� ?�패');
      }
    }
    
    // 개발 ?�버 ?�작 ???��?
    console.log('???�트 ?�정?��? ?�해 ?�시 ?��?�?.. (3�?');
    await delay(3000);
    
    // 개발 ?�버 ?�작
    console.log(`?? 개발 ?�버 ?�작 �?.. (?�트: ${PORT})`);
    
    // --- ?�정: spawn ??npm run dev-internal ?�행 --- 
    const command = process.platform === 'win32' ? 'npm.cmd' : 'npm'; // Use npm command
    const args = ['run', 'dev-internal']; // Run the new script via npm
    
    console.log(`[Spawn] Executing: ${command} ${args.join(' ')}`);
    const devProcess = spawn(command, args, {
        stdio: 'inherit', // Inherit stdio
        shell: false      // Shell should be false when running npm directly
    });
    // ---------------------------------------------    
    
    devProcess.on('error', (error) => {
      console.error(`[Spawn Error] Failed to start server process '${command} ${args.join(' ')}':`, error);
      process.exit(1); 
    });    
    devProcess.on('close', (code) => {
        console.log(`?�� Server process exited with code ${code}`);
    });
    process.on('SIGINT', () => {
      console.log('\n?�� SIGINT received, killing server process...');
      devProcess.kill(); 
      setTimeout(() => process.exit(0), 500); 
    });

  } catch (error) {
    console.error('[Main Error] Failed to start server:', error);
    process.exit(1);
  }
}

// ?�로그램 ?�작
main().catch(err => {
  console.error('?�행 ?�류:', err);
  process.exit(1);
});

// ?�래 코드 주석 처리 - 충돌 방�?
/*
// Next.js ?�버 ?�작
const server = spawn('node', [
  path.join(__dirname, 'node_modules/next/dist/bin/next'),
  'start'
], {
  stdio: 'inherit',
  env: process.env
});

server.on('close', (code) => {
  process.exit(code);
});
*/
