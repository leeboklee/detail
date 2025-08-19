const { chromium } = require('playwright');

async function comprehensiveFinalTest() {
  console.log('?? 理쒖쥌 ?듯빀 ?뚯뒪???쒖옉...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 300 
  });
  
  try {
    const context = await browser.newContext({
      locale: 'ko-KR',
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 肄섏넄 濡쒓렇 ?섏쭛
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('SimpleInput') || text.includes('debounced') || text.includes('議고빀') || text.includes('?ъ빱??)) {
        logs.push(text);
      }
    });
    
    // ?섏씠吏 濡쒕뱶
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    
    // 媛앹떎 ?뺣낫 移대뱶 ?대┃
    console.log('?룧 媛앹떎 ?뺣낫 移대뱶 ?대┃...');
    await page.locator('text=媛앹떎 ?뺣낫').click();
    
    // 紐⑤떖 ?湲?
    console.log('??紐⑤떖 ?湲?..');
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // ?낅젰 ?꾨뱶 ?뺤씤
    const inputs = await page.locator('input[type="text"]').all();
    console.log(`?뱷 ?낅젰 ?꾨뱶 ${inputs.length}媛?諛쒓껄`);
    
    // ?뚯뒪??耳?댁뒪??
    const testCases = [
      { field: 0, value: '?붾윮???몄쐢猷?, description: '泥?踰덉㎏ ?꾨뱶 - ?쒓? ?낅젰' },
      { field: 1, value: '?붾툝踰좊뱶', description: '??踰덉㎏ ?꾨뱶 - ?쒓? ?낅젰' },
      { field: 2, value: '35??, description: '??踰덉㎏ ?꾨뱶 - ?쒓?+?レ옄 ?낅젰' },
      { field: 3, value: '?뱀궗?댁쫰 踰좊뱶', description: '??踰덉㎏ ?꾨뱶 - ?쒓? ?낅젰' },
      { field: 4, value: 'City View', description: '?ㅼ꽢 踰덉㎏ ?꾨뱶 - ?곷Ц ?낅젰' }
    ];
    
    const results = [];
    
    // 媛??뚯뒪??耳?댁뒪 ?ㅽ뻾
    for (const testCase of testCases) {
      if (testCase.field < inputs.length) {
        console.log(`\\n?㎦ ?뚯뒪?? ${testCase.description}`);
        
        const input = inputs[testCase.field];
        
        // ?ъ빱??諛??대━??
        await input.focus();
        await input.fill('');
        
        // ?낅젰 ?쒖옉 ?쒓컙 湲곕줉
        const startTime = Date.now();
        
        // ?쒓? ?낅젰
        await input.type(testCase.value, { delay: 100 });
        
        // ?좎떆 ?湲?
        await page.waitForTimeout(1000);
        
        // 寃곌낵 ?뺤씤
        const actualValue = await input.inputValue();
        const duration = Date.now() - startTime;
        
        const success = actualValue === testCase.value;
        const result = {
          field: testCase.field,
          description: testCase.description,
          expected: testCase.value,
          actual: actualValue,
          success,
          duration
        };
        
        results.push(result);
        
        console.log(`${success ? '?? : '??} 寃곌낵: "${actualValue}" (${duration}ms)`);
      }
    }
    
    // 寃곌낵 ?붿빟
    console.log('\\n?뱤 ?뚯뒪??寃곌낵 ?붿빟:');
    console.log('=' .repeat(50));
    
    let successCount = 0;
    results.forEach((result, index) => {
      const status = result.success ? '???깃났' : '???ㅽ뙣';
      console.log(`${index + 1}. ${result.description}: ${status}`);
      if (!result.success) {
        console.log(`   ?덉긽: "${result.expected}", ?ㅼ젣: "${result.actual}"`);
      }
      if (result.success) successCount++;
    });
    
    console.log('=' .repeat(50));
    console.log(`珥?${results.length}媛??뚯뒪??以?${successCount}媛??깃났 (${Math.round(successCount/results.length*100)}%)`);
    
    // ?깅뒫 遺꾩꽍
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`?됯퇏 ?낅젰 ?쒓컙: ${Math.round(avgDuration)}ms`);
    
    // 濡쒓렇 遺꾩꽍
    const focusProtectionCount = logs.filter(log => log.includes('?ъ빱??以묒씠誘濡??숆린??李⑤떒')).length;
    const debounceCount = logs.filter(log => log.includes('debounced onChange ?ㅽ뻾')).length;
    
    console.log(`\\n?뵇 濡쒓렇 遺꾩꽍:`);
    console.log(`- ?ъ빱??蹂댄샇 ?숈옉: ${focusProtectionCount}??);
    console.log(`- Debounce ?ㅽ뻾: ${debounceCount}??);
    
    // ?ㅽ겕由곗꺑 ???
    await page.screenshot({ path: 'comprehensive-final-test-result.png' });
    console.log('?벝 理쒖쥌 ?ㅽ겕由곗꺑 ??λ맖');
    
    // ?섎룞 ?뺤씤???꾪빐 ?좎떆 ?湲?
    console.log('\\n??10珥??湲?以?.. (?섎룞 ?뺤씤 媛??');
    await page.waitForTimeout(10000);
    
    return results;
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뙣:', error);
    return [];
  } finally {
    await browser.close();
    console.log('?뢾 ?뚯뒪???꾨즺');
  }
}

// ?뚯뒪???ㅽ뻾
comprehensiveFinalTest()
  .then(results => {
    console.log('\\n?렞 理쒖쥌 寃곌낵:', results.length > 0 ? '?뚯뒪???꾨즺' : '?뚯뒪???ㅽ뙣');
  })
  .catch(console.error); 
