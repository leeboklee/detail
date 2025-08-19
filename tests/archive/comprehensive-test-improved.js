import React from 'react';
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 寃곌낵 ????붾젆?좊━ ?앹꽦
const resultsDir = 'test-results';
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
}

// waitForTimeout ?泥??⑥닔
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 媛쒖꽑???湲??⑥닔 - ?붿냼媛 濡쒕뱶???뚭퉴吏 ?湲?
async function waitForElement(page, selector, timeout = 60000) {
    try {
        await page.waitForSelector(selector, { timeout });
        return true;
    } catch (error) {
        console.log(`?좑툘 ?붿냼 ?湲??ㅽ뙣: ${selector} (${timeout}ms)`);
        return false;
    }
}

// 媛쒖꽑???섏씠吏 濡쒕뱶 ?湲?
async function waitForPageLoad(page, timeout = 60000) {
    try {
        await page.waitForLoadState('networkidle', { timeout });
        await wait(2000); // 異붽? ?덉젙???쒓컙
        return true;
    } catch (error) {
        console.log(`?좑툘 ?섏씠吏 濡쒕뱶 ?湲??ㅽ뙣: ${error.message}`);
        return false;
    }
}

// ?ъ떆??濡쒖쭅???ы븿???덉쟾???대┃ ?⑥닔
async function safeClick(page, selector, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await page.waitForSelector(selector, { timeout: 10000 });
            await page.click(selector);
            await wait(1000);
            return true;
        } catch (error) {
            console.log(`?좑툘 ?대┃ ?쒕룄 ${i + 1}/${retries} ?ㅽ뙣: ${error.message}`);
            if (i === retries - 1) throw error;
            await wait(2000);
        }
    }
    return false;
}

// ?덉쟾???낅젰 ?⑥닔
async function safeType(page, selector, text, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await page.waitForSelector(selector, { timeout: 10000 });
            await page.click(selector);
            await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) element.value = '';
            }, selector);
            await page.type(selector, text);
            await wait(500);
            return true;
        } catch (error) {
            console.log(`?좑툘 ?낅젰 ?쒕룄 ${i + 1}/${retries} ?ㅽ뙣: ${error.message}`);
            if (i === retries - 1) throw error;
            await wait(1000);
        }
    }
    return false;
}

// ?띿뒪?몃줈 DIV 移대뱶 李얘린
async function findCardByText(page, searchText) {
    try {
        const cardElements = await page.$$('div.cursor-pointer');
        for (const card of cardElements) {
            const text = await page.evaluate(el => el.textContent, card);
            if (text.includes(searchText)) {
                return card;
            }
        }
        return null;
    } catch (error) {
        console.log(`?좑툘 移대뱶 李얘린 ?ㅽ뙣: ${error.message}`);
        return null;
    }
}

// 紐⑤떖 ?リ린 ?⑥닔
async function closeModal(page) {
    try {
        // X 踰꾪듉 ?대┃
        const closeButton = await page.$('button:has-text("횞")');
        if (closeButton) {
            await closeButton.click();
            await wait(1000);
            return true;
        }
        
        // 痍⑥냼 踰꾪듉 ?대┃
        const cancelButton = await page.$('button:has-text("痍⑥냼")');
        if (cancelButton) {
            await cancelButton.click();
            await wait(1000);
            return true;
        }
        
        return false;
    } catch (error) {
        console.log(`?좑툘 紐⑤떖 ?リ린 ?ㅽ뙣: ${error.message}`);
        return false;
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-web-security']
    });

    const page = await browser.newPage();
    const results = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {
            total: 0,
            passed: 0,
            failed: 0
        }
    };

    try {
        console.log('?? 醫낇빀 ?뚯뒪???쒖옉...');
        
        // ?섏씠吏 濡쒕뱶
        console.log('?뱞 ?섏씠吏 濡쒕뵫...');
        await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle0', timeout: 60000 });
        
        // React 而댄룷?뚰듃 濡쒕뱶 ?湲?
        await page.waitForSelector('div.cursor-pointer', { timeout: 60000 });
        await wait(3000);
        
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');

        // ?뚯뒪?명븷 ?뱀뀡??- ?ㅼ젣 ?섏씠吏 援ъ“??留욊쾶 ?섏젙
        const sections = [
            { 
                key: 'hotel', 
                name: '?명뀛 ?뺣낫', 
                searchText: '?룧?명뀛 ?뺣낫',
                testInputs: [
                    { selector: 'input[name="hotelName"]', value: '?뚯뒪???명뀛', label: '?명뀛紐? },
                    { selector: 'input[name="address"]', value: '?쒖슱??媛뺣궓援?, label: '二쇱냼' },
                    { selector: 'textarea[name="description"]', value: '?뚯뒪???명뀛 ?ㅻ챸', label: '?명뀛 ?ㅻ챸' }
                ]
            },
            { 
                key: 'rooms', 
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
                key: 'facilities', 
                name: '?쒖꽕 ?뺣낫', 
                searchText: '?숋툘?쒖꽕 ?뺣낫',
                testInputs: [
                    { selector: 'textarea[name="facilities"]', value: '?섏쁺?? ?쇳듃?덉뒪?쇳꽣, ?ㅽ뙆', label: '?쒖꽕 ?뺣낫' }
                ]
            },
            { 
                key: 'packages', 
                name: '?⑦궎吏', 
                searchText: '?뱞?⑦궎吏',
                testInputs: [
                    { selector: 'input[name="packageName"]', value: '?덈땲臾??⑦궎吏', label: '?⑦궎吏紐? },
                    { selector: 'textarea[name="packageDesc"]', value: '?좏샎遺遺 ?꾩슜 ?⑦궎吏', label: '?⑦궎吏 ?ㅻ챸' }
                ]
            },
            { 
                key: 'pricing', 
                name: '異붽??붽툑', 
                searchText: '?뮥異붽??붽툑',
                testInputs: [
                    { selector: 'input[name="additionalFee"]', value: '50000', label: '異붽??붽툑' },
                    { selector: 'textarea[name="feeDescription"]', value: '?묒뒪?몃씪 踰좊뱶 ?붽툑', label: '?붽툑 ?ㅻ챸' }
                ]
            }
        ];

        // 媛??뱀뀡 ?뚯뒪??
        for (const section of sections) {
            console.log(`\n?뵇 [${section.name}] ?뱀뀡 ?뚯뒪???쒖옉...`);
            
            const testResult = {
                section: section.name,
                key: section.key,
                steps: [],
                success: false,
                error: null
            };

            try {
                // 1. ?뱀뀡 移대뱶 ?대┃
                console.log(`?뱥 ${section.name} 移대뱶 ?대┃...`);
                const card = await findCardByText(page, section.searchText);
                
                if (!card) {
                    throw new Error(`${section.name} 移대뱶瑜?李얠쓣 ???놁뒿?덈떎`);
                }
                
                await card.click();
                await wait(2000);
                
                testResult.steps.push({
                    step: '移대뱶 ?대┃',
                    success: true,
                    message: `${section.name} 移대뱶 ?대┃ ?깃났`
                });

                // 2. 紐⑤떖 ?대┝ ?뺤씤
                const modalOpened = await page.waitForSelector('.modal-content, [role="dialog"]', { timeout: 10000 });
                if (!modalOpened) {
                    throw new Error('紐⑤떖???대━吏 ?딆븯?듬땲??);
                }
                
                testResult.steps.push({
                    step: '紐⑤떖 ?대┝',
                    success: true,
                    message: '紐⑤떖???깃났?곸쑝濡??대졇?듬땲??
                });

                // 3. ?낅젰 ?꾨뱶 ?뚯뒪??(?대떦 ?뱀뀡???낅젰 ?꾨뱶媛 ?덈뒗 寃쎌슦)
                if (section.testInputs && section.testInputs.length > 0) {
                    console.log(`?륅툘 ${section.name} ?낅젰 ?꾨뱶 ?뚯뒪??..`);
                    
                    for (const input of section.testInputs) {
                        try {
                            const inputElement = await page.$(input.selector);
                            if (inputElement) {
                                await safeType(page, input.selector, input.value);
                                console.log(`  ??${input.label}: "${input.value}" ?낅젰 ?깃났`);
                                
                                testResult.steps.push({
                                    step: `${input.label} ?낅젰`,
                                    success: true,
                                    message: `"${input.value}" ?낅젰 ?깃났`
                                });
                            } else {
                                console.log(`  ?좑툘 ${input.label} ?꾨뱶瑜?李얠쓣 ???놁뒿?덈떎`);
                            }
                        } catch (error) {
                            console.log(`  ??${input.label} ?낅젰 ?ㅽ뙣: ${error.message}`);
                        }
                    }

                    // 4. ?곸슜?섍린 踰꾪듉 ?대┃
                    console.log(`?뮶 ${section.name} ?곸슜?섍린 踰꾪듉 ?대┃...`);
                    const applyButton = await page.$('button:has-text("?곸슜?섍린")');
                    if (applyButton) {
                        await applyButton.click();
                        await wait(2000);
                        
                        testResult.steps.push({
                            step: '?곸슜?섍린',
                            success: true,
                            message: '?곸슜?섍린 踰꾪듉 ?대┃ ?깃났'
                        });
                    }

                    // 5. 紐⑤떖 ?リ린 (X 踰꾪듉 ?먮뒗 痍⑥냼 踰꾪듉)
                    console.log(`??${section.name} 紐⑤떖 ?リ린...`);
                    const modalClosed = await closeModal(page);
                    if (modalClosed) {
                        testResult.steps.push({
                            step: '紐⑤떖 ?リ린',
                            success: true,
                            message: '紐⑤떖???깃났?곸쑝濡??ロ삍?듬땲??
                        });
                    }

                    // 6. ?ㅼ떆 ?댁뼱??媛??뺤씤
                    console.log(`?봽 ${section.name} ?ㅼ떆 ?댁뼱??媛??뺤씤...`);
                    await wait(2000);
                    
                    const cardReopen = await findCardByText(page, section.searchText);
                    if (cardReopen) {
                        await cardReopen.click();
                        await wait(2000);
                        
                        // 媛??뺤씤
                        let valuesPreserved = 0;
                        for (const input of section.testInputs) {
                            try {
                                const currentValue = await page.$eval(input.selector, el => el.value);
                                if (currentValue === input.value) {
                                    console.log(`  ??${input.label}: 媛??좎???("${currentValue}")`);
                                    valuesPreserved++;
                                } else {
                                    console.log(`  ?좑툘 ${input.label}: 媛?蹂寃쎈맖 ("${input.value}" ??"${currentValue}")`);
                                }
                            } catch (error) {
                                console.log(`  ??${input.label}: 媛??뺤씤 ?ㅽ뙣`);
                            }
                        }
                        
                        testResult.steps.push({
                            step: '媛??뺤씤',
                            success: valuesPreserved > 0,
                            message: `${valuesPreserved}/${section.testInputs.length} 媛믪씠 ?좎???
                        });
                        
                        // 紐⑤떖 ?ㅼ떆 ?リ린
                        await closeModal(page);
                    }
                }

                testResult.success = true;
                results.summary.passed++;
                console.log(`??[${section.name}] ?뚯뒪???꾨즺`);

            } catch (error) {
                testResult.error = error.message;
                results.summary.failed++;
                console.log(`??[${section.name}] ?뚯뒪???ㅽ뙣: ${error.message}`);
            }

            results.tests.push(testResult);
            results.summary.total++;
            
            // ?뚯뒪??媛??湲?
            await wait(2000);
        }

        // 理쒖쥌 寃곌낵 異쒕젰
        console.log('\n?뱤 === 理쒖쥌 ?뚯뒪??寃곌낵 ===');
        console.log(`珥??뚯뒪?? ${results.summary.total}`);
        console.log(`?깃났: ${results.summary.passed}`);
        console.log(`?ㅽ뙣: ${results.summary.failed}`);
        console.log(`?깃났瑜? ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

        // 寃곌낵 ?뚯씪 ???
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultFile = path.join(resultsDir, `comprehensive-test-${timestamp}.json`);
        fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
        console.log(`\n?뮶 寃곌낵 ??? ${resultFile}`);

    } catch (error) {
        console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
    } finally {
        await browser.close();
    }
})(); 
