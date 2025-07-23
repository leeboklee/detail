const { chromium } = require('playwright');

const SECTIONS_TO_TEST = [
  { 
    label: '호텔 정보', 
    saveButton: '💾 호텔정보 저장',
    inputs: ['input[type="text"]', 'textarea']
  },
  { 
    label: '객실 정보 (통합)', 
    saveButton: '💾 객실정보 저장',
    inputs: ['input[type="text"]', 'input[type="number"]', 'textarea', 'select']
  },
  { 
    label: '시설 정보', 
    saveButton: '💾 시설정보 저장',
    inputs: ['input[type="checkbox"]', 'textarea']
  },
   { 
    label: '패키지 (통합)', 
    saveButton: '💾 패키지 저장',
    inputs: ['input[type="text"]', 'input[type="number"]', 'textarea']
  },
  { 
    label: '추가요금 (통합)', 
    saveButton: '💾 추가요금 저장',
    inputs: ['input[type="text"]', 'input[type="number"]']
  },
];

(async () => {
  console.log('🚀 고급 상호작용 시나리오 테스트 시작...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const capturedErrors = [];

  page.on('console', msg => {
    const logData = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    };
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
      capturedErrors.push(logData);
    }
  });
  
  page.on('pageerror', exc => {
      const errorText = `[PAGE ERROR] ${exc.message}`;
      console.error(`🚨 ${errorText}`);
      capturedErrors.push(errorText);
  });

  try {
    console.log('🌐 페이지로 이동 중... (http://localhost: {process.env.PORT || 34343})');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('✅ 페이지 로드 완료');
    
    for (const section of SECTIONS_TO_TEST) {
      console.log(`\n\n--- [시작] '${section.label}' 섹션 테스트 ---`);

      // 1. 섹션 열기
      await page.locator(`div:has-text("${section.label}")`).first().click();
      console.log(`  - '${section.label}' 섹션 열기 완료.`);
      await page.waitForTimeout(1000);

      // 2. 모든 입력란에 값 채우기
      console.log('  - 입력란 채우기 시작...');
      for (const inputType of section.inputs) {
        const inputs = await page.locator(`.modal-content ${inputType}, .fade.in ${inputType}`).all();
        for (const input of inputs) {
            if (await input.isEditable()) {
                const type = await input.getAttribute('type');
                if (type === 'checkbox' || type === 'radio') {
                    await input.check({ force: true });
                } else if ((await input.elementHandle())._element.tagName === 'SELECT') {
                    await input.selectOption({ index: 1 });
                } else if (type === 'number') {
                    await input.fill('123', { force: true });
                } else {
                    await input.fill('테스트 자동 입력', { force: true });
                }
            }
        }
      }
      console.log('  - 입력란 채우기 완료.');

      // 3. 저장 버튼 클릭
      page.once('dialog', async dialog => {
        console.log(`  - Alert 메시지 확인: "${dialog.message()}"`);
        await dialog.dismiss();
      });

      // DEBUG: 버튼 클릭 전 모달의 HTML 구조 확인
      const modalHtml = await page.locator('.modal-content').innerHTML();
      console.log('--- MODAL HTML ---');
      console.log(modalHtml);
      console.log('--- END MODAL HTML ---');

      await page.locator(`button:has-text("${section.saveButton}")`).click();
      console.log(`  - '${section.saveButton}' 저장 버튼 클릭 완료.`);
      await page.waitForTimeout(1500);

      // 4. 모달 닫기
      await page.locator('button:has-text("닫기"), button.btn-close').first().click();
      console.log('  - 모달 닫기 완료.');
      await page.waitForTimeout(1000);
      
      // 5. 섹션 다시 열기
      await page.locator(`div:has-text("${section.label}")`).first().click();
      console.log(`  - '${section.label}' 섹션 다시 열기 완료.`);
      await page.waitForTimeout(1000);

      // 6. 입력창 다시 클릭해보기
      const firstInput = page.locator(`.modal-content ${section.inputs[0]}, .fade.in ${section.inputs[0]}`).first();
      if(await firstInput.count() > 0) {
        await firstInput.click();
        console.log('  - 다시 연 후 입력창 클릭 완료.');
      }
      
      await page.locator('button:has-text("닫기"), button.btn-close').first().click();
      console.log('  - 최종 닫기 완료.');

      console.log(`--- [종료] '${section.label}' 섹션 테스트 완료 ---`);
    }

  } catch (error) {
    console.error(`❌ 테스트 중 심각한 오류 발생: ${error.message}`);
    const screenshotPath = `debug-screenshot-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 오류 발생 시점의 스크린샷을 '${screenshotPath}' 파일로 저장했습니다.`);
    console.error(error.stack);
  } finally {
    console.log('\n\n--- 📊 최종 테스트 결과 ---');
    if (capturedErrors.length > 0) {
      console.log('🔴 총 12개의 에러가 발견되었습니다:');
      capturedErrors.forEach(err => {
        console.log(`- [${err.type.toUpperCase()}] ${err.text}`);
        if(err.location) {
          console.log(`  at ${err.location.url}:${err.location.lineNumber}:${err.location.columnNumber}`);
        }
      });
    } else {
      console.log('🟢 테스트의 모든 시나리오에서 브라우저 에러가 발견되지 않았습니다.');
    }
    await browser.close();
    console.log('🚀 테스트 종료.');
  }
})(); 