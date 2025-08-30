const { chromium } = require('playwright');

async function testLocalhost() {
  console.log('🌐 WSL2 IP 주소로 접속 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  let page;
  
  try {
    page = await browser.newPage();
    
    console.log('📱 브라우저 페이지 생성 완료');
    
    // WSL2 IP 주소로 접속
    console.log('🔗 172.19.254.74:3900으로 접속 시도...');
    await page.goto('http://172.19.254.74:3900/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ 페이지 로드 완료');
    
    // 페이지 제목 확인
    const title = await page.title();
    console.log(`📄 페이지 제목: ${title}`);
    
    // 스크린샷 촬영
    await page.screenshot({ 
      path: 'wsl2-ip-test-result.png',
      fullPage: true 
    });
    console.log('📸 스크린샷 저장: wsl2-ip-test-result.png');
    
    // 5초 대기 (사용자가 확인할 수 있도록)
    console.log('⏳ 5초 대기 중... (페이지 확인용)');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    
    // 에러 스크린샷
    if (page) {
      try {
        await page.screenshot({ 
          path: 'wsl2-ip-test-error.png',
          fullPage: true 
        });
        console.log('📸 에러 스크린샷 저장: wsl2-ip-test-error.png');
      } catch (screenshotError) {
        console.error('스크린샷 저장 실패:', screenshotError.message);
      }
    }
  } finally {
    console.log('🔒 브라우저 종료 중...');
    await browser.close();
    console.log('✅ 테스트 완료');
  }
}

testLocalhost().catch(console.error);
