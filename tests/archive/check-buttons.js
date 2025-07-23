const { chromium } = require('playwright');

const BUTTON_LABELS = [
  '호텔 정보',
  '객실 정보 (통합)',
  '시설 정보',
  '패키지 (통합)',
  '추가요금 (통합)',
  '취소규정',
  '예약안내',
  '공지사항',
  '템플릿 목록'
];

(async () => {
  console.log('🚀 버튼 클릭 및 모달 닫기 테스트 시작...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const allLogs = [];
  let errorFound = false;

  page.on('console', msg => {
    const log = {
      type: msg.type(),
      text: msg.text(),
    };
    allLogs.push(log);
    if (log.type === 'error') {
        console.error(`🚨 실시간 에러 발견: ${log.text}`);
        errorFound = true;
    }
  });

  try {
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('✅ 페이지 로드 완료.');
    await page.waitForTimeout(2000);

    for (const label of BUTTON_LABELS) {
      const buttonSelector = `div:has-text("${label}")`;
      console.log(`\n--- 🖱️  '${label}' 버튼 클릭 ---`);
      
      try {
        const button = page.locator(buttonSelector).first();
        if (await button.count() > 0) {
            await button.click({ timeout: 5000 });
            console.log(`✅ '${label}' 버튼 클릭 성공. 모달이 열립니다.`);
            await page.waitForTimeout(1500);

            // 모달 닫기 시도
            const closeButton = page.locator('button:has-text("닫기"), button:has-text("취소"), button.btn-close, [aria-label="Close"]').first();
            if (await closeButton.count() > 0) {
              await closeButton.click({ timeout: 5000 });
              console.log('✅ 모달 닫기 버튼 클릭 성공.');
            } else {
              console.warn('⚠️ 모달 닫기 버튼을 찾을 수 없음. ESC 키를 누릅니다.');
              await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(1000);

        } else {
            console.warn(`⚠️ '${label}' 버튼을 찾을 수 없음.`);
        }
      } catch (e) {
        console.error(`❌ '${label}' 버튼 테스트 중 오류 발생: ${e.message}`);
        errorFound = true; // 클릭 자체의 오류도 에러로 간주
      }
    }

  } catch (e) {
    console.error(`❌ 페이지 탐색 중 오류 발생: ${e.message}`);
    errorFound = true;
  } finally {
    console.log('\n\n--- 📊 최종 콘솔 로그 요약 ---');
    if (allLogs.length === 0) {
      console.log('캡처된 콘솔 로그가 없습니다.');
    } else {
      const errorLogs = allLogs.filter(log => log.type === 'error');
      if (errorLogs.length > 0) {
        console.log(`총 ${allLogs.length}개의 로그 중 ${errorLogs.length}개의 에러 발견:`);
        errorLogs.forEach((log, i) => {
          console.log(`${i + 1}. [${log.type.toUpperCase()}] ${log.text}`);
        });
      } else {
        console.log(`✅ 에러 없음. 총 ${allLogs.length}개의 로그가 캡처되었습니다.`);
      }
    }
    console.log('---------------------------------');

    if (errorFound) {
        console.log('\n🔴 테스트 중 에러가 발견되었습니다.');
    } else {
        console.log('\n🟢 테스트가 에러 없이 완료되었습니다.');
    }

    await browser.close();
    console.log('🚀 테스트 종료.');
  }
})(); 