const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ì§€???¨ìˆ˜ (Promise ê¸°ë°˜)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ?ˆë¡œ???¬íŠ¸ ì°¾ê¸° ?¨ìˆ˜
async function findAvailablePort(startPort, maxRetries = 10) {
  console.log(`?”„ ?¬ìš© ê°€?¥í•œ ?¬íŠ¸ ì°¾ê¸° ?œìž‘ (?œìž‘ ?¬íŠ¸: ${startPort})...`);
  let port = startPort;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // ?¬íŠ¸ ?¬ìš© ?¬ë? ?•ì¸
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
      console.log(`? ï¸ ?¬íŠ¸ ${port}???´ë? ?¬ìš© ì¤‘ìž…?ˆë‹¤. ?¤ìŒ ?¬íŠ¸ ?•ì¸...`);
      port++;
      retries++;
    } catch (error) {
      // ?¤ë¥˜ê°€ ë°œìƒ?œë‹¤??ê²ƒì? ?¬íŠ¸ê°€ ?¬ìš© ì¤‘ì´ì§€ ?Šë‹¤???˜ë?
      console.log(`???¬íŠ¸ ${port}???¬ìš© ê°€?¥í•©?ˆë‹¤.`);
      return port;
    }
  }

  // ê¸°ë³¸ ?¬íŠ¸ë¡??Œì•„ê°€ê³?ê°•ì œ ì¢…ë£Œ ?¤í–‰
  console.log(`? ï¸ ${maxRetries}ë²??œë„?ˆì?ë§??¬ìš© ê°€?¥í•œ ?¬íŠ¸ë¥?ì°¾ì? ëª»í–ˆ?µë‹ˆ?? ê¸°ë³¸ ?¬íŠ¸ ê°•ì œ ?´ì œ ?œë„...`);
  await terminateProcessesOnPort(startPort);
  return startPort;
}

// ?¬íŠ¸ ?¬ìš© ?„ë¡œ?¸ìŠ¤ ì¢…ë£Œ ?¨ìˆ˜
async function terminateProcessesOnPort(port) {
  console.log(`?”„ ${port} ?¬íŠ¸ ?„ë¡œ?¸ìŠ¤ ê°•ì œ ì¢…ë£Œ ì¤?..`);
  try {
    // ?¬íŠ¸ ?¬ìš© ì¤‘ì¸ ?„ë¡œ?¸ìŠ¤ PID ì°¾ê¸°
    const findPIDCommand = `netstat -ano | findstr :${port}`;
    const result = execSync(findPIDCommand, { encoding: 'utf8' });
    
    // ëª¨ë“  ?íƒœ???°ê²° ?•ì¸
    const lines = result.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 0) {
      console.log(`ë°œê²¬??${port} ?¬íŠ¸ ?°ê²°: ${lines.length}ê°?);
      
      // LISTENING ?íƒœ ?„ë¡œ?¸ìŠ¤ ì¢…ë£Œ
      const listeningLines = lines.filter(line => line.includes('LISTENING'));
      for (const line of listeningLines) {
        const pidMatch = line.match(/(\d+)$/);
        if (pidMatch && pidMatch[1]) {
          const pid = pidMatch[1].trim();
          console.log(`??${port} ?¬íŠ¸(LISTENING) ?„ë¡œ?¸ìŠ¤ ë°œê²¬: PID ${pid}`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
            console.log(`??PID ${pid} ì¢…ë£Œ ?„ë£Œ`);
          } catch (e) {
            console.log(`? ï¸ PID ${pid} ì¢…ë£Œ ?¤íŒ¨: ${e.message}`);
          }
        }
      }
      
      // TIME_WAIT ?íƒœ???°ê²°?€ OSê°€ ?ë™?¼ë¡œ ?•ë¦¬ (?œê°„???„ìš”??
      const waitingLines = lines.filter(line => line.includes('TIME_WAIT'));
      if (waitingLines.length > 0) {
        console.log(`??${waitingLines.length}ê°œì˜ TIME_WAIT ?íƒœ ?°ê²° ë°œê²¬. ?´ë“¤?€ OS???˜í•´ ?•ë¦¬?©ë‹ˆ??`);
        console.log('? ì‹œ ?€ê¸?ì¤?.. (5ì´?');
        await delay(5000);
        console.log('?€ê¸??„ë£Œ');
      }
    } else {
      console.log(`? ï¸ ${port} ?¬íŠ¸ ?¬ìš© ì¤‘ì¸ ?„ë¡œ?¸ìŠ¤ê°€ ?†ìŠµ?ˆë‹¤`);
    }
  } catch (error) {
    console.log(`? ï¸ ${port} ?¬íŠ¸ ?¬ìš© ì¤‘ì¸ ?„ë¡œ?¸ìŠ¤ê°€ ?†ìŠµ?ˆë‹¤`);
  }
  
  // ë§ˆì?ë§??˜ë‹¨: taskkill /F /IM node.exe (ëª¨ë“  Node.js ?„ë¡œ?¸ìŠ¤ ì¢…ë£Œ) - ì£¼ì„ ì²˜ë¦¬?˜ì—¬ ë¹„í™œ?±í™”
  /*
  try {
    console.log('? ï¸ ëª¨ë“  node.exe ?„ë¡œ?¸ìŠ¤ ?•ì¸ ì¤?..');
    execSync('tasklist /fi "imagename eq node.exe"', { stdio: 'pipe' });
    console.log('? ï¸ ì£¼ì˜: ëª¨ë“  Node.js ?„ë¡œ?¸ìŠ¤ ì¢…ë£Œë¥??œë„?©ë‹ˆ??');
    execSync('taskkill /F /IM node.exe', { stdio: 'pipe' });
    console.log('??Node.js ?„ë¡œ?¸ìŠ¤ ì¢…ë£Œ ?„ë£Œ');
  } catch (e) {
    console.log('? ï¸ Node.js ?„ë¡œ?¸ìŠ¤ê°€ ?†ê±°??ì¢…ë£Œ?????†ìŠµ?ˆë‹¤.');
  }
  */
}

// Git ?¸ì¦ ê´€???˜ê²½ ë³€???¤ì •
process.env.GIT_TERMINAL_PROMPT = "0";
process.env.GIT_ASKPASS = "echo";
process.env.GIT_SSH_COMMAND = "echo";
process.env.NEXT_TELEMETRY_DISABLED = "1";
process.env.NPM_CONFIG_GIT = "false";
process.env.NPM_CONFIG_GIT_TAG_VERSION = "false";
process.env.NPM_CONFIG_STRICT_SSL = "false";
process.env.GIT_CONFIG_NOSYSTEM = "1";

// ë©”ì¸ ?¨ìˆ˜ ?¤í–‰
async function main() {
  try {
    // ?¬íŠ¸ ?¤ì • ë°?ì¢…ë£Œ ì²˜ë¦¬
    // const PORT = process.env.PORT || await findAvailablePort(4200); // ê¸°ì¡´ ì½”ë“œ ì£¼ì„ ì²˜ë¦¬
    const PORT = 4200; // ?¬íŠ¸ 4200 ê³ ì •
    console.log(`?? ?¬íŠ¸ ${PORT} ?¬ìš© ê°•ì œ ?¤ì •`);
    
    // ì¶”ê?: ?œë²„ ?œìž‘ ???¬íŠ¸ ?•ë¦¬ ë¡œì§ ?¸ì¶œ
    await terminateProcessesOnPort(PORT);
    
    // .next ?”ë ‰? ë¦¬ ?? œ
    console.log('?”„ .next ìºì‹œ ?? œ ì¤?..');
    const nextDir = path.join(__dirname, '.next');
    if (fs.existsSync(nextDir)) {
      try {
        execSync('rmdir /s /q .next', { stdio: 'ignore' });
        console.log('??.next ìºì‹œ ?? œ ?„ë£Œ');
      } catch (error) {
        console.log('? ï¸ .next ?”ë ‰? ë¦¬ ?? œ ?¤íŒ¨');
      }
    }
    
    // ê°œë°œ ?œë²„ ?œìž‘ ???€ê¸?
    console.log('???¬íŠ¸ ?ˆì •?”ë? ?„í•´ ? ì‹œ ?€ê¸?ì¤?.. (3ì´?');
    await delay(3000);
    
    // ê°œë°œ ?œë²„ ?œìž‘
    console.log(`?? ê°œë°œ ?œë²„ ?œìž‘ ì¤?.. (?¬íŠ¸: ${PORT})`);
    
    // --- ?˜ì •: spawn ??npm run dev-internal ?¤í–‰ --- 
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
        console.log(`?‘‹ Server process exited with code ${code}`);
    });
    process.on('SIGINT', () => {
      console.log('\n?‘‹ SIGINT received, killing server process...');
      devProcess.kill(); 
      setTimeout(() => process.exit(0), 500); 
    });

  } catch (error) {
    console.error('[Main Error] Failed to start server:', error);
    process.exit(1);
  }
}

// ?„ë¡œê·¸ëž¨ ?œìž‘
main().catch(err => {
  console.error('?¤í–‰ ?¤ë¥˜:', err);
  process.exit(1);
});

// ?„ëž˜ ì½”ë“œ ì£¼ì„ ì²˜ë¦¬ - ì¶©ëŒ ë°©ì?
/*
// Next.js ?œë²„ ?œìž‘
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
