const { test, expect } = require('@playwright/test');

test('紐⑤떖 ?붾쾭源??뚯뒪??, async ({ page }) => {
  console.log('?? ?섏씠吏 濡쒕뵫 ?쒖옉...');
  await page.goto('http://localhost: {process.env.PORT || 3900}/admin');
  console.log('???섏씠吏 濡쒕뵫 ?꾨즺');
  
  // ?섏씠吏 ?쒕ぉ ?뺤씤
  const title = await page.title();
  console.log('?뱞 ?섏씠吏 ?쒕ぉ:', title);
  
  // ?명뀛 ?뺣낫 ??李얘린
  const hotelTab = page.locator('text=?명뀛 ?뺣낫');
  const isHotelTabVisible = await hotelTab.isVisible();
  console.log('?룳 ?명뀛 ?뺣낫 ??蹂댁엫:', isHotelTabVisible);
  
  if (isHotelTabVisible) {
    console.log('?뼮截??명뀛 ?뺣낫 ???대┃...');
    await hotelTab.click();
    console.log('???명뀛 ?뺣낫 ???대┃ ?꾨즺');
    
    // 2珥??湲?
    await page.waitForTimeout(2000);
    
    // 紐⑤떖 議댁옱 ?뺤씤
    const modal = page.locator('[role="dialog"]');
    const isModalVisible = await modal.isVisible();
    console.log('?뱥 紐⑤떖 蹂댁엫:', isModalVisible);
    
    if (isModalVisible) {
      console.log('??紐⑤떖???대졇?듬땲??');
      
      // 紐⑤떖 ?대? ?붿냼???뺤씤
      const inputs = await page.locator('[role="dialog"] input').count();
      console.log('?뱷 紐⑤떖 ???낅젰 ?꾨뱶 媛쒖닔:', inputs);
      
      // ?명뀛 ?대쫫 ?낅젰 ?꾨뱶 ?뺤씤
      const hotelNameInput = page.locator('[role="dialog"] input[placeholder="?명뀛 ?대쫫???낅젰?섏꽭??]');
      const isHotelNameInputVisible = await hotelNameInput.isVisible();
      console.log('?룳 ?명뀛 ?대쫫 ?낅젰 ?꾨뱶 蹂댁엫:', isHotelNameInputVisible);
      
      if (isHotelNameInputVisible) {
        console.log('???명뀛 ?대쫫 ?낅젰 ?꾨뱶 諛쒓껄!');
        await hotelNameInput.fill('?뚯뒪???명뀛');
        console.log('???명뀛 ?대쫫 ?낅젰 ?꾨즺');
      }
      
      // ?ㅽ겕由곗꺑 珥ъ쁺
      await page.screenshot({ path: 'debug-modal-open.png', fullPage: true });
      console.log('?벝 紐⑤떖 ?대┛ ?곹깭 ?ㅽ겕由곗꺑 ???);
      
    } else {
      console.log('??紐⑤떖???대━吏 ?딆븯?듬땲??');
      
      // ?몃씪?????뺤씤
      const inlineInputs = await page.locator('input[placeholder="?명뀛 ?대쫫???낅젰?섏꽭??]').count();
      console.log('?뱷 ?몃씪???낅젰 ?꾨뱶 媛쒖닔:', inlineInputs);
      
      if (inlineInputs > 0) {
        console.log('???몃씪???쇱뿉???명뀛 ?대쫫 ?낅젰 ?꾨뱶 諛쒓껄!');
      }
      
      // ?ㅽ겕由곗꺑 珥ъ쁺
      await page.screenshot({ path: 'debug-no-modal.png', fullPage: true });
      console.log('?벝 紐⑤떖 ?녿뒗 ?곹깭 ?ㅽ겕由곗꺑 ???);
    }
  } else {
    console.log('???명뀛 ?뺣낫 ??쓣 李얠쓣 ???놁뒿?덈떎.');
    await page.screenshot({ path: 'debug-no-tab.png', fullPage: true });
  }
  
  console.log('?뢾 ?붾쾭源??뚯뒪???꾨즺');
}); 
