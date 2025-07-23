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

// 섹션별 저장 테스트
async function testSectionSave(page, sectionName, sectionText) {
  console.log(`\n🔍 [${sectionName}] 섹션 테스트 시작...`);
  
  // 섹션 카드 찾기
  const cards = await page.locator('div.cursor-pointer').all();
  let sectionCard = null;
  
  for (const card of cards) {
    const text = await card.textContent();
    if (text.includes(sectionText)) {
      sectionCard = card;
      console.log(`✅ ${sectionName} 카드 발견: "${text}"`);
      break;
    }
  }
  
  if (!sectionCard) {
    console.log(`❌ ${sectionName} 카드를 찾을 수 없음`);
    return false;
  }
  
  // 섹션 카드 클릭
  console.log(`🏠 ${sectionName} 카드 클릭...`);
  await safeClick(page, sectionCard, `${sectionName} 카드`);
  
  console.log('⏳ 모달 로딩 대기...');
  await wait(3000);
  
  let inputCount = 0;

  // 섹션별 특화된 입력 로직
  if (sectionName === '시설 정보') {
    console.log('🏢 [시설 정보] 특화 로직: "시설 추가" 버튼 클릭');
    const addButton = page.locator('button:has-text("+ 시설 추가")');
    if (await addButton.count() > 0) {
      await safeClick(page, addButton, '시설 추가 버튼');
      await wait(1000);

      const facilityNameInput = page.locator('input[placeholder="시설명 (예: 수영장)"]').last();
      const testValue = `${sectionName} 테스트 값 ${Date.now()}`;
      await facilityNameInput.fill(testValue);
      console.log(`📝 입력 완료: name = "${testValue}"`);
      inputCount = 1;
    }
  } else if (sectionName === '패키지') {
    console.log('📦 [패키지] 특화 로직: 새 패키지 정보 입력 후 "패키지 추가" 버튼 클릭');
    const nameInput = page.locator('input[placeholder="패키지명"]');
    const priceInput = page.locator('input[placeholder="가격"]');
    const addButton = page.locator('button:has-text("패키지 추가")');

    if (await nameInput.count() > 0 && await addButton.count() > 0) {
      const nameValue = `${sectionName} 테스트 값 ${Date.now()}`;
      const priceValue = String(Math.floor(Math.random() * 100000) + 50000);

      await nameInput.fill(nameValue);
      console.log(`📝 입력 완료: name = "${nameValue}"`);
      await priceInput.fill(priceValue);
      console.log(`📝 입력 완료: price = "${priceValue}"`);

      await safeClick(page, addButton, '패키지 추가 버튼');
      await wait(1000);
      inputCount = 1; // 패키지 1개 추가
    }
  } else if (sectionName === '추가요금') {
    console.log('💰 [추가요금] 특화 로직: "항목 추가" 버튼 클릭');
    const addButton = page.locator('button:has-text("+ 항목 추가")');
    if (await addButton.count() > 0) {
      await safeClick(page, addButton, '항목 추가 버튼');
      await wait(1000);

      const itemNameInput = page.locator('input[placeholder="항목명 (예: 인원 추가)"]').last();
      const itemPriceInput = page.locator('input[placeholder="가격 (예: 20000)"]').last();
      
      const nameValue = `${sectionName} 테스트 값 ${Date.now()}`;
      const priceValue = String(Math.floor(Math.random() * 20000) + 10000);

      await itemNameInput.fill(nameValue);
      console.log(`📝 입력 완료: name = "${nameValue}"`);
      await itemPriceInput.fill(priceValue);
      console.log(`📝 입력 완료: price = "${priceValue}"`);
      inputCount = 1;
    }
  } else {
    // 기존 입력 로직
    const inputs = await page.locator('input[type="text"], input[type="url"], textarea').all();
    
    for (let i = 0; i < Math.min(inputs.length, 3); i++) {
      try {
        const input = inputs[i];
        const name = await input.getAttribute('name');
        
        if (name && !name.includes('time') && !name.includes('capacity')) {
          const testValue = `${sectionName} 테스트 값 ${Date.now()}`;
          await input.fill(testValue);
          inputCount++;
          console.log(`📝 입력 완료: ${name} = "${testValue}"`);
        }
      } catch (error) {
        console.log(`⚠️ 입력 실패: ${error.message}`);
      }
    }
  }
  
  console.log(`📊 총 ${inputCount}개 필드에 입력 완료`);
  
  // 저장 버튼 클릭
  console.log('💾 적용하고 닫기 버튼 찾기...');
  const saveButton = page.locator('button:has-text("적용하고 닫기")').first();
  
  if (await saveButton.count() > 0) {
    console.log('💾 적용하고 닫기 버튼 클릭...');
    await safeClick(page, saveButton, '적용하고 닫기 버튼');
    
    console.log('⏳ 저장 완료 대기...');
    await wait(2000); // DB 반영 및 UI 업데이트 시간
    
    // 성공 메시지 확인 (이 부분은 현재 UI에 없으므로 주석 처리 또는 다른 방식으로 확인)
    /*
    const successMessage = await page.locator('div:has-text("저장되었습니다")').first();
    if (await successMessage.count() > 0) {
      console.log('✅ 저장 성공 메시지 확인됨');
    } else {
      console.log('❌ 저장 성공 메시지 없음');
    }
    */
    // 모달이 닫히는 것으로 성공 간주
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    console.log('✅ 모달이 닫힘. 저장 성공으로 간주.');

  } else {
    console.log('❌ 적용하고 닫기 버튼을 찾을 수 없음');
  }
  
  console.log('⏳ 잠시 대기...');
  await wait(3000);
  
  // 다시 열어서 값 확인
  console.log(`🔄 다시 ${sectionName} 카드 클릭하여 값 확인...`);
  await safeClick(page, sectionCard, `${sectionName} 카드 재클릭`);
  
  console.log('⏳ 모달 재로딩 대기...');
  await wait(3000);
  
  // 저장된 값 확인
  console.log('🔍 저장된 값 확인...');
  const savedInputs = await page.locator('input[type="text"], input[type="url"], textarea').all();
  let savedValues = [];
  
  for (let i = 0; i < Math.min(savedInputs.length, 3); i++) {
    try {
      const input = savedInputs[i];
      const name = await input.getAttribute('name');
      const value = await input.inputValue();
      
      if (name && value) {
        savedValues.push(`${name}: "${value}"`);
      }
    } catch (error) {
      console.log(`⚠️ 값 확인 실패: ${error.message}`);
    }
  }
  
  console.log(`📊 저장된 값들:`);
  savedValues.forEach(value => console.log(`  - ${value}`));
  
  // 저장 성공 여부 판단
  const hasSavedValues = savedValues.some(value => value.includes('테스트 값'));
  
  if (hasSavedValues) {
    console.log(`🎉 [${sectionName}] 저장 기능이 정상적으로 작동함!`);
  } else {
    console.log(`❌ [${sectionName}] 저장된 값이 원래대로 돌아감`);
  }
  
  // 모달 닫기
  const finalCloseButton = page.locator('button:has-text("×")').first();
  if (await finalCloseButton.count() > 0) {
    await safeClick(page, finalCloseButton, '최종 모달 닫기');
  }
  
  await wait(2000);
  
  return hasSavedValues;
}

// 전체 테스트 실행
async function runCompleteTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 브라우저 콘솔 로그를 터미널에 출력
  page.on('console', msg => {
    const type = msg.type().toUpperCase();
    console.log(`[BROWSER ${type}]: ${msg.text()}`);
  });

  try {
    console.log('🌐 페이지 로딩...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle', timeout: 60000 });
    await wait(3000);
    
    // 테스트할 섹션들
    const sections = [
      { name: '호텔 정보', text: '호텔 정보' },
      { name: '객실 정보', text: '객실 정보' },
      { name: '시설 정보', text: '시설 정보' },
      { name: '패키지', text: '패키지' },
      { name: '추가요금', text: '추가요금' }
    ];
    
    let successCount = 0;
    
    for (const section of sections) {
      const success = await testSectionSave(page, section.name, section.text);
      if (success) successCount++;
    }
    
    console.log(`\n🎯 최종 결과: ${successCount}/${sections.length} 섹션 저장 성공`);
    
    if (successCount === sections.length) {
      console.log('🎉 모든 섹션의 저장 기능이 정상적으로 작동합니다!');
    } else {
      console.log('⚠️ 일부 섹션에서 저장 기능에 문제가 있습니다.');
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

// 테스트 실행
runCompleteTest().catch(console.error); 