const { exec, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 吏???⑥닔 (Promise 湲곕컲)
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ?덈줈???ы듃 李얘린 ?⑥닔
async function findAvailablePort(startPort, maxRetries = 10) {
  console.log(`?봽 ?ъ슜 媛?ν븳 ?ы듃 李얘린 ?쒖옉 (?쒖옉 ?ы듃: ${startPort})...`);
  let port = startPort;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      // ?ы듃 ?ъ슜 ?щ? ?뺤씤
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
      console.log(`?좑툘 ?ы듃 ${port}???대? ?ъ슜 以묒엯?덈떎. ?ㅼ쓬 ?ы듃 ?뺤씤...`);
      port++;
      retries++;
    } catch (error) {
      // ?ㅻ쪟媛 諛쒖깮?쒕떎??寃껋? ?ы듃媛 ?ъ슜 以묒씠吏 ?딅떎???섎?
      console.log(`???ы듃 ${port}???ъ슜 媛?ν빀?덈떎.`);
      return port;
    }
  }

  // 湲곕낯 ?ы듃濡??뚯븘媛怨?媛뺤젣 醫낅즺 ?ㅽ뻾
  console.log(`?좑툘 ${maxRetries}踰??쒕룄?덉?留??ъ슜 媛?ν븳 ?ы듃瑜?李얠? 紐삵뻽?듬땲?? 湲곕낯 ?ы듃 媛뺤젣 ?댁젣 ?쒕룄...`);
  await terminateProcessesOnPort(startPort);
  return startPort;
}

// ?ы듃 ?ъ슜 ?꾨줈?몄뒪 醫낅즺 ?⑥닔
async function terminateProcessesOnPort(port) {
  console.log(`?봽 ${port} ?ы듃 ?꾨줈?몄뒪 媛뺤젣 醫낅즺 以?..`);
  try {
    // ?ы듃 ?ъ슜 以묒씤 ?꾨줈?몄뒪 PID 李얘린
    const findPIDCommand = `netstat -ano | findstr :${port}`;
    const result = execSync(findPIDCommand, { encoding: 'utf8' });
    
    // 紐⑤뱺 ?곹깭???곌껐 ?뺤씤
    const lines = result.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length > 0) {
      console.log(`諛쒓껄??${port} ?ы듃 ?곌껐: ${lines.length}媛?);
      
      // LISTENING ?곹깭 ?꾨줈?몄뒪 醫낅즺
      const listeningLines = lines.filter(line => line.includes('LISTENING'));
      for (const line of listeningLines) {
        const pidMatch = line.match(/(\d+)$/);
        if (pidMatch && pidMatch[1]) {
          const pid = pidMatch[1].trim();
          console.log(`??${port} ?ы듃(LISTENING) ?꾨줈?몄뒪 諛쒓껄: PID ${pid}`);
          try {
            execSync(`taskkill /F /PID ${pid}`, { stdio: 'pipe' });
            console.log(`??PID ${pid} 醫낅즺 ?꾨즺`);
          } catch (e) {
            console.log(`?좑툘 PID ${pid} 醫낅즺 ?ㅽ뙣: ${e.message}`);
          }
        }
      }
      
      // TIME_WAIT ?곹깭???곌껐? OS媛 ?먮룞?쇰줈 ?뺣━ (?쒓컙???꾩슂??
      const waitingLines = lines.filter(line => line.includes('TIME_WAIT'));
      if (waitingLines.length > 0) {
        console.log(`??${waitingLines.length}媛쒖쓽 TIME_WAIT ?곹깭 ?곌껐 諛쒓껄. ?대뱾? OS???섑빐 ?뺣━?⑸땲??`);
        console.log('?좎떆 ?湲?以?.. (5珥?');
        await delay(5000);
        console.log('?湲??꾨즺');
      }
    } else {
      console.log(`?좑툘 ${port} ?ы듃 ?ъ슜 以묒씤 ?꾨줈?몄뒪媛 ?놁뒿?덈떎`);
    }
  } catch (error) {
    console.log(`?좑툘 ${port} ?ы듃 ?ъ슜 以묒씤 ?꾨줈?몄뒪媛 ?놁뒿?덈떎`);
  }
  
  // 留덉?留??섎떒: taskkill /F /IM node.exe (紐⑤뱺 Node.js ?꾨줈?몄뒪 醫낅즺) - 二쇱꽍 泥섎━?섏뿬 鍮꾪솢?깊솕
  /*
  try {
    console.log('?좑툘 紐⑤뱺 node.exe ?꾨줈?몄뒪 ?뺤씤 以?..');
    execSync('tasklist /fi "imagename eq node.exe"', { stdio: 'pipe' });
    console.log('?좑툘 二쇱쓽: 紐⑤뱺 Node.js ?꾨줈?몄뒪 醫낅즺瑜??쒕룄?⑸땲??');
    execSync('taskkill /F /IM node.exe', { stdio: 'pipe' });
    console.log('??Node.js ?꾨줈?몄뒪 醫낅즺 ?꾨즺');
  } catch (e) {
    console.log('?좑툘 Node.js ?꾨줈?몄뒪媛 ?녾굅??醫낅즺?????놁뒿?덈떎.');
  }
  */
}

// Git ?몄쬆 愿???섍꼍 蹂???ㅼ젙
process.env.GIT_TERMINAL_PROMPT = "0";
process.env.GIT_ASKPASS = "echo";
process.env.GIT_SSH_COMMAND = "echo";
process.env.NEXT_TELEMETRY_DISABLED = "1";
process.env.NPM_CONFIG_GIT = "false";
process.env.NPM_CONFIG_GIT_TAG_VERSION = "false";
process.env.NPM_CONFIG_STRICT_SSL = "false";
process.env.GIT_CONFIG_NOSYSTEM = "1";

// 硫붿씤 ?⑥닔 ?ㅽ뻾
async function main() {
  try {
    // ?ы듃 ?ㅼ젙 諛?醫낅즺 泥섎━
    // const PORT = process.env.PORT || await findAvailablePort(4200); // 湲곗〈 肄붾뱶 二쇱꽍 泥섎━
    const PORT = 4200; // ?ы듃 4200 怨좎젙
    console.log(`?? ?ы듃 ${PORT} ?ъ슜 媛뺤젣 ?ㅼ젙`);
    
    // 異붽?: ?쒕쾭 ?쒖옉 ???ы듃 ?뺣━ 濡쒖쭅 ?몄텧
    await terminateProcessesOnPort(PORT);
    
    // .next ?붾젆?좊━ ??젣
    console.log('?봽 .next 罹먯떆 ??젣 以?..');
    const nextDir = path.join(__dirname, '.next');
    if (fs.existsSync(nextDir)) {
      try {
        execSync('rmdir /s /q .next', { stdio: 'ignore' });
        console.log('??.next 罹먯떆 ??젣 ?꾨즺');
      } catch (error) {
        console.log('?좑툘 .next ?붾젆?좊━ ??젣 ?ㅽ뙣');
      }
    }
    
    // 媛쒕컻 ?쒕쾭 ?쒖옉 ???湲?
    console.log('???ы듃 ?덉젙?붾? ?꾪빐 ?좎떆 ?湲?以?.. (3珥?');
    await delay(3000);
    
    // 媛쒕컻 ?쒕쾭 ?쒖옉
    console.log(`?? 媛쒕컻 ?쒕쾭 ?쒖옉 以?.. (?ы듃: ${PORT})`);
    
    // --- ?섏젙: spawn ??npm run dev-internal ?ㅽ뻾 --- 
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
        console.log(`?몝 Server process exited with code ${code}`);
    });
    process.on('SIGINT', () => {
      console.log('\n?몝 SIGINT received, killing server process...');
      devProcess.kill(); 
      setTimeout(() => process.exit(0), 500); 
    });

  } catch (error) {
    console.error('[Main Error] Failed to start server:', error);
    process.exit(1);
  }
}

// ?꾨줈洹몃옩 ?쒖옉
main().catch(err => {
  console.error('?ㅽ뻾 ?ㅻ쪟:', err);
  process.exit(1);
});

// ?꾨옒 肄붾뱶 二쇱꽍 泥섎━ - 異⑸룎 諛⑹?
/*
// Next.js ?쒕쾭 ?쒖옉
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
