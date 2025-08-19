const { chromium } = require('playwright');

async function testPreview() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('?봽 誘몃━蹂닿린 ?뚯뒪???쒖옉...');
    
    // ?섏씠吏 濡쒕뱶
    await page.goto('http://localhost:3900');
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
    
    // ?명뀛 ?뺣낫 ?낅젰
    await page.fill('input[placeholder*="?명뀛 ?대쫫"]', '?뚯뒪???명뀛');
    await page.fill('input[placeholder*="?명뀛 二쇱냼"]', '?쒖슱??媛뺣궓援??뚯뒪?몃줈 123');
    await page.fill('textarea[placeholder*="?명뀛 ?ㅻ챸"]', '?뚯뒪?몄슜 ?명뀛?낅땲??');
    console.log('???명뀛 ?뺣낫 ?낅젰 ?꾨즺');
    
    // 誘몃━蹂닿린 ?뱀뀡 ?뺤씤
    const previewTitle = await page.locator('h1:has-text("?뚯뒪???명뀛")');
    const previewAddress = await page.locator('p:has-text("?쒖슱??媛뺣궓援??뚯뒪?몃줈 123")');
    const previewDescription = await page.locator('p:has-text("?뚯뒪?몄슜 ?명뀛?낅땲??")');
    
    if (await previewTitle.isVisible()) {
      console.log('??誘몃━蹂닿린 ?쒕ぉ ?쒖떆??);
    } else {
      console.log('??誘몃━蹂닿린 ?쒕ぉ ?쒖떆 ?덈맖');
    }
    
    if (await previewAddress.isVisible()) {
      console.log('??誘몃━蹂닿린 二쇱냼 ?쒖떆??);
    } else {
      console.log('??誘몃━蹂닿린 二쇱냼 ?쒖떆 ?덈맖');
    }
    
    if (await previewDescription.isVisible()) {
      console.log('??誘몃━蹂닿린 ?ㅻ챸 ?쒖떆??);
    } else {
      console.log('??誘몃━蹂닿린 ?ㅻ챸 ?쒖떆 ?덈맖');
    }
    
    // ?ㅽ겕由곗꺑 ???
    await page.screenshot({ path: 'preview-test-result.png' });
    console.log('?벝 ?ㅽ겕由곗꺑 ??λ맖: preview-test-result.png');
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error.message);
  } finally {
    await browser.close();
  }
}

testPreview(); 
