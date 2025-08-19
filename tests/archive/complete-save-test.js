const { chromium } = require('playwright');

// ?湲??⑥닔
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ?덉쟾???대┃ ?⑥닔
async function safeClick(page, element, description = '') {
  try {
    await element.scrollIntoViewIfNeeded();
    await wait(500);
    await element.click();
    await wait(1000);
    console.log(`??${description} ?대┃ ?깃났`);
    return true;
  } catch (error) {
    console.log(`??${description} ?대┃ ?ㅽ뙣: ${error.message}`);
    try {
      await element.evaluate(el => el.click());
      await wait(1000);
      console.log(`??${description} 媛뺤젣 ?대┃ ?깃났`);
      return true;
    } catch (e) {
      console.log(`??${description} 媛뺤젣 ?대┃???ㅽ뙣: ${e.message}`);
      return false;
    }
  }
}

// ?뱀뀡蹂?????뚯뒪??async function testSectionSave(page, sectionName, sectionText) {
  console.log(`\n?뵇 [${sectionName}] ?뱀뀡 ?뚯뒪???쒖옉...`);
  
  // ?뱀뀡 移대뱶 李얘린
  const cards = await page.locator('div.cursor-pointer').all();
  let sectionCard = null;
  
  for (const card of cards) {
    const text = await card.textContent();
    if (text.includes(sectionText)) {
      sectionCard = card;
      console.log(`??${sectionName} 移대뱶 諛쒓껄: "${text}"`);
      break;
    }
  }
  
  if (!sectionCard) {
    console.log(`??${sectionName} 移대뱶瑜?李얠쓣 ???놁쓬`);
    return false;
  }
  
  // ?뱀뀡 移대뱶 ?대┃
  console.log(`?룧 ${sectionName} 移대뱶 ?대┃...`);
  await safeClick(page, sectionCard, `${sectionName} 移대뱶`);
  
  console.log('??紐⑤떖 濡쒕뵫 ?湲?..');
  await wait(3000);
  
  let inputCount = 0;

  // ?뱀뀡蹂??뱁솕???낅젰 濡쒖쭅
  if (sectionName === '?쒖꽕 ?뺣낫') {
    console.log('?룫 [?쒖꽕 ?뺣낫] ?뱁솕 濡쒖쭅: "?쒖꽕 異붽?" 踰꾪듉 ?대┃');
    const addButton = page.locator('button:has-text("+ ?쒖꽕 異붽?")');
    if (await addButton.count() > 0) {
      await safeClick(page, addButton, '?쒖꽕 異붽? 踰꾪듉');
      await wait(1000);

      const facilityNameInput = page.locator('input[placeholder="?쒖꽕紐?(?? ?섏쁺??"]').last();
      const testValue = `${sectionName} ?뚯뒪??媛?${Date.now()}`;
      await facilityNameInput.fill(testValue);
      console.log(`?뱷 ?낅젰 ?꾨즺: name = "${testValue}"`);
      inputCount = 1;
    }
  } else if (sectionName === '?⑦궎吏') {
    console.log('?벀 [?⑦궎吏] ?뱁솕 濡쒖쭅: ???⑦궎吏 ?뺣낫 ?낅젰 ??"?⑦궎吏 異붽?" 踰꾪듉 ?대┃');
    const nameInput = page.locator('input[placeholder="?⑦궎吏紐?]');
    const priceInput = page.locator('input[placeholder="媛寃?]');
    const addButton = page.locator('button:has-text("?⑦궎吏 異붽?")');

    if (await nameInput.count() > 0 && await addButton.count() > 0) {
      const nameValue = `${sectionName} ?뚯뒪??媛?${Date.now()}`;
      const priceValue = String(Math.floor(Math.random() * 100000) + 50000);

      await nameInput.fill(nameValue);
      console.log(`?뱷 ?낅젰 ?꾨즺: name = "${nameValue}"`);
      await priceInput.fill(priceValue);
      console.log(`?뱷 ?낅젰 ?꾨즺: price = "${priceValue}"`);

      await safeClick(page, addButton, '?⑦궎吏 異붽? 踰꾪듉');
      await wait(1000);
      inputCount = 1; // ?⑦궎吏 1媛?異붽?
    }
  } else if (sectionName === '異붽??붽툑') {
    console.log('?뮥 [異붽??붽툑] ?뱁솕 濡쒖쭅: "??ぉ 異붽?" 踰꾪듉 ?대┃');
    const addButton = page.locator('button:has-text("+ ??ぉ 異붽?")');
    if (await addButton.count() > 0) {
      await safeClick(page, addButton, '??ぉ 異붽? 踰꾪듉');
      await wait(1000);

      const itemNameInput = page.locator('input[placeholder="??ぉ紐?(?? ?몄썝 異붽?)"]').last();
      const itemPriceInput = page.locator('input[placeholder="媛寃?(?? 20000)"]').last();
      
      const nameValue = `${sectionName} ?뚯뒪??媛?${Date.now()}`;
      const priceValue = String(Math.floor(Math.random() * 20000) + 10000);

      await itemNameInput.fill(nameValue);
      console.log(`?뱷 ?낅젰 ?꾨즺: name = "${nameValue}"`);
      await itemPriceInput.fill(priceValue);
      console.log(`?뱷 ?낅젰 ?꾨즺: price = "${priceValue}"`);
      inputCount = 1;
    }
  } else {
    // 湲곗〈 ?낅젰 濡쒖쭅
    const inputs = await page.locator('input[type="text"], input[type="url"], textarea').all();
    
    for (let i = 0; i < Math.min(inputs.length, 3); i++) {
      try {
        const input = inputs[i];
        const name = await input.getAttribute('name');
        
        if (name && !name.includes('time') && !name.includes('capacity')) {
          const testValue = `${sectionName} ?뚯뒪??媛?${Date.now()}`;
          await input.fill(testValue);
          inputCount++;
          console.log(`?뱷 ?낅젰 ?꾨즺: ${name} = "${testValue}"`);
        }
      } catch (error) {
        console.log(`?좑툘 ?낅젰 ?ㅽ뙣: ${error.message}`);
      }
    }
  }
  
  console.log(`?뱤 珥?${inputCount}媛??꾨뱶???낅젰 ?꾨즺`);
  
  // ???踰꾪듉 ?대┃
  console.log('?뮶 ?곸슜?섍퀬 ?リ린 踰꾪듉 李얘린...');
  const saveButton = page.locator('button:has-text("?곸슜?섍퀬 ?リ린")').first();
  
  if (await saveButton.count() > 0) {
    console.log('?뮶 ?곸슜?섍퀬 ?リ린 踰꾪듉 ?대┃...');
    await safeClick(page, saveButton, '?곸슜?섍퀬 ?リ린 踰꾪듉');
    
    console.log('??????꾨즺 ?湲?..');
    await wait(2000); // DB 諛섏쁺 諛?UI ?낅뜲?댄듃 ?쒓컙
    
    // ?깃났 硫붿떆吏 ?뺤씤 (??遺遺꾩? ?꾩옱 UI???놁쑝誘濡?二쇱꽍 泥섎━ ?먮뒗 ?ㅻⅨ 諛⑹떇?쇰줈 ?뺤씤)
    /*
    const successMessage = await page.locator('div:has-text("??λ릺?덉뒿?덈떎")').first();
    if (await successMessage.count() > 0) {
      console.log('??????깃났 硫붿떆吏 ?뺤씤??);
    } else {
      console.log('??????깃났 硫붿떆吏 ?놁쓬');
    }
    */
    // 紐⑤떖???ロ엳??寃껋쑝濡??깃났 媛꾩＜
    await page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 });
    console.log('??紐⑤떖???ロ옒. ????깃났?쇰줈 媛꾩＜.');

  } else {
    console.log('???곸슜?섍퀬 ?リ린 踰꾪듉??李얠쓣 ???놁쓬');
  }
  
  console.log('???좎떆 ?湲?..');
  await wait(3000);
  
  // ?ㅼ떆 ?댁뼱??媛??뺤씤
  console.log(`?봽 ?ㅼ떆 ${sectionName} 移대뱶 ?대┃?섏뿬 媛??뺤씤...`);
  await safeClick(page, sectionCard, `${sectionName} 移대뱶 ?ы겢由?);
  
  console.log('??紐⑤떖 ?щ줈???湲?..');
  await wait(3000);
  
  // ??λ맂 媛??뺤씤
  console.log('?뵇 ??λ맂 媛??뺤씤...');
  const savedInputs = await page.locator('input[type="text"], input[type="url"], textarea').all();
  let savedValues = [];
  
  for (let i = 0; i < Math.min(savedInputs.length, 3); i++) {
    try {
      const input = savedInputs[i];
      const name = await input.getAttribute('name');
      const value = await input.inputValue();
      
      if (name && value) {
        savedValues.push(`${name}: "${value}"`);
      }
    } catch (error) {
      console.log(`?좑툘 媛??뺤씤 ?ㅽ뙣: ${error.message}`);
    }
  }
  
  console.log(`?뱤 ??λ맂 媛믩뱾:`);
  savedValues.forEach(value => console.log(`  - ${value}`));
  
  // ????깃났 ?щ? ?먮떒
  const hasSavedValues = savedValues.some(value => value.includes('?뚯뒪??媛?));
  
  if (hasSavedValues) {
    console.log(`?럦 [${sectionName}] ???湲곕뒫???뺤긽?곸쑝濡??묐룞??`);
  } else {
    console.log(`??[${sectionName}] ??λ맂 媛믪씠 ?먮옒?濡??뚯븘媛?);
  }
  
  // 紐⑤떖 ?リ린
  const finalCloseButton = page.locator('button:has-text("횞")').first();
  if (await finalCloseButton.count() > 0) {
    await safeClick(page, finalCloseButton, '理쒖쥌 紐⑤떖 ?リ린');
  }
  
  await wait(2000);
  
  return hasSavedValues;
}

// ?꾩껜 ?뚯뒪???ㅽ뻾
async function runCompleteTest() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 釉뚮씪?곗? 肄섏넄 濡쒓렇瑜??곕??먯뿉 異쒕젰
  page.on('console', msg => {
    const type = msg.type().toUpperCase();
    console.log(`[BROWSER ${type}]: ${msg.text()}`);
  });

  try {
    console.log('?뙋 ?섏씠吏 濡쒕뵫...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle', timeout: 60000 });
    await wait(3000);
    
    // ?뚯뒪?명븷 ?뱀뀡??    const sections = [
      { name: '?명뀛 ?뺣낫', text: '?명뀛 ?뺣낫' },
      { name: '媛앹떎 ?뺣낫', text: '媛앹떎 ?뺣낫' },
      { name: '?쒖꽕 ?뺣낫', text: '?쒖꽕 ?뺣낫' },
      { name: '?⑦궎吏', text: '?⑦궎吏' },
      { name: '異붽??붽툑', text: '異붽??붽툑' }
    ];
    
    let successCount = 0;
    
    for (const section of sections) {
      const success = await testSectionSave(page, section.name, section.text);
      if (success) successCount++;
    }
    
    console.log(`\n?렞 理쒖쥌 寃곌낵: ${successCount}/${sections.length} ?뱀뀡 ????깃났`);
    
    if (successCount === sections.length) {
      console.log('?럦 紐⑤뱺 ?뱀뀡?????湲곕뒫???뺤긽?곸쑝濡??묐룞?⑸땲??');
    } else {
      console.log('?좑툘 ?쇰? ?뱀뀡?먯꽌 ???湲곕뒫??臾몄젣媛 ?덉뒿?덈떎.');
    }
    
  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

// ?뚯뒪???ㅽ뻾
runCompleteTest().catch(console.error); 
