import { test, expect } from '@playwright/test';

test.describe('Section Interaction and API Test (Fixed)', () => {
  test('should edit hotel info and verify save', async ({ page }) => {
    // Capture all browser console messages
    page.on('console', msg => {
      if (msg.text().includes('fast-refresh')) return;
      console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    await page.goto('/');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.waitForLoadState('domcontentloaded');

    // 1. Wait for page to be ready
    await expect(page.locator('h1:has-text("호텔 상세페이지 관리자")')).toBeVisible({ timeout: 15000 });
    console.log('Admin page header is visible.');

    // 2. Click "호텔 정보" tab to ensure it's active
    console.log('Clicking on "호텔 정보" section tab...');
    const hotelInfoTab = page.locator('button:has-text("🏠호텔 정보")');
    await hotelInfoTab.click();

    // 3. Verify the form fields are directly visible (NO MODAL)
    console.log('Verifying form fields are visible on the page...');
    const nameInput = page.locator('input[name="name"]');
    const addressInput = page.locator('input[name="address"]');
    
    await expect(nameInput).toBeVisible({ timeout: 10000 });
    await expect(addressInput).toBeVisible({ timeout: 30000 });
    console.log('Form fields are visible.');

    // 4. Fill the form
    console.log('Filling form...');
    await nameInput.fill('수정된 호텔 이름');
    await addressInput.fill('수정된 호텔 주소');

    // 5. Click "전체 저장" and wait for the API response
    console.log('Clicking "전체 저장" button and waiting for API response...');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/hotels/save-all') && res.status() === 200),
      page.locator('button:has-text("💾 전체 저장")').click(),
    ]);

    const responseBody = await response.json();
    expect(responseBody.message).toContain('성공적으로 저장되었습니다');

    // 6. Verify the success message on the UI
    console.log('Verifying success message on UI...');
    const successMessage = page.locator('div.fixed.top-5.right-5.bg-green-500');
    await expect(successMessage).toBeVisible({ timeout: 10000 });

    console.log('✅ Section interaction test passed.');
  });
}); 

