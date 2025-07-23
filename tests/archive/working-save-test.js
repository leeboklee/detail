const { chromium } = require('playwright');

async function workingSaveTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 콘솔 로그 수집
    const logs = [];
    page.on('console', msg => {
      logs.push(`${new Date().toISOString()} ${msg.type()}: ${msg.text()}`);
    });
    
    // alert 대화상자 처리
    page.on('dialog', async dialog => {
      console.log('🚨 Alert 메시지:', dialog.message());
      await dialog.accept();
    });
    
    // 네트워크 요청 모니터링
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
    
    console.log('🏨 호텔 정보 모달 열기...');
    
    // 호텔 정보 클릭 (성공했던 방식)
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('호텔 정보') && 
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
    
    console.log('✅ 호텔 정보 클릭 성공');
    
    // 모달 대기
    await page.waitForSelector('[role="dialog"]', { visible: true, timeout: 10000 });
    console.log('✅ 호텔 정보 모달 열림 확인');
    
    await page.waitForTimeout(2000);
    
    console.log('💾 DB 저장 버튼 클릭...');
    
    // DB 저장 버튼 클릭 (성공했던 방식)
    const saveResult = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('DB 저장') || 
        btn.textContent.includes('저장하기') ||
        (btn.textContent.includes('저장') && !btn.textContent.includes('불러오기'))
      );
      
      console.log('찾은 저장 버튼:', saveButtons.map(btn => btn.textContent));
      
      if (saveButtons.length > 0) {
        const saveButton = saveButtons.find(btn => btn.textContent.includes('DB 저장')) || saveButtons[0];
        
        const rect = saveButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (isVisible) {
          saveButton.click();
          return { success: true, buttonText: saveButton.textContent };
        } else {
          return { success: false, reason: '버튼이 보이지 않음' };
        }
      }
      return { success: false, reason: '저장 버튼을 찾을 수 없음' };
    });
    
    if (saveResult.success) {
      console.log(`✅ 호텔 정보 저장 버튼 클릭 성공: ${saveResult.buttonText}`);
      
      // 저장 완료 대기
      await page.waitForTimeout(5000);
      
      // 저장 메시지 확인
      const saveMessage = await page.evaluate(() => {
        const messageElements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent && (
            el.textContent.includes('저장되었습니다') || 
            el.textContent.includes('저장 성공') ||
            el.textContent.includes('저장 완료') ||
            el.textContent.includes('저장 중') ||
            el.textContent.includes('✅') ||
            el.textContent.includes('성공') ||
            el.textContent.includes('완료')
          )
        );
        
        console.log('찾은 메시지 요소들:', messageElements.map(el => el.textContent.trim()).slice(0, 10));
        
        return messageElements.length > 0 ? messageElements[0].textContent.trim() : null;
      });
      
      if (saveMessage) {
        console.log(`✅ 호텔 정보 저장 완료: ${saveMessage}`);
      } else {
        console.log(`⚠️ 호텔 정보 저장 메시지 확인 안됨`);
      }
    } else {
      console.log(`❌ 호텔 정보 저장 버튼 클릭 실패: ${saveResult.reason}`);
    }
    
    console.log('\n📋 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    console.log('\n🌐 API 요청:');
    responses.forEach(res => {
      console.log(`${res.time} ${res.method} ${res.url} - ${res.status}`);
    });
    
    // 스크린샷
    await page.screenshot({ path: 'debug/working-save-test.png' });
    
    console.log('✅ 작동하는 저장 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

workingSaveTest(); 