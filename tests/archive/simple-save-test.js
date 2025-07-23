const { chromium } = require('playwright');

async function simpleSaveTest() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // 콘솔 로그 수집
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    console.log('💾 DB 저장 버튼 클릭...');
    
    // DB 저장 버튼 클릭
    await page.click('button:has-text("🗄️ DB 저장")');
    
    // 5초 대기
    await page.waitForTimeout(5000);
    
    console.log('\n📋 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    // alert 대화상자 처리
    page.on('dialog', async dialog => {
      console.log('🚨 Alert 메시지:', dialog.message());
      await dialog.accept();
    });
    
    // 스크린샷
    await page.screenshot({ path: 'debug/simple-save-test.png' });
    
    console.log('✅ 간단 저장 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

simpleSaveTest(); 