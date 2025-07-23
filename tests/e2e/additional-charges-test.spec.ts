import { test, expect } from '@playwright/test';

test.describe('Additional Charges Field Test', () => {
  test.beforeEach(async ({ page }) => {
    // page load
    await page.goto('/');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');

    // click charges button
    const chargesButton = page.locator('button:has-text("추가 요금")');
    await chargesButton.click();
    await page.waitForTimeout(1000);
  });

  test('Additional charges input test - headless', async ({ page }) => {
    console.log('--- Start additional charges test in headless mode');

    // Check if the surcharge info card is visible
    await expect(page.locator('text=추가 요금 정보')).toBeVisible({ timeout: 30000 });

    // Weekend surcharge input
    const weekendSurchargeInput = page.locator('input[placeholder*="주말 증가"]').first();
    await expect(weekendSurchargeInput).toBeVisible({ timeout: 30000 });

    console.log('--- Attempting to fill weekend surcharge');
    await weekendSurchargeInput.click();
    await weekendSurchargeInput.fill('Test Weekend Surcharge');

    // Peak season/holiday surcharge input
    const holidaySurchargeInput = page.locator('input[placeholder*="공휴일 증가"]').first();
    await expect(holidaySurchargeInput).toBeVisible({ timeout: 30000 });

    console.log('--- Attempting to fill holiday surcharge');
    await holidaySurchargeInput.click();
    await holidaySurchargeInput.fill('Test Holiday Surcharge');

    // Seasonal rates textarea
    const seasonalRatesTextarea = page.locator('textarea[placeholder*="계절 요금"]').first();
    await expect(seasonalRatesTextarea).toBeVisible({ timeout: 30000 });

    console.log('--- Attempting to fill seasonal rates');
    await seasonalRatesTextarea.click();
    await seasonalRatesTextarea.fill('Test Seasonal Rates');

    // Wait for state to update
    await page.waitForTimeout(2000);

    // Check input values
    const weekendValue = await weekendSurchargeInput.inputValue();
    const holidayValue = await holidaySurchargeInput.inputValue();
    const seasonalValue = await seasonalRatesTextarea.inputValue();

    console.log('--- Input values:');
    console.log('  Weekend Surcharge:', weekendValue);
    console.log('  Holiday Surcharge:', holidayValue);
    console.log('  Seasonal Rates:', seasonalValue);

    // Screenshot
    await page.screenshot({
      path: 'test-results/additional-charges-headless.png',
      fullPage: true
    });

    // Assert that the values were set correctly
    expect(weekendValue).toBe('Test Weekend Surcharge');
    expect(holidayValue).toBe('Test Holiday Surcharge');
    expect(seasonalValue).toBe('Test Seasonal Rates');
  });
}); 


