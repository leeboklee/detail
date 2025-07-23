const { chromium } = require('playwright');

// 대기 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 안전한 클릭 함수
async function safeClick(page, element, description = '') {
  try {
    await element.scrollIntoViewIfNeeded();
    await wait(500);
    await element.click();
    await wait(1000);
    console.log(`✅ ${description} 클릭 성공`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} 클릭 실패: ${error.message}`);
    try {
      await element.evaluate(el => el.click());
      await wait(1000);
      console.log(`✅ ${description} 강제 클릭 성공`);
      return true;
    } catch (e) {
      console.log(`❌ ${description} 강제 클릭도 실패: ${e.message}`);
      return false;
    }
  }
}

// 저장 기능 테스트
async function testSaveFunction() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('🌐 페이지 로딩...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await wait(3000);
    
    console.log('🔍 호텔 정보 카드 찾기...');
    const hotelCards = await page.locator('div.cursor-pointer').all();
    
    let hotelCard = null;
    for (const card of hotelCards) {
      const text = await card.textContent();
      if (text.includes('호텔 정보') || text.includes('🏠')) {
        hotelCard = card;
        console.log(`✅ 호텔 정보 카드 발견: "${text}"`);
        break;
      }
    }
    
    if (!hotelCard) {
      console.log('❌ 호텔 정보 카드를 찾을 수 없음');
      return;
    }
    
    console.log('🏠 호텔 정보 카드 클릭...');
    await safeClick(page, hotelCard, '호텔 정보 카드');
    
    console.log('⏳ 모달 로딩 대기...');
    await wait(3000);
    
    console.log('📝 입력 필드 찾기...');
    const nameInput = page.locator('input[name="name"]').first();
    const addressInput = page.locator('input[name="address"]').first();
    const descriptionInput = page.locator('textarea[name="description"]').first();
    
    // 테스트 데이터 입력
    console.log('📝 테스트 데이터 입력...');
    await nameInput.fill('테스트 호텔 ' + Date.now());
    await addressInput.fill('서울시 강남구 테스트로 123');
    await descriptionInput.fill('저장 기능 테스트용 호텔입니다.');
    
    console.log('💾 DB 저장 버튼 찾기...');
    const saveButton = page.locator('button:has-text("🗄️ DB 저장")').first();
    
    if (await saveButton.count() > 0) {
      console.log('💾 DB 저장 버튼 클릭...');
      await safeClick(page, saveButton, 'DB 저장 버튼');
      
      console.log('⏳ 저장 완료 대기...');
      await wait(5000);
      
      // 성공 메시지 확인
      const successMessage = await page.locator('div:has-text("저장되었습니다")').first();
      if (await successMessage.count() > 0) {
        console.log('✅ 저장 성공 메시지 확인됨');
      } else {
        console.log('❌ 저장 성공 메시지 없음');
      }
    } else {
      console.log('❌ DB 저장 버튼을 찾을 수 없음');
    }
    
    console.log('🔄 모달 닫기...');
    const closeButton = page.locator('button:has-text("×")').first();
    if (await closeButton.count() > 0) {
      await safeClick(page, closeButton, '모달 닫기 버튼');
    }
    
    console.log('⏳ 잠시 대기...');
    await wait(3000);
    
    console.log('🔄 다시 호텔 정보 카드 클릭하여 값 확인...');
    await safeClick(page, hotelCard, '호텔 정보 카드 재클릭');
    
    console.log('⏳ 모달 재로딩 대기...');
    await wait(3000);
    
    console.log('🔍 저장된 값 확인...');
    const savedName = await nameInput.inputValue();
    const savedAddress = await addressInput.inputValue();
    const savedDescription = await descriptionInput.inputValue();
    
    console.log(`📊 저장된 값들:`);
    console.log(`  - 호텔명: "${savedName}"`);
    console.log(`  - 주소: "${savedAddress}"`);
    console.log(`  - 설명: "${savedDescription}"`);
    
    if (savedName.includes('테스트 호텔') && savedAddress.includes('테스트로')) {
      console.log('🎉 저장 기능이 정상적으로 작동함!');
    } else {
      console.log('❌ 저장된 값이 원래대로 돌아감');
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testSaveFunction().catch(console.error); 