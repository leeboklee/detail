const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🚀 페이지 로딩 시작...');
    const startTime = Date.now();
    
    await page.goto('http://localhost: {process.env.PORT || 34343}', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ 페이지 로딩 완료: ${loadTime}ms`);
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    // 기본 요소들 확인
    const elements = await page.evaluate(() => {
      return {
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length,
        divs: document.querySelectorAll('div').length,
        modals: document.querySelectorAll('[role="dialog"]').length
      };
    });
    
    console.log('📊 페이지 요소 현황:');
    console.log(`  - 버튼: ${elements.buttons}개`);
    console.log(`  - 입력필드: ${elements.inputs}개`);
    console.log(`  - DIV: ${elements.divs}개`);
    console.log(`  - 모달: ${elements.modals}개`);
    
    // 스크린샷 촬영
    await page.screenshot({ path: 'quick-test-result.png' });
    console.log('📸 스크린샷 저장됨: quick-test-result.png');
    
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    await browser.close();
  }
}

quickTest(); 