import { test, expect } from '@playwright/test';

test('메인 페이지 렌더링 및 에러/스크린샷 확인', async ({ page }) => {
  const consoleLogs = [];
  const pageErrors = [];

  page.on('console', msg => consoleLogs.push(`[${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('http://localhost:34343');
  await page.screenshot({ path: 'test-results/debug-render.png', fullPage: true });

  if (consoleLogs.length > 0) {
    console.log('콘솔 로그:', consoleLogs);
  }
  if (pageErrors.length > 0) {
    console.log('페이지 에러:', pageErrors);
  }

  // 렌더링 에러가 있으면 테스트 실패 처리
  expect(pageErrors.length).toBe(0);
}); 