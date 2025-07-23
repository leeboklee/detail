const { chromium } = require('playwright');

async function testBrowser() {
  console.log('🚀 브라우저 테스트 시작...');
  
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    // 브라우저 실행
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    
    // 콘솔 로그 캐치
    page.on('console', msg => {
      console.log(`🖥️ 콘솔: ${msg.type()}: ${msg.text()}`);
    });
    
    // 에러 캐치
    page.on('pageerror', error => {
      console.log(`❌ 페이지 에러: ${error.message}`);
    });
    
    // 네트워크 요청 모니터링
    page.on('request', request => {
      console.log(`📡 요청: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`📨 응답: ${response.status()} ${response.url()}`);
    });
    
    console.log('🌐 localhost: {process.env.PORT || 34343}로 이동 중...');
    
    // 페이지 로드 (타임아웃 설정)
    await page.goto('http://localhost: {process.env.PORT || 34343}', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ 페이지 로드 완료');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    // DOM 기본 요소들 확인
    const bodyText = await page.textContent('body');
    console.log(`📝 페이지 내용 (첫 200자): ${bodyText?.substring(0, 200)}...`);
    
    // React 앱이 로드되었는지 확인
    const reactElements = await page.locator('[data-reactroot], #__next, .App').count();
    console.log(`⚛️ React 요소 감지: ${reactElements}개`);
    
    // 주요 섹션들 확인
    const sections = await page.locator('section, .section, [class*="section"]').count();
    console.log(`📑 섹션 요소: ${sections}개`);
    
    // 입력 필드들 확인
    const inputs = await page.locator('input, textarea, select').count();
    console.log(`📝 입력 필드: ${inputs}개`);
    
    // 버튼들 확인
    const buttons = await page.locator('button, [role="button"]').count();
    console.log(`🔘 버튼: ${buttons}개`);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'debug-browser-test.png', fullPage: true });
    console.log('📸 스크린샷 저장 완료: debug-browser-test.png');
    
    // 잠시 대기 (페이지 확인용)
    console.log('⏳ 5초간 페이지 유지...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log(`❌ 브라우저 테스트 실패: ${error.message}`);
    console.log(`📊 스택 트레이스:`, error.stack);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔚 브라우저 종료');
    }
  }
}

// 테스트 실행
testBrowser().catch(console.error); 