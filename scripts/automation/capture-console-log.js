const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const consoleLogs = [];

  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
    });
  });

  try {
    console.log('Navigating to http://localhost: {process.env.PORT || 34343} ...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'domcontentloaded' });
    console.log('Navigation successful.');

    // Give some time for async operations to complete

    console.log('\n--- Captured Console Logs ---');
    if (consoleLogs.length === 0) {
      console.log('No console logs captured.');
    } else {
      consoleLogs.forEach(log => {
        console.log(`[${log.type.toUpperCase()}] ${log.text}`);
      });
    }
    console.log('---------------------------\n');

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await browser.close();
  }
})(); 