import { test, expect } from '@playwright/test';

test('硫붿씤 ?섏씠吏 怨듬갚 ?щ? 諛?CSS ?뺤씤', async ({ page }) => {
  // 硫붿씤 ?섏씠吏濡??대룞
  await page.goto('/');
  
  // AppContainer媛 ?꾩쟾??濡쒕뱶???뚭퉴吏 ?湲?
  await page.waitForSelector('[data-hydrated="true"]', { timeout: 30000 });

  // ?꾩옱 ?섏씠吏 ?ㅽ겕由곗꺑 罹≪쿂
  await page.screenshot({ path: 'main-page-check.png', fullPage: true });

  // ?섏씠吏 body媛 鍮꾩뼱?덉? ?딆?吏 ?뺤씤
  const body = page.locator('body');
  const textContent = await body.innerText();
  
  // body???띿뒪?멸? ?덈뒗吏 ?뺤씤
  expect(textContent.trim()).not.toBe('');

  // 二쇱슂 而⑦뀒?대꼫??媛?쒖꽦 ?뺤씤 (CSS 濡쒕뵫 ?뺤씤)
  const mainContainer = page.locator('main').or(page.locator('.container')).first();
  await expect(mainContainer).toBeVisible();
}); 
