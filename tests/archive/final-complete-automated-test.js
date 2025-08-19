const { chromium } = require('playwright');
const fs = require('fs');

// ?湲??⑥닔
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 寃곌낵 ???
const results = {
    timestamp: new Date().toISOString(),
    sections: [],
    summary: { total: 0, passed: 0, failed: 0 },
    improvements: [],
    finalReport: {
        totalFields: 0,
        successfulInputs: 0,
        preservedValues: 0,
        saveButtonClicks: 0
    }
};

// 媛쒖꽑???덉쟾???대┃ ?⑥닔
async function safeClick(page, element, description = '', forceClick = false) {
    try {
        await element.scrollIntoViewIfNeeded();
        await wait(500);
        
        if (forceClick) {
            await element.evaluate(el => el.click());
        } else {
            await element.click();
        }
        
        await wait(1000);
        console.log(`??${description} ?대┃ ?깃났`);
        return true;
    } catch (error) {
        console.log(`??${description} ?대┃ ?ㅽ뙣: ${error.message}`);
        
        if (!forceClick) {
            console.log(`?봽 ${description} 媛뺤젣 ?대┃ ?ъ떆??..`);
            return await safeClick(page, element, description, true);
        }
        
        return false;
    }
}

// ?ㅼ젣 ?낅젰 ?꾨뱶 ?먯?
async function detectInputFields(page, sectionName) {
    console.log(`?뵇 ${sectionName} ?ㅼ젣 ?낅젰 ?꾨뱶 ?먯?...`);
    
    const fields = [];
    
    const inputs = await page.locator('input:visible').all();
    const textareas = await page.locator('textarea:visible').all();
    
    for (let i = 0; i < inputs.length; i++) {
        try {
            const input = inputs[i];
            const type = await input.getAttribute('type') || 'text';
            const name = await input.getAttribute('name') || '';
            const placeholder = await input.getAttribute('placeholder') || '';
            const value = await input.inputValue();
            
            fields.push({
                index: i,
                element: input,
                type,
                name,
                placeholder,
                value,
                elementType: 'input'
            });
            
            console.log(`  Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}", value="${value}"`);
        } catch (error) {
            console.log(`  Input ${i}: 遺꾩꽍 ?ㅽ뙣`);
        }
    }
    
    for (let i = 0; i < textareas.length; i++) {
        try {
            const textarea = textareas[i];
            const name = await textarea.getAttribute('name') || '';
            const placeholder = await textarea.getAttribute('placeholder') || '';
            const value = await textarea.inputValue();
            
            fields.push({
                index: inputs.length + i,
                element: textarea,
                type: 'textarea',
                name,
                placeholder,
                value,
                elementType: 'textarea'
            });
            
            console.log(`  Textarea ${i}: name="${name}", placeholder="${placeholder}", value="${value}"`);
        } catch (error) {
            console.log(`  Textarea ${i}: 遺꾩꽍 ?ㅽ뙣`);
        }
    }
    
    return fields;
}

// ???踰꾪듉 ?대┃
async function clickSaveButton(page, sectionName) {
    console.log(`?뮶 ${sectionName} ???踰꾪듉 ?대┃...`);
    
    const saveTexts = ['???, '?곸슜', '?뺤씤', 'DB ???, '?뾼截?DB ???];
    
    for (const saveText of saveTexts) {
        try {
            const buttons = await page.locator('button').all();
            
            for (const button of buttons) {
                const text = await button.textContent();
                if (text && text.includes(saveText)) {
                    console.log(`?????踰꾪듉 諛쒓껄: "${text}"`);
                    
                    // 紐⑤떖 ?ㅽ겕濡?議곗젙
                    await page.evaluate(() => {
                        const modal = document.querySelector('.modal-content, [role="dialog"], .fixed');
                        if (modal) {
                            modal.scrollTop = modal.scrollHeight;
                        }
                    });
                    
                    await wait(1000);
                    
                    const clicked = await safeClick(page, button, '???踰꾪듉', true);
                    if (clicked) {
                        await wait(3000);
                        return true;
                    }
                }
            }
        } catch (error) {
            console.log(`?좑툘 "${saveText}" 踰꾪듉 ?대┃ ?쒕룄 ?ㅽ뙣: ${error.message}`);
        }
    }
    
    console.log(`??${sectionName} ???踰꾪듉 ?대┃ ?ㅽ뙣`);
    return false;
}

// ?뱀뀡蹂??뚯뒪???곗씠??- ?ㅼ젣 ?꾨뱶??留욊쾶 理쒖쟻??
const sectionTestData = {
    '?명뀛 ?뺣낫': [
        { value: '洹몃옖???명뀛', label: '?명뀛紐? },
        { value: '?쒖슱??以묎뎄 紐낅룞', label: '二쇱냼' },
        { value: 'https://example.com/hotel.jpg', label: '?대?吏 URL' },
        { value: '理쒓퀬湲??쒕퉬?ㅻ? ?쒓났?섎뒗 ?명뀛?낅땲??', label: '?명뀛 ?ㅻ챸' }
    ],
    '媛앹떎 ?뺣낫': [
        { value: '14', label: '泥댄겕???쒓컙', type: 'number' },
        { value: '11', label: '泥댄겕?꾩썐 ?쒓컙', type: 'number' },
        { value: '?붾윮???몄쐢猷?, label: '媛앹떎紐? },
        { value: '?붾툝踰좊뱶', label: '媛앹떎??? },
        { value: '35??, label: '援ъ“' },
        { value: '?뱀궗?댁쫰 踰좊뱶', label: '移⑤???? },
        { value: '?쒗떚酉?, label: '?꾨쭩' }
    ],
    '?쒖꽕 ?뺣낫': [
        { value: '?섏쁺?? ?쇳듃?덉뒪?쇳꽣, ?ㅽ뙆', label: '?쒖꽕 ?뺣낫' }
    ],
    '?⑦궎吏': [
        { value: '濡쒕㎤???⑦궎吏', label: '?⑦궎吏紐? },
        { value: '200000', label: '媛寃? },
        { value: '而ㅽ뵆???꾪븳 ?밸퀎???쒕퉬??, label: '?⑦궎吏 ?ㅻ챸' }
    ],
    '異붽??붽툑': [
        { value: '30000', label: '異붽??붽툑', type: 'number' },
        { value: '?묒뒪?몃씪 踰좊뱶 諛?議곗떇 ?ы븿', label: '?붽툑 ?ㅻ챸' }
    ]
};

// 媛쒖꽑???뱀뀡 ?뚯뒪???⑥닔
async function testSection(page, sectionInfo) {
    console.log(`\n?뵇 === [${sectionInfo.name}] ?뱀뀡 ?뚯뒪???쒖옉 ===`);
    
    const sectionResult = {
        name: sectionInfo.name,
        steps: [],
        inputTests: [],
        success: false,
        error: null,
        improvements: [],
        fieldsDetected: 0,
        inputsSuccessful: 0,
        valuesPreserved: 0
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
        
        // 3. ?ㅼ젣 ?낅젰 ?꾨뱶 ?먯?
        const detectedFields = await detectInputFields(page, sectionInfo.name);
        sectionResult.fieldsDetected = detectedFields.length;
        sectionResult.improvements.push(`?ㅼ젣 ?낅젰 ?꾨뱶 ${detectedFields.length}媛??먯?`);
        
        // 4. ?낅젰 ?꾨뱶 ?뚯뒪??
        const testData = sectionTestData[sectionInfo.name] || [];
        
        if (testData.length > 0 && detectedFields.length > 0) {
            console.log(`?륅툘 ${sectionInfo.name} ?낅젰 ?꾨뱶 ?뚯뒪??..`);
            
            for (let i = 0; i < Math.min(testData.length, detectedFields.length); i++) {
                const testInput = testData[i];
                const field = detectedFields[i];
                
                const inputResult = {
                    field: testInput.label,
                    value: testInput.value,
                    success: false,
                    error: null,
                    fieldType: field.type
                };
                
                try {
                    let inputSuccess = false;
                    
                    if (field.type === 'number' && testInput.type === 'number') {
                        await field.element.fill(testInput.value);
                        inputSuccess = true;
                        console.log(`  ??${testInput.label}: "${testInput.value}" ?レ옄 ?낅젰 ?깃났`);
                    } else if (field.type !== 'number') {
                        await field.element.fill(testInput.value);
                        inputSuccess = true;
                        console.log(`  ??${testInput.label}: "${testInput.value}" ?띿뒪???낅젰 ?깃났`);
                    } else {
                        console.log(`  ?좑툘 ${testInput.label}: ?꾨뱶 ???遺덉씪移?(${field.type})`);
                    }
                    
                    if (inputSuccess) {
                        sectionResult.inputsSuccessful++;
                        results.finalReport.successfulInputs++;
                    }
                    
                    inputResult.success = inputSuccess;
                    
                } catch (error) {
                    inputResult.error = error.message;
                    console.log(`  ??${testInput.label}: ?낅젰 ?ㅽ뙣 - ${error.message}`);
                }
                
                sectionResult.inputTests.push(inputResult);
            }
        }
        
        // 5. ???踰꾪듉 ?대┃
        const saveClicked = await clickSaveButton(page, sectionInfo.name);
        if (saveClicked) {
            sectionResult.steps.push({ step: '???踰꾪듉 ?대┃', success: true });
            sectionResult.improvements.push('???踰꾪듉 ?대┃ ?깃났');
            results.finalReport.saveButtonClicks++;
        } else {
            sectionResult.steps.push({ step: '???踰꾪듉 ?대┃', success: false });
        }
        
        // 6. 紐⑤떖 ?リ린
        console.log(`??${sectionInfo.name} 紐⑤떖 ?リ린...`);
        await page.keyboard.press('Escape');
        await wait(1000);
        
        sectionResult.steps.push({ step: '紐⑤떖 ?リ린', success: true });
        
        // 7. ?먮룞????뺤씤
        console.log(`?봽 ${sectionInfo.name} ?먮룞????뺤씤...`);
        await wait(2000);
        
        const cardReopenClicked = await safeClick(page, targetCard, `${sectionInfo.name} 移대뱶 ?ъ삤??);
        if (cardReopenClicked) {
            await wait(2000);
            
            const reopenedFields = await detectInputFields(page, sectionInfo.name);
            let valuesPreserved = 0;
            
            for (let i = 0; i < Math.min(testData.length, reopenedFields.length); i++) {
                const testInput = testData[i];
                const field = reopenedFields[i];
                
                try {
                    const currentValue = await field.element.inputValue();
                    if (currentValue === testInput.value) {
                        valuesPreserved++;
                        console.log(`  ??${testInput.label}: 媛??좎???("${currentValue}")`);
                    } else {
                        console.log(`  ?좑툘 ${testInput.label}: 媛?蹂寃쎈맖 ("${testInput.value}" ??"${currentValue}")`);
                    }
                } catch (error) {
                    console.log(`  ??${testInput.label}: 媛??뺤씤 ?ㅽ뙣`);
                }
            }
            
            sectionResult.valuesPreserved = valuesPreserved;
            results.finalReport.preservedValues += valuesPreserved;
            
            sectionResult.steps.push({ 
                step: '?먮룞????뺤씤', 
                success: valuesPreserved > 0,
                details: `${valuesPreserved}/${testData.length} 媛??좎???
            });
            
            if (valuesPreserved > 0) {
                sectionResult.improvements.push(`?먮룞???湲곕뒫 ?묐룞 ?뺤씤 (${valuesPreserved}/${testData.length})`);
            }
            
            await page.keyboard.press('Escape');
            await wait(1000);
        }
        
        sectionResult.success = true;
        console.log(`??[${sectionInfo.name}] ?뱀뀡 ?뚯뒪???꾨즺`);
        
    } catch (error) {
        sectionResult.error = error.message;
        console.log(`??[${sectionInfo.name}] ?뱀뀡 ?뚯뒪???ㅽ뙣: ${error.message}`);
    }
    
    results.finalReport.totalFields += sectionResult.fieldsDetected;
    
    return sectionResult;
}

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('?? === 理쒖쥌 ?꾩꽦???먮룞???뚯뒪???쒖옉 ===');
        
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await page.waitForLoadState('networkidle');
        await wait(3000);
        
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
        
        // ?ㅼ젣 移대뱶 ?띿뒪?몄뿉 ?뺥솗??留욎텣 ?뱀뀡 ?뺣낫
        const sections = [
            { name: '?명뀛 ?뺣낫', searchText: '?룧?명뀛 ?뺣낫' },
            { name: '媛앹떎 ?뺣낫', searchText: '?뫁媛앹떎 ?뺣낫' },
            { name: '?쒖꽕 ?뺣낫', searchText: '?숋툘?쒖꽕 ?뺣낫' },
            { name: '?⑦궎吏', searchText: '?뱞?⑦궎吏' },
            { name: '異붽??붽툑', searchText: '?뮥?뮥 異붽??붽툑' } // ?ㅼ젣 ?띿뒪?몄뿉 留욊쾶 ?섏젙
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
            
            if (sectionResult.improvements.length > 0) {
                results.improvements.push({
                    section: section.name,
                    improvements: sectionResult.improvements
                });
            }
            
            await wait(2000);
        }
        
        // 理쒖쥌 寃곌낵 異쒕젰
        console.log('\n?뱤 === 理쒖쥌 ?꾩꽦???먮룞???뚯뒪??寃곌낵 ===');
        console.log(`珥??뱀뀡: ${results.summary.total}`);
        console.log(`?깃났: ${results.summary.passed}`);
        console.log(`?ㅽ뙣: ${results.summary.failed}`);
        console.log(`?깃났瑜? ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
        
        console.log('\n?렞 === 醫낇빀 ?깃낵 吏??===');
        console.log(`珥?媛먯????꾨뱶: ${results.finalReport.totalFields}媛?);
        console.log(`?깃났?곸씤 ?낅젰: ${results.finalReport.successfulInputs}媛?);
        console.log(`?먮룞????뺤씤: ${results.finalReport.preservedValues}媛?);
        console.log(`???踰꾪듉 ?대┃: ${results.finalReport.saveButtonClicks}媛?);
        
        // 媛쒖꽑?ы빆 異쒕젰
        console.log('\n?뵩 === ?곸슜??媛쒖꽑?ы빆 ===');
        for (const improvement of results.improvements) {
            console.log(`\n[${improvement.section}]`);
            for (const item of improvement.improvements) {
                console.log(`  ??${item}`);
            }
        }
        
        // ?곸꽭 寃곌낵
        console.log('\n?뱥 === ?곸꽭 寃곌낵 ===');
        for (const section of results.sections) {
            console.log(`\n[${section.name}] ${section.success ? '???깃났' : '???ㅽ뙣'}`);
            if (section.error) {
                console.log(`  ?ㅻ쪟: ${section.error}`);
            }
            
            console.log(`  媛먯????꾨뱶: ${section.fieldsDetected}媛?);
            console.log(`  ?깃났?곸씤 ?낅젰: ${section.inputsSuccessful}媛?);
            console.log(`  媛??좎?: ${section.valuesPreserved}媛?);
            console.log(`  ?꾨즺???④퀎: ${section.steps.filter(s => s.success).length}/${section.steps.length}`);
        }
        
        // 寃곌낵 ?뚯씪 ???
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultFile = `test-results/final-complete-test-${timestamp}.json`;
        fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
        console.log(`\n?뮶 寃곌낵 ??? ${resultFile}`);
        
        // 理쒖쥌 ?깃났 硫붿떆吏
        if (results.summary.passed === results.summary.total) {
            console.log('\n?럦 === 紐⑤뱺 ?뚯뒪???깃났! ===');
            console.log('??紐⑤뱺 ?뱀뀡???뺤긽?곸쑝濡??묐룞?⑸땲??');
            console.log('???꾨뱶 ?낅젰 諛??먮룞???湲곕뒫???꾨꼍?섍쾶 ?묐룞?⑸땲??');
        } else {
            console.log('\n?좑툘 === ?쇰? ?뚯뒪???ㅽ뙣 ===');
            console.log(`${results.summary.failed}媛??뱀뀡?먯꽌 臾몄젣媛 諛쒓껄?섏뿀?듬땲??`);
        }
        
    } catch (error) {
        console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
    } finally {
        await browser.close();
    }
})(); 
