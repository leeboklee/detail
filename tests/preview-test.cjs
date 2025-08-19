const puppeteer = require('puppeteer');

async function testPreview() {
  console.log('?? 誘몃━蹂닿린 ?뚯뒪???쒖옉...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뵫 以?..');
    await page.goto('http://localhost:3900', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
    
    // ?섏씠吏 ?댁슜 ?뺤씤
    const pageTitle = await page.title();
    console.log('?뱥 ?섏씠吏 ?쒕ぉ:', pageTitle);
    
    // ?좎떆 ?湲?(React ?뚮뜑留??꾨즺 ?湲?
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // ?명뀛 ?뺣낫 ?낅젰 ?꾨뱶 李얘린 諛??낅젰
    console.log('?뵇 ?낅젰 ?꾨뱶 李얜뒗 以?..');
    
    // ?명뀛 ?대쫫 ?낅젰
    const nameInput = await page.$('input[name="name"], input[placeholder*="?명뀛"], input[type="text"]');
    if (nameInput) {
      await nameInput.click();
      await nameInput.type('?뚯뒪???명뀛 123', { delay: 100 });
      console.log('???명뀛 ?대쫫 ?낅젰 ?꾨즺');
    } else {
      console.log('???명뀛 ?대쫫 ?낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
    }
    
    // ?명뀛 二쇱냼 ?낅젰
    const addressInput = await page.$('input[name="address"], input[placeholder*="二쇱냼"]');
    if (addressInput) {
      await addressInput.click();
      await addressInput.type('?쒖슱??媛뺣궓援??뚯뒪?몃줈 456', { delay: 100 });
      console.log('???명뀛 二쇱냼 ?낅젰 ?꾨즺');
    } else {
      console.log('???명뀛 二쇱냼 ?낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
    }
    
    // ?명뀛 ?ㅻ챸 ?낅젰
    const descInput = await page.$('textarea[name="description"], textarea[placeholder*="?ㅻ챸"]');
    if (descInput) {
      await descInput.click();
      await descInput.type('?뚯뒪?몄슜 ?명뀛?낅땲?? 誘몃━蹂닿린 ?뚯뒪??以묒엯?덈떎.', { delay: 100 });
      console.log('???명뀛 ?ㅻ챸 ?낅젰 ?꾨즺');
    } else {
      console.log('???명뀛 ?ㅻ챸 ?낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
    }
    
    // ?낅젰 ???좎떆 ?湲?(誘몃━蹂닿린 ?낅뜲?댄듃 ?湲?
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 誘몃━蹂닿린 ?곸뿭 ?뺤씤
    console.log('?? 誘몃━蹂닿린 ?곸뿭 ?뺤씤 以?..');
    
    // iframe ?대? ?댁슜 ?뺤씤
    const iframe = await page.$('iframe[title="Preview"]');
    if (iframe) {
      console.log('??誘몃━蹂닿린 iframe 諛쒓껄');
      
      const frame = await iframe.contentFrame();
      if (frame) {
        // iframe ?대? ?띿뒪???뺤씤
        const frameText = await frame.evaluate(() => document.body.innerText);
        console.log('?뱥 iframe ?댁슜:', frameText.substring(0, 200));
        
        // ?뱀젙 ?띿뒪???뺤씤
        if (frameText.includes('?뚯뒪???명뀛 123')) {
          console.log('??誘몃━蹂닿린???명뀛 ?대쫫 諛섏쁺??);
        } else {
          console.log('??誘몃━蹂닿린???명뀛 ?대쫫 諛섏쁺 ?덈맖');
        }
        
        if (frameText.includes('?쒖슱??媛뺣궓援??뚯뒪?몃줈 456')) {
          console.log('??誘몃━蹂닿린???명뀛 二쇱냼 諛섏쁺??);
        } else {
          console.log('??誘몃━蹂닿린???명뀛 二쇱냼 諛섏쁺 ?덈맖');
        }
        
        if (frameText.includes('?뚯뒪?몄슜 ?명뀛?낅땲??)) {
          console.log('??誘몃━蹂닿린???명뀛 ?ㅻ챸 諛섏쁺??);
        } else {
          console.log('??誘몃━蹂닿린???명뀛 ?ㅻ챸 諛섏쁺 ?덈맖');
        }
      }
    } else {
      console.log('??誘몃━蹂닿린 iframe??李얠쓣 ???놁쓬');
      
      // ??? ?쇰컲 div?먯꽌 誘몃━蹂닿린 ?뺤씤
      const previewDiv = await page.$('.preview, [data-testid="preview"], .hotel-preview');
      if (previewDiv) {
        const previewText = await previewDiv.evaluate(el => el.innerText);
        console.log('?뱥 誘몃━蹂닿린 div ?댁슜:', previewText.substring(0, 200));
      }
    }
    
    // ?꾩껜 ?섏씠吏 ?ㅽ겕由곗꺑 ???
    await page.screenshot({ path: 'preview-test-result.png', fullPage: true });
    console.log('?벝 ?꾩껜 ?섏씠吏 ?ㅽ겕由곗꺑 ??λ맖: preview-test-result.png');
    
    // iframe留??ㅽ겕由곗꺑 ???
    if (iframe) {
      await iframe.screenshot({ path: 'preview-iframe-result.png' });
      console.log('?벝 iframe ?ㅽ겕由곗꺑 ??λ맖: preview-iframe-result.png');
    }
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error.message);
    console.error('?ㅽ깮 ?몃젅?댁뒪:', error.stack);
    
    // ?ㅻ쪟 諛쒖깮 ?쒖뿉???ㅽ겕由곗꺑 ???
    try {
      await page.screenshot({ path: 'preview-error-result.png', fullPage: true });
      console.log('?벝 ?ㅻ쪟 ?곹깭 ?ㅽ겕由곗꺑 ??λ맖: preview-error-result.png');
    } catch (screenshotError) {
      console.error('?ㅽ겕由곗꺑 ????ㅽ뙣:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('?뢾 ?뚯뒪???꾨즺');
  }
}

testPreview(); 
