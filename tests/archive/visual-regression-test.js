const { test, expect } = require('@playwright/test');

// Visual Regression Test Suite
test.describe('Visual Regression Tests', () => {
  
  // 뷰포트 고정 (일관된 스크린샷을 위해)
  test.use({ 
    viewport: { width: 1280, height: 720 },
    // 애니메이션 비활성화 (일관된 결과를 위해)
    reducedMotion: 'reduce'
  });

  test('전체 페이지 baseline 생성', async ({ page }) => {
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    
    // 페이지 로딩 완료 대기
    await page.waitForLoadState('networkidle');
    
    // 전체 페이지 스크린샷 비교
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      // 약간의 차이는 허용 (픽셀 허용 오차)
      threshold: 0.2,
      // 최대 차이 픽셀 수
      maxDiffPixels: 1000
    });
  });

  test('각 섹션별 Visual Test', async ({ page }) => {
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    await page.waitForLoadState('networkidle');
    
    // 헤더 섹션 테스트
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header-section.png');
    
    // 메인 그리드 섹션 테스트
    const mainGrid = page.locator('main');
    await expect(mainGrid).toHaveScreenshot('main-grid.png');
    
    // 각 카드 섹션별 테스트
    const cards = await page.locator('[data-testid^="section-card-"]').all();
    for (let i = 0; i < cards.length; i++) {
      await expect(cards[i]).toHaveScreenshot(`card-${i}.png`);
    }
  });

  test('모달 상태별 Visual Test', async ({ page }) => {
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    await page.waitForLoadState('networkidle');
    
    // 호텔 정보 모달 테스트
    await page.locator('[data-testid="section-card-hotel"]').click();
    await page.waitForSelector('[role="dialog"]');
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('hotel-modal.png');
    
    // 모달 닫기
    await page.locator('button:has-text("취소")').click();
    await page.waitForSelector('[role="dialog"]', { state: 'detached' });
    
    // 다른 섹션들도 테스트
    const sectionsToTest = ['rooms', 'facilities', 'packages'];
    for (const section of sectionsToTest) {
      await page.locator(`[data-testid="section-card-${section}"]`).click();
      await page.waitForSelector('[role="dialog"]');
      await expect(page.locator('[role="dialog"]')).toHaveScreenshot(`${section}-modal.png`);
      await page.locator('button:has-text("취소")').click();
      await page.waitForSelector('[role="dialog"]', { state: 'detached' });
    }
  });

  test('반응형 디자인 테스트', async ({ page }) => {
    // 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('mobile-view.png');
    
    // 태블릿 뷰포트
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('tablet-view.png');
    
    // 데스크탑 뷰포트
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('desktop-view.png');
  });

  test('에러 상태 Visual Test', async ({ page }) => {
    // 네트워크 차단하여 에러 상태 만들기
    await page.route('**/api/hotels**', route => route.abort());
    
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    await page.waitForTimeout(3000); // 에러 상태 로딩 대기
    
    await expect(page).toHaveScreenshot('error-state.png');
  });
});

// 특정 컴포넌트만 테스트하는 함수
test.describe('Component Visual Tests', () => {
  
  test('카드 컴포넌트 상태별 테스트', async ({ page }) => {
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    await page.waitForLoadState('networkidle');
    
    const hotelCard = page.locator('[data-testid="section-card-hotel"]');
    
    // 기본 상태
    await expect(hotelCard).toHaveScreenshot('card-default.png');
    
    // 호버 상태 (CSS :hover 시뮬레이션)
    await hotelCard.hover();
    await expect(hotelCard).toHaveScreenshot('card-hover.png');
  });
}); 