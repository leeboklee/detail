const { chromium } = require('playwright');

async function modalSaveTest() {
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
    
    // alert 대화상자 처리
    page.on('dialog', async dialog => {
      console.log('🚨 Alert 메시지:', dialog.message());
      await dialog.accept();
    });
    
    console.log('💾 DB 저장 모달 열기...');
    
    // DB 저장 버튼 클릭 (모달 열기)
    await page.click('button:has-text("🗄️ DB 저장")');
    await page.waitForTimeout(2000);
    
    console.log('🔍 모달 안의 저장 버튼 찾기...');
    
    // 모달 안의 모든 버튼 찾기
    const modalButtons = await page.$$eval('button', buttons => {
      return buttons.map(btn => ({
        text: btn.textContent?.trim() || '',
        className: btn.className,
        visible: btn.offsetParent !== null
      })).filter(btn => btn.visible && btn.text);
    });
    
    console.log('📋 모달 안의 버튼들:');
    modalButtons.forEach((btn, index) => {
      console.log(`${index + 1}. "${btn.text}" - ${btn.className}`);
    });
    
    // 호텔 정보 저장 버튼 클릭
    const hotelSaveButton = modalButtons.find(btn => 
      btn.text.includes('호텔') && btn.text.includes('저장')
    );
    
    if (hotelSaveButton) {
      console.log('🏨 호텔 정보 저장 버튼 클릭...');
      await page.click(`button:has-text("${hotelSaveButton.text}")`);
      await page.waitForTimeout(3000);
    } else {
      console.log('⚠️ 호텔 정보 저장 버튼을 찾을 수 없음');
    }
    
    console.log('\n📋 최종 콘솔 로그:');
    logs.forEach(log => console.log(log));
    
    // 스크린샷
    await page.screenshot({ path: 'debug/modal-save-test.png' });
    
    console.log('✅ 모달 저장 테스트 완료');
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

modalSaveTest(); 