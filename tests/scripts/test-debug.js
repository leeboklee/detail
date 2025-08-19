/**
 * ?붾쾭源??꾧뎄 ?뚯뒪???ㅽ겕由쏀듃
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 濡쒓렇 ?붾젆?곕━ ?앹꽦
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// ?뚯뒪??濡쒓렇 ?뚯씪
const testLogFile = path.join(logDir, `debug-test-${new Date().toISOString().replace(/:/g, '-')}.log`);

// 濡쒓렇 ?⑥닔
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  
  // 肄섏넄??異쒕젰
  console.log(message);
  
  // ?뚯씪??湲곕줉
  fs.appendFileSync(testLogFile, logMessage);
}

// ?뚯뒪???쒖옉
log('===== ?붾쾭源??꾧뎄 ?뚯뒪???쒖옉 =====');

// 1. ?대씪?댁뼵???붾쾭源??뚯뒪??以鍮?
log('1. ?대씪?댁뼵???붾쾭源??뚯뒪??以鍮?);
try {
  // ?대씪?댁뼵???붾쾭源??ㅽ겕由쏀듃 ?뺤씤
  const clientDebugPath = path.join(process.cwd(), 'public', 'client-debug.js');
  if (fs.existsSync(clientDebugPath)) {
    const stats = fs.statSync(clientDebugPath);
    log(`- ?대씪?댁뼵???붾쾭源??ㅽ겕由쏀듃 ?뺤씤: ${stats.size} bytes`);
  } else {
    log('- ?대씪?댁뼵???붾쾭源??ㅽ겕由쏀듃媛 ?놁뒿?덈떎!');
  }
  
  // app/client-debug.js ?뺤씤
  const appClientDebugPath = path.join(process.cwd(), 'app', 'client-debug.js');
  if (fs.existsSync(appClientDebugPath)) {
    const stats = fs.statSync(appClientDebugPath);
    log(`- app/client-debug.js ?뺤씤: ${stats.size} bytes`);
  } else {
    log('- app/client-debug.js媛 ?놁뒿?덈떎!');
  }
} catch (error) {
  log(`- ?대씪?댁뼵???붾쾭源??뚯뒪??以鍮??ㅻ쪟: ${error.message}`);
}

// 2. ?쒕쾭 ?붾쾭源??뚯뒪??以鍮?
log('2. ?쒕쾭 ?붾쾭源??뚯뒪??以鍮?);
try {
  // ?쒕쾭 ?붾쾭源??ㅽ겕由쏀듃 ?뺤씤
  const serverDebugPath = path.join(process.cwd(), 'scripts', 'server-debug.js');
  if (fs.existsSync(serverDebugPath)) {
    const stats = fs.statSync(serverDebugPath);
    log(`- ?쒕쾭 ?붾쾭源??ㅽ겕由쏀듃 ?뺤씤: ${stats.size} bytes`);
  } else {
    log('- ?쒕쾭 ?붾쾭源??ㅽ겕由쏀듃媛 ?놁뒿?덈떎!');
  }
  
  // app/server-debug.js ?뺤씤
  const appServerDebugPath = path.join(process.cwd(), 'app', 'server-debug.js');
  if (fs.existsSync(appServerDebugPath)) {
    const stats = fs.statSync(appServerDebugPath);
    log(`- app/server-debug.js ?뺤씤: ${stats.size} bytes`);
  } else {
    log('- app/server-debug.js媛 ?놁뒿?덈떎!');
  }
} catch (error) {
  log(`- ?쒕쾭 ?붾쾭源??뚯뒪??以鍮??ㅻ쪟: ${error.message}`);
}

// 3. ?ы듃 ?뺣━ ?뺤씤
log('3. ?ы듃 ?뺣━ ?뺤씤');
try {
  // ?ы듃 ?뺣━ ?ㅽ겕由쏀듃 ?ㅽ뻾
  exec('node scripts/clean-port.js', (error, stdout, stderr) => {
    if (error) {
      log(`- ?ы듃 ?뺣━ ?ㅽ뻾 ?ㅻ쪟: ${error.message}`);
      return;
    }
    
    log('- ?ы듃 ?뺣━ ?꾨즺');
    log(`- 異쒕젰: ${stdout.trim()}`);
    
    // 4. ?쒕쾭 ?쒖옉 ?뚯뒪??
    log('4. ?쒕쾭 ?쒖옉 ?뚯뒪??);
    log('- ?쒕쾭瑜?吏곸젒 ?쒖옉?섏? ?딆뒿?덈떎. ?ㅼ쓬 紐낅졊?쇰줈 ?쒖옉?섏꽭??');
    log('  > npm run dev');
    log('  ?먮뒗');
    log('  > npm run s');
    
    log('===== ?붾쾭源??꾧뎄 ?뚯뒪???꾨즺 =====');
    log('?붾쾭源??꾧뎄瑜??ъ슜?섎젮硫?');
    log('1. ?쒕쾭 ?쒖옉: npm run dev ?먮뒗 npm run s');
    log('2. 釉뚮씪?곗??먯꽌 ???닿린');
    log('3. 釉뚮씪?곗??먯꽌 Ctrl+Shift+D瑜??뚮윭 ?붾쾭源??⑤꼸 ?닿린');
    log('4. 肄섏넄?먯꽌 ?붾쾭源?濡쒓렇 ?뺤씤');
  });
} catch (error) {
  log(`- ?ы듃 ?뺣━ ?뚯뒪???ㅻ쪟: ${error.message}`);
  log('===== ?붾쾭源??꾧뎄 ?뚯뒪???꾨즺 (?ㅻ쪟 諛쒖깮) =====');
} 
