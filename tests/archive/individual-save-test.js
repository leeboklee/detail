const { chromium } = require('playwright');

async function individualSaveTest() {
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
    
    // 호텔 정보 카드 클릭 (DIV 형태)
    await page.click('div:has-text("호텔 정보")');
    await page.waitForTimeout(2000);
    
    console.log('📝 호텔 정보 입력...');
    
    // 호텔 정보 입력
    await page.fill('input[name="name"]', '테스트 호텔');
    await page.fill('input[name="address"]', '서울시 강남구');
    await page.fill('textarea[name="description"]', '테스트 설명');
    
    console.log('💾 호텔 정보 저장 버튼 클릭...');
    
    // 호텔 정보 저장 버튼 클릭
    await page.click('button:has-text("🗄️ DB 저장")');
    await page.waitForTimeout(5000);
    
    console.log('\n📋 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    console.log('\n🌐 API 요청:');
    responses.forEach(res => {
      console.log(`${res.time} ${res.method} ${res.url} - ${res.status}`);
    });
    
    // 스크린샷
    await page.screenshot({ path: 'debug/individual-save-test.png' });
    
    console.log('✅ 개별 저장 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

individualSaveTest(); 