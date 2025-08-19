const { chromium } = require('playwright');

async function workingSaveTest() {
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
    
    // ?명뀛 ?뺣낫 ?대┃ (?깃났?덈뜕 諛⑹떇)
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
    
    console.log('???명뀛 ?뺣낫 ?대┃ ?깃났');
    
    // 紐⑤떖 ?湲?
    await page.waitForSelector('[role="dialog"]', { visible: true, timeout: 10000 });
    console.log('???명뀛 ?뺣낫 紐⑤떖 ?대┝ ?뺤씤');
    
    await page.waitForTimeout(2000);
    
    console.log('?뮶 DB ???踰꾪듉 ?대┃...');
    
    // DB ???踰꾪듉 ?대┃ (?깃났?덈뜕 諛⑹떇)
    const saveResult = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('DB ???) || 
        btn.textContent.includes('??ν븯湲?) ||
        (btn.textContent.includes('???) && !btn.textContent.includes('遺덈윭?ㅺ린'))
      );
      
      console.log('李얠? ???踰꾪듉:', saveButtons.map(btn => btn.textContent));
      
      if (saveButtons.length > 0) {
        const saveButton = saveButtons.find(btn => btn.textContent.includes('DB ???)) || saveButtons[0];
        
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
      
      // ????꾨즺 ?湲?
      await page.waitForTimeout(5000);
      
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
        console.log(`?좑툘 ?명뀛 ?뺣낫 ???硫붿떆吏 ?뺤씤 ?덈맖`);
      }
    } else {
      console.log(`???명뀛 ?뺣낫 ???踰꾪듉 ?대┃ ?ㅽ뙣: ${saveResult.reason}`);
    }
    
    console.log('\n?뱥 肄섏넄 濡쒓렇:');
    logs.forEach(log => console.log(log));
    
    console.log('\n?뙋 API ?붿껌:');
    responses.forEach(res => {
      console.log(`${res.time} ${res.method} ${res.url} - ${res.status}`);
    });
    
    // ?ㅽ겕由곗꺑
    await page.screenshot({ path: 'debug/working-save-test.png' });
    
    console.log('???묐룞?섎뒗 ????뚯뒪???꾨즺');
    
  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

workingSaveTest(); 
