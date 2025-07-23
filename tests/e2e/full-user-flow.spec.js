const { test, expect } = require('@playwright/test');

test.describe('전체 사용자 흐름 E2E 테스트', () => {
  const HOTEL_NAME = `테스트 호텔 ${Date.now()}`;
  const HOTEL_DESCRIPTION = '이 호텔은 E2E 테스트를 위해 자동 생성되었습니다.';

  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/');
      // 이제 페이지 로드의 기준으로 '호텔 상세페이지 관리자' h1 태그를 기다리도록 수정
      await page.waitForSelector('h1:has-text("호텔 상세페이지 관리자")', { timeout: 30000 });
    } catch (error) {
      console.error("페이지 로드 또는 기본 요소 기다리는 중 오류 발생:", error);
      throw error;
    }
  });

  test('1. 호텔 정보 입력 및 상태 유지 확인', async ({ page }) => {
    // HotelInfo 컴포넌트가 렌더링되었는지 확인 (label을 기준으로)
    await expect(page.locator('label:has-text("호텔 이름")')).toBeVisible({ timeout: 15000 });

    // 호텔 이름 입력 (name 속성을 기준으로 수정)
    await page.locator('input[name="hotelName"]').fill(HOTEL_NAME);

    // 호텔 설명 입력 (name 속성을 기준으로 수정)
    await page.locator('textarea[name="description"]').fill(HOTEL_DESCRIPTION);

    // 저장로직(throttle 2초)을 기다리기 위한 임시 시간 추가
    await page.waitForTimeout(2500);

    // 다른 탭(객실 정보)으로 이동
    await page.getByRole('button', { name: '객실 정보' }).click();

    // '객실 정보' 항목의 '새 객실 추가' 버튼이 보이는지 확인
    await expect(page.locator('h2:has-text("객실 정보")')).toBeVisible({ timeout: 30000 });
    const addRoomButton = page.getByRole('button', { name: /새 객실 추가/ });
    await expect(addRoomButton).toBeVisible({ timeout: 30000 });

    // 새 객실 추가
    await addRoomButton.click();

    // 객실이 추가되었는지 확인 (첫번째 객실의 '객실 유형' 레이블 확인)
    await expect(page.locator('label[for="roomType-0"]')).toBeVisible({ timeout: 30000 });

    // 다시 호텔 정보 탭으로 이동
    await page.getByRole('button', { name: '호텔 정보' }).click();
    // HotelInfo 컴포넌트가 다시 렌더링되었는지 확인
    await expect(page.locator('label:has-text("호텔 이름")')).toBeVisible({ timeout: 30000 });

    // 입력했던 데이터가 유지되는지 확인 (name 속성을 기준으로 수정)
    await expect(page.locator('input[name="hotelName"]')).toHaveValue(HOTEL_NAME);
    await expect(page.locator('textarea[name="description"]')).toHaveValue(HOTEL_DESCRIPTION);
  });

  test('2. 새 호텔 정보 저장 및 확인', async ({ page }) => {
    // 호텔 정보 입력 (name 속성을 기준으로 수정)
    await page.locator('input[name="hotelName"]').fill(HOTEL_NAME);
    await page.locator('textarea[name="description"]').fill(HOTEL_DESCRIPTION);
    await page.locator('input[name="address"]').fill('테스트 주소');
    await page.locator('input[name="phone"]').fill('010-1234-5678');

    // 저장버튼이 HotelInfo 컴포넌트 내에 있으므로 해당 컴포넌트가 렌더링된 후 버튼 클릭
    const saveButton = page.locator('button:has-text("저장"):not([disabled])');
    await expect(saveButton).toBeVisible({ timeout: 30000 });
    await saveButton.click();

    // 저장 API 응답 대기
    await page.waitForResponse(response =>
      response.url().includes('/api/hotels') && response.request().method() === 'POST',
      { timeout: 15000 }
    );

    // 템플릿 목록 탭으로 이동
    await page.getByRole('button', { name: '템플릿 목록' }).click();

    // 목록이 로드될 때까지 대기
    await expect(page.locator('h2:has-text("템플릿 목록")')).toBeVisible({ timeout: 30000 });

    // 새로 생성된 호텔이 목록에 있는지 확인
    await expect(page.locator(`text=${HOTEL_NAME}`).first()).toBeVisible({ timeout: 30000 });
  });
}); 

