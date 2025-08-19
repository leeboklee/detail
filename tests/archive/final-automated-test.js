const { chromium } = require('playwright');
const fs = require('fs');

// ?湲??⑥닔
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 寃곌낵 ???
const results = {
    timestamp: new Date().toISOString(),
    sections: [],
    summary: { total: 0, passed: 0, failed: 0 }
};

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
        return false;
    }
}

// ?덉쟾???낅젰 ?⑥닔
async function safeInput(page, selector, value, description = '') {
    try {
        const element = page.locator(selector).first();
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await element.fill(''); // 湲곗〈 媛??대━??
        await element.fill(value);
        await wait(500);
        console.log(`??${description} ?낅젰 ?깃났: "${value}"`);
        return true;
    } catch (error) {
        console.log(`??${description} ?낅젰 ?ㅽ뙣: ${error.message}`);
        return false;
    }
}

// ?뱀뀡 ?뚯뒪???⑥닔
async function testSection(page, sectionInfo) {
    console.log(`\n?뵇 === [${sectionInfo.name}] ?뱀뀡 ?뚯뒪???쒖옉 ===`);
    
    const sectionResult = {
        name: sectionInfo.name,
        steps: [],
        inputTests: [],
        success: false,
        error: null
    };
    
    try {
        // 1. ?뱀뀡 移대뱶 李얘린 諛??대┃
        console.log(`?뵇 ${sectionInfo.name} 移대뱶 李얘린...`);
        const cards = await page.locator('div.cursor-pointer').all();
        let targetCard = null;
        
        for (const card of cards) {
            const text = await card.textContent();
            if (text.includes(sectionInfo.searchText)) {
                targetCard = card;
                console.log(`??${sectionInfo.name} 移대뱶 諛쒓껄: "${text}"`);
                break;
            }
        }
        
        if (!targetCard) {
            throw new Error(`${sectionInfo.name} 移대뱶瑜?李얠쓣 ???놁뒿?덈떎`);
        }
        
        // 移대뱶 ?대┃
        const cardClicked = await safeClick(page, targetCard, `${sectionInfo.name} 移대뱶`);
        if (!cardClicked) {
            throw new Error('移대뱶 ?대┃ ?ㅽ뙣');
        }
        
        sectionResult.steps.push({ step: '移대뱶 ?대┃', success: true });
        
        // 2. 紐⑤떖 ?대┝ ?뺤씤
        console.log(`?뵇 ${sectionInfo.name} 紐⑤떖 ?뺤씤...`);
        await page.waitForSelector('.fixed, [role="dialog"], .modal', { timeout: 10000 });
        
        const modalVisible = await page.locator('.fixed, [role="dialog"], .modal').first().isVisible();
        if (!modalVisible) {
            throw new Error('紐⑤떖???대━吏 ?딆븯?듬땲??);
        }
        
        console.log(`??${sectionInfo.name} 紐⑤떖 ?대┝ ?뺤씤`);
        sectionResult.steps.push({ step: '紐⑤떖 ?대┝', success: true });
        
        // 3. ?낅젰 ?꾨뱶 ?뚯뒪??
        if (sectionInfo.testInputs && sectionInfo.testInputs.length > 0) {
            console.log(`?륅툘 ${sectionInfo.name} ?낅젰 ?꾨뱶 ?뚯뒪??..`);
            
            for (const inputTest of sectionInfo.testInputs) {
                const inputResult = {
                    field: inputTest.label,
                    value: inputTest.value,
                    success: false,
                    error: null
                };
                
                try {
                    // ?ㅼ뼇???좏깮?먮줈 ?쒕룄
                    const selectors = [
                        inputTest.selector,
                        `input[placeholder*="${inputTest.label}"]`,
                        `input[name*="${inputTest.label.toLowerCase()}"]`,
                        `textarea[placeholder*="${inputTest.label}"]`,
                        `textarea[name*="${inputTest.label.toLowerCase()}"]`
                    ];
                    
                    let inputSuccess = false;
                    for (const selector of selectors) {
                        try {
                            const element = page.locator(selector).first();
                            if (await element.isVisible()) {
                                await element.fill(inputTest.value);
                                inputSuccess = true;
                                console.log(`  ??${inputTest.label}: "${inputTest.value}" ?낅젰 ?깃났`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (!inputSuccess) {
                        // 紐⑤뱺 visible input/textarea???쒖꽌?濡??낅젰 ?쒕룄
                        const allInputs = await page.locator('input:visible, textarea:visible').all();
                        if (allInputs.length > 0) {
                            const index = sectionInfo.testInputs.indexOf(inputTest);
                            if (index < allInputs.length) {
                                await allInputs[index].fill(inputTest.value);
                                inputSuccess = true;
                                console.log(`  ??${inputTest.label}: "${inputTest.value}" ?낅젰 ?깃났 (?몃뜳??${index})`);
                            }
                        }
                    }
                    
                    inputResult.success = inputSuccess;
                    if (!inputSuccess) {
                        inputResult.error = '?낅젰 ?꾨뱶瑜?李얠쓣 ???놁뒿?덈떎';
                        console.log(`  ?좑툘 ${inputTest.label}: ?낅젰 ?꾨뱶瑜?李얠쓣 ???놁뒿?덈떎`);
                    }
                    
                } catch (error) {
                    inputResult.error = error.message;
                    console.log(`  ??${inputTest.label}: ?낅젰 ?ㅽ뙣 - ${error.message}`);
                }
                
                sectionResult.inputTests.push(inputResult);
            }
        }
        
        // 4. ????곸슜 踰꾪듉 李얘린 諛??대┃
        console.log(`?뮶 ${sectionInfo.name} ???踰꾪듉 李얘린...`);
        const buttons = await page.locator('button').all();
        let saveButton = null;
        
        for (const button of buttons) {
            const text = await button.textContent();
            if (text && (text.includes('???) || text.includes('?곸슜') || text.includes('?뺤씤'))) {
                saveButton = button;
                console.log(`?????踰꾪듉 諛쒓껄: "${text}"`);
                break;
            }
        }
        
        if (saveButton) {
            const saveClicked = await safeClick(page, saveButton, '???踰꾪듉');
            if (saveClicked) {
                sectionResult.steps.push({ step: '???踰꾪듉 ?대┃', success: true });
                await wait(2000); // ???泥섎━ ?湲?
            }
        }
        
        // 5. 紐⑤떖 ?リ린
        console.log(`??${sectionInfo.name} 紐⑤떖 ?リ린...`);
        let modalClosed = false;
        
        // ESC ?ㅻ줈 ?リ린 ?쒕룄
        await page.keyboard.press('Escape');
        await wait(1000);
        
        // 紐⑤떖???ロ삍?붿? ?뺤씤
        const modalStillVisible = await page.locator('.fixed, [role="dialog"], .modal').first().isVisible();
        if (!modalStillVisible) {
            modalClosed = true;
            console.log(`??${sectionInfo.name} 紐⑤떖 ?リ린 ?깃났 (ESC)`);
        } else {
            // ?リ린 踰꾪듉 李얘린
            const closeButtons = await page.locator('button').all();
            for (const button of closeButtons) {
                const text = await button.textContent();
                if (text && (text.includes('횞') || text.includes('?リ린') || text.includes('痍⑥냼'))) {
                    await safeClick(page, button, '?リ린 踰꾪듉');
                    modalClosed = true;
                    break;
                }
            }
        }
        
        if (modalClosed) {
            sectionResult.steps.push({ step: '紐⑤떖 ?リ린', success: true });
        }
        
        // 6. 媛??좎? ?뺤씤 (?ㅼ떆 ?댁뼱???뺤씤)
        if (sectionInfo.testInputs && sectionInfo.testInputs.length > 0) {
            console.log(`?봽 ${sectionInfo.name} 媛??좎? ?뺤씤...`);
            await wait(2000);
            
            // ?ㅼ떆 移대뱶 ?대┃
            const cardReopenClicked = await safeClick(page, targetCard, `${sectionInfo.name} 移대뱶 ?ъ삤??);
            if (cardReopenClicked) {
                await wait(2000);
                
                // 媛??뺤씤
                let valuesPreserved = 0;
                for (const inputTest of sectionInfo.testInputs) {
                    try {
                        const allInputs = await page.locator('input:visible, textarea:visible').all();
                        const index = sectionInfo.testInputs.indexOf(inputTest);
                        if (index < allInputs.length) {
                            const currentValue = await allInputs[index].inputValue();
                            if (currentValue === inputTest.value) {
                                valuesPreserved++;
                                console.log(`  ??${inputTest.label}: 媛??좎???("${currentValue}")`);
                            } else {
                                console.log(`  ?좑툘 ${inputTest.label}: 媛?蹂寃쎈맖 ("${inputTest.value}" ??"${currentValue}")`);
                            }
                        }
                    } catch (error) {
                        console.log(`  ??${inputTest.label}: 媛??뺤씤 ?ㅽ뙣`);
                    }
                }
                
                sectionResult.steps.push({ 
                    step: '媛??좎? ?뺤씤', 
                    success: valuesPreserved > 0,
                    details: `${valuesPreserved}/${sectionInfo.testInputs.length} 媛??좎???
                });
                
                // 紐⑤떖 ?ㅼ떆 ?リ린
                await page.keyboard.press('Escape');
                await wait(1000);
            }
        }
        
        sectionResult.success = true;
        console.log(`??[${sectionInfo.name}] ?뱀뀡 ?뚯뒪???꾨즺`);
        
    } catch (error) {
        sectionResult.error = error.message;
        console.log(`??[${sectionInfo.name}] ?뱀뀡 ?뚯뒪???ㅽ뙣: ${error.message}`);
    }
    
    return sectionResult;
}

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('?? ?먮룞???뚯뒪???쒖옉...');
        
        // ?섏씠吏 濡쒕뱶
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await page.waitForLoadState('networkidle');
        await wait(3000);
        
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
        
        // ?뚯뒪?명븷 ?뱀뀡??
        const sections = [
            {
                name: '?명뀛 ?뺣낫',
                searchText: '?룧?명뀛 ?뺣낫',
                testInputs: [
                    { selector: 'input[name="hotelName"]', value: '?뚯뒪???명뀛', label: '?명뀛紐? },
                    { selector: 'input[name="address"]', value: '?쒖슱??媛뺣궓援?, label: '二쇱냼' },
                    { selector: 'textarea[name="description"]', value: '?뚯뒪???명뀛 ?ㅻ챸', label: '?명뀛 ?ㅻ챸' }
                ]
            },
            {
                name: '媛앹떎 ?뺣낫',
                searchText: '?뫁媛앹떎 ?뺣낫',
                testInputs: [
                    { selector: 'input[name="roomName"]', value: '?붾윮???몄쐢猷?, label: '媛앹떎紐? },
                    { selector: 'input[name="roomType"]', value: '?붾툝踰좊뱶', label: '媛앹떎??? },
                    { selector: 'input[name="roomSize"]', value: '35??, label: '援ъ“' },
                    { selector: 'input[name="bedType"]', value: '?뱀궗?댁쫰 踰좊뱶', label: '移⑤???? },
                    { selector: 'input[name="roomView"]', value: 'City View', label: '?꾨쭩' }
                ]
            },
            {
                name: '?쒖꽕 ?뺣낫',
                searchText: '?숋툘?쒖꽕 ?뺣낫',
                testInputs: [
                    { selector: 'textarea[name="facilities"]', value: '?섏쁺?? ?쇳듃?덉뒪?쇳꽣, ?ㅽ뙆', label: '?쒖꽕 ?뺣낫' }
                ]
            },
            {
                name: '?⑦궎吏',
                searchText: '?뱞?⑦궎吏',
                testInputs: [
                    { selector: 'input[name="packageName"]', value: '?덈땲臾??⑦궎吏', label: '?⑦궎吏紐? },
                    { selector: 'textarea[name="packageDesc"]', value: '?좏샎遺遺 ?꾩슜 ?⑦궎吏', label: '?⑦궎吏 ?ㅻ챸' }
                ]
            },
            {
                name: '異붽??붽툑',
                searchText: '?뮥異붽??붽툑',
                testInputs: [
                    { selector: 'input[name="additionalFee"]', value: '50000', label: '異붽??붽툑' },
                    { selector: 'textarea[name="feeDescription"]', value: '?묒뒪?몃씪 踰좊뱶 ?붽툑', label: '?붽툑 ?ㅻ챸' }
                ]
            }
        ];
        
        // 媛??뱀뀡 ?뚯뒪???ㅽ뻾
        for (const section of sections) {
            const sectionResult = await testSection(page, section);
            results.sections.push(sectionResult);
            results.summary.total++;
            
            if (sectionResult.success) {
                results.summary.passed++;
            } else {
                results.summary.failed++;
            }
            
            // ?뱀뀡 媛??湲?
            await wait(2000);
        }
        
        // 理쒖쥌 寃곌낵 異쒕젰
        console.log('\n?뱤 === ?먮룞???뚯뒪??理쒖쥌 寃곌낵 ===');
        console.log(`珥??뱀뀡: ${results.summary.total}`);
        console.log(`?깃났: ${results.summary.passed}`);
        console.log(`?ㅽ뙣: ${results.summary.failed}`);
        console.log(`?깃났瑜? ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
        
        // ?곸꽭 寃곌낵
        console.log('\n?뱥 === ?곸꽭 寃곌낵 ===');
        for (const section of results.sections) {
            console.log(`\n[${section.name}] ${section.success ? '???깃났' : '???ㅽ뙣'}`);
            if (section.error) {
                console.log(`  ?ㅻ쪟: ${section.error}`);
            }
            
            if (section.inputTests.length > 0) {
                const successInputs = section.inputTests.filter(t => t.success).length;
                console.log(`  ?낅젰 ?뚯뒪?? ${successInputs}/${section.inputTests.length} ?깃났`);
            }
            
            console.log(`  ?꾨즺???④퀎: ${section.steps.filter(s => s.success).length}/${section.steps.length}`);
        }
        
        // 寃곌낵 ?뚯씪 ???
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultFile = `test-results/automated-test-${timestamp}.json`;
        fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
        console.log(`\n?뮶 寃곌낵 ??? ${resultFile}`);
        
    } catch (error) {
        console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
    } finally {
        await browser.close();
    }
})(); 
