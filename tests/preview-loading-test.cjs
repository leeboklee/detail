// 誘몃━蹂닿린 濡쒕뵫 ?곹깭 諛??쒕쾭 ?ㅻ쪟 ?뚯뒪??
const puppeteer = require('puppeteer');

async function testPreviewLoading() {
  console.log('?? 誘몃━蹂닿린 濡쒕뵫 ?곹깭 ?뚯뒪???쒖옉...');
  
  const browser = await puppeteer.launch({ 
    headless: false, // 釉뚮씪?곗? ?쒖떆
    args: ['--no-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    // ?섏씠吏 濡쒕뱶
    console.log('?뱞 ?섏씠吏 濡쒕뵫 以?..');
    await page.goto('http://localhost:3900', { timeout: 30000 });
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
    
    // 濡쒕뵫 ?곹깭 ?뺤씤
    console.log('?뵇 誘몃━蹂닿린 濡쒕뵫 ?곹깭 ?뺤씤 以?..');
    
    // 濡쒕뵫 ?ㅽ뵾???뺤씤
    const loadingSpinner = await page.$('.spinner');
    if (loadingSpinner) {
      console.log('??濡쒕뵫 ?ㅽ뵾??諛쒓껄');
    } else {
      console.log('??濡쒕뵫 ?ㅽ뵾?덈? 李얠쓣 ???놁쓬');
    }
    
    // 濡쒕뵫 ?띿뒪???뺤씤
    const loadingText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => el.textContent.includes('誘몃━蹂닿린 濡쒕뵫 以?));
    });
    
    if (loadingText) {
      console.log('??濡쒕뵫 ?띿뒪??諛쒓껄: "誘몃━蹂닿린 濡쒕뵫 以?.."');
    } else {
      console.log('??濡쒕뵫 ?띿뒪?몃? 李얠쓣 ???놁쓬');
    }
    
    // ?좎떆 ?湲?(濡쒕뵫 ?꾨즺 ?湲?
    console.log('??濡쒕뵫 ?꾨즺 ?湲?以?..');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 濡쒕뵫 ?꾨즺 ???곹깭 ?뺤씤
    const loadingSpinnerAfter = await page.$('.spinner');
    if (!loadingSpinnerAfter) {
      console.log('??濡쒕뵫 ?꾨즺??(?ㅽ뵾???щ씪吏?');
    } else {
      console.log('?좑툘 濡쒕뵫???꾩쭅 吏꾪뻾 以?(?ㅽ뵾???좎?)');
    }
    
    // ?명뀛 ?뺣낫 ?낅젰 ?뚯뒪??
    console.log('?륅툘 ?명뀛 ?뺣낫 ?낅젰 ?뚯뒪??..');
    
    // ?명뀛 ?대쫫 ?낅젰
    const nameInput = await page.$('input[name="name"]');
    if (nameInput) {
      await nameInput.click();
      await nameInput.type('?뚯뒪???명뀛 123', { delay: 100 });
      console.log('???명뀛 ?대쫫 ?낅젰 ?꾨즺');
    }
    
    // ?명뀛 二쇱냼 ?낅젰
    const addressInput = await page.$('input[name="address"]');
    if (addressInput) {
      await addressInput.click();
      await addressInput.type('?쒖슱??媛뺣궓援??뚯뒪?몃줈 456', { delay: 100 });
      console.log('???명뀛 二쇱냼 ?낅젰 ?꾨즺');
    }
    
    // ?명뀛 ?ㅻ챸 ?낅젰
    const descInput = await page.$('textarea[name="description"]');
    if (descInput) {
      await descInput.click();
      await descInput.type('?뚯뒪?몄슜 ?명뀛?낅땲?? 濡쒕뵫 ?뚯뒪??以묒엯?덈떎.', { delay: 100 });
      console.log('???명뀛 ?ㅻ챸 ?낅젰 ?꾨즺');
    }
    
    // ?낅젰 ??濡쒕뵫 ?곹깭 ?ы솗??
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const loadingSpinnerAfterInput = await page.$('.spinner');
    if (!loadingSpinnerAfterInput) {
      console.log('???낅젰 ??濡쒕뵫 ?꾨즺??);
    } else {
      console.log('?좑툘 ?낅젰 ?꾩뿉??濡쒕뵫 以?);
    }
    
    // 誘몃━蹂닿린 ?댁슜 ?뺤씤
    console.log('?? 誘몃━蹂닿린 ?댁슜 ?뺤씤...');
    const previewContent = await page.evaluate(() => {
      const previewDiv = document.querySelector('[ref="previewRef"]') || 
                        document.querySelector('.preview') ||
                        document.querySelector('div[style*="overflow: auto"]');
      return previewDiv ? previewDiv.innerText : '誘몃━蹂닿린 ?곸뿭??李얠쓣 ???놁쓬';
    });
    
    console.log('?뱥 誘몃━蹂닿린 ?댁슜:', previewContent.substring(0, 200));
    
    // ?쒕쾭 ?ㅻ쪟 ?쒕??덉씠??
    console.log('?뵩 ?쒕쾭 ?ㅻ쪟 ?쒕??덉씠??..');
    await page.evaluate(() => {
      // ?쒕쾭 ?ㅻ쪟 ?대깽??諛쒖깮
      const errorEvent = new CustomEvent('server-error', {
        detail: {
          type: 'server_error',
          message: '?뚯뒪?몄슜 ?쒕쾭 ?ㅻ쪟?낅땲??',
          severity: 'high',
          timestamp: new Date().toISOString()
        }
      });
      window.dispatchEvent(errorEvent);
    });
    
    // ?ㅻ쪟 ?쒖떆 ?뺤씤
    await new Promise(resolve => setTimeout(resolve, 1000));
    const errorDisplay = await page.evaluate(() => {
      const errorElements = Array.from(document.querySelectorAll('*'));
      return errorElements.find(el => el.textContent.includes('?쒕쾭 ?ㅻ쪟'));
    });
    
    if (errorDisplay) {
      console.log('???쒕쾭 ?ㅻ쪟 ?쒖떆 ?뺤씤??);
    } else {
      console.log('???쒕쾭 ?ㅻ쪟 ?쒖떆瑜?李얠쓣 ???놁쓬');
    }
    
    // ?ㅽ겕由곗꺑 ???
    await page.screenshot({ path: 'preview-loading-test.png', fullPage: true });
    console.log('?벝 ?ㅽ겕由곗꺑 ??λ맖: preview-loading-test.png');
    
    // 釉뚮씪?곗? ?좎떆 ?좎? (?섎룞 ?뺤씤??
    console.log('?몌툘 釉뚮씪?곗?瑜?10珥덇컙 ?좎??⑸땲??..');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error.message);
    
    // ?ㅻ쪟 諛쒖깮 ?쒖뿉???ㅽ겕由곗꺑 ???
    try {
      await page.screenshot({ path: 'preview-loading-error.png', fullPage: true });
      console.log('?벝 ?ㅻ쪟 ?곹깭 ?ㅽ겕由곗꺑 ??λ맖: preview-loading-error.png');
    } catch (screenshotError) {
      console.error('?ㅽ겕由곗꺑 ????ㅽ뙣:', screenshotError.message);
    }
  } finally {
    await browser.close();
    console.log('?뢾 ?뚯뒪???꾨즺');
  }
}

// ?쒕쾭 ?곹깭 ?뺤씤
async function checkServerStatus() {
  console.log('?뵇 ?쒕쾭 ?곹깭 ?뺤씤 以?..');
  
  try {
    const response = await fetch('http://localhost:3900/api/health');
    if (response.ok) {
      console.log('???쒕쾭 ?뺤긽 ?묐룞');
      return true;
    } else {
      console.log(`???쒕쾭 ?ㅻ쪟: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`???쒕쾭 ?곌껐 ?ㅽ뙣: ${error.message}`);
    return false;
  }
}

// 硫붿씤 ?뚯뒪???ㅽ뻾
async function runLoadingTests() {
  console.log('?? 誘몃━蹂닿린 濡쒕뵫 諛??쒕쾭 ?ㅻ쪟 ?뚯뒪???쒖옉...\n');
  
  // ?쒕쾭 ?곹깭 ?뺤씤
  const serverOk = await checkServerStatus();
  
  if (serverOk) {
    // 誘몃━蹂닿린 濡쒕뵫 ?뚯뒪???ㅽ뻾
    await testPreviewLoading();
  } else {
    console.log('???쒕쾭媛 ?묐룞?섏? ?딆븘 ?뚯뒪?몃? 嫄대꼫?곷땲??');
  }
}

runLoadingTests(); 
