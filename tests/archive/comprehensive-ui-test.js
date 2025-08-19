const { chromium } = require('playwright');

async function comprehensiveTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox'],
    slowMo: 500 // ?숈옉??泥쒖쿇???댁꽌 ?쒓컖?곸쑝濡??뺤씤
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('?? ?섏씠吏 ?묒냽 以?..');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    console.log('?벜 珥덇린 ?섏씠吏 ?ㅽ겕由곗꺑...');
    await page.screenshot({ path: 'test-01-initial.png' });
    
    // ?뱀뀡 移대뱶???뺤씤
    console.log('?뵇 ?뱀뀡 移대뱶??李얘린...');
    const sectionCards = await page.locator('[data-testid^="section-card-"]').count();
    console.log(`??諛쒓껄???뱀뀡 移대뱶: ${sectionCards}媛?);
    
    if (sectionCards === 0) {
      throw new Error('?뱀뀡 移대뱶瑜?李얠쓣 ???놁뒿?덈떎');
    }
    
    // 媛??뱀뀡 ?뚯뒪??
    const sectionsToTest = ['hotel', 'rooms', 'facilities', 'packages', 'charges'];
    
    for (let i = 0; i < sectionsToTest.length; i++) {
      const section = sectionsToTest[i];
      console.log(`\n?뱥 [${i+1}/${sectionsToTest.length}] ${section} ?뱀뀡 ?뚯뒪???쒖옉...`);
      
      // ?뱀뀡 移대뱶 ?대┃
      console.log(`?뼮截?${section} ?뱀뀡 ?대┃...`);
      await page.locator(`[data-testid="section-card-${section}"]`).click();
      
      // 紐⑤떖 ?湲?
      console.log('??紐⑤떖 ?湲?..');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // 紐⑤떖 ?ㅽ겕由곗꺑
      console.log('?벜 紐⑤떖 ?ㅽ겕由곗꺑...');
      await page.screenshot({ path: `test-02-${section}-modal.png` });
      
      // ?곸슜?섍퀬 ?リ린 踰꾪듉 李얘린 諛??대┃
      console.log('?뵖 ?곸슜?섍퀬 ?リ린 踰꾪듉 李얘린...');
      const applyButton = page.locator('button:has-text("?곸슜?섍퀬 ?リ린")');
      await applyButton.waitFor({ timeout: 3000 });
      await applyButton.click();
      
      // 紐⑤떖???ロ옄 ?뚭퉴吏 ?湲?
      console.log('??紐⑤떖 ?ロ옒 ?湲?..');
      await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 3000 });
      
      console.log(`??${section} ?뱀뀡 ?뚯뒪???꾨즺`);
      
      // 媛??뱀뀡 ?뚯뒪???ъ씠???좎떆 ?湲?
      await page.waitForTimeout(1000);
    }
    
    // ?꾩껜 ???踰꾪듉 ?뚯뒪??
    console.log('\n?뮶 ?꾩껜 ???湲곕뒫 ?뚯뒪??..');
    await page.screenshot({ path: 'test-03-before-save.png' });
    
    const saveButton = page.locator('button:has-text("?꾩껜 ???)');
    await saveButton.waitFor({ timeout: 3000 });
    await saveButton.click();
    
    console.log('??????꾨즺 ?湲?..');
    // ?깃났 硫붿떆吏 ?湲?(5珥??댁뿉 ?섑??섏빞 ??
    try {
      await page.waitForSelector('div:has-text("??λ릺?덉뒿?덈떎")', { timeout: 8000 });
      console.log('??????깃났 硫붿떆吏 ?뺤씤??);
    } catch (e) {
      console.log('?좑툘 ???硫붿떆吏瑜?李얠쓣 ???놁쓬, ?섏?留?怨꾩냽 吏꾪뻾...');
    }
    
    await page.screenshot({ path: 'test-04-after-save.png' });
    
    console.log('\n?럦 紐⑤뱺 ?뚯뒪???꾨즺!');
    console.log('?뱚 ?앹꽦???ㅽ겕由곗꺑:');
    console.log('  - test-01-initial.png: 珥덇린 ?섏씠吏');
    console.log('  - test-02-{section}-modal.png: 媛??뱀뀡 紐⑤떖');
    console.log('  - test-03-before-save.png: ?????);
    console.log('  - test-04-after-save.png: ?????);
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error.message);
    await page.screenshot({ path: 'test-error.png' });
    console.log('?벜 ?먮윭 ?ㅽ겕由곗꺑 ??? test-error.png');
  } finally {
    await browser.close();
  }
}

comprehensiveTest(); 
