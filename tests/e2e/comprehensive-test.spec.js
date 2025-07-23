import { test, expect } from '@playwright/test';

test.describe('Comprehensive End-to-End Test (Self-Contained)', () => {
  let page;
  let browserErrors = [];
  const uniqueHotelName = `Test Hotel ${Date.now()}`;

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    browserErrors = [];
    page.on('pageerror', (error) => {
      console.error(`Browser error: ${error}`);
      browserErrors.push(error.message);
    });
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // 특정 라이브러리 경고 등 무시하고 싶은 에러가 있다면 여기서 필터링
        if (msg.text().includes('some-ignorable-error')) return;
        console.error(`Browser console error: ${msg.text()}`);
        browserErrors.push(msg.text());
      } else {
        // 일반 로그는 선택적으로 출력
        if (msg.text().includes('Download the React DevTools')) return;
        console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
      }
    });
  });
  
  test('should create, save, load, and verify a hotel template without errors', async () => {
    // 1. 초기 페이지 로드
    const initialResponse = await page.goto('/');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
    await page.waitForLoadState('domcontentloaded');
    expect(initialResponse.status()).toBe(200);
    await expect(page.locator('h1:has-text("호텔 상세페이지 관리자")')).toBeVisible({ timeout: 30000 });

    // 2. '호텔 정보' 탭으로 이동 (기본 탭이지만 명시적으로 확인)
    const hotelInfoTab = page.locator('button[role="tab"]:has-text("호텔 정보")');
    await hotelInfoTab.click();
    
    // 3. 고유한 호텔 이름으로 새 템플릿 정보 입력
    console.log(`Creating new template with name: ${uniqueHotelName}`);
    await page.locator('input[placeholder="호텔/업체 이름을 입력하세요"]').fill(uniqueHotelName);
    await page.locator('input[placeholder="호텔의 주소를 입력하세요"]').fill('123 Test St, Test City');

    // 4. '전체 저장' 눌러 템플릿 생성
    console.log('Saving new template...');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/hotels/save-all') && res.status() === 200),
      page.locator('button:has-text("💾 전체 저장")').click(),
    ]);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('템플릿이 성공적으로 생성되었습니다');
    console.log('Save successful. New template created.');

    // 5. '템플릿 목록' 탭으로 이동
    console.log('Navigating to template list...');
    const dbManagerTab = page.locator('button:has-text("🗂️ 템플릿 목록")');
    await dbManagerTab.click();

    // 6. 방금 생성한 템플릿이 목록에 보일 때까지 대기
    console.log(`Searching for template: "${uniqueHotelName}"`);
    const newTemplateRow = page.locator('.flex.items-center.justify-between', { hasText: uniqueHotelName });
    await expect(newTemplateRow).toBeVisible({ timeout: 15000 });
    console.log('New template found in the list.');

    // 7. 해당 템플릿의 '불러오기' 버튼 클릭 (Lazy-load test)
    console.log('Clicking "Load" button for the new template...');
    await newTemplateRow.locator('button:has-text("불러오기")').click();

    // 8. 데이터가 로드되었는지 검증
    // 로드 후 '호텔 정보' 탭이 다시 활성화되고 이름이 채워져 있어야 함
    await expect(hotelInfoTab).toHaveClass(/bg-blue-500/); // 활성 탭인지 확인
    
    console.log('Verifying data was loaded correctly...');
    const hotelNameInput = page.locator('input[placeholder="호텔/업체 이름을 입력하세요"]');
    await expect(hotelNameInput).toHaveValue(uniqueHotelName, { timeout: 10000 });
    
    console.log('✅ Comprehensive test passed: Create, Save, Load, and Verify flow is working.');

    // 최종적으로 브라우저 에러가 없었는지 확인
    expect(browserErrors).toHaveLength(0, `Browser console should have no errors, but found: \n${browserErrors.join('\n')}`);
  });
}); 

