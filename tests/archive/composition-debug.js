import React from 'react';
const puppeteer = require('puppeteer');

async function compositionDebug() {
  console.log('?뵇 議고빀 ?대깽???붾쾭源?..');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    slowMo: 100
  });
  
  try {
    const page = await browser.newPage();
    
    // 紐⑤뱺 肄섏넄 濡쒓렇 ?섏쭛
    page.on('console', msg => {
      const text = msg.text();
      const timestamp = new Date().toISOString().substr(11, 12);
      console.log(`[${timestamp}] ${text}`);
    });
    
    // ?섏씠吏 濡쒕뱶
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle0' });
    
    // React 濡쒕뵫 ?湲?
    await page.waitForFunction(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      return gridContainer && gridContainer.querySelectorAll('.cursor-pointer').length > 0;
    }, { timeout: 15000 });
    
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
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('?렚 紐⑤떖 以鍮??꾨즺');
    
    // 議고빀 ?대깽??由ъ뒪?덈? 吏곸젒 DOM??異붽?
    await page.evaluate(() => {
      const input = document.querySelector('[role=\"dialog\"] input[name=\"name\"]:first-of-type');
      if (input) {
        console.log('?렞 議고빀 ?대깽??由ъ뒪??異붽???);
        
        input.addEventListener('compositionstart', (e) => {
          console.log('?뵶 DOM compositionstart ?대깽??諛쒖깮:', e.data);
        });
        
        input.addEventListener('compositionupdate', (e) => {
          console.log('?윞 DOM compositionupdate ?대깽??諛쒖깮:', e.data);
        });
        
        input.addEventListener('compositionend', (e) => {
          console.log('?윟 DOM compositionend ?대깽??諛쒖깮:', e.data);
        });
        
        input.addEventListener('input', (e) => {
          console.log('??DOM input ?대깽??諛쒖깮:', e.target.value);
        });
        
        input.addEventListener('change', (e) => {
          console.log('?뵷 DOM change ?대깽??諛쒖깮:', e.target.value);
        });
      } else {
        console.log('???낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
      }
    });
    
    // ?꾨뱶 ?ъ빱??
    const selector = '[role="dialog"] input[name="name"]:first-of-type';
    await page.focus(selector);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('\\n?뱷 "?? ?낅젰 ?뚯뒪??..');
    
    // ??湲?먮쭔 ?낅젰
    await page.keyboard.type('??, { delay: 300 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\\n?뱷 "?? 異붽? ?낅젰...');
    await page.keyboard.type('??, { delay: 300 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\\n?뱷 "?? 異붽? ?낅젰...');
    await page.keyboard.type('??, { delay: 300 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\\n?뱷 blur ?ㅽ뻾...');
    await page.evaluate((sel) => {
      const input = document.querySelector(sel);
      if (input) {
        input.blur();
        console.log('??blur ?ㅽ뻾?? ?꾩옱 媛?', input.value);
      }
    }, selector);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 理쒖쥌 媛??뺤씤
    const finalValue = await page.$eval(selector, el => el.value);
    console.log(`\\n?렞 理쒖쥌 媛? "${finalValue}"`);
    
  } catch (error) {
    console.error('???붾쾭源?以??ㅻ쪟:', error);
  } finally {
    console.log('\\n?뢾 議고빀 ?대깽???붾쾭源??꾨즺');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
  }
}

// ?ㅽ뻾
compositionDebug().catch(console.error); 
