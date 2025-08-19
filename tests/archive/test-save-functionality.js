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

// ???湲곕뒫 ?뚯뒪??
async function testSaveFunction() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뙋 ?섏씠吏 濡쒕뵫...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await wait(3000);
    
    console.log('?뵇 ?명뀛 ?뺣낫 移대뱶 李얘린...');
    const hotelCards = await page.locator('div.cursor-pointer').all();
    
    let hotelCard = null;
    for (const card of hotelCards) {
      const text = await card.textContent();
      if (text.includes('?명뀛 ?뺣낫') || text.includes('?룧')) {
        hotelCard = card;
        console.log(`???명뀛 ?뺣낫 移대뱶 諛쒓껄: "${text}"`);
        break;
      }
    }
    
    if (!hotelCard) {
      console.log('???명뀛 ?뺣낫 移대뱶瑜?李얠쓣 ???놁쓬');
      return;
    }
    
    console.log('?룧 ?명뀛 ?뺣낫 移대뱶 ?대┃...');
    await safeClick(page, hotelCard, '?명뀛 ?뺣낫 移대뱶');
    
    console.log('??紐⑤떖 濡쒕뵫 ?湲?..');
    await wait(3000);
    
    console.log('?뱷 ?낅젰 ?꾨뱶 李얘린...');
    const nameInput = page.locator('input[name="name"]').first();
    const addressInput = page.locator('input[name="address"]').first();
    const descriptionInput = page.locator('textarea[name="description"]').first();
    
    // ?뚯뒪???곗씠???낅젰
    console.log('?뱷 ?뚯뒪???곗씠???낅젰...');
    await nameInput.fill('?뚯뒪???명뀛 ' + Date.now());
    await addressInput.fill('?쒖슱??媛뺣궓援??뚯뒪?몃줈 123');
    await descriptionInput.fill('???湲곕뒫 ?뚯뒪?몄슜 ?명뀛?낅땲??');
    
    console.log('?뮶 DB ???踰꾪듉 李얘린...');
    const saveButton = page.locator('button:has-text("?뾼截?DB ???)').first();
    
    if (await saveButton.count() > 0) {
      console.log('?뮶 DB ???踰꾪듉 ?대┃...');
      await safeClick(page, saveButton, 'DB ???踰꾪듉');
      
      console.log('??????꾨즺 ?湲?..');
      await wait(5000);
      
      // ?깃났 硫붿떆吏 ?뺤씤
      const successMessage = await page.locator('div:has-text("??λ릺?덉뒿?덈떎")').first();
      if (await successMessage.count() > 0) {
        console.log('??????깃났 硫붿떆吏 ?뺤씤??);
      } else {
        console.log('??????깃났 硫붿떆吏 ?놁쓬');
      }
    } else {
      console.log('??DB ???踰꾪듉??李얠쓣 ???놁쓬');
    }
    
    console.log('?봽 紐⑤떖 ?リ린...');
    const closeButton = page.locator('button:has-text("횞")').first();
    if (await closeButton.count() > 0) {
      await safeClick(page, closeButton, '紐⑤떖 ?リ린 踰꾪듉');
    }
    
    console.log('???좎떆 ?湲?..');
    await wait(3000);
    
    console.log('?봽 ?ㅼ떆 ?명뀛 ?뺣낫 移대뱶 ?대┃?섏뿬 媛??뺤씤...');
    await safeClick(page, hotelCard, '?명뀛 ?뺣낫 移대뱶 ?ы겢由?);
    
    console.log('??紐⑤떖 ?щ줈???湲?..');
    await wait(3000);
    
    console.log('?뵇 ??λ맂 媛??뺤씤...');
    const savedName = await nameInput.inputValue();
    const savedAddress = await addressInput.inputValue();
    const savedDescription = await descriptionInput.inputValue();
    
    console.log(`?뱤 ??λ맂 媛믩뱾:`);
    console.log(`  - ?명뀛紐? "${savedName}"`);
    console.log(`  - 二쇱냼: "${savedAddress}"`);
    console.log(`  - ?ㅻ챸: "${savedDescription}"`);
    
    if (savedName.includes('?뚯뒪???명뀛') && savedAddress.includes('?뚯뒪?몃줈')) {
      console.log('?럦 ???湲곕뒫???뺤긽?곸쑝濡??묐룞??');
    } else {
      console.log('????λ맂 媛믪씠 ?먮옒?濡??뚯븘媛?);
    }
    
  } catch (error) {
    console.error('???뚯뒪???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

// ?뚯뒪???ㅽ뻾
testSaveFunction().catch(console.error); 
