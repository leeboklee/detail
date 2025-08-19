const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugChargesContent() {
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
    
    // 紐⑤떖 ?덉쓽 紐⑤뱺 ?띿뒪???댁슜 ?뺤씤
    const content = await page.evaluate(() => {
      const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal, .modal-content, .charges-container'));
      
      if (modals.length === 0) {
        return { error: '紐⑤떖??李얠쓣 ???놁쓬' };
      }
      
      const modal = modals[modals.length - 1]; // 媛??理쒓렐 紐⑤떖
      
      return {
        innerHTML: modal.innerHTML,
        textContent: modal.textContent,
        className: modal.className,
        tagName: modal.tagName
      };
    });
    
    console.log('?뵇 紐⑤떖 ?댁슜:');
    console.log('?쒓렇:', content.tagName);
    console.log('?대옒??', content.className);
    console.log('?띿뒪???댁슜:', content.textContent?.substring(0, 500) + '...');
    
    // 異붽??붽툑 愿???붿냼 李얘린
    const chargesElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('異붽??붽툑')
      );
      
      return elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        textContent: el.textContent.substring(0, 100),
        visible: el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
      }));
    });
    
    console.log('\n?뱥 異붽??붽툑 愿???붿냼??');
    chargesElements.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName} (${el.visible ? '蹂댁엫' : '?④?'}): "${el.textContent}"`);
    });
    
    // ???踰꾪듉 ?ㅼ떆 李얘린 (???볦? 踰붿쐞)
    const allSaveButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter(btn => 
        btn.textContent.includes('???) || 
        btn.textContent.includes('?뮶')
      ).map(btn => ({
        text: btn.textContent.trim(),
        className: btn.className,
        visible: btn.getBoundingClientRect().width > 0 && btn.getBoundingClientRect().height > 0,
        parent: btn.parentElement?.className || 'no-parent'
      }));
    });
    
    console.log('\n?뮶 紐⑤뱺 ???踰꾪듉:');
    allSaveButtons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.text}" (${btn.visible ? '蹂댁엫' : '?④?'}) - 遺紐? ${btn.parent}`);
    });
    
    await delay(5000);
    
  } catch (error) {
    console.error('???뚯뒪??以??ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

debugChargesContent().catch(console.error); 
