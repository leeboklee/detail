const { chromium } = require('playwright');

async function modalSaveTest() {
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
    
    // alert ??붿긽??泥섎━
    page.on('dialog', async dialog => {
      console.log('?슚 Alert 硫붿떆吏:', dialog.message());
      await dialog.accept();
    });
    
    console.log('?뮶 DB ???紐⑤떖 ?닿린...');
    
    // DB ???踰꾪듉 ?대┃ (紐⑤떖 ?닿린)
    await page.click('button:has-text("?뾼截?DB ???)');
    await page.waitForTimeout(2000);
    
    console.log('?뵇 紐⑤떖 ?덉쓽 ???踰꾪듉 李얘린...');
    
    // 紐⑤떖 ?덉쓽 紐⑤뱺 踰꾪듉 李얘린
    const modalButtons = await page.$$eval('button', buttons => {
      return buttons.map(btn => ({
        text: btn.textContent?.trim() || '',
        className: btn.className,
        visible: btn.offsetParent !== null
      })).filter(btn => btn.visible && btn.text);
    });
    
    console.log('?뱥 紐⑤떖 ?덉쓽 踰꾪듉??');
    modalButtons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.text}" - ${btn.className}`);
    });
    
    // ?명뀛 ?뺣낫 ???踰꾪듉 ?대┃
    const hotelSaveButton = modalButtons.find(btn => 
      btn.text.includes('?명뀛') && btn.text.includes('???)
    );
    
    if (hotelSaveButton) {
      console.log('?룳 ?명뀛 ?뺣낫 ???踰꾪듉 ?대┃...');
      await page.click(`button:has-text("${hotelSaveButton.text}")`);
      await page.waitForTimeout(3000);
    } else {
      console.log('?좑툘 ?명뀛 ?뺣낫 ???踰꾪듉??李얠쓣 ???놁쓬');
    }
    
    console.log('\n?뱥 理쒖쥌 肄섏넄 濡쒓렇:');
    logs.forEach(log => console.log(log));
    
    // ?ㅽ겕由곗꺑
    await page.screenshot({ path: 'debug/modal-save-test.png' });
    
    console.log('??紐⑤떖 ????뚯뒪???꾨즺');
    
  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

modalSaveTest(); 
