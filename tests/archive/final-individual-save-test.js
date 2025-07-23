const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function finalIndividualSaveTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await delay(3000);
    
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
          timestamp: new Date().toISOString()
        });
      }
    });
    
    console.log('🏨 호텔 정보 모달 열기...');
    
    // 호텔 정보 카드 클릭 (성공했던 방식 사용)
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.includes('호텔 정보') && 
        (el.tagName === 'DIV' || el.tagName === 'BUTTON' || el.tagName === 'SPAN')
      );
      
      // 클릭 가능한 요소 찾기
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
      
      // 클릭 가능한 요소가 없으면 첫 번째 요소 클릭
      if (elements.length > 0) {
        elements[0].click();
        return true;
      }
      
      return false;
    });
    
    await delay(2000);
    
    // 모달이 열렸는지 확인
    const modalExists = await page.$('[role="dialog"]');
    if (modalExists) {
      console.log('✅ 호텔 정보 모달 열림 확인');
    } else {
      console.log('❌ 호텔 정보 모달이 열리지 않음');
      return;
    }
    
    // 호텔 정보 입력
    console.log('📝 호텔 정보 입력...');
    
    // 호텔명 입력
    const nameInput = await page.locator('input[name="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill('테스트 호텔 ' + Date.now());
      console.log('✅ 호텔명 입력 완료');
    }
    
    // 주소 입력
    const addressInput = await page.locator('input[name="address"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('서울시 강남구 테스트로 123');
      console.log('✅ 주소 입력 완료');
    }
    
    // 설명 입력
    const descInput = await page.locator('textarea[name="description"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill('자동 테스트로 생성된 호텔입니다.');
      console.log('✅ 설명 입력 완료');
    }
    
    await delay(1000);
    
    console.log('💾 호텔 정보 저장 버튼 클릭...');
    
    // 저장 버튼 클릭 (성공했던 방식 사용)
    const saveResult = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('DB 저장') || 
        btn.textContent.includes('저장하기') ||
        (btn.textContent.includes('저장') && !btn.textContent.includes('불러오기'))
      );
      
      console.log('찾은 저장 버튼:', saveButtons.map(btn => btn.textContent));
      
      if (saveButtons.length > 0) {
        // 가장 적절한 저장 버튼 선택
        const saveButton = saveButtons.find(btn => btn.textContent.includes('DB 저장')) || saveButtons[0];
        
        // 버튼이 보이는지 확인
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
    } else {
      console.log(`❌ 호텔 정보 저장 버튼 클릭 실패: ${saveResult.reason}`);
    }
    
    // 10초 대기 (저장 처리 및 메시지 확인)
    await delay(10000);
    
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
      console.log('⚠️ 호텔 정보 저장 메시지 확인 안됨');
    }
    
    console.log('\n📋 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    console.log('\n🌐 API 요청:');
    responses.forEach(req => {
      console.log(`${req.timestamp} ${req.method} ${req.url} - ${req.status}`);
    });
    
    await delay(2000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

finalIndividualSaveTest().catch(console.error); 