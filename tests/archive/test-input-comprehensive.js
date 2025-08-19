const { chromium } = require('playwright');

async function testInputComprehensive() {
  console.log('?룳 理쒖쟻?붾맂 ?낅젰 ?뚯뒪???쒖옉...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    timeout: 60000
  });
  
  try {
    const page = await browser.newPage();
    
    // ?섏씠吏 濡쒕뵫 ?깅뒫 痢≪젙
    const startTime = Date.now();
    console.log('?뱞 ?섏씠吏 濡쒕뵫 以?..');
    
    await page.goto('http://localhost: {process.env.PORT || 3900}', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`???섏씠吏 濡쒕뵫 ?꾨즺: ${loadTime}ms`);
    
    // ?섏씠吏 ?덉젙???湲?
    await page.waitForTimeout(3000);
    
    // 珥덇린 ?곹깭 ?뺤씤
    console.log('?뱥 珥덇린 ?곹깭 ?뺤씤...');
    const initialData = await page.evaluate(() => {
      return {
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length,
        textareas: document.querySelectorAll('textarea').length,
        modals: document.querySelectorAll('[role="dialog"]').length
      };
    });
    console.log('?뱤 珥덇린 ?붿냼 ??', initialData);
    
    // ?명뀛 ?뺣낫 ?뱀뀡 李얘린 諛??대┃
    console.log('?룳 ?명뀛 ?뺣낫 ?뱀뀡 李얜뒗 以?..');
    
    // ???뺥솗???명뀛 ?뺣낫 移대뱶 李얘린
    const hotelCards = await page.evaluate(() => {
      const cards = [];
      document.querySelectorAll('div').forEach((div, i) => {
        const text = div.textContent?.trim() || '';
        if (text.includes('?명뀛 ?뺣낫') && text.includes('湲곕낯 ?뺣낫')) {
          const rect = div.getBoundingClientRect();
          cards.push({
            index: i,
            text: text.substring(0, 100),
            visible: rect.width > 0 && rect.height > 0,
            clickable: div.style.cursor === 'pointer' || div.onclick !== null,
            className: div.className
          });
        }
      });
      return cards;
    });
    
    console.log('?뵇 諛쒓껄???명뀛 ?뺣낫 移대뱶:', hotelCards.length);
    
    if (hotelCards.length > 0) {
      console.log('?렞 ?명뀛 ?뺣낫 移대뱶 ?대┃ ?쒕룄...');
      
      // 泥?踰덉㎏ ?명뀛 ?뺣낫 移대뱶 ?대┃
      await page.click('text=?명뀛 ?뺣낫');
      await page.waitForTimeout(2000);
      
      // 紐⑤떖 ?곹깭 ?뺤씤
      const modalState = await page.evaluate(() => {
        const modals = document.querySelectorAll('[role="dialog"]');
        return {
          modalCount: modals.length,
          modalVisible: modals.length > 0 && modals[0].style.display !== 'none',
          modalContent: modals.length > 0 ? modals[0].textContent?.substring(0, 200) : null
        };
      });
      
      console.log('?뱥 紐⑤떖 ?곹깭:', modalState);
      
      if (modalState.modalCount > 0) {
        console.log('??紐⑤떖 ?대┝ ?뺤씤');
        
        // 紐⑤떖 ?댁슜 濡쒕뵫 ?湲?
        await page.waitForTimeout(2000);
        
        // ?낅젰 ?꾨뱶 李얘린
        const inputFields = await page.evaluate(() => {
          const inputs = [];
          
          // 紐⑤떖 ?대????낅젰 ?꾨뱶留?李얘린
          const modal = document.querySelector('[role="dialog"]');
          if (modal) {
            // input ?쒓렇??
            modal.querySelectorAll('input').forEach((input, i) => {
              inputs.push({
                index: i,
                type: 'input',
                name: input.name || '',
                placeholder: input.placeholder || '',
                value: input.value || '',
                visible: input.offsetParent !== null
              });
            });
            
            // textarea ?쒓렇??
            modal.querySelectorAll('textarea').forEach((textarea, i) => {
              inputs.push({
                index: i,
                type: 'textarea',
                name: textarea.name || '',
                placeholder: textarea.placeholder || '',
                value: textarea.value || '',
                visible: textarea.offsetParent !== null
              });
            });
          }
          
          return inputs;
        });
        
        console.log('?뱷 諛쒓껄???낅젰 ?꾨뱶:', inputFields.length);
        inputFields.forEach((field, i) => {
          console.log(`  ${i + 1}. ${field.type} - name: "${field.name}", placeholder: "${field.placeholder}"`);
        });
        
        if (inputFields.length > 0) {
          console.log('?뻿截??낅젰 ?뚯뒪???쒖옉...');
          
          // ?뚯뒪???곗씠??
          const testData = {
            hotelName: '?뚯뒪???명뀛 ' + Date.now(),
            address: '?쒖슱??媛뺣궓援??뚯뒪?몃줈 123',
            description: '?뚯뒪?몄슜 ?명뀛 ?ㅻ챸?낅땲?? ?먮룞 ?뚯뒪?몃줈 ?낅젰???댁슜?낅땲??'
          };
          
          // ?명뀛紐??낅젰
          const hotelNameField = inputFields.find(f => f.name === 'hotelName' || f.placeholder.includes('?명뀛紐?));
          if (hotelNameField) {
            console.log('?룳 ?명뀛紐??낅젰 以?..');
            await page.fill(`[name="${hotelNameField.name}"]`, testData.hotelName);
            await page.waitForTimeout(500);
            
            // ?낅젰 ?뺤씤
            const inputValue = await page.inputValue(`[name="${hotelNameField.name}"]`);
            console.log(`???명뀛紐??낅젰 ?꾨즺: "${inputValue}"`);
          }
          
          // 二쇱냼 ?낅젰
          const addressField = inputFields.find(f => f.name === 'address' || f.placeholder.includes('二쇱냼'));
          if (addressField) {
            console.log('?뱧 二쇱냼 ?낅젰 以?..');
            await page.fill(`[name="${addressField.name}"]`, testData.address);
            await page.waitForTimeout(500);
            
            // ?낅젰 ?뺤씤
            const inputValue = await page.inputValue(`[name="${addressField.name}"]`);
            console.log(`??二쇱냼 ?낅젰 ?꾨즺: "${inputValue}"`);
          }
          
          // ?ㅻ챸 ?낅젰
          const descField = inputFields.find(f => f.name === 'description' || f.placeholder.includes('?ㅻ챸'));
          if (descField) {
            console.log('?뱷 ?ㅻ챸 ?낅젰 以?..');
            if (descField.type === 'textarea') {
              await page.fill(`textarea[name="${descField.name}"]`, testData.description);
            } else {
              await page.fill(`[name="${descField.name}"]`, testData.description);
            }
            await page.waitForTimeout(500);
            
            // ?낅젰 ?뺤씤
            const inputValue = descField.type === 'textarea' 
              ? await page.inputValue(`textarea[name="${descField.name}"]`)
              : await page.inputValue(`[name="${descField.name}"]`);
            console.log(`???ㅻ챸 ?낅젰 ?꾨즺: "${inputValue.substring(0, 50)}..."`);
          }
          
          // ?낅젰 ?꾨즺 ???좎떆 ?湲?
          await page.waitForTimeout(2000);
          
          // 理쒖쥌 ?낅젰 媛??뺤씤
          console.log('?뵇 理쒖쥌 ?낅젰 媛??뺤씤...');
          const finalValues = await page.evaluate(() => {
            const modal = document.querySelector('[role="dialog"]');
            const values = {};
            
            if (modal) {
              modal.querySelectorAll('input, textarea').forEach(element => {
                if (element.name) {
                  values[element.name] = element.value;
                }
              });
            }
            
            return values;
          });
          
          console.log('?뱥 理쒖쥌 ?낅젰 媛?', finalValues);
          
          // ?먮룞????뺤씤 (3珥??湲?
          console.log('?뮶 ?먮룞????뺤씤 以?..');
          await page.waitForTimeout(3000);
          
          // ???踰꾪듉 李얘린 諛??대┃
          const saveButton = await page.locator('button:has-text("???), button:has-text("?곸슜")').first();
          if (await saveButton.isVisible()) {
            console.log('?뮶 ???踰꾪듉 ?대┃...');
            await saveButton.click();
            await page.waitForTimeout(1000);
            console.log('??????꾨즺');
          }
          
          // ?ㅽ겕由곗꺑 ???
          await page.screenshot({ path: 'test-input-result.png' });
          console.log('?벝 寃곌낵 ?ㅽ겕由곗꺑 ??λ맖');
          
          // ?깃났 硫붿떆吏
          console.log('?럦 ?낅젰 ?뚯뒪???깃났!');
          console.log('?뱤 ?뚯뒪??寃곌낵:');
          console.log(`  - ?명뀛紐? ${finalValues.hotelName || '?낅젰 ?ㅽ뙣'}`);
          console.log(`  - 二쇱냼: ${finalValues.address || '?낅젰 ?ㅽ뙣'}`);
          console.log(`  - ?ㅻ챸: ${finalValues.description ? finalValues.description.substring(0, 30) + '...' : '?낅젰 ?ㅽ뙣'}`);
          
        } else {
          console.log('???낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
        }
        
      } else {
        console.log('??紐⑤떖???대━吏 ?딆쓬');
      }
      
    } else {
      console.log('???명뀛 ?뺣낫 移대뱶瑜?李얠쓣 ???놁쓬');
    }
    
    // 5珥????湲?(寃곌낵 ?뺤씤??
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error.message);
    await page.screenshot({ path: 'test-input-error.png' });
  } finally {
    await browser.close();
    console.log('?뵚 ?뚯뒪???꾨즺');
  }
}

testInputComprehensive(); 
