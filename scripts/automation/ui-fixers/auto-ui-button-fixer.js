const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto('http://localhost: {process.env.PORT || 3900}/');
    await page.waitForLoadState('networkidle');

    // 모든 버튼/액션 요소 탐색
    const buttons = await page.$$('button, [role="button"], .btn');
    let fixedCount = 0;

    for (const btn of buttons) {
      const box = await btn.boundingBox();
      if (!box) continue;
      // 최소 크기 기준(44x44px)
      if (box.width < 44 || box.height < 44) {
        // 자동 CSS 패치: min-width/min-height 적용
        await page.evaluate(el => {
          el.style.minWidth = '44px';
          el.style.minHeight = '44px';
          el.style.padding = '8px 16px';
        }, btn);
        fixedCount++;
      }
      // 오버플로우/겹침 등 추가 검사 필요시 여기에 추가
    }

    // 오버플로우/잘림 감지 및 자동 수정(예시)
    const overflowEls = await page.$$('[style*="overflow"], [class*="overflow"]');
    for (const el of overflowEls) {
      const overflow = await el.evaluate(node => getComputedStyle(node).overflow);
      if (overflow === 'auto' || overflow === 'scroll' || overflow === 'visible') {
        await el.evaluate(node => node.style.overflow = 'hidden');
        fixedCount++;
      }
    }

    // 결과 요약(콘솔에만)
    if (fixedCount > 0) {
      console.log(`✅ ${fixedCount}개 버튼/요소 디자인 자동 수정 완료`);
    } else {
      console.log('✅ 모든 버튼/요소 디자인 정상 - 수정 불필요');
    }
  } catch (err) {
    console.error('❌ 자동 디자인 검사/수정 중 에러 발생:', err);
  } finally {
    if (browser) await browser.close();
  }
})(); 