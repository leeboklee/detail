const { chromium } = require('playwright');

async function testSaveFunction() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('?㎦ ?명뀛 ?뺣낫 ????뚯뒪??..');
    
    // ?명뀛 ?뺣낫 ?대┃
    await page.click('[data-section="hotel"]');
    await page.waitForTimeout(2000);
    
    // ?명뀛 ?뺣낫 ?낅젰
    await page.fill('input[name="name"]', '?뚯뒪???명뀛');
    await page.fill('input[name="address"]', '?쒖슱??媛뺣궓援?);
    await page.fill('textarea[name="description"]', '?뚯뒪???ㅻ챸');
    
    console.log('?뮶 ???踰꾪듉 ?대┃...');
    
    // 肄섏넄 濡쒓렇 ?섏쭛
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // ???踰꾪듉 ?대┃
    await page.click('button:has-text("?뾼截?DB ???)');
    
    // 3珥??湲?
    await page.waitForTimeout(3000);
    
    console.log('\n?뱥 肄섏넄 濡쒓렇:');
    logs.forEach(log => console.log(log));
    
    // 硫붿떆吏 ?뺤씤
    const message = await page.locator('div:has-text("???)').first().textContent().catch(() => null);
    console.log('?뱷 ???硫붿떆吏:', message);
    
    // ?ㅽ겕由곗꺑
    await page.screenshot({ path: 'debug/manual-save-test.png' });
    
    console.log('???섎룞 ?뚯뒪???꾨즺');
    
  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

testSaveFunction(); 
