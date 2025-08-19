import { test, expect } from '@playwright/test';

// ?쒕쾭濡?濡쒓렇 ?꾩넚 ?⑥닔
async function sendLog(log) {
  await fetch(`http://localhost:${process.env.PORT || 3900}/api/log-error`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(log)
  });
}

test('test-detail ?섏씠吏 ?대씪?댁뼵??濡쒓렇 ?먮룞 ?섏쭛 諛??쒕쾭 ?꾩넚', async ({ page }) => {
  const logs = [];

  // 肄섏넄 ?ㅻ쪟/濡쒓렇 ?섏쭛
  page.on('console', msg => {
    if (msg.type() === 'error' || msg.type() === 'warning' || msg.type() === 'log') {
      logs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // ?섏씠吏 ?ㅻ쪟 ?섏쭛
  page.on('pageerror', error => {
    logs.push({
      type: 'page_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  });

  // ?ㅽ듃?뚰겕 ?ㅻ쪟 ?섏쭛
  page.on('response', response => {
    if (response.status() >= 400) {
      logs.push({
        type: 'network_error',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      });
    }
  });

  // /test-detail ?섏씠吏 吏꾩엯
  await page.goto(`http://localhost:${process.env.PORT || 3900}/test-detail`);
  await page.waitForLoadState('networkidle');

  // '?뚯뒪???쒖옉' 踰꾪듉 ?대┃
  const startBtn = page.locator('button:has-text("?뚯뒪???쒖옉")');
  await expect(startBtn).toBeVisible();
  await startBtn.click();

  // 5珥덇컙 濡쒓렇 ?섏쭛
  await page.waitForTimeout(5000);

  // ?쒕쾭濡?濡쒓렇 ?꾩넚
  for (const log of logs) {
    await page.evaluate(sendLog, log);
  }

  // 寃곌낵 ?붿빟 異쒕젰
  if (logs.length > 0) {
    console.log('\n?슚 媛먯????대씪?댁뼵??濡쒓렇:');
    logs.forEach((log, idx) => {
      console.log(`\n${idx + 1}. ${log.type}:`);
      console.log('   硫붿떆吏:', log.message || log.text);
      if (log.url) console.log('   URL:', log.url);
      if (log.stack) console.log('   ?ㅽ깮:', log.stack);
      console.log('   ?쒓컙:', log.timestamp);
    });
  } else {
    console.log('???ㅻ쪟/濡쒓렇 ?놁쓬');
  }

  // ?ㅻ쪟媛 ?덉쑝硫??뚯뒪???ㅽ뙣
  expect(logs.filter(l => l.type === 'error' || l.type === 'page_error' || l.type === 'network_error').length).toBe(0);

  // ?ㅽ겕由곗꺑 鍮꾧탳
  await expect(page).toHaveScreenshot('test-detail-page.png', { maxDiffPixels: 100 });
}); 
