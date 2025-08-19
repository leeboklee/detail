const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function finalIndividualSaveTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await delay(3000);
    
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
          timestamp: new Date().toISOString()
        });
      }
    });
    
    console.log('?룳 ?명뀛 ?뺣낫 紐⑤떖 ?닿린...');
    
    // ?명뀛 ?뺣낫 移대뱶 ?대┃ (?깃났?덈뜕 諛⑹떇 ?ъ슜)
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('?명뀛 ?뺣낫') && 
        (el.tagName === 'DIV' || el.tagName === 'BUTTON' || el.tagName === 'SPAN')
      );
      
      // ?대┃ 媛?ν븳 ?붿냼 李얘린
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
      
      // ?대┃ 媛?ν븳 ?붿냼媛 ?놁쑝硫?泥?踰덉㎏ ?붿냼 ?대┃
      if (elements.length > 0) {
        elements[0].click();
        return true;
      }
      
      return false;
    });
    
    await delay(2000);
    
    // 紐⑤떖???대졇?붿? ?뺤씤
    const modalExists = await page.$('[role="dialog"]');
    if (modalExists) {
      console.log('???명뀛 ?뺣낫 紐⑤떖 ?대┝ ?뺤씤');
    } else {
      console.log('???명뀛 ?뺣낫 紐⑤떖???대━吏 ?딆쓬');
      return;
    }
    
    // ?명뀛 ?뺣낫 ?낅젰
    console.log('?뱷 ?명뀛 ?뺣낫 ?낅젰...');
    
    // ?명뀛紐??낅젰
    const nameInput = await page.locator('input[name="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('?뚯뒪???명뀛 ' + Date.now());
      console.log('???명뀛紐??낅젰 ?꾨즺');
    }
    
    // 二쇱냼 ?낅젰
    const addressInput = await page.locator('input[name="address"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('?쒖슱??媛뺣궓援??뚯뒪?몃줈 123');
      console.log('??二쇱냼 ?낅젰 ?꾨즺');
    }
    
    // ?ㅻ챸 ?낅젰
    const descInput = await page.locator('textarea[name="description"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill('?먮룞 ?뚯뒪?몃줈 ?앹꽦???명뀛?낅땲??');
      console.log('???ㅻ챸 ?낅젰 ?꾨즺');
    }
    
    await delay(1000);
    
    console.log('?뮶 ?명뀛 ?뺣낫 ???踰꾪듉 ?대┃...');
    
    // ???踰꾪듉 ?대┃ (?깃났?덈뜕 諛⑹떇 ?ъ슜)
    const saveResult = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('DB ???) || 
        btn.textContent.includes('??ν븯湲?) ||
        (btn.textContent.includes('???) && !btn.textContent.includes('遺덈윭?ㅺ린'))
      );
      
      console.log('李얠? ???踰꾪듉:', saveButtons.map(btn => btn.textContent));
      
      if (saveButtons.length > 0) {
        // 媛???곸젅?????踰꾪듉 ?좏깮
        const saveButton = saveButtons.find(btn => btn.textContent.includes('DB ???)) || saveButtons[0];
        
        // 踰꾪듉??蹂댁씠?붿? ?뺤씤
        const rect = saveButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (isVisible) {
          saveButton.click();
          return { success: true, buttonText: saveButton.textContent };
        } else {
          return { success: false, reason: '踰꾪듉??蹂댁씠吏 ?딆쓬' };
        }
      }
      return { success: false, reason: '???踰꾪듉??李얠쓣 ???놁쓬' };
    });
    
    if (saveResult.success) {
      console.log(`???명뀛 ?뺣낫 ???踰꾪듉 ?대┃ ?깃났: ${saveResult.buttonText}`);
    } else {
      console.log(`???명뀛 ?뺣낫 ???踰꾪듉 ?대┃ ?ㅽ뙣: ${saveResult.reason}`);
    }
    
    // 10珥??湲?(???泥섎━ 諛?硫붿떆吏 ?뺤씤)
    await delay(10000);
    
    // ???硫붿떆吏 ?뺤씤
    const saveMessage = await page.evaluate(() => {
      const messageElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('??λ릺?덉뒿?덈떎') || 
          el.textContent.includes('????깃났') ||
          el.textContent.includes('????꾨즺') ||
          el.textContent.includes('???以?) ||
          el.textContent.includes('??) ||
          el.textContent.includes('?깃났') ||
          el.textContent.includes('?꾨즺')
        )
      );
      
      console.log('李얠? 硫붿떆吏 ?붿냼??', messageElements.map(el => el.textContent.trim()).slice(0, 10));
      
      return messageElements.length > 0 ? messageElements[0].textContent.trim() : null;
    });
    
    if (saveMessage) {
      console.log(`???명뀛 ?뺣낫 ????꾨즺: ${saveMessage}`);
    } else {
      console.log('?좑툘 ?명뀛 ?뺣낫 ???硫붿떆吏 ?뺤씤 ?덈맖');
    }
    
    console.log('\n?뱥 肄섏넄 濡쒓렇:');
    logs.forEach(log => console.log(log));
    
    console.log('\n?뙋 API ?붿껌:');
    responses.forEach(req => {
      console.log(`${req.timestamp} ${req.method} ${req.url} - ${req.status}`);
    });
    
    await delay(2000);
    
  } catch (error) {
    console.error('???뚯뒪??以??ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

finalIndividualSaveTest().catch(console.error); 
