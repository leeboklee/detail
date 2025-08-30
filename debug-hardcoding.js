const { chromium } = require('playwright');

async function debugHardcoding() {
  console.log('🔍 하드코딩 문제 진단 시작...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 페이지 로드
    console.log('📡 http://localhost:3900/ 연결 시도...');
    await page.goto('http://localhost:3900/', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ 페이지 로드 완료');
    
    // 페이지 스크린샷
    await page.screenshot({ path: 'debug-page.png', fullPage: true });
    console.log('📸 페이지 스크린샷 저장: debug-page.png');
    
    // 객실명 입력 필드 찾기
    console.log('🔍 객실명 입력 필드 검색...');
    const roomNameInput = await page.locator('input[placeholder*="객실명"]').first();
    
    if (await roomNameInput.count() > 0) {
      console.log('✅ 객실명 입력 필드 발견');
      
      // 입력 필드의 현재 값 확인
      const currentValue = await roomNameInput.inputValue();
      console.log(`📝 현재 입력 필드 값: "${currentValue}"`);
      
      // 입력 필드의 placeholder 확인
      const placeholder = await roomNameInput.getAttribute('placeholder');
      console.log(`📝 placeholder: "${placeholder}"`);
      
      // 입력 필드의 HTML 구조 확인
      const html = await roomNameInput.evaluate(el => el.outerHTML);
      console.log(`🔧 HTML 구조: ${html}`);
      
      // 입력 필드에 텍스트 입력 시도
      console.log('✏️ 입력 필드에 새 텍스트 입력 시도...');
      await roomNameInput.fill('테스트 객실명');
      await page.waitForTimeout(1000);
      
      // 입력 후 값 확인
      const newValue = await roomNameInput.inputValue();
      console.log(`📝 입력 후 값: "${newValue}"`);
      
      // 입력 필드 스크린샷
      await roomNameInput.screenshot({ path: 'debug-input-field.png' });
      console.log('📸 입력 필드 스크린샷 저장: debug-input-field.png');
      
    } else {
      console.log('❌ 객실명 입력 필드를 찾을 수 없음');
      
      // 모든 입력 필드 확인
      const allInputs = await page.locator('input').all();
      console.log(`🔍 총 ${allInputs.length}개의 입력 필드 발견`);
      
      for (let i = 0; i < allInputs.length; i++) {
        const input = allInputs[i];
        const placeholder = await input.getAttribute('placeholder');
        const value = await input.inputValue();
        const type = await input.getAttribute('type');
        console.log(`📝 입력 필드 ${i + 1}: type="${type}", placeholder="${placeholder}", value="${value}"`);
      }
    }
    
    // 페이지 소스 확인
    const pageSource = await page.content();
    await require('fs').writeFileSync('debug-page-source.html', pageSource);
    console.log('📄 페이지 소스 저장: debug-page-source.html');
    
    // 콘솔 로그 확인
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(msg.text());
      console.log(`🔍 콘솔: ${msg.text()}`);
    });
    
    // 오류 확인
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.log(`❌ 페이지 오류: ${error.message}`);
    });
    
    await page.waitForTimeout(2000);
    
    console.log(`📊 총 ${consoleLogs.length}개의 콘솔 로그, ${errors.length}개의 오류`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    
    // 오류 스크린샷
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
    console.log('📸 오류 스크린샷 저장: debug-error.png');
  } finally {
    await browser.close();
    console.log('🔚 브라우저 종료');
  }
}

// 스크립트 실행
debugHardcoding().catch(console.error);
