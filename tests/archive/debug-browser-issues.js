const { chromium } = require('playwright');

const BUTTON_LABELS = [
  '?명뀛 ?뺣낫', '媛앹떎 ?뺣낫 (?듯빀)', '?쒖꽕 ?뺣낫', '?⑦궎吏 (?듯빀)', 
  '異붽??붽툑 (?듯빀)', '痍⑥냼洹쒖젙', '?덉빟?덈궡', '怨듭??ы빆', '?쒗뵆由?紐⑸줉'
];

(async () => {
  console.log('?? 怨좉툒 釉뚮씪?곗? ?댁뒋 遺꾩꽍 ?쒖옉 (Console + Page Errors + Failed Requests)...');
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
        console.error(`?슚 CONSOLE ERROR: ${msg.text()}`);
    }
  });

  page.on('pageerror', exception => {
    console.error(`?슚 PAGE ERROR (UNCAUGHT EXCEPTION): ${exception.message}`);
    capturedData.pageErrors.push(exception.message);
  });

  page.on('requestfailed', request => {
    console.error(`?슚 REQUEST FAILED: ${request.method()} ${request.url()} - ${request.failure().errorText}`);
    capturedData.failedRequests.push({ url: request.url(), method: request.method(), error: request.failure().errorText });
  });

  try {
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺.');
    await page.waitForTimeout(2000);

    for (const label of BUTTON_LABELS) {
      console.log(`\n--- ?뼮截? '${label}' 踰꾪듉 ?뚯뒪??---`);
      const buttonSelector = `div:has-text("${label}")`;
      const button = page.locator(buttonSelector).first();

      if (await button.count() > 0) {
        await button.click({ timeout: 5000 });
        console.log(`  ??'${label}' 踰꾪듉 ?대┃ ?깃났.`);
        await page.waitForTimeout(1500);

        const closeButton = page.locator('button:has-text("?リ린"), button:has-text("痍⑥냼"), button.btn-close, [aria-label="Close"]').first();
        if (await closeButton.count() > 0) {
          await closeButton.click({ timeout: 5000 });
          console.log('  ??紐⑤떖 ?リ린 ?깃났.');
        } else {
          await page.keyboard.press('Escape');
          console.log('  ?윞 紐⑤떖 ?リ린 踰꾪듉??李얠쓣 ???놁뼱 ESC ???ъ슜.');
        }
        await page.waitForTimeout(1000);
      } else {
        console.warn(`  ?좑툘 '${label}' 踰꾪듉??李얠쓣 ???놁쓬.`);
      }
    }
  } catch (e) {
    console.error(`???뚯뒪???ㅽ뻾 以??ш컖???ㅻ쪟 諛쒖깮: ${e.message}`);
  } finally {
    console.log('\n\n--- ?뱤 理쒖쥌 ?댁뒋 遺꾩꽍 ?붿빟 ---');
    const { consoleLogs, pageErrors, failedRequests } = capturedData;
    let totalIssues = 0;

    console.log(`\n[Console Logs]`);
    const consoleErrors = consoleLogs.filter(c => c.type === 'error');
    if (consoleErrors.length > 0) {
        console.log(`  ?뵶 ${consoleErrors.length}媛쒖쓽 ?먮윭 諛쒓껄:`);
        consoleErrors.forEach((log, i) => console.log(`    ${i + 1}. ${log.text} (at ${log.location.url}:${log.location.lineNumber})`));
        totalIssues += consoleErrors.length;
    } else {
        console.log('  ?윟 肄섏넄 ?먮윭 ?놁쓬.');
    }
    
    console.log(`\n[Page Errors (Uncaught Exceptions)]`);
    if (pageErrors.length > 0) {
        console.log(`  ?뵶 ${pageErrors.length}媛쒖쓽 ?덉쇅 諛쒓껄:`);
        pageErrors.forEach((err, i) => console.log(`    ${i + 1}. ${err}`));
        totalIssues += pageErrors.length;
    } else {
        console.log('  ?윟 ?섏씠吏 ?덉쇅 ?놁쓬.');
    }

    console.log(`\n[Failed Network Requests]`);
    if (failedRequests.length > 0) {
        console.log(`  ?뵶 ${failedRequests.length}媛쒖쓽 ?붿껌 ?ㅽ뙣 諛쒓껄:`);
        failedRequests.forEach((req, i) => console.log(`    ${i + 1}. ${req.method} ${req.url} - ${req.error}`));
        totalIssues += failedRequests.length;
    } else {
        console.log('  ?윟 ?ㅽ듃?뚰겕 ?붿껌 ?ㅽ뙣 ?놁쓬.');
    }

    console.log('\n---------------------------------');
    if (totalIssues > 0) {
        console.log(`\n?뵶 珥?${totalIssues}媛쒖쓽 ?댁뒋媛 諛쒓껄?섏뿀?듬땲??`);
    } else {
        console.log('\n?윟 ?뚯뒪?멸? ?대뼚???댁뒋???놁씠 ?꾨즺?섏뿀?듬땲??');
    }

    await browser.close();
    console.log('?? 遺꾩꽍 醫낅즺.');
  }
})(); 
