const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage']
  });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  const port = process.env.PORT || 3900;
  const url = `http://127.0.0.1:${port}`;
  console.log(`Opening ${url}`);

  try {
    page.on('console', m => console.log(`[console.${m.type()}] ${m.text()}`));
    page.on('pageerror', e => console.error(`[pageerror] ${e.message}`));
    page.on('response', r => console.log(`[resp] ${r.status()} ${r.url()}`));

    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});

    const title = await page.title();
    console.log(`Title: ${title}`);

    await page.screenshot({ path: path.join(screenshotDir, 'full-page.png'), fullPage: true });

    const bodyText = await page.textContent('body');
    fs.writeFileSync(path.join(screenshotDir, 'body.txt'), (bodyText || '').slice(0, 2000));

    const report = await page.evaluate(() => ({
      inputs: document.querySelectorAll('input, textarea, select').length,
      buttons: document.querySelectorAll('button,[role="button"]').length,
      sections: document.querySelectorAll('section,.section').length
    }));

    fs.writeFileSync(
      path.join(screenshotDir, 'preview-report.json'),
      JSON.stringify({ url, title, report, timestamp: new Date().toISOString() }, null, 2)
    );

    console.log('Capture complete');
  } catch (error) {
    console.error(`Capture error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
