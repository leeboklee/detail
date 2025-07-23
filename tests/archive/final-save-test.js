const { chromium } = require('playwright');

async function finalSaveTest() {
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
    
    console.log('💾 DB 저장 모달 열기...');
    
    // DB 저장 버튼 클릭 (모달 열기)
    await page.click('button:has-text("🗄️ DB 저장")');
    await page.waitForTimeout(2000);
    
    console.log('💾 새로 저장 버튼 클릭...');
    
    // 새로 저장 버튼 클릭
    await page.click('button:has-text("새로 저장")');
    await page.waitForTimeout(5000);
    
    console.log('\n📋 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    // 네트워크 요청 확인
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method()
        });
      }
    });
    
    // 추가로 5초 대기
    await page.waitForTimeout(5000);
    
    console.log('\n🌐 API 요청:');
    responses.forEach(res => {
      console.log(`${res.method} ${res.url} - ${res.status}`);
    });
    
    // 스크린샷
    await page.screenshot({ path: 'debug/final-save-test.png' });
    
    console.log('✅ 최종 저장 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

finalSaveTest(); 