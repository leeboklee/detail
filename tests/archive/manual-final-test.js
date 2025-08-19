const { chromium } = require('playwright');

(async () => {
  let browser;
  try {
    console.log('?뚯뒪?몃? ?쒖옉?⑸땲?? Headed 紐⑤뱶濡?釉뚮씪?곗?瑜??ㅽ뻾?⑸땲??..');
    browser = await chromium.launch({ headless: false }); // ?쒓컖???뺤씤???꾪빐 headed 紐⑤뱶濡??ㅽ뻾
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('http://localhost:3000 ?쇰줈 ?대룞?⑸땲??..');
    await page.goto('http://localhost:3000', { timeout: 60000 });

    page.on('console', msg => {
      if (msg.text().includes('fast-refresh')) return;
      console.log(`[釉뚮씪?곗? 肄섏넄] ${msg.type().toUpperCase()}: ${msg.text()}`);
    });

    console.log('"?명뀛 ?뺣낫" ?뱀뀡 移대뱶瑜??대┃?⑸땲??..');
    await page.locator('[data-testid="section-card-hotel"]').click({ timeout: 15000 });

    console.log('紐⑤떖李쎌씠 ?섑??섎뒗 寃껋쓣 湲곕떎由쎈땲??..');
    const modal = page.locator('div[role="dialog"]');
    await modal.waitFor({ state: 'visible', timeout: 10000 });
    console.log('??紐⑤떖李쎌씠 ?깃났?곸쑝濡??섑??ъ뒿?덈떎.');

    console.log('紐⑤떖李쎌쓽 ?묒떇???섏젙?⑸땲??..');
    await modal.locator('input[name="name"]').fill('?섏젙???명뀛 ?대쫫');
    await modal.locator('input[name="address"]').fill('?섏젙???명뀛 二쇱냼');

    console.log('"?곸슜?섍퀬 ?リ린" 踰꾪듉???대┃?⑸땲??..');
    await modal.locator('button:has-text("?곸슜?섍퀬 ?リ린")').click();
    await modal.waitFor({ state: 'hidden', timeout: 5000 });
    console.log('??紐⑤떖李쎌씠 ?깃났?곸쑝濡??ロ삍?듬땲??');

    console.log('"?꾩껜 ??? 踰꾪듉???대┃?섍퀬 API ?묐떟??湲곕떎由쎈땲??..');
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/hotels/save-all') && res.status() === 200, { timeout: 10000 }),
      page.locator('button:has-text("?꾩껜 ???)').click(),
    ]);

    const responseBody = await response.json();
    if (responseBody.message && responseBody.message.includes('?깃났?곸쑝濡???λ릺?덉뒿?덈떎')) {
        console.log('??API ?묐떟: ????깃났 硫붿떆吏瑜??뺤씤?덉뒿?덈떎.');
    } else {
        throw new Error(`API ?묐떟?먯꽌 ?깃났 硫붿떆吏瑜?李얠쓣 ???놁뒿?덈떎. 諛쏆? 硫붿떆吏: ${JSON.stringify(responseBody)}`);
    }

    console.log('UI?먯꽌 理쒖쥌 ?깃났 硫붿떆吏媛 蹂댁씠?붿? ?뺤씤?⑸땲??..');
    const successMessage = page.locator('div:has-text("?깃났?곸쑝濡???λ릺?덉뒿?덈떎")');
    await successMessage.waitFor({ state: 'visible', timeout: 10000 });
    console.log('?끸쐟???뚯뒪???듦낵: 紐⑤뱺 怨쇱젙???깃났?곸쑝濡??꾨즺?섏뿀?듬땲??');

  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error.message);
  } finally {
    if (browser) {
      console.log('?뚯뒪?몃? 醫낅즺?섍퀬 釉뚮씪?곗?瑜??レ뒿?덈떎.');
      await browser.close();
    }
  }
})(); 
