const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('?? ?섏씠吏 濡쒕뵫 ?쒖옉...');
    const startTime = Date.now();
    
    await page.goto('http://localhost: {process.env.PORT || 3900}', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`???섏씠吏 濡쒕뵫 ?꾨즺: ${loadTime}ms`);
    
    // ?섏씠吏 ?쒕ぉ ?뺤씤
    const title = await page.title();
    console.log(`?뱞 ?섏씠吏 ?쒕ぉ: ${title}`);
    
    // 湲곕낯 ?붿냼???뺤씤
    const elements = await page.evaluate(() => {
      return {
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length,
        divs: document.querySelectorAll('div').length,
        modals: document.querySelectorAll('[role="dialog"]').length
      };
    });
    
    console.log('?뱤 ?섏씠吏 ?붿냼 ?꾪솴:');
    console.log(`  - 踰꾪듉: ${elements.buttons}媛?);
    console.log(`  - ?낅젰?꾨뱶: ${elements.inputs}媛?);
    console.log(`  - DIV: ${elements.divs}媛?);
    console.log(`  - 紐⑤떖: ${elements.modals}媛?);
    
    // ?ㅽ겕由곗꺑 珥ъ쁺
    await page.screenshot({ path: 'quick-test-result.png' });
    console.log('?벝 ?ㅽ겕由곗꺑 ??λ맖: quick-test-result.png');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest(); 
