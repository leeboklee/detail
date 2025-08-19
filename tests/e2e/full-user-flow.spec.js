import { test, expect } from '@playwright/test';

test.describe('?꾩껜 ?ъ슜???먮쫫 E2E ?뚯뒪??, () => {
  const HOTEL_NAME = `?뚯뒪???명뀛 ${Date.now()}`;
  const HOTEL_DESCRIPTION = '???명뀛? E2E ?뚯뒪?몃? ?꾪빐 ?먮룞 ?앹꽦?섏뿀?듬땲??';

  test.beforeEach(async ({ page }) => {
    try {
      await page.goto('/');
      // ?댁젣 ?섏씠吏 濡쒕뱶??湲곗??쇰줈 '?명뀛 ?곸꽭?섏씠吏 愿由ъ옄' h1 ?쒓렇瑜?湲곕떎由щ룄濡??섏젙
      await page.waitForSelector('h1:has-text("?명뀛 ?곸꽭?섏씠吏 愿由ъ옄")', { timeout: 30000 });
    } catch (error) {
      console.error("?섏씠吏 濡쒕뱶 ?먮뒗 湲곕낯 ?붿냼 湲곕떎由щ뒗 以??ㅻ쪟 諛쒖깮:", error);
      throw error;
    }
  });

  test('1. ?명뀛 ?뺣낫 ?낅젰 諛??곹깭 ?좎? ?뺤씤', async ({ page }) => {
    // HotelInfo 而댄룷?뚰듃媛 ?뚮뜑留곷릺?덈뒗吏 ?뺤씤 (label??湲곗??쇰줈)
    await expect(page.locator('label:has-text("?명뀛 ?대쫫")')).toBeVisible({ timeout: 15000 });

    // ?명뀛 ?대쫫 ?낅젰 (name ?띿꽦??湲곗??쇰줈 ?섏젙)
    await page.locator('input[name="name"]').fill(HOTEL_NAME);

    // ?명뀛 ?ㅻ챸 ?낅젰 (name ?띿꽦??湲곗??쇰줈 ?섏젙)
    await page.locator('textarea[name="description"]').fill(HOTEL_DESCRIPTION);

    // ??λ줈吏?throttle 2珥???湲곕떎由ш린 ?꾪븳 ?꾩떆 ?쒓컙 異붽?
    await page.waitForTimeout(2500);

    // ?ㅻⅨ ??媛앹떎)?쇰줈 ?대룞
    await page.getByRole('button', { name: '媛앹떎' }).click();

    // '媛앹떎' ??ぉ??'??媛앹떎 異붽?' 踰꾪듉??蹂댁씠?붿? ?뺤씤
    await expect(page.locator('h2:has-text("媛앹떎 ?뺣낫")')).toBeVisible({ timeout: 30000 });
    const addRoomButton = page.locator('button:has-text("??媛앹떎 異붽?")');
    await expect(addRoomButton).toBeVisible({ timeout: 30000 });

    // ??媛앹떎 異붽?
    await addRoomButton.click();

    // 媛앹떎??異붽??섏뿀?붿? ?뺤씤 (泥ル쾲吏?媛앹떎??'媛앹떎 ?좏삎' ?덉씠釉??뺤씤)
    await expect(page.locator('label[for="roomType-0"]')).toBeVisible({ timeout: 30000 });

    // ?ㅼ떆 ?명뀛 ?뺣낫 ??쑝濡??대룞
    await page.getByRole('button', { name: '?명뀛 ?뺣낫' }).click();
    // HotelInfo 而댄룷?뚰듃媛 ?ㅼ떆 ?뚮뜑留곷릺?덈뒗吏 ?뺤씤
    await expect(page.locator('label:has-text("?명뀛 ?대쫫")')).toBeVisible({ timeout: 30000 });

    // ?낅젰?덈뜕 ?곗씠?곌? ?좎??섎뒗吏 ?뺤씤 (name ?띿꽦??湲곗??쇰줈 ?섏젙)
    await expect(page.locator('input[name="name"]')).toHaveValue(HOTEL_NAME);
    await expect(page.locator('textarea[name="description"]')).toHaveValue(HOTEL_DESCRIPTION);
  });

  test('2. ???명뀛 ?뺣낫 ???諛??뺤씤', async ({ page }) => {
    // ?명뀛 ?뺣낫 ?낅젰 (name ?띿꽦??湲곗??쇰줈 ?섏젙)
    await page.locator('input[name="name"]').fill(HOTEL_NAME);
    await page.locator('textarea[name="description"]').fill(HOTEL_DESCRIPTION);
    await page.locator('input[name="address"]').fill('?뚯뒪??二쇱냼');
    await page.locator('input[name="phone"]').fill('010-1234-5678');

    // ??λ쾭?쇱씠 HotelInfo 而댄룷?뚰듃 ?댁뿉 ?덉쑝誘濡??대떦 而댄룷?뚰듃媛 ?뚮뜑留곷맂 ??踰꾪듉 ?대┃
    const saveButton = page.locator('button:has-text("???):not([disabled])');
    await expect(saveButton).toBeVisible({ timeout: 30000 });
    await saveButton.click();

    // ???API ?묐떟 ?湲?    await page.waitForResponse(response =>
      response.url().includes('/api/hotels') && response.request().method() === 'POST',
      { timeout: 15000 }
    );

    // ?쒗뵆由?紐⑸줉 ??쑝濡??대룞 (?ㅼ젣 ???대쫫 ?뺤씤 ?꾩슂)
    await page.getByRole('button', { name: '?⑦궎吏' }).click();

    // ?⑦궎吏 ??씠 濡쒕뱶???뚭퉴吏 ?湲?    await expect(page.locator('h2:has-text("?⑦궎吏")')).toBeVisible({ timeout: 30000 });

    // ?덈줈 ?앹꽦???명뀛??紐⑸줉???덈뒗吏 ?뺤씤
    await expect(page.locator(`text=${HOTEL_NAME}`).first()).toBeVisible({ timeout: 30000 });
  });
}); 

