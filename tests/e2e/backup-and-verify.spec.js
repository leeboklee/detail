// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Performance and Verification', () => {
  test('should load the main page and verify content', async ({ page }) => {
    // Navigate to the application and measure load time
    const startTime = Date.now();
    await page.goto('http://localhost:3900');

    // Wait for hydration to complete
    await page.waitForFunction(() => {
      return window.document.body.classList.contains('enable-motion') || 
             document.querySelector('[data-hydrated="true"]') !== null;
    }, { timeout: 30000 });

    // Wait for the page to be fully loaded and visible
    await page.waitForLoadState('networkidle', { timeout: 30000 });

    // Check for the presence of a specific element, like an h1, to confirm content has loaded.
    await expect(page.getByRole('heading', { name: '?명뀛 ?곸꽭?섏씠吏 愿由ъ옄' })).toBeVisible({ timeout: 30000 });

    const loadTime = Date.now() - startTime;
    console.log(`Page load time: ${loadTime}ms`);
    
    // More realistic performance expectation
    expect(loadTime).toBeLessThan(30000);

    // Visually compare the page against the baseline screenshot.
    await expect(page).toHaveScreenshot('backup-verification.png', { fullPage: true });
  });
}); 

