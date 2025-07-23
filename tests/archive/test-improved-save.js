const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function testImprovedSave() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await delay(3000);
    
    // 콘솔 로그 수집
    const logs = [];
    page.on('console', msg => {
      if (msg.text().includes('저장') || msg.text().includes('API') || msg.text().includes('호텔')) {
        logs.push(`${new Date().toISOString()} ${msg.type()}: ${msg.text()}`);
      }
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
    
    // 호텔 정보 카드 클릭
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
    
    await delay(2000);
    
    console.log('✅ 호텔 정보 모달 열림');
    
    // 호텔 정보 입력
    console.log('📝 호텔 정보 입력...');
    
    const testName = `개선된 테스트 호텔 ${Date.now()}`;
    
    // 호텔명 입력
    const nameInput = await page.locator('input[name="name"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(testName);
      console.log('✅ 호텔명 입력 완료:', testName);
    }
    
    // 주소 입력
    const addressInput = await page.locator('input[name="address"]').first();
    if (await addressInput.isVisible()) {
      await addressInput.fill('서울시 강남구 개선된 테스트로 456');
      console.log('✅ 주소 입력 완료');
    }
    
    // 설명 입력
    const descInput = await page.locator('textarea[name="description"]').first();
    if (await descInput.isVisible()) {
      await descInput.fill('개선된 자동 테스트로 생성된 호텔입니다.');
      console.log('✅ 설명 입력 완료');
    }
    
    await delay(1000);
    
    console.log('💾 개선된 호텔정보 저장 버튼 클릭...');
    
    // 새로운 저장 버튼 클릭
    const saveResult = await page.evaluate(() => {
      const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('호텔정보 저장') || 
        btn.textContent.includes('💾 호텔정보 저장')
      );
      
      console.log('찾은 호텔정보 저장 버튼:', saveButtons.map(btn => btn.textContent));
      
      if (saveButtons.length > 0) {
        const saveButton = saveButtons[0];
        const rect = saveButton.getBoundingClientRect();
        const isVisible = rect.width > 0 && rect.height > 0;
        
        if (isVisible) {
          saveButton.click();
          return { success: true, buttonText: saveButton.textContent };
        } else {
          return { success: false, reason: '버튼이 보이지 않음' };
        }
      }
      return { success: false, reason: '호텔정보 저장 버튼을 찾을 수 없음' };
    });
    
    if (saveResult.success) {
      console.log(`✅ 호텔정보 저장 버튼 클릭 성공: ${saveResult.buttonText}`);
    } else {
      console.log(`❌ 호텔정보 저장 버튼 클릭 실패: ${saveResult.reason}`);
    }
    
    // 15초 대기 (저장 처리 및 alert 확인)
    await delay(15000);
    
    // 저장 메시지 확인
    const saveMessage = await page.evaluate(() => {
      const messageElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && (
          el.textContent.includes('저장되었습니다') || 
          el.textContent.includes('저장 성공') ||
          el.textContent.includes('저장 완료') ||
          el.textContent.includes('성공적으로 저장') ||
          el.textContent.includes('✅')
        )
      );
      
      return messageElements.length > 0 ? messageElements[0].textContent.trim() : null;
    });
    
    if (saveMessage) {
      console.log(`✅ 호텔정보 저장 완료: ${saveMessage}`);
    } else {
      console.log('⚠️ 호텔정보 저장 메시지 확인 안됨');
    }
    
    console.log('\n📋 중요 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    console.log('\n🌐 API 요청:');
    responses.forEach(req => {
      console.log(`${req.timestamp} ${req.method} ${req.url} - ${req.status}`);
    });
    
    // 결과 요약
    const postRequests = responses.filter(r => r.method === 'POST');
    console.log(`\n📊 결과 요약:`);
    console.log(`- 저장 버튼 클릭: ${saveResult.success ? '✅ 성공' : '❌ 실패'}`);
    console.log(`- POST 요청 발생: ${postRequests.length > 0 ? '✅ 성공' : '❌ 실패'} (${postRequests.length}개)`);
    console.log(`- 저장 메시지: ${saveMessage ? '✅ 확인됨' : '⚠️ 확인 안됨'}`);
    
    await delay(2000);
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testImprovedSave().catch(console.error); 