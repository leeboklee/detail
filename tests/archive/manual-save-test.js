const { chromium } = require('playwright');

async function testSaveFunction() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🧪 호텔 정보 저장 테스트...');
    
    // 호텔 정보 클릭
    await page.click('[data-section="hotel"]');
    await page.waitForTimeout(2000);
    
    // 호텔 정보 입력
    await page.fill('input[name="name"]', '테스트 호텔');
    await page.fill('input[name="address"]', '서울시 강남구');
    await page.fill('textarea[name="description"]', '테스트 설명');
    
    console.log('💾 저장 버튼 클릭...');
    
    // 콘솔 로그 수집
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // 저장 버튼 클릭
    await page.click('button:has-text("🗄️ DB 저장")');
    
    // 3초 대기
    await page.waitForTimeout(3000);
    
    console.log('\n📋 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    // 메시지 확인
    const message = await page.locator('div:has-text("저장")').first().textContent().catch(() => null);
    console.log('📝 저장 메시지:', message);
    
    // 스크린샷
    await page.screenshot({ path: 'debug/manual-save-test.png' });
    
    console.log('✅ 수동 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

testSaveFunction(); 