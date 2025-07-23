const { test, expect } = require('@playwright/test');

test('모달 디버깅 테스트', async ({ page }) => {
  console.log('🚀 페이지 로딩 시작...');
  await page.goto('http://localhost: {process.env.PORT || 34343}/admin');
  console.log('✅ 페이지 로딩 완료');
  
  // 페이지 제목 확인
  const title = await page.title();
  console.log('📄 페이지 제목:', title);
  
  // 호텔 정보 탭 찾기
  const hotelTab = page.locator('text=호텔 정보');
  const isHotelTabVisible = await hotelTab.isVisible();
  console.log('🏨 호텔 정보 탭 보임:', isHotelTabVisible);
  
  if (isHotelTabVisible) {
    console.log('🖱️ 호텔 정보 탭 클릭...');
    await hotelTab.click();
    console.log('✅ 호텔 정보 탭 클릭 완료');
    
    // 2초 대기
    await page.waitForTimeout(2000);
    
    // 모달 존재 확인
    const modal = page.locator('[role="dialog"]');
    const isModalVisible = await modal.isVisible();
    console.log('📋 모달 보임:', isModalVisible);
    
    if (isModalVisible) {
      console.log('✅ 모달이 열렸습니다!');
      
      // 모달 내부 요소들 확인
      const inputs = await page.locator('[role="dialog"] input').count();
      console.log('📝 모달 내 입력 필드 개수:', inputs);
      
      // 호텔 이름 입력 필드 확인
      const hotelNameInput = page.locator('[role="dialog"] input[placeholder="호텔 이름을 입력하세요"]');
      const isHotelNameInputVisible = await hotelNameInput.isVisible();
      console.log('🏨 호텔 이름 입력 필드 보임:', isHotelNameInputVisible);
      
      if (isHotelNameInputVisible) {
        console.log('✅ 호텔 이름 입력 필드 발견!');
        await hotelNameInput.fill('테스트 호텔');
        console.log('✅ 호텔 이름 입력 완료');
      }
      
      // 스크린샷 촬영
      await page.screenshot({ path: 'debug-modal-open.png', fullPage: true });
      console.log('📸 모달 열린 상태 스크린샷 저장');
      
    } else {
      console.log('❌ 모달이 열리지 않았습니다.');
      
      // 인라인 폼 확인
      const inlineInputs = await page.locator('input[placeholder="호텔 이름을 입력하세요"]').count();
      console.log('📝 인라인 입력 필드 개수:', inlineInputs);
      
      if (inlineInputs > 0) {
        console.log('✅ 인라인 폼에서 호텔 이름 입력 필드 발견!');
      }
      
      // 스크린샷 촬영
      await page.screenshot({ path: 'debug-no-modal.png', fullPage: true });
      console.log('📸 모달 없는 상태 스크린샷 저장');
    }
  } else {
    console.log('❌ 호텔 정보 탭을 찾을 수 없습니다.');
    await page.screenshot({ path: 'debug-no-tab.png', fullPage: true });
  }
  
  console.log('🏁 디버깅 테스트 완료');
}); 