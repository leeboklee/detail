import { test, expect } from '@playwright/test';

test.describe('UI/UX Debugging', () => {
  test('Capture trace and screenshot of the main page', async ({ page }) => {
    // Navigate to the main page
    await page.goto('http://localhost:3900');

    // Wait for a key element to be visible to ensure the page is loaded
    await expect(page.locator('h1').filter({ hasText: 'Hotel Detail Page Admin' })).toBeVisible({ timeout: 20000 });

    // Wait for any dynamic scripts to finish loading
    await page.waitForTimeout(3000);

    // Test finishes here, the trace file will be generated automatically
  });
}); 
