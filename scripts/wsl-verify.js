/*
  간단 검증: Playwright로 페이지 열기→상태/렌더 확인→닫기
  사용: node scripts/wsl-verify.js [path]
*/

const { chromium } = require('playwright');

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3900';
  const path = process.argv[2] || '/';
  const url = new URL(path, baseUrl).toString();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  if (!response || !response.ok()) {
    await browser.close();
    throw new Error(`Page not OK: ${url} status=${response && response.status()}`);
  }

  // 간단 렌더 확인(바디 존재)
  await page.waitForSelector('body', { timeout: 10000 });

  // 스크린샷 저장(디버깅 용도)
  await page.screenshot({ path: `test-results/verify${path === '/' ? '' : path.replace(/\//g, '_')}.png`, fullPage: true });

  await browser.close();
  console.log(`OK ${url}`);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});


