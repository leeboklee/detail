const { test, expect } = require('@playwright/test');

// Visual Regression Test Suite
test.describe('Visual Regression Tests', () => {
  
  // 酉고룷??怨좎젙 (?쇨????ㅽ겕由곗꺑???꾪빐)
  test.use({ 
    viewport: { width: 1280, height: 720 },
    // ?좊땲硫붿씠??鍮꾪솢?깊솕 (?쇨???寃곌낵瑜??꾪빐)
    reducedMotion: 'reduce'
  });

  test('?꾩껜 ?섏씠吏 baseline ?앹꽦', async ({ page }) => {
    await page.goto(`http://localhost:${process.env.PORT || 3900}`);
    
    // ?섏씠吏 濡쒕뵫 ?꾨즺 ?湲?    await page.waitForLoadState('networkidle');
    
    // ?꾩껜 ?섏씠吏 ?ㅽ겕由곗꺑 鍮꾧탳
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      // ?쎄컙??李⑥씠???덉슜 (?쎌? ?덉슜 ?ㅼ감)
      threshold: 0.2,
      // 理쒕? 李⑥씠 ?쎌? ??      maxDiffPixels: 1000
    });
  });

  test('媛??뱀뀡蹂?Visual Test', async ({ page }) => {
    await page.goto(`http://localhost:${process.env.PORT || 3900}`);
    await page.waitForLoadState('networkidle');
    
    // ?ㅻ뜑 ?뱀뀡 ?뚯뒪??    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header-section.png');
    
    // 硫붿씤 洹몃━???뱀뀡 ?뚯뒪??    const mainGrid = page.locator('main');
    await expect(mainGrid).toHaveScreenshot('main-grid.png');
    
    // 媛?移대뱶 ?뱀뀡蹂??뚯뒪??    const cards = await page.locator('[data-testid^="section-card-"]').all();
    for (let i = 0; i < cards.length; i++) {
      await expect(cards[i]).toHaveScreenshot(`card-${i}.png`);
    }
  });

  test('紐⑤떖 ?곹깭蹂?Visual Test', async ({ page }) => {
    await page.goto(`http://localhost:${process.env.PORT || 3900}`);
    await page.waitForLoadState('networkidle');
    
    // ?명뀛 ?뺣낫 紐⑤떖 ?뚯뒪??    await page.locator('[data-testid="section-card-hotel"]').click();
    await page.waitForSelector('[role="dialog"]');
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('hotel-modal.png');
    
    // 紐⑤떖 ?リ린
    await page.locator('button:has-text("痍⑥냼")').click();
    await page.waitForSelector('[role="dialog"]', { state: 'detached' });
    
    // ?ㅻⅨ ?뱀뀡?ㅻ룄 ?뚯뒪??    const sectionsToTest = ['rooms', 'facilities', 'packages'];
    for (const section of sectionsToTest) {
      await page.locator(`[data-testid="section-card-${section}"]`).click();
      await page.waitForSelector('[role="dialog"]');
      await expect(page.locator('[role="dialog"]')).toHaveScreenshot(`${section}-modal.png`);
      await page.locator('button:has-text("痍⑥냼")').click();
      await page.waitForSelector('[role="dialog"]', { state: 'detached' });
    }
  });

  test('諛섏쓳???붿옄???뚯뒪??, async ({ page }) => {
    // 紐⑤컮??酉고룷??    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`http://localhost:${process.env.PORT || 3900}`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('mobile-view.png');
    
    // ?쒕툝由?酉고룷??    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('tablet-view.png');
    
    // ?곗뒪?ы깙 酉고룷??    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('desktop-view.png');
  });

  test('?먮윭 ?곹깭 Visual Test', async ({ page }) => {
    // ?ㅽ듃?뚰겕 李⑤떒?섏뿬 ?먮윭 ?곹깭 留뚮뱾湲?    await page.route('**/api/hotels**', route => route.abort());
    
    await page.goto(`http://localhost:${process.env.PORT || 3900}`);
    await page.waitForTimeout(3000); // ?먮윭 ?곹깭 濡쒕뵫 ?湲?    
    await expect(page).toHaveScreenshot('error-state.png');
  });
});

// ?뱀젙 而댄룷?뚰듃留??뚯뒪?명븯???⑥닔
test.describe('Component Visual Tests', () => {
  
  test('移대뱶 而댄룷?뚰듃 ?곹깭蹂??뚯뒪??, async ({ page }) => {
    await page.goto(`http://localhost:${process.env.PORT || 3900}`);
    await page.waitForLoadState('networkidle');
    
    const hotelCard = page.locator('[data-testid="section-card-hotel"]');
    
    // 湲곕낯 ?곹깭
    await expect(hotelCard).toHaveScreenshot('card-default.png');
    
    // ?몃쾭 ?곹깭 (CSS :hover ?쒕??덉씠??
    await hotelCard.hover();
    await expect(hotelCard).toHaveScreenshot('card-hover.png');
  });
}); 
