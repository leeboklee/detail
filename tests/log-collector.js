// log-collector.js - 釉뚮씪?占쏙옙? 肄섏넄 濡쒓렇 占?API ?占쎈쾭源낆쓣 ?占쏀븳 ?占쏀겕由쏀듃

import { chromium } from 'playwright';
import fs from 'fs';

async function saveLog(message) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logText = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('./test-log.txt', logText);
  console.log(message);
}

async function collectLogs() {
  const browser = await chromium.launch({
    headless: false, // GUI 紐⑤뱶占??占쏀뻾?占쎌뿬 ?占쎌떆占??占쎌씤 媛??
  });
  
  saveLog('釉뚮씪?占쏙옙?媛 ?占쎌옉?占쎌뿀?占쎈땲??');
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  
  // 肄섏넄 濡쒓렇 ?占쎌쭛
  context.on('console', message => {
    const type = message.type();
    const text = message.text();
    
    // 濡쒓렇 ?占쏀삎占?異쒕젰 ?占쎈㎎??
    if (type === 'error') {
      saveLog(`釉뚮씪?占쏙옙? 肄섏넄 ?占쎈쪟: ${text}`);
    } else if (type === 'warning') {
      saveLog(`釉뚮씪?占쏙옙? 肄섏넄 寃쎄퀬: ${text}`);
    } else {
      saveLog(`釉뚮씪?占쏙옙? 肄섏넄 ${type}: ${text}`);
    }
  });
  
  // ?占쎌씠吏 ?占쎈깽???占쎌쭛
  const page = await context.newPage();
  
  // ?占쏀듃?占쏀겕 ?占쎌껌/?占쎈떟 媛먯떆
  page.on('request', request => {
    saveLog(`?占쎌껌: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', async response => {
    const status = response.status();
    const url = response.url();
    
    // API ?占쎈떟?占???占쏙옙 湲곕줉
    if (url.includes('/api/')) {
      saveLog(`API ?占쎈떟 (${status}): ${url}`);
      try {
        const responseBody = await response.text();
        saveLog(`API ?占쎈떟 蹂몃Ц: ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`);
      } catch (err) {
        saveLog(`API ?占쎈떟 蹂몃Ц ?占쎌떛 ?占쎈쪟: ${err.message}`);
      }
    }
    // ?占쎈쪟 ?占쎈떟占??占쎌꽭 異쒕젰
    else if (status >= 400) {
      saveLog(`?占쎈떟 ?占쎈쪟 (${status}): ${url}`);
      try {
        const body = await response.text();
        saveLog(`?占쎈떟 蹂몃Ц: ${body.substring(0, 500)}`);
      } catch (err) {
        saveLog(`?占쎈떟 蹂몃Ц ?占쎌떛 ?占쎈쪟: ${err.message}`);
      }
    } else {
      saveLog(`?占쎈떟 (${status}): ${url}`);
    }
  });
  
  // ?占쎌씠吏 ?占쎈쪟 ?占쎌쭛
  page.on('pageerror', error => {
    saveLog(`?占쎌씠吏 ?占쎈쪟: ${error.message}`);
  });
  
  try {
    saveLog('?占쎌씠吏 濡쒕뵫 ?占쎌옉: http://localhost: {process.env.PORT || 3900}');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { timeout: 30000 });
    saveLog('?占쎌씠吏 濡쒕뵫 ?占쎈즺');
    
    // ?占쎌씠吏 ?占쏀겕由곗꺑 
    await page.screenshot({ path: 'screenshot-start.png', fullPage: true });
    saveLog('珥덇린 ?占쏀겕由곗꺑 ?占???占쎈즺: screenshot-start.png');
    
    // 1. 湲곕낯 ?占쏀깭 ?占쎌씤
    saveLog('--- 湲곕낯 ?占쏀깭 ?占쎌씤 ---');
    await page.waitForTimeout(2000);
    
    // 2. ?占쎌뒪??紐⑤뱶 踰꾪듉 ?占쎈┃
    try {
      saveLog('?占쎌뒪??紐⑤뱶 踰꾪듉 李얘린 ?占쎈룄...');
      // ???占쏀솗???占쏀깮???占쎌슜
      await page.waitForSelector('button:has-text("?占쎌뒪??紐⑤뱶")');
      const testModeButton = await page.$('button:has-text("?占쎌뒪??紐⑤뱶")');
      if (testModeButton) {
        saveLog('?占쎌뒪??紐⑤뱶 踰꾪듉 李얠쓬, ?占쎈┃ ?占쎈룄...');
        await testModeButton.click();
        saveLog('?占쎌뒪??紐⑤뱶 踰꾪듉 ?占쎈┃ ?占쎈즺');
        await page.waitForTimeout(2000);
      } else {
        saveLog('?占쎌뒪??紐⑤뱶 踰꾪듉??李얠쓣 ???占쎌뒿?占쎈떎.');
      }
    } catch (err) {
      saveLog(`?占쎌뒪??紐⑤뱶 踰꾪듉 ?占쎈┃ ?占쏀뙣: ${err.message}`);
    }
    
    // 3. 媛앹떎 ?占쎈낫 ?占쎈젰 ?占쎌뒪??
    try {
      saveLog('--- 媛앹떎 ?占쎈낫 ?占쎈젰 ?占쎌뒪??---');
      
      // 媛앹떎 ?占쎈낫 ?占쎌뀡 ?占쎌씤
      await page.waitForSelector('section#room', { timeout: 5000 });
      saveLog('媛앹떎 ?占쎈낫 ?占쎌뀡 李얠쓬');
      
      // 媛앹떎占??占쎈젰
      saveLog('媛앹떎占??占쎈젰 ?占쎈룄...');
      const roomNameInput = await page.$('input[name="name"]');
      if (roomNameInput) {
        // ?占쎌쟾 占??占쎌씤
        const prevValue = await roomNameInput.inputValue();
        saveLog(`媛앹떎占??占쎈젰 ?占쎈뱶 ?占쎌쟾 占? "${prevValue}"`);
        
        // ??占??占쎈젰
        await roomNameInput.fill('?占쎌뒪???占쎌쐞?占쎈８');
        
        // ?占쎈젰 ??占??占쎌씤
        const newValue = await roomNameInput.inputValue();
        saveLog(`媛앹떎占??占쎈젰 ??占? "${newValue}"`);
      } else {
        saveLog('媛앹떎占??占쎈젰 ?占쎈뱶占?李얠쓣 ???占쎌쓬');
      }
      
      // ?占???占쎈젰
      const roomTypeInput = await page.$('input[name="type"]');
      if (roomTypeInput) {
        await roomTypeInput.fill('?占쎈윮??);
        saveLog('媛앹떎 ?占???占쎈젰 ?占쎈즺');
      } else {
        saveLog('?占???占쎈젰 ?占쎈뱶占?李얠쓣 ???占쎌쓬');
      }
      
      // 援ъ“ ?占쎈젰
      const roomStructureInput = await page.$('input[name="structure"]');
      if (roomStructureInput) {
        await roomStructureInput.fill('占?+?占쎌떎1');
        saveLog('援ъ“ ?占쎈젰 ?占쎈즺');
      } else {
        saveLog('援ъ“ ?占쎈젰 ?占쎈뱶占?李얠쓣 ???占쎌쓬');
      }
      
      // 踰좊뱶?占???占쎈젰
      const roomBedTypeInput = await page.$('input[name="bedType"]');
      if (roomBedTypeInput) {
        await roomBedTypeInput.fill('???占쎌씠占?1占?);
        saveLog('踰좊뱶?占???占쎈젰 ?占쎈즺');
      } else {
        saveLog('踰좊뱶?占???占쎈젰 ?占쎈뱶占?李얠쓣 ???占쎌쓬');
      }
      
      // ?占쎈젰 ???占쎌떆 ?占쏙옙?
      saveLog('?占쎈젰 ???占쏀깭 ?占쎈뜲?占쏀듃 ?占쏙옙?..');
      await page.waitForTimeout(2000);
      
      // ?占쎈젰 ???占쏀겕由곗꺑
      await page.screenshot({ path: 'screenshot-after-input.png', fullPage: true });
      saveLog('?占쎈젰 ???占쏀겕由곗꺑 ?占???占쎈즺: screenshot-after-input.png');
    } catch (err) {
      saveLog(`媛앹떎 ?占쎈낫 ?占쎈젰 ?占쎌뒪???占쏀뙣: ${err.message}`);
    }
    
    // 4. 誘몃━蹂닿린 踰꾪듉 ?占쎈┃ ?占쎌뒪??
    try {
      saveLog('--- 誘몃━蹂닿린 踰꾪듉 ?占쎈┃ ?占쎌뒪??---');
      
      // 誘몃━蹂닿린 踰꾪듉 李얘린
      await page.waitForSelector('button:has-text("誘몃━蹂닿린 ?占쎌꽦")');
      const previewButton = await page.$('button:has-text("誘몃━蹂닿린 ?占쎌꽦")');
      
      if (previewButton) {
        saveLog('誘몃━蹂닿린 踰꾪듉 李얠쓬, ?占쎈┃ ?占쎈룄...');
        await previewButton.click();
        saveLog('誘몃━蹂닿린 踰꾪듉 ?占쎈┃ ?占쎈즺');
        
        // 濡쒕뵫 ?占쏙옙?
        saveLog('誘몃━蹂닿린 ?占쎌꽦 占?.. (5占??占쏙옙?');
        await page.waitForTimeout(5000);
        
        // 誘몃━蹂닿린 寃곌낵 ?占쏀겕由곗꺑
        await page.screenshot({ path: 'screenshot-preview.png', fullPage: true });
        saveLog('誘몃━蹂닿린 ???占쏀겕由곗꺑 ?占???占쎈즺: screenshot-preview.png');
        
        // HTML 誘몃━蹂닿린 ?占쎌슜 ?占쎌씤
        const previewContent = await page.locator('#previewContainer iframe').contentFrame();
        if (previewContent) {
          saveLog('誘몃━蹂닿린 iframe 李얠쓬, ?占쎌슜 ?占쎌씤 占?..');
          
          // iframe ?占쎌슜 媛?占쎌삤占?
          const frameContent = await previewContent.content();
          if (frameContent) {
            saveLog(`誘몃━蹂닿린 iframe ?占쎌슜 ?占쏙옙?: ${frameContent.substring(0, 200)}...`);
            
            // ?占쎌젙 ?占쎌슜 ?占쎌씤
            if (frameContent.includes('?占쎌뒪???占쎌쐞?占쎈８')) {
              saveLog('??誘몃━蹂닿린??媛앹떎紐낆씠 ?占쎌긽?占쎌쑝占??占쎌떆?占쎈땲??');
            } else {
              saveLog('??誘몃━蹂닿린??媛앹떎紐낆씠 ?占쎌떆?占쏙옙? ?占쎌뒿?占쎈떎!');
            }
            
            if (frameContent.includes('?占쎈윮??)) {
              saveLog('??誘몃━蹂닿린??媛앹떎 ?占?占쎌씠 ?占쎌긽?占쎌쑝占??占쎌떆?占쎈땲??');
            } else {
              saveLog('??誘몃━蹂닿린??媛앹떎 ?占?占쎌씠 ?占쎌떆?占쏙옙? ?占쎌뒿?占쎈떎!');
            }
          } else {
            saveLog('誘몃━蹂닿린 iframe ?占쎌슜??媛?占쎌삱 ???占쎌뒿?占쎈떎.');
          }
        } else {
          saveLog('誘몃━蹂닿린 iframe??李얠쓣 ???占쎌뒿?占쎈떎.');
        }
      } else {
        saveLog('誘몃━蹂닿린 踰꾪듉??李얠쓣 ???占쎌뒿?占쎈떎.');
      }
    } catch (err) {
      saveLog(`誘몃━蹂닿린 ?占쎌뒪???占쏀뙣: ${err.message}`);
    }
    
    // ?占쎌떆 ?占쏙옙???醫낅즺
    saveLog('?占쎌뒪???占쎈즺, 5占???醫낅즺');
    await page.waitForTimeout(5000);
  } catch (err) {
    saveLog(`?占쎌뒪??占??占쎈쪟 諛쒖깮: ${err}`);
  } finally {
    await browser.close();
    saveLog('釉뚮씪?占쏙옙?媛 醫낅즺?占쎌뿀?占쎈땲??');
  }
}

// ?占쏀겕由쏀듃 ?占쏀뻾
collectLogs().catch(err => {
  console.error('濡쒓렇 ?占쎌쭛 ?占쏀겕由쏀듃 ?占쎈쪟:', err);
  process.exit(1);
}); 
