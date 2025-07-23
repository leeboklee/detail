const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function debugChargesTest() {
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
    
    // 모달 안의 모든 버튼 찾기
    const buttons = await page.$$eval('button', buttons => 
      buttons.map(btn => ({
        text: btn.textContent.trim(),
        className: btn.className,
        visible: btn.getBoundingClientRect().width > 0 && btn.getBoundingClientRect().height > 0
      }))
    );
    
    console.log('🔍 모달 안의 모든 버튼:');
    buttons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.text}" (${btn.visible ? '보임' : '숨김'}) - ${btn.className}`);
    });
    
    // 저장 관련 버튼 찾기
    const saveButtons = buttons.filter(btn => 
      btn.text.includes('저장') || 
      btn.text.includes('💾') ||
      btn.text.includes('추가요금')
    );
    
    console.log('\n💾 저장 관련 버튼:');
    saveButtons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.text}" (${btn.visible ? '보임' : '숨김'})`);
    });
    
    // 실제 저장 버튼 클릭 시도
    console.log('\n🎯 저장 버튼 클릭 시도...');
    
    const saveResult = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('💾 추가요금 저장')
      );
      
      console.log('찾은 저장 버튼 수:', saveButtons.length);
      
      if (saveButtons.length > 0) {
        const saveButton = saveButtons[0];
        const rect = saveButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        console.log('버튼 위치:', rect);
        console.log('버튼 표시 여부:', isVisible);
        
        if (isVisible) {
          saveButton.click();
          return { success: true, buttonText: saveButton.textContent };
        } else {
          return { success: false, reason: '버튼이 보이지 않음' };
        }
      }
      return { success: false, reason: '저장 버튼을 찾을 수 없음' };
    });
    
    console.log('저장 결과:', saveResult);
    
    await delay(3000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

debugChargesTest().catch(console.error); 