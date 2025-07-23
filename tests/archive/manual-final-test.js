const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    console.log('테스트를 시작합니다. Headed 모드로 브라우저를 실행합니다...');
    browser = await chromium.launch({ headless: false }); // 시각적 확인을 위해 headed 모드로 실행
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('http://localhost:3000 으로 이동합니다...');
    await page.goto('http://localhost:3000', { timeout: 60000 });

    page.on('console', msg => {
      if (msg.text().includes('fast-refresh')) return;
      console.log(`[브라우저 콘솔] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    console.log('"호텔 정보" 섹션 카드를 클릭합니다...');
    await page.locator('[data-testid="section-card-hotel"]').click({ timeout: 15000 });

    console.log('모달창이 나타나는 것을 기다립니다...');
    const modal = page.locator('div[role="dialog"]');
    await modal.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ 모달창이 성공적으로 나타났습니다.');

    console.log('모달창의 양식을 수정합니다...');
    await modal.locator('input[name="name"]').fill('수정된 호텔 이름');
    await modal.locator('input[name="address"]').fill('수정된 호텔 주소');

    console.log('"적용하고 닫기" 버튼을 클릭합니다...');
    await modal.locator('button:has-text("적용하고 닫기")').click();
    await modal.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('✅ 모달창이 성공적으로 닫혔습니다.');

    console.log('"전체 저장" 버튼을 클릭하고 API 응답을 기다립니다...');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/hotels/save-all') && res.status() === 200, { timeout: 10000 }),
      page.locator('button:has-text("전체 저장")').click(),
    ]);

    const responseBody = await response.json();
    if (responseBody.message && responseBody.message.includes('성공적으로 저장되었습니다')) {
        console.log('✅ API 응답: 저장 성공 메시지를 확인했습니다.');
    } else {
        throw new Error(`API 응답에서 성공 메시지를 찾을 수 없습니다. 받은 메시지: ${JSON.stringify(responseBody)}`);
    }

    console.log('UI에서 최종 성공 메시지가 보이는지 확인합니다...');
    const successMessage = page.locator('div:has-text("성공적으로 저장되었습니다")');
    await successMessage.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅✅✅ 테스트 통과: 모든 과정이 성공적으로 완료되었습니다.');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
  } finally {
    if (browser) {
      console.log('테스트를 종료하고 브라우저를 닫습니다.');
      await browser.close();
    }
  }
})(); 