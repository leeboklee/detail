const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugChargesTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await delay(3000);
    
    console.log('?㎦ 異붽??붽툑 紐⑤떖 ?닿린...');
    
    // 異붽??붽툑 ?뱀뀡 ?대┃
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('異붽??붽툑') && 
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
    
    await delay(3000);
    console.log('??異붽??붽툑 紐⑤떖 ?대┝');
    
    // 紐⑤떖 ?덉쓽 紐⑤뱺 踰꾪듉 李얘린
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(btn => ({
        text: btn.textContent.trim(),
        className: btn.className,
        visible: btn.getBoundingClientRect().width > 0 && btn.getBoundingClientRect().height > 0
      }))
    );
    
    console.log('?뵇 紐⑤떖 ?덉쓽 紐⑤뱺 踰꾪듉:');
    buttons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.text}" (${btn.visible ? '蹂댁엫' : '?④?'}) - ${btn.className}`);
    });
    
    // ???愿??踰꾪듉 李얘린
    const saveButtons = buttons.filter(btn => 
      btn.text.includes('???) || 
      btn.text.includes('?뮶') ||
      btn.text.includes('異붽??붽툑')
    );
    
    console.log('\n?뮶 ???愿??踰꾪듉:');
    saveButtons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.text}" (${btn.visible ? '蹂댁엫' : '?④?'})`);
    });
    
    // ?ㅼ젣 ???踰꾪듉 ?대┃ ?쒕룄
    console.log('\n?렞 ???踰꾪듉 ?대┃ ?쒕룄...');
    
    const saveResult = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('?뮶 異붽??붽툑 ???)
      );
      
      console.log('李얠? ???踰꾪듉 ??', saveButtons.length);
      
      if (saveButtons.length > 0) {
        const saveButton = saveButtons[0];
        const rect = saveButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        console.log('踰꾪듉 ?꾩튂:', rect);
        console.log('踰꾪듉 ?쒖떆 ?щ?:', isVisible);
        
        if (isVisible) {
          saveButton.click();
          return { success: true, buttonText: saveButton.textContent };
        } else {
          return { success: false, reason: '踰꾪듉??蹂댁씠吏 ?딆쓬' };
        }
      }
      return { success: false, reason: '???踰꾪듉??李얠쓣 ???놁쓬' };
    });
    
    console.log('???寃곌낵:', saveResult);
    
    await delay(3000);
    
  } catch (error) {
    console.error('???뚯뒪??以??ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

debugChargesTest().catch(console.error); 
