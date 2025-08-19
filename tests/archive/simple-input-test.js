const { chromium } = require('playwright');

async function testSimpleInput() {
  console.log('?뵇 SimpleInput ?⑤룆 ?뚯뒪???쒖옉...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 300 
  });
  
  const page = await browser.newPage();

  try {
    // ?섏씠吏 濡쒕뱶
    await page.goto('http://localhost: {process.env.PORT || 3900}');
    await page.waitForTimeout(2000);

    // 媛앹떎 ?뺣낫 ?뱀뀡 ?대┃
    await page.click('text=媛앹떎 ?뺣낫 (?듯빀)');
    await page.waitForTimeout(2000);

    // 泥?踰덉㎏ 媛앹떎???대쫫 ?꾨뱶 李얘린
    const nameInput = await page.locator('input[name="name"]').first();
    
    if (await nameInput.isVisible()) {
      console.log('??媛앹떎 ?대쫫 ?낅젰 ?꾨뱶 諛쒓껄');
      
      // ?ъ빱??
      await nameInput.click();
      await page.waitForTimeout(500);
      
      // ??湲?먯뵫 泥쒖쿇???낅젰
      console.log('??湲?먯뵫 ?낅젰 ?뚯뒪??..');
      
      await nameInput.fill('');
      await page.waitForTimeout(300);
      
      await nameInput.type('A', { delay: 500 });
      await page.waitForTimeout(1000);
      let value1 = await nameInput.inputValue();
      console.log(`A ?낅젰 ?? "${value1}"`);
      
      await nameInput.type('B', { delay: 500 });
      await page.waitForTimeout(1000);
      let value2 = await nameInput.inputValue();
      console.log(`B ?낅젰 ?? "${value2}"`);
      
      await nameInput.type('C', { delay: 500 });
      await page.waitForTimeout(1000);
      let value3 = await nameInput.inputValue();
      console.log(`C ?낅젰 ?? "${value3}"`);
      
      // ?꾩껜 ?띿뒪?몃줈 ?뚯뒪??
      console.log('?꾩껜 ?띿뒪???낅젰 ?뚯뒪??..');
      await nameInput.fill('');
      await page.waitForTimeout(300);
      
      await nameInput.fill('?뚯뒪?멸컼??);
      await page.waitForTimeout(1000);
      let finalValue = await nameInput.inputValue();
      console.log(`理쒖쥌 媛? "${finalValue}"`);
      
      // Tab?쇰줈 blur
      await page.keyboard.press('Tab');
      await page.waitForTimeout(1000);
      let blurValue = await nameInput.inputValue();
      console.log(`blur ?? "${blurValue}"`);
      
    } else {
      console.log('??媛앹떎 ?대쫫 ?낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
    }

    // ?ㅽ겕由곗꺑 ???
    await page.screenshot({ path: 'simple-input-test.png' });
    console.log('?벜 ?ㅽ겕由곗꺑 ??λ맖: simple-input-test.png');

  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    console.log('?뢾 ?뚯뒪???꾨즺');
    await browser.close();
  }
}

testSimpleInput(); 
