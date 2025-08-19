import { test, expect } from '@playwright/test';

test('硫붿씤 ?섏씠吏 ?뚮뜑留?諛??먮윭/?ㅽ겕由곗꺑 ?뺤씤', async ({ page }) => {
  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('http://localhost:3900');
  await page.screenshot({ path: 'test-results/debug-render.png', fullPage: true });

  if (consoleLogs.length > 0) {
    console.log('肄섏넄 濡쒓렇:', consoleLogs);
  }
  if (pageErrors.length > 0) {
    console.log('?섏씠吏 ?먮윭:', pageErrors);
  }

  // ?뚮뜑留??먮윭媛 ?덉쑝硫??뚯뒪???ㅽ뙣 泥섎━
  expect(pageErrors.length).toBe(0);
}); 
