import React from 'react';
const puppeteer = require('puppeteer');

async function browserConsoleTest() {
  console.log('?뵇 釉뚮씪?곗? 肄섏넄 濡쒓렇 紐⑤땲?곕쭅...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    slowMo: 200
  });
  
  try {
    const page = await browser.newPage();
    
    // 紐⑤뱺 肄섏넄 濡쒓렇 ?섏쭛
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      const timestamp = new Date().toISOString().substr(11, 12);
      logs.push({ timestamp, text });
      
      // SimpleInput怨?RoomInfoEditor 愿??濡쒓렇留?異쒕젰
      if (text.includes('SimpleInput') || text.includes('RoomInfoEditor') || text.includes('?뵩') || text.includes('?뱷') || text.includes('?룳')) {
        console.log(`[${timestamp}] ${text}`);
      }
    });
    
    // ?섏씠吏 濡쒕뱶
    console.log('?뱞 ?섏씠吏 濡쒕뱶 以?..');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle0' });
    
    // React 濡쒕뵫 ?湲?
    await page.waitForFunction(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      return gridContainer && gridContainer.querySelectorAll('.cursor-pointer').length > 0;
    }, { timeout: 15000 });
    
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺, 媛앹떎 紐⑤떖 ?닿린...');
    
    // 媛앹떎 移대뱶 ?대┃
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      for (let card of cards) {
        if (card.textContent.includes('媛앹떎 ?뺣낫')) {
          card.click();
          return;
        }
      }
    });
    
    // 紐⑤떖 ?湲?
    await page.waitForFunction(() => {
      const modals = document.querySelectorAll('[role="dialog"]');
      return modals.length > 0 && modals[0].offsetParent !== null;
    }, { timeout: 5000 });
    
    console.log('?렚 紐⑤떖 ?대┝ ?꾨즺, 3珥??湲?..');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // ?낅젰 ?꾨뱶 ?뺤씤
    const inputInfo = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return null;
      
      const nameInputs = Array.from(modal.querySelectorAll('input[name="name"]'));
      return nameInputs.map((input, i) => ({
        index: i,
        value: input.value,
        className: input.className,
        tagName: input.tagName
      }));
    });
    
    console.log(`\n?뱤 李얠? ?낅젰 ?꾨뱶: ${inputInfo.length}媛?);
    inputInfo.forEach((input, i) => {
      console.log(`  ${i + 1}. 媛? "${input.value}", ?대옒?? ${input.className}`);
    });
    
    if (inputInfo.length > 0) {
      console.log('\n?뱷 ?낅젰 ?뚯뒪???쒖옉...');
      
      // 泥?踰덉㎏ ?꾨뱶??'?? ?낅젰 (?쒓? 議고빀 ?쒖옉)
      await page.focus('[role="dialog"] input[name="name"]:first-of-type');
      console.log('?⑨툘 ?꾨뱶 ?ъ빱???꾨즺');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // ??湲?먯뵫 ?낅젰
      await page.keyboard.type('??, { delay: 500 });
      console.log('?⑨툘 "?? ?낅젰 ?꾨즺');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.keyboard.type('??, { delay: 500 });
      console.log('?⑨툘 "?? ?낅젰 ?꾨즺');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.keyboard.type('??, { delay: 500 });
      console.log('?⑨툘 "?? ?낅젰 ?꾨즺');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.keyboard.type('??, { delay: 500 });
      console.log('?⑨툘 "?? ?낅젰 ?꾨즺');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 理쒖쥌 媛??뺤씤
      const finalValue = await page.$eval('[role="dialog"] input[name="name"]:first-of-type', el => el.value);
      console.log(`\n?렞 理쒖쥌 ?낅젰 媛? "${finalValue}"`);
    }
    
    // 理쒓렐 濡쒓렇 異쒕젰
    console.log('\n?뱥 理쒓렐 肄섏넄 濡쒓렇 (留덉?留?20媛?:');
    const recentLogs = logs.slice(-20);
    recentLogs.forEach(log => {
      console.log(`  [${log.timestamp}] ${log.text}`);
    });
    
    // ?좎떆 ?湲?
    console.log('\n?깍툘 5珥??湲?以?.. (釉뚮씪?곗??먯꽌 吏곸젒 ?뺤씤 媛??');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('???뚯뒪??以??ㅻ쪟:', error);
  } finally {
    console.log('?뢾 釉뚮씪?곗? 肄섏넄 ?뚯뒪???꾨즺');
    await browser.close();
  }
}

// ?ㅽ뻾
browserConsoleTest().catch(console.error); 
