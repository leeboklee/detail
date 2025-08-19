import { test, expect } from '@playwright/test';

test.describe('?ㅻ쪟 媛먯? ?뚯뒪??, () => {
  test('釉뚮씪?곗? 肄섏넄 ?ㅻ쪟 媛먯?', async ({ page }) => {
    const errors = [];
    
    // 肄섏넄 ?ㅻ쪟 ?섏쭛
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console_error',
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // ?섏씠吏 ?ㅻ쪟 ?섏쭛
    page.on('pageerror', error => {
      errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // ?ㅽ듃?뚰겕 ?ㅻ쪟 ?섏쭛
    page.on('response', response => {
      if (response.status() >= 400) {
        errors.push({
          type: 'network_error',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // ?섏씠吏 濡쒕뱶
    await page.goto(`http://localhost:${process.env.PORT || 3900}/admin`);
    
    // ?좎떆 ?湲고빐???ㅻ쪟 ?섏쭛
    await page.waitForTimeout(5000);

    // ?ㅻ쪟媛 ?덉쑝硫??곸꽭 ?뺣낫 異쒕젰
    if (errors.length > 0) {
      console.log('?슚 媛먯????ㅻ쪟??');
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type}:`);
        console.log('   硫붿떆吏:', error.message || error.text);
        console.log('   URL:', error.url || error.location?.url);
        console.log('   ?쒓컙:', error.timestamp);
        if (error.stack) {
          console.log('   ?ㅽ깮:', error.stack);
        }
      });
    }

    // ?ㅻ쪟媛 ?놁쑝硫??깃났
    expect(errors.length).toBe(0);
  });

  test('admin ?섏씠吏 湲곕뒫蹂??ㅻ쪟 媛먯?', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console_error',
          text: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    page.on('pageerror', error => {
      errors.push({
        type: 'page_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    // admin ?섏씠吏 濡쒕뱶
    await page.goto(`http://localhost:${process.env.PORT || 3900}/admin`);
    await page.waitForLoadState('networkidle');

    // 媛????대┃?섎㈃???ㅻ쪟 媛먯?
    const tabs = ['?명뀛 ?뺣낫', '媛앹떎 ?뺣낫', '?쒖꽕 ?뺣낫', '泥댄겕???꾩썐', '?⑦궎吏', '?붽툑??, '痍⑥냼洹쒖젙', '?덉빟?덈궡', '怨듭??ы빆'];
    
    for (const tabName of tabs) {
      try {
        await page.click(`text=${tabName}`);
        await page.waitForTimeout(1000);
        
        // 移대뱶 ?대┃ ?쒕룄
        const card = page.locator('.card').first();
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(1000);
          
          // 紐⑤떖???대졇?붿? ?뺤씤
          const modal = page.locator('[role="dialog"]');
          if (await modal.isVisible()) {
            await modal.locator('button:has-text("痍⑥냼")').click();
          }
        }
      } catch (error) {
        errors.push({
          type: 'interaction_error',
          tab: tabName,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // ?ㅻ쪟 由ы룷???앹꽦
    if (errors.length > 0) {
      console.log('\n?슚 Admin ?섏씠吏 ?ㅻ쪟 由ы룷??');
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type}:`);
        console.log('   ??', error.tab || 'N/A');
        console.log('   硫붿떆吏:', error.message || error.text);
        console.log('   ?쒓컙:', error.timestamp);
      });
    }

    expect(errors.length).toBe(0);
  });
}); 
