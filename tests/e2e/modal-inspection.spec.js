import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Modal UI Inspection on Button Clicks', () => {
  const screenshotsDir = 'screenshots/modal-inspection';

  test.beforeAll(async () => {
    // Ensure screenshot directory exists and is empty
    if (fs.existsSync(screenshotsDir)) {
      fs.rmSync(screenshotsDir, { recursive: true, force: true });
    }
    fs.mkdirSync(screenshotsDir, { recursive: true });
  });

  test('should find and test modals triggered by buttons', async ({ browser }) => {
    const context = await browser.newContext();
        
    // Set up localStorage before the page loads
    await context.addInitScript(() => {
        const dummyHotelData = {
            id: 'test-hotel-123',
            name: 'The Grand Test Hotel',
            address: '123 Test Street, Automation City',
            description: 'A fine establishment for all your testing needs.',
            checkin_time: '15:00',
            checkout_time: '11:00',
            image_url: 'https://example.com/image.jpg',
        };
        window.localStorage.setItem('hotelData', JSON.stringify(dummyHotelData));
        window.localStorage.setItem('hotelInfo', JSON.stringify(dummyHotelData));
        window.localStorage.setItem('lastWorkingHotelData', JSON.stringify(dummyHotelData));
    });
    
    const page = await context.newPage();

    // Listen for all console events and log them
    page.on('console', msg => {
      console.log(`Browser Console [${msg.type()}]: ${msg.text()}`);
    });

    await page.route('**/*', (route) => {
      console.log(`Requesting: ${route.request().url()}`);
      route.continue();
    });

    await page.goto('/');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for hydration to complete
    await page.waitForFunction(() => {
      return window.document.body.classList.contains('enable-motion') || 
             document.querySelector('[data-hydrated="true"]') !== null;
    }, { timeout: 30000 });
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    
    // 2. Now wait for the specific main header
    await expect(page.locator('h1:has-text("호텔 상세페이지 관리자")')).toBeVisible({ timeout: 30000 });
    console.log('Page loaded. Starting button scan.');

    await page.waitForTimeout(5000); // Increased wait time to 5s

    // Debugging step: take screenshot and save HTML
    await page.screenshot({ path: 'debug-fullpage.png', fullPage: true });
    fs.writeFileSync('debug-page-content.html', await page.content());
    console.log('Saved debug screenshot and HTML content.');

    const buttons = page.locator('button, [role="button"], [role="tab"]');
    const count = await buttons.count();
    console.log(`Found ${count} interactive elements to test.`);

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      
      if (!await button.isVisible() || !await button.isEnabled()) {
        continue;
      }

      const buttonText = (await button.textContent() || await button.getAttribute('aria-label') || `button-${i}`).trim();
      const sanitizedButtonText = buttonText.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
      
      console.log(`\n[${i + 1}/${count}] Testing button: "${buttonText}"`);

      try {
        await button.scrollIntoViewIfNeeded({ timeout: 5000 });
        await button.click({ force: true, timeout: 5000 });
      } catch (e) {
        console.error(`Error clicking button "${buttonText}": ${e.message}`);
        continue; // Continue to next button
      }

      // Wait for a potential modal
      try {
        const modal = page.locator('[role="dialog"]').last();
        await modal.waitFor({ state: 'visible', timeout: 2000 });
        
        console.log(`  -> Modal appeared for button: "${buttonText}"`);
        
        // UI Inspection
        await expect(modal).toBeVisible({ timeout: 30000 });
        const screenshotPath = `${screenshotsDir}/modal_${i}_${sanitizedButtonText}.png`;
        await modal.screenshot({ path: screenshotPath });
        console.log(`  -> Screenshot saved: ${screenshotPath}`);

        // Try to close the modal
        const closeButton = modal.locator('button:has-text("닫기"), button:has-text("Close"), button:has-text("Cancel"), [aria-label="close"], [aria-label="Close"]');
        if (await closeButton.count() > 0) {
            await closeButton.first().click();
            console.log('  -> Closed modal with a button.');
        } else {
            await page.keyboard.press('Escape');
            console.log('  -> Closed modal with Escape key.');
        }
        await expect(modal).not.toBeVisible({ timeout: 5000 });
        console.log('  -> Modal closed successfully.');

      } catch (error) {
        if (error instanceof test.errors.TimeoutError) {
          console.log(`  -> No modal detected for button: "${buttonText}"`);
        } else {
          console.error(`  -> An error occurred for button "${buttonText}": ${error.message}`);
        }
        // If navigation happened, we need to go back.
        if (page.url() !== 'http://localhost: {process.env.PORT || 34343}/') {
            console.log('  -> Navigation occurred. Going back.');
            await page.goto('/');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await page.waitForLoadState('networkidle', { timeout: 30000 });
            await expect(page.locator('h1:has-text("호텔 상세페이지 관리자")')).toBeVisible({ timeout: 30000 });
        }
      }
      
      await page.waitForTimeout(500); // Small delay before next button
    }
    console.log('\nAll buttons tested.');
  });
}); 

