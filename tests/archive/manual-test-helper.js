import React from 'react';
const puppeteer = require('puppeteer');

async function manualTestHelper() {
  console.log('?뵩 ?섎룞 ?뚯뒪???ы띁 ?쒖옉...');
  console.log('?뱷 釉뚮씪?곗?媛 ?대━硫?吏곸젒 ?쒓????낅젰?대낫?몄슂.');
  console.log('?렞 ?뚯뒪?명븷 ?댁슜: "?붾윮???몄쐢猷?, "?꾨━誘몄뾼 ?ㅼ쐞?? ??);
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    slowMo: 0 // ?섎룞 ?낅젰?대?濡?slowMo ?쒓굅
  });
  
  try {
    const page = await browser.newPage();
    
    // 肄섏넄 濡쒓렇 紐⑤땲?곕쭅
    page.on('console', msg => {
      const text = msg.text();
      const timestamp = new Date().toISOString().substr(11, 12);
      
      // 以묒슂??濡쒓렇留?異쒕젰
      if (text.includes('SimpleInput') || text.includes('RoomInfoEditor') || 
          text.includes('?눖?눟') || text.includes('??) || text.includes('??) || 
          text.includes('?슟') || text.includes('??') || text.includes('?뱷')) {
        console.log(`[${timestamp}] ${text}`);
      }
    });
    
    // ?섏씠吏 濡쒕뱶
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle0' });
    
    // React 濡쒕뵫 ?湲?
    await page.waitForFunction(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      return gridContainer && gridContainer.querySelectorAll('.cursor-pointer').length > 0;
    }, { timeout: 15000 });
    
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
    
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
    
    console.log('?렚 紐⑤떖???대졇?듬땲??');
    console.log('');
    console.log('?뱥 ?섎룞 ?뚯뒪??媛?대뱶:');
    console.log('  1. 泥?踰덉㎏ 媛앹떎紐??꾨뱶瑜??대┃?섏꽭??);
    console.log('  2. "?붾윮???몄쐢猷???泥쒖쿇???낅젰?대낫?몄슂');
    console.log('  3. Tab ?ㅻ? ?뚮윭 ?ㅼ쓬 ?꾨뱶濡??대룞?섏꽭??);
    console.log('  4. "?꾨━誘몄뾼 ?ㅼ쐞??瑜??낅젰?대낫?몄슂');
    console.log('  5. 媛??낅젰 ??肄섏넄 濡쒓렇瑜??뺤씤?섏꽭??);
    console.log('');
    console.log('?뵇 ?뺤씤?ы빆:');
    console.log('  - 議고빀 ?대깽?멸? 諛쒖깮?섎뒗吏 (?눖?눟 濡쒓렇)');
    console.log('  - debounce媛 ?щ컮瑜닿쾶 ?묐룞?섎뒗吏 (??濡쒓렇)');
    console.log('  - 理쒖쥌 媛믪씠 ?뺥솗????λ릺?붿?');
    console.log('');
    console.log('?좑툘 ?뚯뒪???꾨즺 ??Ctrl+C瑜??뚮윭 醫낅즺?섏꽭??');
    
    // ?뚯뒪?몄슜 ?좏떥由ы떚 ?⑥닔瑜??섏씠吏??異붽?
    await page.evaluate(() => {
      window.testHelper = {
        // ?꾩옱 紐⑤뱺 ?낅젰 ?꾨뱶 媛??뺤씤
        checkAllValues: () => {
          const modal = document.querySelector('[role="dialog"]');
          if (!modal) return { error: 'Modal not found' };
          
          const nameInputs = Array.from(modal.querySelectorAll('input[name="name"]'));
          const typeInputs = Array.from(modal.querySelectorAll('input[name="type"]'));
          
          console.log('?뱤 ?꾩옱 ?낅젰 媛믩뱾:');
          nameInputs.forEach((input, i) => {
            console.log(`  媛앹떎 ${i + 1} ?대쫫: "${input.value}"`);
          });
          typeInputs.forEach((input, i) => {
            if (input.value) {
              console.log(`  媛앹떎 ${i + 1} ??? "${input.value}"`);
            }
          });
          
          return {
            names: nameInputs.map(input => input.value),
            types: typeInputs.map(input => input.value)
          };
        },
        
        // ?낅젰 ?꾨뱶 媛뺤“ ?쒖떆
        highlightFields: () => {
          const nameInputs = Array.from(document.querySelectorAll('[role="dialog"] input[name="name"]'));
          nameInputs.forEach((input, i) => {
            input.style.border = '3px solid red';
            input.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
              input.style.border = '';
              input.style.backgroundColor = '';
            }, 3000);
          });
          console.log('??媛앹떎紐??낅젰 ?꾨뱶?ㅼ쓣 媛뺤“ ?쒖떆?덉뒿?덈떎 (3珥덇컙)');
        }
      };
      
      console.log('?썱截??뚯뒪???좏떥由ы떚 ?⑥닔媛 異붽??섏뿀?듬땲??');
      console.log('  - testHelper.checkAllValues() : ?꾩옱 紐⑤뱺 ?낅젰 媛??뺤씤');
      console.log('  - testHelper.highlightFields() : ?낅젰 ?꾨뱶 媛뺤“ ?쒖떆');
    });
    
    // 臾댄븳 ?湲?(?ъ슜?먭? Ctrl+C濡?醫낅즺???뚭퉴吏)
    console.log('???섎룞 ?뚯뒪??吏꾪뻾 以?.. (Ctrl+C濡?醫낅즺)');
    
    // 30珥덈쭏???곹깭 ?뺤씤 硫붿떆吏 異쒕젰
    setInterval(() => {
      console.log('?뱷 ?섎룞 ?뚯뒪??吏꾪뻾 以?.. 釉뚮씪?곗??먯꽌 吏곸젒 ?낅젰?대낫?몄슂.');
    }, 30000);
    
    // Promise that never resolves (until process is killed)
    await new Promise(() => {});
    
  } catch (error) {
    console.error('???ы띁 ?ㅽ뻾 以??ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

// Ctrl+C ?몃뱾??
process.on('SIGINT', () => {
  console.log('\n?뢾 ?섎룞 ?뚯뒪???ы띁 醫낅즺');
  process.exit(0);
});

// ?ㅽ뻾
manualTestHelper().catch(console.error); 
