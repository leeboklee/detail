const { chromium } = require('playwright');

async function simpleSaveTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 肄섏넄 濡쒓렇 ?섏쭛
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    console.log('?뮶 DB ???踰꾪듉 ?대┃...');
    
    // DB ???踰꾪듉 ?대┃
    await page.click('button:has-text("?뾼截?DB ???)');
    
    // 5珥??湲?
    await page.waitForTimeout(5000);
    
    console.log('\n?뱥 肄섏넄 濡쒓렇:');
    logs.forEach(log => console.log(log));
    
    // alert ??붿긽??泥섎━
    page.on('dialog', async dialog => {
      console.log('?슚 Alert 硫붿떆吏:', dialog.message());
      await dialog.accept();
    });
    
    // ?ㅽ겕由곗꺑
    await page.screenshot({ path: 'debug/simple-save-test.png' });
    
    console.log('??媛꾨떒 ????뚯뒪???꾨즺');
    
  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

simpleSaveTest(); 
