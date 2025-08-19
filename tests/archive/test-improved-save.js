const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testImprovedSave() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await delay(3000);
    
    // 肄섏넄 濡쒓렇 ?섏쭛
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('???) || msg.text().includes('API') || msg.text().includes('?명뀛')) {
        logs.push(`${new Date().toISOString()} ${msg.type()}: ${msg.text()}`);
      }
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
          timestamp: new Date().toISOString()
        });
      }
    });
    
    console.log('?룳 ?명뀛 ?뺣낫 紐⑤떖 ?닿린...');
    
    // ?명뀛 ?뺣낫 移대뱶 ?대┃
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('?명뀛 ?뺣낫') && 
        (el.tagName === 'DIV' || el.tagName === 'BUTTON' || el.tagName === 'SPAN')
      );
      
      const clickableElement = elements.find(el => {
        const style = window.getComputedStyle(el);
        return style.cursor === 'pointer' || 
               el.tagName === 'BUTTON' || 
               el.onclick || 
               el.getAttribute('role') === 'button';
      });
      
      if (clickableElement) {
        clickableElement.click();
        return true;
      }
      
      if (elements.length > 0) {
        elements[0].click();
        return true;
      }
      
      return false;
    });
    
    await delay(2000);
    
    console.log('???명뀛 ?뺣낫 紐⑤떖 ?대┝');
    
    // ?명뀛 ?뺣낫 ?낅젰
    console.log('?뱷 ?명뀛 ?뺣낫 ?낅젰...');
    
    const testName = `媛쒖꽑???뚯뒪???명뀛 ${Date.now()}`;
    
    // ?명뀛紐??낅젰
    const nameInput = await page.locator('input[name="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(testName);
      console.log('???명뀛紐??낅젰 ?꾨즺:', testName);
    }
    
    // 二쇱냼 ?낅젰
    const addressInput = await page.locator('input[name="address"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('?쒖슱??媛뺣궓援?媛쒖꽑???뚯뒪?몃줈 456');
      console.log('??二쇱냼 ?낅젰 ?꾨즺');
    }
    
    // ?ㅻ챸 ?낅젰
    const descInput = await page.locator('textarea[name="description"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill('媛쒖꽑???먮룞 ?뚯뒪?몃줈 ?앹꽦???명뀛?낅땲??');
      console.log('???ㅻ챸 ?낅젰 ?꾨즺');
    }
    
    await delay(1000);
    
    console.log('?뮶 媛쒖꽑???명뀛?뺣낫 ???踰꾪듉 ?대┃...');
    
    // ?덈줈?????踰꾪듉 ?대┃
    const saveResult = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('?명뀛?뺣낫 ???) || 
        btn.textContent.includes('?뮶 ?명뀛?뺣낫 ???)
      );
      
      console.log('李얠? ?명뀛?뺣낫 ???踰꾪듉:', saveButtons.map(btn => btn.textContent));
      
      if (saveButtons.length > 0) {
        const saveButton = saveButtons[0];
        const rect = saveButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (isVisible) {
          saveButton.click();
          return { success: true, buttonText: saveButton.textContent };
        } else {
          return { success: false, reason: '踰꾪듉??蹂댁씠吏 ?딆쓬' };
        }
      }
      return { success: false, reason: '?명뀛?뺣낫 ???踰꾪듉??李얠쓣 ???놁쓬' };
    });
    
    if (saveResult.success) {
      console.log(`???명뀛?뺣낫 ???踰꾪듉 ?대┃ ?깃났: ${saveResult.buttonText}`);
    } else {
      console.log(`???명뀛?뺣낫 ???踰꾪듉 ?대┃ ?ㅽ뙣: ${saveResult.reason}`);
    }
    
    // 15珥??湲?(???泥섎━ 諛?alert ?뺤씤)
    await delay(15000);
    
    // ???硫붿떆吏 ?뺤씤
    const saveMessage = await page.evaluate(() => {
      const messageElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('??λ릺?덉뒿?덈떎') || 
          el.textContent.includes('????깃났') ||
          el.textContent.includes('????꾨즺') ||
          el.textContent.includes('?깃났?곸쑝濡????) ||
          el.textContent.includes('??)
        )
      );
      
      return messageElements.length > 0 ? messageElements[0].textContent.trim() : null;
    });
    
    if (saveMessage) {
      console.log(`???명뀛?뺣낫 ????꾨즺: ${saveMessage}`);
    } else {
      console.log('?좑툘 ?명뀛?뺣낫 ???硫붿떆吏 ?뺤씤 ?덈맖');
    }
    
    console.log('\n?뱥 以묒슂 肄섏넄 濡쒓렇:');
    logs.forEach(log => console.log(log));
    
    console.log('\n?뙋 API ?붿껌:');
    responses.forEach(req => {
      console.log(`${req.timestamp} ${req.method} ${req.url} - ${req.status}`);
    });
    
    // 寃곌낵 ?붿빟
    const postRequests = responses.filter(r => r.method === 'POST');
    console.log(`\n?뱤 寃곌낵 ?붿빟:`);
    console.log(`- ???踰꾪듉 ?대┃: ${saveResult.success ? '???깃났' : '???ㅽ뙣'}`);
    console.log(`- POST ?붿껌 諛쒖깮: ${postRequests.length > 0 ? '???깃났' : '???ㅽ뙣'} (${postRequests.length}媛?`);
    console.log(`- ???硫붿떆吏: ${saveMessage ? '???뺤씤?? : '?좑툘 ?뺤씤 ?덈맖'}`);
    
    await delay(2000);
    
  } catch (error) {
    console.error('???뚯뒪??以??ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

testImprovedSave().catch(console.error); 
