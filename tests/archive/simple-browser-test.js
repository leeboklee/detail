import React from 'react';
const puppeteer = require('puppeteer');
const fs = require('fs');

async function testModal() {
  console.log('?㎦ 媛앹떎 紐⑤떖 ?뚯뒪???쒖옉...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 } 
  });
  
  try {
    const page = await browser.newPage();
    
    // 肄섏넄 濡쒓렇 ?섏쭛
    page.on('console', msg => {
      console.log('?뼢截?釉뚮씪?곗? 濡쒓렇:', msg.text());
    });
    
    // 1. ?섏씠吏 濡쒕뱶
    console.log('?뙋 ?섏씠吏 濡쒕뱶 以?..');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle0' });
    
    // 2. React 而댄룷?뚰듃 濡쒕뵫 ?꾨즺 ?湲?(移대뱶 洹몃━?쒓? ?뚮뜑留곷맆 ?뚭퉴吏)
    console.log('??React 而댄룷?뚰듃 濡쒕뵫 ?湲?以?..');
    await page.waitForFunction(() => {
      // 移대뱶 洹몃━?쒓? ?뚮뜑留곷맆 ?뚭퉴吏 ?湲?
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      const cards = gridContainer ? gridContainer.querySelectorAll('.cursor-pointer') : [];
      return cards.length > 0;
    }, { timeout: 15000 });
    
    console.log('??React 而댄룷?뚰듃 濡쒕뵫 ?꾨즺');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. 珥덇린 ?ㅽ겕由곗꺑
    await page.screenshot({ path: 'test-results/browser-test-01-initial.png', fullPage: true });
    console.log('?벝 珥덇린 ?ㅽ겕由곗꺑 ????꾨즺');
    
    // 4. ?섏씠吏 援ъ“ ?뺤씤
    const cardCount = await page.evaluate(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      return gridContainer ? gridContainer.querySelectorAll('.cursor-pointer').length : 0;
    });
    console.log(`?뱤 移대뱶 媛쒖닔: ${cardCount}媛?);
    
    // 5. 媛앹떎 移대뱶 李얘린 - ?띿뒪?몃줈 李얘린
    const roomCardExists = await page.evaluate(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      for (let card of cards) {
        if (card.textContent.includes('媛앹떎 ?뺣낫')) {
          return true;
        }
      }
      return false;
    });
    console.log(`?룧 媛앹떎 移대뱶 議댁옱: ${roomCardExists}`);
    
    if (roomCardExists) {
      // 6. 移대뱶 ?띿뒪???뺤씤
      const cardText = await page.evaluate(() => {
        const cards = document.querySelectorAll('.cursor-pointer');
        for (let card of cards) {
          if (card.textContent.includes('媛앹떎 ?뺣낫')) {
            return card.textContent;
          }
        }
        return null;
      });
      console.log(`?뱷 移대뱶 ?띿뒪?? ${cardText?.substring(0, 100)}...`);
      
      // 7. 紐⑤떖 ?곹깭 ?뺤씤 (?대┃ ??
      const modalsBefore = await page.evaluate(() => {
        return document.querySelectorAll('[role="dialog"]').length;
      });
      console.log(`?렚 ?대┃ ??紐⑤떖 媛쒖닔: ${modalsBefore}`);
      
      // 8. 移대뱶 ?대┃ - 媛앹떎 ?뺣낫 移대뱶瑜?李얠븘???대┃
      await page.evaluate(() => {
        const cards = document.querySelectorAll('.cursor-pointer');
        for (let card of cards) {
          if (card.textContent.includes('媛앹떎 ?뺣낫')) {
            card.click();
            return;
          }
        }
      });
      console.log('?몘 媛앹떎 移대뱶 ?대┃ ?꾨즺');
      
      // 9. ?대┃ ??紐⑤떖 ?뚮뜑留??湲?
      console.log('??紐⑤떖 ?뚮뜑留??湲?以?..');
      try {
        await page.waitForFunction(() => {
          const modals = document.querySelectorAll('[role="dialog"]');
          return modals.length > 0 && modals[0].offsetParent !== null;
        }, { timeout: 5000 });
        console.log('??紐⑤떖 ?뚮뜑留??꾨즺');
      } catch (e) {
        console.log('?좑툘 紐⑤떖 ?뚮뜑留???꾩븘??(怨꾩냽 吏꾪뻾)');
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 10. 紐⑤떖 ?곹깭 ?뺤씤 (?대┃ ??
      const modalsAfter = await page.evaluate(() => {
        const modals = document.querySelectorAll('[role="dialog"]');
        return {
          count: modals.length,
          visible: Array.from(modals).map(m => ({
            visible: m.offsetParent !== null,
            display: getComputedStyle(m).display,
            opacity: getComputedStyle(m).opacity,
            className: m.className
          }))
        };
      });
      console.log(`?렚 ?대┃ ??紐⑤떖 ?곹깭:`, modalsAfter);
      
      // 11. ?대┃ ???ㅽ겕由곗꺑
      await page.screenshot({ path: 'test-results/browser-test-02-after-click.png', fullPage: true });
      console.log('?벝 ?대┃ ???ㅽ겕由곗꺑 ????꾨즺');
      
      // 12. 紐⑤떖???덈떎硫??낅젰 ?꾨뱶 ?뺤씤
      if (modalsAfter.count > 0) {
        const inputFields = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]');
          if (modal) {
            const inputs = modal.querySelectorAll('input');
            const textareas = modal.querySelectorAll('textarea');
            return {
              inputs: inputs.length,
              textareas: textareas.length,
              inputTypes: Array.from(inputs).map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder }))
            };
          }
          return null;
        });
        
        console.log(`?뵥 ?낅젰 ?꾨뱶 ?뺣낫:`, inputFields);
        
        if (inputFields && inputFields.inputs > 0) {
          // 泥?踰덉㎏ ?낅젰 ?꾨뱶???뚯뒪???낅젰
          await page.type('[role="dialog"] input:first-of-type', '?뚯뒪??媛앹떎紐?);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const inputValue = await page.$eval('[role="dialog"] input:first-of-type', el => el.value);
          console.log(`?랃툘 ?낅젰 ?뚯뒪??寃곌낵: "${inputValue}"`);
          
          await page.screenshot({ path: 'test-results/browser-test-03-input-test.png', fullPage: true });
          console.log('?벝 ?낅젰 ?뚯뒪???ㅽ겕由곗꺑 ????꾨즺');
        }
      } else {
        console.log('??紐⑤떖???대━吏 ?딆븯??);
        
        // React ?곹깭 ?붾쾭源?
        const reactDebug = await page.evaluate(() => {
          const body = document.body;
          return {
            bodyClasses: body.className,
            bodyStyle: body.style.cssText,
            modalElements: document.querySelectorAll('*[class*="modal"], *[class*="Modal"]').length,
            overlayElements: document.querySelectorAll('*[class*="overlay"], *[class*="Overlay"]').length,
            clickableElements: document.querySelectorAll('.cursor-pointer').length,
            roomCards: Array.from(document.querySelectorAll('.cursor-pointer')).filter(card => 
              card.textContent.includes('媛앹떎')).length
          };
        });
        console.log('?뵇 React ?붾쾭源??뺣낫:', reactDebug);
      }
    } else {
      console.log('??媛앹떎 移대뱶瑜?李얠쓣 ???놁쓬');
      
      // ?ъ슜 媛?ν븳 移대뱶???섏뿴
      const availableCards = await page.evaluate(() => {
        const cards = document.querySelectorAll('.cursor-pointer');
        return Array.from(cards).map(card => ({
          text: card.textContent.substring(0, 100)
        }));
      });
      console.log('?뱥 ?ъ슜 媛?ν븳 移대뱶??', availableCards);
    }
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
  } finally {
    console.log('?뢾 ?뚯뒪???꾨즺, 釉뚮씪?곗? ?ル뒗 以?..');
    await browser.close();
  }
}

// ?ㅽ뻾
testModal().catch(console.error); 
