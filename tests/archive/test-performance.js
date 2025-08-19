const { chromium } = require('playwright');

async function testPerformance() {
  console.log('?? ?깅뒫 媛쒖꽑???명뀛 ?뚯뒪???쒖옉...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 600
  });
  
  try {
    const page = await browser.newPage();
    
    // ?섏씠吏 濡쒕뵫 ?깅뒫 痢≪젙
    const startTime = Date.now();
    console.log('?뱞 ?섏씠吏 濡쒕뵫 以?..');
    
    await page.goto('http://localhost: {process.env.PORT || 3900}', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`???섏씠吏 濡쒕뵫 ?꾨즺: ${loadTime}ms`);
    
    // ?섏씠吏 ?덉젙???湲?
    await page.waitForTimeout(3000);
    
    // ?명뀛 ?뺣낫 ?뱀뀡 李얘린 諛??대┃
    console.log('?룳 ?명뀛 ?뺣낫 ?뱀뀡 李얜뒗 以?..');
    
    // ???뺥솗???좏깮???ъ슜
    const hotelSection = await page.locator('text=?명뀛 ?뺣낫').first();
    
    if (await hotelSection.isVisible()) {
      console.log('?렞 ?명뀛 ?뺣낫 ?뱀뀡 諛쒓껄, ?대┃ 以?..');
      
      // ?대┃ ???ㅽ겕由곗꺑
      await page.screenshot({ path: 'screenshots-archive/test-results/before-click.png' });
      
      await hotelSection.click();
      await page.waitForTimeout(3000);
      
      // ?대┃ ???ㅽ겕由곗꺑
      await page.screenshot({ path: 'screenshots-archive/test-results/after-click.png' });
      
      // 紐⑤떖 ?뺤씤
      const modal = await page.locator('[role="dialog"]');
      const isModalVisible = await modal.isVisible();
      
      console.log(`?뵇 紐⑤떖 ?곹깭: ${isModalVisible ? '?대┝' : '?ロ옒'}`);
      
      if (isModalVisible) {
        console.log('??紐⑤떖 ?대┝ ?뺤씤??);
        
        // ?낅젰 ?꾨뱶 李얘린
        await page.waitForTimeout(2000);
        
        const inputs = await page.evaluate(() => {
          const allInputs = [];
          
          // input ?쒓렇??
          document.querySelectorAll('input[name]').forEach((input, i) => {
            allInputs.push({
              index: i,
              name: input.name,
              placeholder: input.placeholder || '',
              value: input.value || '',
              type: input.type || 'text'
            });
          });
          
          // textarea ?쒓렇??
          document.querySelectorAll('textarea[name]').forEach((textarea, i) => {
            allInputs.push({
              index: i + 100,
              name: textarea.name,
              placeholder: textarea.placeholder || '',
              value: textarea.value || '',
              type: 'textarea'
            });
          });
          
          return allInputs;
        });
        
        console.log(`?뱷 諛쒓껄???낅젰 ?꾨뱶: ${inputs.length}媛?);
        inputs.forEach(input => {
          console.log(`  - ${input.name}: ${input.placeholder} (${input.type})`);
        });
        
        // ?명뀛紐??낅젰 ?뚯뒪??
        const hotelNameInput = inputs.find(input => input.name === 'name');
        if (hotelNameInput) {
          console.log('?룳 ?명뀛紐??낅젰 ?뚯뒪??..');
          
          await page.fill('input[name="name"]', '');
          await page.waitForTimeout(500);
          await page.fill('input[name="name"]', '?뚯뒪???명뀛');
          await page.waitForTimeout(1000);
          
          const newValue = await page.inputValue('input[name="name"]');
          console.log(`???명뀛紐??낅젰 ?꾨즺: "${newValue}"`);
        } else {
          console.log('???명뀛紐??낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
        }
        
        // 二쇱냼 ?낅젰 ?뚯뒪??
        const addressInput = inputs.find(input => input.name === 'address');
        if (addressInput) {
          console.log('?뱧 二쇱냼 ?낅젰 ?뚯뒪??..');
          
          await page.fill('input[name="address"]', '');
          await page.waitForTimeout(500);
          await page.fill('input[name="address"]', '?쒖슱??媛뺣궓援??뚯뒪?몃줈 123');
          await page.waitForTimeout(1000);
          
          const newValue = await page.inputValue('input[name="address"]');
          console.log(`??二쇱냼 ?낅젰 ?꾨즺: "${newValue}"`);
        } else {
          console.log('??二쇱냼 ?낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
        }
        
        // ?ㅻ챸 ?낅젰 ?뚯뒪??
        const descriptionInput = inputs.find(input => input.name === 'description');
        if (descriptionInput) {
          console.log('?뱷 ?ㅻ챸 ?낅젰 ?뚯뒪??..');
          
          const selector = descriptionInput.type === 'textarea' ? 'textarea[name="description"]' : 'input[name="description"]';
          await page.fill(selector, '');
          await page.waitForTimeout(500);
          await page.fill(selector, '?몄븞?섍퀬 源붾걫???뚯뒪???명뀛?낅땲??');
          await page.waitForTimeout(1000);
          
          const newValue = await page.inputValue(selector);
          console.log(`???ㅻ챸 ?낅젰 ?꾨즺: "${newValue}"`);
        } else {
          console.log('???ㅻ챸 ?낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
        }
        
        // 理쒖쥌 ?ㅽ겕由곗꺑
        await page.screenshot({ path: 'screenshots-archive/test-results/final-result.png' });
        
        // ?먮룞????뺤씤???꾪븳 ?湲?
        console.log('?뮶 ?먮룞????뺤씤 ?湲?..');
        await page.waitForTimeout(3000);
        
        console.log('???명뀛 ?뺣낫 ?낅젰 ?뚯뒪???꾨즺');
        
      } else {
        console.log('??紐⑤떖???대━吏 ?딆쓬');
      }
      
    } else {
      console.log('???명뀛 ?뺣낫 ?뱀뀡??李얠쓣 ???놁쓬');
    }
    
    // 5珥????湲?
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error.message);
    
    // ?먮윭 諛쒖깮 ???ㅽ겕由곗꺑
    try {
      await page.screenshot({ path: 'screenshots-archive/test-results/error-screenshot.png' });
    } catch (e) {
      // 臾댁떆
    }
  } finally {
    await browser.close();
    console.log('?뵚 ?뚯뒪???꾨즺');
  }
}

testPerformance(); 
