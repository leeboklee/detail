import React from 'react';
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
        // ?뱀젙 ?쇱씠釉뚮윭由?寃쎄퀬 ??臾댁떆?섍퀬 ?띠? ?먮윭媛 ?덈떎硫??ш린???꾪꽣留?        if (msg.text().includes('some-ignorable-error')) return;
        console.error(`Browser console error: ${msg.text()}`);
        browserErrors.push(msg.text());
      } else {
        // ?쇰컲 濡쒓렇???좏깮?곸쑝濡?異쒕젰
        if (msg.text().includes('Download the React DevTools')) return;
        console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
      }
    });
  });
  
  test('should create, save, load, and verify a hotel template without errors', async () => {
    // 1. 珥덇린 ?섏씠吏 濡쒕뱶
    const initialResponse = await page.goto('/');
    await new Promise(resolve => setTimeout(resolve, 1000)); // 1珥??湲?    await page.waitForLoadState('domcontentloaded');
    expect(initialResponse.status()).toBe(200);
    await expect(page.locator('h1:has-text("?명뀛 ?곸꽭?섏씠吏 愿由ъ옄")')).toBeVisible({ timeout: 30000 });

    // 2. '?명뀛 ?뺣낫' ??쑝濡??대룞 (湲곕낯 ??씠吏留?紐낆떆?곸쑝濡??뺤씤)
    const hotelInfoTab = page.locator('button[role="tab"]:has-text("?명뀛 ?뺣낫")');
    await hotelInfoTab.click();
    
    // 3. 怨좎쑀???명뀛 ?대쫫?쇰줈 ???쒗뵆由??뺣낫 ?낅젰
    console.log(`Creating new template with name: ${uniqueHotelName}`);
    await page.locator('input[placeholder="?명뀛/?낆껜 ?대쫫???낅젰?섏꽭??]').fill(uniqueHotelName);
    await page.locator('input[placeholder="?명뀛??二쇱냼瑜??낅젰?섏꽭??]').fill('123 Test St, Test City');

    // 4. '?꾩껜 ??? ?뚮윭 ?쒗뵆由??앹꽦
    console.log('Saving new template...');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/hotels/save-all') && res.status() === 200),
      page.locator('button:has-text("?뮶 ?꾩껜 ???)').click(),
    ]);
    const responseBody = await response.json();
    expect(responseBody.message).toBe('?쒗뵆由우씠 ?깃났?곸쑝濡??앹꽦?섏뿀?듬땲??);
    console.log('Save successful. New template created.');

    // 5. '?쒗뵆由?紐⑸줉' ??쑝濡??대룞
    console.log('Navigating to template list...');
    const dbManagerTab = page.locator('button:has-text("?뾺截??쒗뵆由?紐⑸줉")');
    await dbManagerTab.click();

    // 6. 諛⑷툑 ?앹꽦???쒗뵆由우씠 紐⑸줉??蹂댁씪 ?뚭퉴吏 ?湲?    console.log(`Searching for template: "${uniqueHotelName}"`);
    const newTemplateRow = page.locator('.flex.items-center.justify-between', { hasText: uniqueHotelName });
    await expect(newTemplateRow).toBeVisible({ timeout: 15000 });
    console.log('New template found in the list.');

    // 7. ?대떦 ?쒗뵆由우쓽 '遺덈윭?ㅺ린' 踰꾪듉 ?대┃ (Lazy-load test)
    console.log('Clicking "Load" button for the new template...');
    await newTemplateRow.locator('button:has-text("遺덈윭?ㅺ린")').click();

    // 8. ?곗씠?곌? 濡쒕뱶?섏뿀?붿? 寃利?    // 濡쒕뱶 ??'?명뀛 ?뺣낫' ??씠 ?ㅼ떆 ?쒖꽦?붾릺怨??대쫫??梨꾩썙???덉뼱????    await expect(hotelInfoTab).toHaveClass(/bg-blue-500/); // ?쒖꽦 ??씤吏 ?뺤씤
    
    console.log('Verifying data was loaded correctly...');
    const hotelNameInput = page.locator('input[placeholder="?명뀛/?낆껜 ?대쫫???낅젰?섏꽭??]');
    await expect(hotelNameInput).toHaveValue(uniqueHotelName, { timeout: 10000 });
    
    console.log('??Comprehensive test passed: Create, Save, Load, and Verify flow is working.');

    // 理쒖쥌?곸쑝濡?釉뚮씪?곗? ?먮윭媛 ?놁뿀?붿? ?뺤씤
    expect(browserErrors).toHaveLength(0, `Browser console should have no errors, but found: \n${browserErrors.join('\n')}`);
  });
}); 

