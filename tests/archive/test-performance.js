const { chromium } = require('playwright');

async function testPerformance() {
  console.log('🚀 성능 개선된 호텔 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 600
  });
  
  try {
    const page = await browser.newPage();
    
    // 페이지 로딩 성능 측정
    const startTime = Date.now();
    console.log('📄 페이지 로딩 중...');
    
    await page.goto('http://localhost: {process.env.PORT || 34343}', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ 페이지 로딩 완료: ${loadTime}ms`);
    
    // 페이지 안정화 대기
    await page.waitForTimeout(3000);
    
    // 호텔 정보 섹션 찾기 및 클릭
    console.log('🏨 호텔 정보 섹션 찾는 중...');
    
    // 더 정확한 선택자 사용
    const hotelSection = await page.locator('text=호텔 정보').first();
    
    if (await hotelSection.isVisible()) {
      console.log('🎯 호텔 정보 섹션 발견, 클릭 중...');
      
      // 클릭 전 스크린샷
      await page.screenshot({ path: 'screenshots-archive/test-results/before-click.png' });
      
      await hotelSection.click();
      await page.waitForTimeout(3000);
      
      // 클릭 후 스크린샷
      await page.screenshot({ path: 'screenshots-archive/test-results/after-click.png' });
      
      // 모달 확인
      const modal = await page.locator('[role="dialog"]');
      const isModalVisible = await modal.isVisible();
      
      console.log(`🔍 모달 상태: ${isModalVisible ? '열림' : '닫힘'}`);
      
      if (isModalVisible) {
        console.log('✅ 모달 열림 확인됨');
        
        // 입력 필드 찾기
        await page.waitForTimeout(2000);
        
        const inputs = await page.evaluate(() => {
          const allInputs = [];
          
          // input 태그들
          document.querySelectorAll('input[name]').forEach((input, i) => {
            allInputs.push({
              index: i,
              name: input.name,
              placeholder: input.placeholder || '',
              value: input.value || '',
              type: input.type || 'text'
            });
          });
          
          // textarea 태그들
          document.querySelectorAll('textarea[name]').forEach((textarea, i) => {
            allInputs.push({
              index: i + 100,
              name: textarea.name,
              placeholder: textarea.placeholder || '',
              value: textarea.value || '',
              type: 'textarea'
            });
          });
          
          return allInputs;
        });
        
        console.log(`📝 발견된 입력 필드: ${inputs.length}개`);
        inputs.forEach(input => {
          console.log(`  - ${input.name}: ${input.placeholder} (${input.type})`);
        });
        
        // 호텔명 입력 테스트
        const hotelNameInput = inputs.find(input => input.name === 'name');
        if (hotelNameInput) {
          console.log('🏨 호텔명 입력 테스트...');
          
          await page.fill('input[name="name"]', '');
          await page.waitForTimeout(500);
          await page.fill('input[name="name"]', '테스트 호텔');
          await page.waitForTimeout(1000);
          
          const newValue = await page.inputValue('input[name="name"]');
          console.log(`✅ 호텔명 입력 완료: "${newValue}"`);
        } else {
          console.log('❌ 호텔명 입력 필드를 찾을 수 없음');
        }
        
        // 주소 입력 테스트
        const addressInput = inputs.find(input => input.name === 'address');
        if (addressInput) {
          console.log('📍 주소 입력 테스트...');
          
          await page.fill('input[name="address"]', '');
          await page.waitForTimeout(500);
          await page.fill('input[name="address"]', '서울시 강남구 테스트로 123');
          await page.waitForTimeout(1000);
          
          const newValue = await page.inputValue('input[name="address"]');
          console.log(`✅ 주소 입력 완료: "${newValue}"`);
        } else {
          console.log('❌ 주소 입력 필드를 찾을 수 없음');
        }
        
        // 설명 입력 테스트
        const descriptionInput = inputs.find(input => input.name === 'description');
        if (descriptionInput) {
          console.log('📝 설명 입력 테스트...');
          
          const selector = descriptionInput.type === 'textarea' ? 'textarea[name="description"]' : 'input[name="description"]';
          await page.fill(selector, '');
          await page.waitForTimeout(500);
          await page.fill(selector, '편안하고 깔끔한 테스트 호텔입니다.');
          await page.waitForTimeout(1000);
          
          const newValue = await page.inputValue(selector);
          console.log(`✅ 설명 입력 완료: "${newValue}"`);
        } else {
          console.log('❌ 설명 입력 필드를 찾을 수 없음');
        }
        
        // 최종 스크린샷
        await page.screenshot({ path: 'screenshots-archive/test-results/final-result.png' });
        
        // 자동저장 확인을 위한 대기
        console.log('💾 자동저장 확인 대기...');
        await page.waitForTimeout(3000);
        
        console.log('✅ 호텔 정보 입력 테스트 완료');
        
      } else {
        console.log('❌ 모달이 열리지 않음');
      }
      
    } else {
      console.log('❌ 호텔 정보 섹션을 찾을 수 없음');
    }
    
    // 5초 더 대기
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    
    // 에러 발생 시 스크린샷
    try {
      await page.screenshot({ path: 'screenshots-archive/test-results/error-screenshot.png' });
    } catch (e) {
      // 무시
    }
  } finally {
    await browser.close();
    console.log('🔚 테스트 완료');
  }
}

testPerformance(); 