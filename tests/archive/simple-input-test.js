const { chromium } = require('playwright');

async function testSimpleInput() {
  console.log('🔍 SimpleInput 단독 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300 
  });
  
  const page = await browser.newPage();

  try {
    // 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    await page.waitForTimeout(2000);

    // 객실 정보 섹션 클릭
    await page.click('text=객실 정보 (통합)');
    await page.waitForTimeout(2000);

    // 첫 번째 객실의 이름 필드 찾기
    const nameInput = await page.locator('input[name="name"]').first();
    
    if (await nameInput.isVisible()) {
      console.log('✅ 객실 이름 입력 필드 발견');
      
      // 포커스
      await nameInput.click();
      await page.waitForTimeout(500);
      
      // 한 글자씩 천천히 입력
      console.log('한 글자씩 입력 테스트...');
      
      await nameInput.fill('');
      await page.waitForTimeout(300);
      
      await nameInput.type('A', { delay: 500 });
      await page.waitForTimeout(1000);
      let value1 = await nameInput.inputValue();
      console.log(`A 입력 후: "${value1}"`);
      
      await nameInput.type('B', { delay: 500 });
      await page.waitForTimeout(1000);
      let value2 = await nameInput.inputValue();
      console.log(`B 입력 후: "${value2}"`);
      
      await nameInput.type('C', { delay: 500 });
      await page.waitForTimeout(1000);
      let value3 = await nameInput.inputValue();
      console.log(`C 입력 후: "${value3}"`);
      
      // 전체 텍스트로 테스트
      console.log('전체 텍스트 입력 테스트...');
      await nameInput.fill('');
      await page.waitForTimeout(300);
      
      await nameInput.fill('테스트객실');
      await page.waitForTimeout(1000);
      let finalValue = await nameInput.inputValue();
      console.log(`최종 값: "${finalValue}"`);
      
      // Tab으로 blur
      await page.keyboard.press('Tab');
      await page.waitForTimeout(1000);
      let blurValue = await nameInput.inputValue();
      console.log(`blur 후: "${blurValue}"`);
      
    } else {
      console.log('❌ 객실 이름 입력 필드를 찾을 수 없음');
    }

    // 스크린샷 저장
    await page.screenshot({ path: 'simple-input-test.png' });
    console.log('📷 스크린샷 저장됨: simple-input-test.png');

  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    console.log('🏁 테스트 완료');
    await browser.close();
  }
}

testSimpleInput(); 