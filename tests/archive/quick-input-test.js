const { chromium } = require('playwright');

async function quickInputTest() {
  console.log('?낅젰 ?깅뒫 ?뚯뒪???쒖옉...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // ?섏씠吏 濡쒕뱶
    await page.goto('http://localhost: {process.env.PORT || 3900}');
    await page.waitForTimeout(2000);

    // 媛앹떎 ?뺣낫 ?대┃
    await page.click('text=媛앹떎 ?뺣낫');
    await page.waitForTimeout(1000);

    // 紐⑤뱺 蹂댁씠???낅젰 ?꾨뱶 李얘린
    const inputs = await page.$$eval('input:visible, textarea:visible', elements => 
      elements.map(el => ({
        placeholder: el.placeholder,
        id: el.id,
        tag: el.tagName
      }))
    );

    console.log(`諛쒓껄???낅젰 ?꾨뱶: ${inputs.length}媛?);
    inputs.forEach((input, i) => {
      console.log(`${i+1}. ${input.tag} - ${input.placeholder || input.id}`);
    });

    // 泥?踰덉㎏ 蹂댁씠???낅젰 ?꾨뱶???낅젰 ?뚯뒪??
    if (inputs.length > 0) {
      const testText = '?깅뒫?뚯뒪?몄엯??;
      
      for (let i = 0; i < Math.min(3, inputs.length); i++) {
        try {
          const selector = inputs[i].id ? `#${inputs[i].id}` : 
                          inputs[i].placeholder ? `[placeholder*="${inputs[i].placeholder}"]` :
                          `${inputs[i].tag.toLowerCase()}`;
          
          const start = Date.now();
          await page.fill(selector, testText);
          const end = Date.now();
          
          console.log(`?낅젰 ?꾨뱶 ${i+1} ?묐떟?쒓컙: ${end - start}ms`);
          
          // ?곗냽 ?낅젰 ?뚯뒪??
          const charStart = Date.now();
          await page.type(selector, 'abc', { delay: 10 });
          const charEnd = Date.now();
          
          console.log(`  臾몄옄蹂??낅젰 ?뚯뒪?? ${charEnd - charStart}ms`);
          
        } catch (error) {
          console.log(`?낅젰 ?꾨뱶 ${i+1} ?뚯뒪???ㅽ뙣: ${error.message}`);
        }
      }
    } else {
      console.log('?낅젰 ?꾨뱶瑜?李얠쓣 ???놁뒿?덈떎.');
    }

  } catch (error) {
    console.error('?뚯뒪???ㅻ쪟:', error.message);
  } finally {
    await browser.close();
  }
}

quickInputTest(); 
