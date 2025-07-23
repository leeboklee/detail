const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugChargesContent() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await delay(3000);
    
    console.log('🧪 추가요금 모달 열기...');
    
    // 추가요금 섹션 클릭
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('추가요금') && 
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
    console.log('✅ 추가요금 모달 열림');
    
    // 모달 안의 모든 텍스트 내용 확인
    const content = await page.evaluate(() => {
      const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal, .modal-content, .charges-container'));
      
      if (modals.length === 0) {
        return { error: '모달을 찾을 수 없음' };
      }
      
      const modal = modals[modals.length - 1]; // 가장 최근 모달
      
      return {
        innerHTML: modal.innerHTML,
        textContent: modal.textContent,
        className: modal.className,
        tagName: modal.tagName
      };
    });
    
    console.log('🔍 모달 내용:');
    console.log('태그:', content.tagName);
    console.log('클래스:', content.className);
    console.log('텍스트 내용:', content.textContent?.substring(0, 500) + '...');
    
    // 추가요금 관련 요소 찾기
    const chargesElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('추가요금')
      );
      
      return elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        textContent: el.textContent.substring(0, 100),
        visible: el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
      }));
    });
    
    console.log('\n📋 추가요금 관련 요소들:');
    chargesElements.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName} (${el.visible ? '보임' : '숨김'}): "${el.textContent}"`);
    });
    
    // 저장 버튼 다시 찾기 (더 넓은 범위)
    const allSaveButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.filter(btn => 
        btn.textContent.includes('저장') || 
        btn.textContent.includes('💾')
      ).map(btn => ({
        text: btn.textContent.trim(),
        className: btn.className,
        visible: btn.getBoundingClientRect().width > 0 && btn.getBoundingClientRect().height > 0,
        parent: btn.parentElement?.className || 'no-parent'
      }));
    });
    
    console.log('\n💾 모든 저장 버튼:');
    allSaveButtons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.text}" (${btn.visible ? '보임' : '숨김'}) - 부모: ${btn.parent}`);
    });
    
    await delay(5000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

debugChargesContent().catch(console.error); 