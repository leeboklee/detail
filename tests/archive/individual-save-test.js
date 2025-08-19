const { chromium } = require('playwright');

async function individualSaveTest() {
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
    
    // ?ㅽ듃?뚰겕 ?붿껌 紐⑤땲?곕쭅
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          time: new Date().toISOString()
        });
      }
    });
    
    console.log('?룳 ?명뀛 ?뺣낫 紐⑤떖 ?닿린...');
    
    // ?명뀛 ?뺣낫 移대뱶 ?대┃ (DIV ?뺥깭)
    await page.click('div:has-text("?명뀛 ?뺣낫")');
    await page.waitForTimeout(2000);
    
    console.log('?뱷 ?명뀛 ?뺣낫 ?낅젰...');
    
    // ?명뀛 ?뺣낫 ?낅젰
    await page.fill('input[name="name"]', '?뚯뒪???명뀛');
    await page.fill('input[name="address"]', '?쒖슱??媛뺣궓援?);
    await page.fill('textarea[name="description"]', '?뚯뒪???ㅻ챸');
    
    console.log('?뮶 ?명뀛 ?뺣낫 ???踰꾪듉 ?대┃...');
    
    // ?명뀛 ?뺣낫 ???踰꾪듉 ?대┃
    await page.click('button:has-text("?뾼截?DB ???)');
    await page.waitForTimeout(5000);
    
    console.log('\n?뱥 肄섏넄 濡쒓렇:');
    logs.forEach(log => console.log(log));
    
    console.log('\n?뙋 API ?붿껌:');
    responses.forEach(res => {
      console.log(`${res.time} ${res.method} ${res.url} - ${res.status}`);
    });
    
    // ?ㅽ겕由곗꺑
    await page.screenshot({ path: 'debug/individual-save-test.png' });
    
    console.log('??媛쒕퀎 ????뚯뒪???꾨즺');
    
  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

individualSaveTest(); 
