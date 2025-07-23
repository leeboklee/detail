const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost: {process.env.PORT || 34343}');
  console.log('Page loaded. You can now inspect the page.');
  console.log('Close the browser to end the script.');
  // Keep the browser open until it's manually closed.
  page.on('close', () => browser.close());
})(); 
