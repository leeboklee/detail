import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:3900';

// Headed 모드로 실행: npx playwright test tests/e2e/rooms-headed.spec.js --headed

test.describe('객실 미리보기 하드코딩 제거 확인', () => {
  test('미리보기 안내문 표시(하드코딩 객실 없음)', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });

    // 페이지 로드 확인(상단 타이틀 중 하나 확인)
    await expect(page.getByRole('heading', { name: /호텔 정보 관리/ })).toBeVisible({ timeout: 30000 });

    // 미리보기 패널 안내문이 보여야 함
    await expect(page.getByText('객실 정보를 입력하면 여기에 미리보기가 표시됩니다.', { exact: false })).toBeVisible({ timeout: 20000 });
  });
});
