const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function finalCompleteTest() {
  console.log('?렞 理쒖쥌 ?꾩쟾 ?쒓? ?낅젰 ?뚯뒪???쒖옉...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 肄섏넄 濡쒓렇 罹≪쿂
    page.on('console', msg => {
      if (msg.text().includes('SimpleInput') || msg.text().includes('?쒓?') || msg.text().includes('[name]')) {
        console.log(`?뼢截?釉뚮씪?곗?: ${msg.text()}`);
      }
    });
    
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'domcontentloaded' });
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
    
    await delay(3000);
    
    // 媛앹떎 ?뺣낫 ?뱀뀡 ?대┃
    console.log('?룳 媛앹떎 ?뺣낫 ?뱀뀡 ?대┃...');
    const roomSection = await page.evaluateHandle(() => {
      const elements = Array.from(document.querySelectorAll('.cursor-pointer'));
      return elements.find(el => el.textContent?.includes('媛앹떎 ?뺣낫'));
    });
    
    if (roomSection) {
      await roomSection.click();
      console.log('??媛앹떎 ?뺣낫 ?뱀뀡 ?대┃ ?꾨즺');
      await delay(5000); // ??湲??湲?
      
      // ?낅젰 ?꾨뱶 ?뺤씤
      const inputCount = await page.evaluate(() => {
        return document.querySelectorAll('input[name]').length;
      });
      
      console.log(`?뱥 name ?띿꽦???덈뒗 ?낅젰 ?꾨뱶: ${inputCount}媛?);
      
      if (inputCount === 0) {
        console.log('?좑툘 ?꾨뱶媛 ?놁뒿?덈떎. ?섏씠吏 ?덈줈怨좎묠 ???ъ떆??..');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await delay(3000);
        
        // ?ㅼ떆 媛앹떎 ?뺣낫 ?뱀뀡 ?대┃
        const roomSection2 = await page.evaluateHandle(() => {
          const elements = Array.from(document.querySelectorAll('.cursor-pointer'));
          return elements.find(el => el.textContent?.includes('媛앹떎 ?뺣낫'));
        });
        
        if (roomSection2) {
          await roomSection2.click();
          await delay(5000);
        }
      }
      
      // ?뚯뒪??耳?댁뒪??
      const testCases = [
        { name: 'name', value: '?붾윮???몄쐢猷?, description: '媛앹떎紐? },
        { name: 'type', value: '?붾툝踰좊뱶', description: '媛앹떎??? },
        { name: 'structure', value: '35??, description: '援ъ“' },
        { name: 'bedType', value: '?뱀궗?댁쫰 踰좊뱶', description: '移⑤???? },
        { name: 'view', value: 'City View', description: '?꾨쭩' }
      ];
      
      let totalTests = 0;
      let successTests = 0;
      let partialTests = 0;
      
      for (const testCase of testCases) {
        totalTests++;
        console.log(`\n?뱷 ${testCase.description} ?낅젰 ?뚯뒪?? "${testCase.value}"`);
        
        try {
          const inputSelector = `input[name="${testCase.name}"]`;
          const fieldExists = await page.$(inputSelector);
          
          if (!fieldExists) {
            console.log(`???꾨뱶瑜?李얠쓣 ???놁쓬: ${testCase.name}`);
            continue;
          }
          
          // ?꾨뱶???ъ빱??
          await page.focus(inputSelector);
          await delay(200);
          
          // 湲곗〈 媛??꾩쟾??吏?곌린
          await page.keyboard.down('Control');
          await page.keyboard.press('KeyA');
          await page.keyboard.up('Control');
          await page.keyboard.press('Delete');
          await delay(300);
          
          // ?쒓? ?낅젰 (???먮┛ ?띾룄濡?
          console.log(`?⑨툘 "${testCase.value}" ?낅젰 以?..`);
          await page.type(inputSelector, testCase.value, { delay: 200 });
          
          // ?낅젰 ?꾨즺 ??釉붾윭 泥섎━ (以묒슂!)
          await delay(1000);
          await page.evaluate((selector) => {
            const input = document.querySelector(selector);
            if (input) {
              input.blur();
            }
          }, inputSelector);
          
          // 異붽? ?湲?
          await delay(2000);
          
          // 寃곌낵 ?뺤씤
          const actualValue = await page.$eval(inputSelector, el => el.value);
          
          if (actualValue === testCase.value) {
            console.log(`???꾩쟾 ?깃났: "${actualValue}"`);
            successTests++;
          } else if (actualValue.length > 0) {
            console.log(`?윞 遺遺??깃났: "${testCase.value}" ??"${actualValue}"`);
            partialTests++;
          } else {
            console.log(`???ㅽ뙣: 媛믪씠 鍮꾩뼱?덉쓬`);
          }
          
        } catch (error) {
          console.log(`???뚯뒪???ㅽ뙣: ${testCase.name} - ${error.message}`);
        }
      }
      
      // 寃곌낵 ?붿빟
      console.log('\n?뱤 === 理쒖쥌 ?뚯뒪??寃곌낵 ===');
      console.log(`珥??뚯뒪?? ${totalTests}媛?);
      console.log(`?꾩쟾 ?깃났: ${successTests}媛?(${totalTests > 0 ? Math.round(successTests/totalTests*100) : 0}%)`);
      console.log(`遺遺??깃났: ${partialTests}媛?(${totalTests > 0 ? Math.round(partialTests/totalTests*100) : 0}%)`);
      console.log(`?ㅽ뙣: ${totalTests - successTests - partialTests}媛?(${totalTests > 0 ? Math.round((totalTests - successTests - partialTests)/totalTests*100) : 0}%)`);
      
      if (totalTests > 0) {
        const overallSuccess = (successTests + partialTests) / totalTests * 100;
        console.log(`?꾩껜 ?깃났瑜? ${Math.round(overallSuccess)}%`);
        
        if (overallSuccess >= 90) {
          console.log('?럦 ?꾨꼍???깃났! (90% ?댁긽)');
        } else if (overallSuccess >= 80) {
          console.log('?럧 ?뚯뒪???듦낵! (80% ?댁긽)');
        } else {
          console.log('?좑툘 異붽? 媛쒖꽑 ?꾩슂');
        }
      }
      
    } else {
      console.log('??媛앹떎 ?뺣낫 ?뱀뀡??李얠쓣 ???놁쓬');
    }
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error);
  } finally {
    // 20珥???釉뚮씪?곗? 醫낅즺
    setTimeout(async () => {
      await browser.close();
      console.log('?뵚 釉뚮씪?곗? 醫낅즺');
    }, 20000);
  }
}

finalCompleteTest().catch(console.error); 
