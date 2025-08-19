const { chromium } = require('playwright');

const SECTIONS_TO_TEST = [
  { 
    label: '?명뀛 ?뺣낫', 
    saveButton: '?뮶 ?명뀛?뺣낫 ???,
    inputs: ['input[type="text"]', 'textarea']
  },
  { 
    label: '媛앹떎 ?뺣낫 (?듯빀)', 
    saveButton: '?뮶 媛앹떎?뺣낫 ???,
    inputs: ['input[type="text"]', 'input[type="number"]', 'textarea', 'select']
  },
  { 
    label: '?쒖꽕 ?뺣낫', 
    saveButton: '?뮶 ?쒖꽕?뺣낫 ???,
    inputs: ['input[type="checkbox"]', 'textarea']
  },
   { 
    label: '?⑦궎吏 (?듯빀)', 
    saveButton: '?뮶 ?⑦궎吏 ???,
    inputs: ['input[type="text"]', 'input[type="number"]', 'textarea']
  },
  { 
    label: '異붽??붽툑 (?듯빀)', 
    saveButton: '?뮶 異붽??붽툑 ???,
    inputs: ['input[type="text"]', 'input[type="number"]']
  },
];

(async () => {
  console.log('?? 怨좉툒 ?곹샇?묒슜 ?쒕굹由ъ삤 ?뚯뒪???쒖옉...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const capturedErrors = [];

  page.on('console', msg => {
    const logData = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    };
    if (msg.type() === 'error' || msg.type() === 'warn') {
      console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
      capturedErrors.push(logData);
    }
  });
  
  page.on('pageerror', exc => {
      const errorText = `[PAGE ERROR] ${exc.message}`;
      console.error(`?슚 ${errorText}`);
      capturedErrors.push(errorText);
  });

  try {
    console.log('?뙋 ?섏씠吏濡??대룞 以?.. (http://localhost: {process.env.PORT || 3900})');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle', timeout: 30000 });
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
    
    for (const section of SECTIONS_TO_TEST) {
      console.log(`\n\n--- [?쒖옉] '${section.label}' ?뱀뀡 ?뚯뒪??---`);

      // 1. ?뱀뀡 ?닿린
      await page.locator(`div:has-text("${section.label}")`).first().click();
      console.log(`  - '${section.label}' ?뱀뀡 ?닿린 ?꾨즺.`);
      await page.waitForTimeout(1000);

      // 2. 紐⑤뱺 ?낅젰???媛?梨꾩슦湲?
      console.log('  - ?낅젰? 梨꾩슦湲??쒖옉...');
      for (const inputType of section.inputs) {
        const inputs = await page.locator(`.modal-content ${inputType}, .fade.in ${inputType}`).all();
        for (const input of inputs) {
            if (await input.isEditable()) {
                const type = await input.getAttribute('type');
                if (type === 'checkbox' || type === 'radio') {
                    await input.check({ force: true });
                } else if ((await input.elementHandle())._element.tagName === 'SELECT') {
                    await input.selectOption({ index: 1 });
                } else if (type === 'number') {
                    await input.fill('123', { force: true });
                } else {
                    await input.fill('?뚯뒪???먮룞 ?낅젰', { force: true });
                }
            }
        }
      }
      console.log('  - ?낅젰? 梨꾩슦湲??꾨즺.');

      // 3. ???踰꾪듉 ?대┃
      page.once('dialog', async dialog => {
        console.log(`  - Alert 硫붿떆吏 ?뺤씤: "${dialog.message()}"`);
        await dialog.dismiss();
      });

      // DEBUG: 踰꾪듉 ?대┃ ??紐⑤떖??HTML 援ъ“ ?뺤씤
      const modalHtml = await page.locator('.modal-content').innerHTML();
      console.log('--- MODAL HTML ---');
      console.log(modalHtml);
      console.log('--- END MODAL HTML ---');

      await page.locator(`button:has-text("${section.saveButton}")`).click();
      console.log(`  - '${section.saveButton}' ???踰꾪듉 ?대┃ ?꾨즺.`);
      await page.waitForTimeout(1500);

      // 4. 紐⑤떖 ?リ린
      await page.locator('button:has-text("?リ린"), button.btn-close').first().click();
      console.log('  - 紐⑤떖 ?リ린 ?꾨즺.');
      await page.waitForTimeout(1000);
      
      // 5. ?뱀뀡 ?ㅼ떆 ?닿린
      await page.locator(`div:has-text("${section.label}")`).first().click();
      console.log(`  - '${section.label}' ?뱀뀡 ?ㅼ떆 ?닿린 ?꾨즺.`);
      await page.waitForTimeout(1000);

      // 6. ?낅젰李??ㅼ떆 ?대┃?대낫湲?
      const firstInput = page.locator(`.modal-content ${section.inputs[0]}, .fade.in ${section.inputs[0]}`).first();
      if(await firstInput.count() > 0) {
        await firstInput.click();
        console.log('  - ?ㅼ떆 ?????낅젰李??대┃ ?꾨즺.');
      }
      
      await page.locator('button:has-text("?リ린"), button.btn-close').first().click();
      console.log('  - 理쒖쥌 ?リ린 ?꾨즺.');

      console.log(`--- [醫낅즺] '${section.label}' ?뱀뀡 ?뚯뒪???꾨즺 ---`);
    }

  } catch (error) {
    console.error(`???뚯뒪??以??ш컖???ㅻ쪟 諛쒖깮: ${error.message}`);
    const screenshotPath = `debug-screenshot-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`?벝 ?ㅻ쪟 諛쒖깮 ?쒖젏???ㅽ겕由곗꺑??'${screenshotPath}' ?뚯씪濡???ν뻽?듬땲??`);
    console.error(error.stack);
  } finally {
    console.log('\n\n--- ?뱤 理쒖쥌 ?뚯뒪??寃곌낵 ---');
    if (capturedErrors.length > 0) {
      console.log('?뵶 珥?12媛쒖쓽 ?먮윭媛 諛쒓껄?섏뿀?듬땲??');
      capturedErrors.forEach(err => {
        console.log(`- [${err.type.toUpperCase()}] ${err.text}`);
        if(err.location) {
          console.log(`  at ${err.location.url}:${err.location.lineNumber}:${err.location.columnNumber}`);
        }
      });
    } else {
      console.log('?윟 ?뚯뒪?몄쓽 紐⑤뱺 ?쒕굹由ъ삤?먯꽌 釉뚮씪?곗? ?먮윭媛 諛쒓껄?섏? ?딆븯?듬땲??');
    }
    await browser.close();
    console.log('?? ?뚯뒪??醫낅즺.');
  }
})(); 
