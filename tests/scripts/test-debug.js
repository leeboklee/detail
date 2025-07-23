/**
 * ?�버�??�구 ?�스???�크립트
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 로그 ?�렉?�리 ?�성
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ?�스??로그 ?�일
const testLogFile = path.join(logDir, `debug-test-${new Date().toISOString().replace(/:/g, '-')}.log`);

// 로그 ?�수
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 콘솔??출력
  console.log(message);
  
  // ?�일??기록
  fs.appendFileSync(testLogFile, logMessage);
}

// ?�스???�작
log('===== ?�버�??�구 ?�스???�작 =====');

// 1. ?�라?�언???�버�??�스??준�?
log('1. ?�라?�언???�버�??�스??준�?);
try {
  // ?�라?�언???�버�??�크립트 ?�인
  const clientDebugPath = path.join(process.cwd(), 'public', 'client-debug.js');
  if (fs.existsSync(clientDebugPath)) {
    const stats = fs.statSync(clientDebugPath);
    log(`- ?�라?�언???�버�??�크립트 ?�인: ${stats.size} bytes`);
  } else {
    log('- ?�라?�언???�버�??�크립트가 ?�습?�다!');
  }
  
  // app/client-debug.js ?�인
  const appClientDebugPath = path.join(process.cwd(), 'app', 'client-debug.js');
  if (fs.existsSync(appClientDebugPath)) {
    const stats = fs.statSync(appClientDebugPath);
    log(`- app/client-debug.js ?�인: ${stats.size} bytes`);
  } else {
    log('- app/client-debug.js가 ?�습?�다!');
  }
} catch (error) {
  log(`- ?�라?�언???�버�??�스??준�??�류: ${error.message}`);
}

// 2. ?�버 ?�버�??�스??준�?
log('2. ?�버 ?�버�??�스??준�?);
try {
  // ?�버 ?�버�??�크립트 ?�인
  const serverDebugPath = path.join(process.cwd(), 'scripts', 'server-debug.js');
  if (fs.existsSync(serverDebugPath)) {
    const stats = fs.statSync(serverDebugPath);
    log(`- ?�버 ?�버�??�크립트 ?�인: ${stats.size} bytes`);
  } else {
    log('- ?�버 ?�버�??�크립트가 ?�습?�다!');
  }
  
  // app/server-debug.js ?�인
  const appServerDebugPath = path.join(process.cwd(), 'app', 'server-debug.js');
  if (fs.existsSync(appServerDebugPath)) {
    const stats = fs.statSync(appServerDebugPath);
    log(`- app/server-debug.js ?�인: ${stats.size} bytes`);
  } else {
    log('- app/server-debug.js가 ?�습?�다!');
  }
} catch (error) {
  log(`- ?�버 ?�버�??�스??준�??�류: ${error.message}`);
}

// 3. ?�트 ?�리 ?�인
log('3. ?�트 ?�리 ?�인');
try {
  // ?�트 ?�리 ?�크립트 ?�행
  exec('node scripts/clean-port.js', (error, stdout, stderr) => {
    if (error) {
      log(`- ?�트 ?�리 ?�행 ?�류: ${error.message}`);
      return;
    }
    
    log('- ?�트 ?�리 ?�료');
    log(`- 출력: ${stdout.trim()}`);
    
    // 4. ?�버 ?�작 ?�스??
    log('4. ?�버 ?�작 ?�스??);
    log('- ?�버�?직접 ?�작?��? ?�습?�다. ?�음 명령?�로 ?�작?�세??');
    log('  > npm run dev');
    log('  ?�는');
    log('  > npm run s');
    
    log('===== ?�버�??�구 ?�스???�료 =====');
    log('?�버�??�구�??�용?�려�?');
    log('1. ?�버 ?�작: npm run dev ?�는 npm run s');
    log('2. 브라?��??�서 ???�기');
    log('3. 브라?��??�서 Ctrl+Shift+D�??�러 ?�버�??�널 ?�기');
    log('4. 콘솔?�서 ?�버�?로그 ?�인');
  });
} catch (error) {
  log(`- ?�트 ?�리 ?�스???�류: ${error.message}`);
  log('===== ?�버�??�구 ?�스???�료 (?�류 발생) =====');
} 
