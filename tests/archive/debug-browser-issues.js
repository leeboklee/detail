const { chromium } = require('playwright');

const BUTTON_LABELS = [
  '호텔 정보', '객실 정보 (통합)', '시설 정보', '패키지 (통합)', 
  '추가요금 (통합)', '취소규정', '예약안내', '공지사항', '템플릿 목록'
];

(async () => {
  console.log('🚀 고급 브라우저 이슈 분석 시작 (Console + Page Errors + Failed Requests)...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const capturedData = {
    consoleLogs: [],
    pageErrors: [],
    failedRequests: []
  };

  page.on('console', msg => {
    capturedData.consoleLogs.push({ type: msg.type(), text: msg.text(), location: msg.location() });
    if (msg.type() === 'error') {
        console.error(`🚨 CONSOLE ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', exception => {
    console.error(`🚨 PAGE ERROR (UNCAUGHT EXCEPTION): ${exception.message}`);
    capturedData.pageErrors.push(exception.message);
  });

  page.on('requestfailed', request => {
    console.error(`🚨 REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure().errorText}`);
    capturedData.failedRequests.push({ url: request.url(), method: request.method(), error: request.failure().errorText });
  });

  try {
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('✅ 페이지 로드 완료.');
    await page.waitForTimeout(2000);

    for (const label of BUTTON_LABELS) {
      console.log(`\n--- 🖱️  '${label}' 버튼 테스트 ---`);
      const buttonSelector = `div:has-text("${label}")`;
      const button = page.locator(buttonSelector).first();

      if (await button.count() > 0) {
        await button.click({ timeout: 5000 });
        console.log(`  ✅ '${label}' 버튼 클릭 성공.`);
        await page.waitForTimeout(1500);

        const closeButton = page.locator('button:has-text("닫기"), button:has-text("취소"), button.btn-close, [aria-label="Close"]').first();
        if (await closeButton.count() > 0) {
          await closeButton.click({ timeout: 5000 });
          console.log('  ✅ 모달 닫기 성공.');
        } else {
          await page.keyboard.press('Escape');
          console.log('  🟡 모달 닫기 버튼을 찾을 수 없어 ESC 키 사용.');
        }
        await page.waitForTimeout(1000);
      } else {
        console.warn(`  ⚠️ '${label}' 버튼을 찾을 수 없음.`);
      }
    }
  } catch (e) {
    console.error(`❌ 테스트 실행 중 심각한 오류 발생: ${e.message}`);
  } finally {
    console.log('\n\n--- 📊 최종 이슈 분석 요약 ---');
    const { consoleLogs, pageErrors, failedRequests } = capturedData;
    let totalIssues = 0;

    console.log(`\n[Console Logs]`);
    const consoleErrors = consoleLogs.filter(c => c.type === 'error');
    if (consoleErrors.length > 0) {
        console.log(`  🔴 ${consoleErrors.length}개의 에러 발견:`);
        consoleErrors.forEach((log, i) => console.log(`    ${i + 1}. ${log.text} (at ${log.location.url}:${log.location.lineNumber})`));
        totalIssues += consoleErrors.length;
    } else {
        console.log('  🟢 콘솔 에러 없음.');
    }
    
    console.log(`\n[Page Errors (Uncaught Exceptions)]`);
    if (pageErrors.length > 0) {
        console.log(`  🔴 ${pageErrors.length}개의 예외 발견:`);
        pageErrors.forEach((err, i) => console.log(`    ${i + 1}. ${err}`));
        totalIssues += pageErrors.length;
    } else {
        console.log('  🟢 페이지 예외 없음.');
    }

    console.log(`\n[Failed Network Requests]`);
    if (failedRequests.length > 0) {
        console.log(`  🔴 ${failedRequests.length}개의 요청 실패 발견:`);
        failedRequests.forEach((req, i) => console.log(`    ${i + 1}. ${req.method} ${req.url} - ${req.error}`));
        totalIssues += failedRequests.length;
    } else {
        console.log('  🟢 네트워크 요청 실패 없음.');
    }

    console.log('\n---------------------------------');
    if (totalIssues > 0) {
        console.log(`\n🔴 총 ${totalIssues}개의 이슈가 발견되었습니다.`);
    } else {
        console.log('\n🟢 테스트가 어떠한 이슈도 없이 완료되었습니다.');
    }

    await browser.close();
    console.log('🚀 분석 종료.');
  }
})(); 