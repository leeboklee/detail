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

// ????뺤씤 ?⑥닔
async function testSavePersistence(page, sectionName, testData) {
    console.log(`\n?뵇 === [${sectionName}] ???吏?띿꽦 ?뚯뒪??===`);
    
    try {
        // 1. ?뱀뀡 移대뱶 李얘린
        const cards = await page.locator('div.cursor-pointer').all();
        let targetCard = null;
        
        for (const card of cards) {
            const text = await card.textContent();
            if (text.includes(sectionName)) {
                targetCard = card;
                console.log(`??${sectionName} 移대뱶 諛쒓껄: "${text}"`);
                break;
            }
        }
        
        if (!targetCard) {
            console.log(`??${sectionName} 移대뱶瑜?李얠쓣 ???놁뒿?덈떎`);
            return false;
        }
        
        // 2. 泥?踰덉㎏ 紐⑤떖 ?닿린
        await safeClick(page, targetCard, `${sectionName} 移대뱶 泥?踰덉㎏ ?닿린`);
        await wait(2000);
        
        // 3. ?낅젰 ?꾨뱶 李얘린 諛??섏젙
        const inputs = await page.locator('input:visible').all();
        const textareas = await page.locator('textarea:visible').all();
        
        console.log(`?뱷 ${sectionName} ?꾨뱶 ?섏젙 ?쒖옉...`);
        
        // 泥?踰덉㎏ ?낅젰 ?꾨뱶???뚯뒪??媛??낅젰
        if (inputs.length > 0) {
            const firstInput = inputs[0];
            const originalValue = await firstInput.inputValue();
            console.log(`?먮옒 媛? "${originalValue}"`);
            
            await firstInput.fill(testData.value);
            await wait(1000);
            
            const newValue = await firstInput.inputValue();
            console.log(`?섏젙??媛? "${newValue}"`);
            
            // 4. ???踰꾪듉 ?대┃
            console.log(`?뮶 ${sectionName} ???踰꾪듉 ?대┃...`);
            const saveButtons = await page.locator('button').all();
            
            for (const button of saveButtons) {
                const text = await button.textContent();
                if (text && (text.includes('???) || text.includes('DB ???) || text.includes('?곸슜'))) {
                    console.log(`?????踰꾪듉 諛쒓껄: "${text}"`);
                    await safeClick(page, button, '???踰꾪듉');
                    await wait(3000); // ????꾨즺 ?湲?
                    break;
                }
            }
            
            // 5. 紐⑤떖 ?リ린
            console.log(`??${sectionName} 紐⑤떖 ?リ린...`);
            await page.keyboard.press('Escape');
            await wait(2000);
            
            // 6. ?ㅼ떆 紐⑤떖 ?닿린
            console.log(`?봽 ${sectionName} ?ㅼ떆 ?닿린...`);
            await safeClick(page, targetCard, `${sectionName} 移대뱶 ?ъ삤??);
            await wait(2000);
            
            // 7. 媛??뺤씤
            const reopenedInputs = await page.locator('input:visible').all();
            if (reopenedInputs.length > 0) {
                const savedValue = await reopenedInputs[0].inputValue();
                console.log(`?ъ삤????媛? "${savedValue}"`);
                
                if (savedValue === testData.value) {
                    console.log(`??${sectionName} 媛믪씠 ?뺤긽?곸쑝濡???λ릺?덉뒿?덈떎!`);
                    
                    // 紐⑤떖 ?リ린
                    await page.keyboard.press('Escape');
                    await wait(1000);
                    
                    return true;
                } else {
                    console.log(`??${sectionName} 媛믪씠 ??λ릺吏 ?딆븯?듬땲?? ?먮옒 媛믪쑝濡??뚯븘媛붿뒿?덈떎.`);
                    console.log(`  湲곕?媛? "${testData.value}"`);
                    console.log(`  ?ㅼ젣媛? "${savedValue}"`);
                    
                    // 紐⑤떖 ?リ린
                    await page.keyboard.press('Escape');
                    await wait(1000);
                    
                    return false;
                }
            }
        }
        
        return false;
        
    } catch (error) {
        console.log(`??${sectionName} ?뚯뒪??以??ㅻ쪟: ${error.message}`);
        return false;
    }
}

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('?? === ???吏?띿꽦 ?뚯뒪???쒖옉 ===');
        
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await page.waitForLoadState('networkidle');
        await wait(3000);
        
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
        
        // ?ㅽ듃?뚰겕 ?붿껌 紐⑤땲?곕쭅
        const requests = [];
        page.on('request', request => {
            if (request.url().includes('/api/') && (request.method() === 'PUT' || request.method() === 'POST')) {
                requests.push({
                    method: request.method(),
                    url: request.url(),
                    timestamp: new Date().toISOString()
                });
                console.log(`?뱻 API ?붿껌: ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('/api/') && (response.request().method() === 'PUT' || response.request().method() === 'POST')) {
                console.log(`?뱻 API ?묐떟: ${response.status()} ${response.url()}`);
            }
        });
        
        // ?뚯뒪?명븷 ?뱀뀡?ㅺ낵 ?뚯뒪???곗씠??
        const testSections = [
            { 
                name: '?명뀛 ?뺣낫', 
                data: { value: '?뚯뒪???명뀛 ?섏젙??, label: '?명뀛紐? }
            },
            { 
                name: '媛앹떎 ?뺣낫', 
                data: { value: '?뚯뒪??媛앹떎 ?섏젙??, label: '媛앹떎紐? }
            },
            { 
                name: '?쒖꽕 ?뺣낫', 
                data: { value: '?뚯뒪???쒖꽕 ?섏젙??, label: '?쒖꽕紐? }
            }
        ];
        
        const results = [];
        
        // 媛??뱀뀡 ?뚯뒪??
        for (const section of testSections) {
            const result = await testSavePersistence(page, section.name, section.data);
            results.push({
                section: section.name,
                success: result,
                data: section.data
            });
            
            await wait(2000);
        }
        
        // 理쒖쥌 寃곌낵 異쒕젰
        console.log('\n?뱤 === ???吏?띿꽦 ?뚯뒪??寃곌낵 ===');
        
        let successCount = 0;
        for (const result of results) {
            if (result.success) {
                console.log(`??${result.section}: ????깃났`);
                successCount++;
            } else {
                console.log(`??${result.section}: ????ㅽ뙣`);
            }
        }
        
        console.log(`\n?렞 珥?${results.length}媛??뱀뀡 以?${successCount}媛??깃났 (${((successCount / results.length) * 100).toFixed(1)}%)`);
        
        // API ?붿껌 遺꾩꽍
        console.log('\n?뱻 === API ?붿껌 遺꾩꽍 ===');
        if (requests.length > 0) {
            console.log(`珥?${requests.length}媛쒖쓽 ????붿껌??諛쒖깮?덉뒿?덈떎:`);
            for (const req of requests) {
                console.log(`  ${req.method} ${req.url} - ${req.timestamp}`);
            }
        } else {
            console.log('??????붿껌???꾪? 諛쒖깮?섏? ?딆븯?듬땲??');
            console.log('?뮕 ?닿쾬??媛믪씠 ??λ릺吏 ?딅뒗 ?먯씤?낅땲??');
        }
        
        if (successCount === 0) {
            console.log('\n?뵩 === 臾몄젣 吏꾨떒 ===');
            console.log('??紐⑤뱺 ?뱀뀡?먯꽌 ??μ씠 ?ㅽ뙣?덉뒿?덈떎.');
            console.log('?뮕 媛?ν븳 ?먯씤:');
            console.log('   1. ???踰꾪듉???ㅼ젣濡?API瑜??몄텧?섏? ?딆쓬');
            console.log('   2. ?꾨줎?몄뿏?쒖뿉??諛깆뿏?쒕줈 ?곗씠?곕? ?꾩넚?섏? ?딆쓬');
            console.log('   3. ?먮룞???湲곕뒫??鍮꾪솢?깊솕??);
            console.log('   4. ???濡쒖쭅??踰꾧렇媛 ?덉쓬');
        }
        
    } catch (error) {
        console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
    } finally {
        await browser.close();
    }
})(); 
