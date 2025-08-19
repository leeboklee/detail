const { chromium } = require('playwright');

async function resetData() {
  console.log('🧹 데이터 초기화 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500 
  });
  
  const page = await browser.newPage();

  try {
    // 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 3900}');
    await page.waitForTimeout(2000);

    // 로컬스토리지 초기화
    await page.evaluate(() => {
      localStorage.clear();
      console.log('✅ 로컬스토리지 초기화됨');
    });

    // 페이지 새로고침
    await page.reload();
    await page.waitForTimeout(3000);

    // 객실 정보 섹션 클릭
    await page.click('text=객실 정보 (통합)');
    await page.waitForTimeout(2000);

    // 객실 개수 확인
    const roomCards = await page.$$('[class*="border rounded-lg p-4 bg-gray-50"]');
    console.log(`🏨 초기화 후 객실 개수: ${roomCards.length}개`);

    // 스크린샷 저장
    await page.screenshot({ path: 'reset-data-result.png' });
    console.log('📷 초기화 후 스크린샷 저장됨: reset-data-result.png');

  } catch (error) {
    console.error('❌ 초기화 오류:', error);
  } finally {
    console.log('🏁 초기화 완료');
    await browser.close();
  }
}

resetData(); 