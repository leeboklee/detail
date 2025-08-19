const { chromium } = require('playwright');

async function finalSaveTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 肄섏넄 濡쒓렇 ?섏쭛
    const logs = [];
    page.on('console', msg => {
      logs.push(`${new Date().toISOString()} ${msg.type()}: ${msg.text()}`);
    });
    
    // alert ??붿긽??泥섎━
    page.on('dialog', async dialog => {
      console.log('?슚 Alert 硫붿떆吏:', dialog.message());
      await dialog.accept();
    });
    
    console.log('?뮶 DB ???紐⑤떖 ?닿린...');
    
    // DB ???踰꾪듉 ?대┃ (紐⑤떖 ?닿린)
    await page.click('button:has-text("?뾼截?DB ???)');
    await page.waitForTimeout(2000);
    
    console.log('?뮶 ?덈줈 ???踰꾪듉 ?대┃...');
    
    // ?덈줈 ???踰꾪듉 ?대┃
    await page.click('button:has-text("?덈줈 ???)');
    await page.waitForTimeout(5000);
    
    console.log('\n?뱥 肄섏넄 濡쒓렇:');
    logs.forEach(log => console.log(log));
    
    // ?ㅽ듃?뚰겕 ?붿껌 ?뺤씤
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // 異붽?濡?5珥??湲?
    await page.waitForTimeout(5000);
    
    console.log('\n?뙋 API ?붿껌:');
    responses.forEach(res => {
      console.log(`${res.method} ${res.url} - ${res.status}`);
    });
    
    // ?ㅽ겕由곗꺑
    await page.screenshot({ path: 'debug/final-save-test.png' });
    
    console.log('??理쒖쥌 ????뚯뒪???꾨즺');
    
  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

finalSaveTest(); 
