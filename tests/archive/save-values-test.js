import React from 'react';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 媛쒖꽑???湲??⑥닔
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ?ъ떆??濡쒖쭅???ы븿???덉쟾???대┃ ?⑥닔
async function safeClick(page, selector, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const element = await page.locator(selector).first();
            await element.scrollIntoViewIfNeeded();
            await wait(500);
            await element.click();
            return true;
        } catch (error) {
            console.log(`?좑툘 ?대┃ ?쒕룄 ${i + 1}/${retries} ?ㅽ뙣: ${error.message}`);
            if (i === retries - 1) throw error;
            await wait(1000);
        }
    }
    return false;
}

// ?덉쟾???낅젰 ?⑥닔
async function safeType(page, selector, text, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const element = await page.locator(selector).first();
            await element.scrollIntoViewIfNeeded();
            await element.click();
            await element.clear();
            await element.type(text, { delay: 50 });
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

async function saveValuesTest() {
    console.log('?? 媛쒖꽑??????쒖젏 媛??섏쭛 ?뚯뒪???쒖옉...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // ?섏씠吏 濡쒕뱶 (??꾩븘??60珥?
        await page.goto('http://localhost: {process.env.PORT || 3900}', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        // ?섏씠吏 ?꾩쟾 濡쒕뱶 ?湲?
        await wait(5000);
        
        // React 而댄룷?뚰듃 濡쒕뱶 ?뺤씤
        await page.waitForSelector('button', { timeout: 30000 });
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');

        // 媛앹떎 ?뺣낫 移대뱶 ?대┃ (媛쒖꽑???대┃)
        console.log('占쏙옙 媛앹떎 ?뺣낫 移대뱶 ?대┃...');
        
        // ?ㅼ젣 ?섏씠吏 援ъ“??留욊쾶 DIV 移대뱶 ?좏깮
        const roomsButtonClicked = await safeClick(page, 'div.cursor-pointer:has-text("?뫁媛앹떎 ?뺣낫")');
        
        if (!roomsButtonClicked) {
            // ????좏깮???쒕룄
            const cardElements = await page.locator('div.cursor-pointer').all();
            let foundCard = false;
            
            for (const card of cardElements) {
                try {
                    const text = await card.textContent();
                    if (text.includes('媛앹떎 ?뺣낫') || text.includes('?뫁媛앹떎')) {
                        await card.click();
                        foundCard = true;
                        console.log(`??媛앹떎 ?뺣낫 移대뱶 ?대┃ ?깃났: "${text}"`);
                        break;
                    }
                } catch (error) {
                    console.log(`?좑툘 移대뱶 ?띿뒪???뺤씤 ?ㅽ뙣: ${error.message}`);
                }
            }
            
            if (!foundCard) {
                throw new Error('媛앹떎 ?뺣낫 移대뱶瑜?李얠쓣 ???놁쓬');
            }
        }
        
        // 紐⑤떖 濡쒕뱶 ?湲?
        await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
        await wait(2000);

        // ?낅젰 ?꾨뱶 李얘린
        const inputFields = await page.locator('[role="dialog"] input[type="text"]').all();
        console.log(`?뱷 ?낅젰 ?꾨뱶 ${inputFields.length}媛?諛쒓껄`);

        if (inputFields.length === 0) {
            throw new Error('?낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
        }

        // ?뚯뒪???곗씠??
        const testData = [
            "?붾윮???몄쐢猷?,
            "?붾툝踰좊뱶", 
            "35??,
            "?뱀궗?댁쫰 踰좊뱶",
            "City View"
        ];

        // 媛??꾨뱶???곗씠???낅젰
        for (let i = 0; i < Math.min(testData.length, inputFields.length); i++) {
            console.log(`?뱷 ?꾨뱶 ${i + 1}??"${testData[i]}" ?낅젰...`);
            
            try {
                await inputFields[i].scrollIntoViewIfNeeded();
                await inputFields[i].click();
                await inputFields[i].clear();
                await inputFields[i].type(testData[i], { delay: 50 });
                await wait(500);
                
                // ?낅젰 ?뺤씤
                const value = await inputFields[i].inputValue();
                if (value === testData[i]) {
                    console.log(`???낅젰 ?꾨즺: "${value}"`);
                } else {
                    console.log(`?좑툘 ?낅젰 遺덉씪移? ?덉긽 "${testData[i]}", ?ㅼ젣 "${value}"`);
                }
            } catch (error) {
                console.log(`???꾨뱶 ${i + 1} ?낅젰 ?ㅽ뙣: ${error.message}`);
            }
        }

        // ?먮룞????湲?
        console.log('?뮶 ?먮룞????湲?以?..');
        await wait(3000);

        // ?????紐⑤뱺 ?꾨뱶 媛??섏쭛
        console.log('?뮶 ?????紐⑤뱺 ?꾨뱶 媛??섏쭛...');
        const allInputs = await page.locator('[role="dialog"] input[type="text"]').all();
        
        for (let i = 0; i < allInputs.length; i++) {
            try {
                const value = await allInputs[i].inputValue();
                const name = await allInputs[i].getAttribute('name') || `field-${i + 1}`;
                console.log(`?꾨뱶 ${i + 1} [${name}]: "${value}"`);
            } catch (error) {
                console.log(`?꾨뱶 ${i + 1} 媛??쎄린 ?ㅽ뙣: ${error.message}`);
            }
        }

        // JavaScript濡?DOM 媛??섏쭛
        console.log('?뵇 JavaScript濡?DOM 媛??섏쭛...');
        const domValues = await page.evaluate(() => {
            const inputs = document.querySelectorAll('[role="dialog"] input[type="text"]');
            return Array.from(inputs).map((input, index) => ({
                index: index + 1,
                name: input.name || `field-${index + 1}`,
                value: input.value
            }));
        });

        console.log('DOM?먯꽌 ?섏쭛??媛믩뱾:');
        domValues.forEach(item => {
            console.log(`?꾨뱶 ${item.index} [${item.name}]: "${item.value}"`);
        });

        // ???踰꾪듉 ?대┃
        console.log('?뮶 ???踰꾪듉 ?대┃...');
        const saveButtonSelectors = [
            'button:has-text("???)',
            'button:has-text("?꾨즺")',
            'button:has-text("?뺤씤")',
            '[data-testid="save-button"]'
        ];

        let saveButtonClicked = false;
        for (const selector of saveButtonSelectors) {
            try {
                const saveButton = page.locator(selector).first();
                if (await saveButton.isVisible()) {
                    await saveButton.click();
                    saveButtonClicked = true;
                    console.log(`?????踰꾪듉 ?대┃ ?깃났: ${selector}`);
                    break;
                }
            } catch (error) {
                console.log(`?좑툘 ???踰꾪듉 ?쒕룄 ?ㅽ뙣: ${selector}`);
            }
        }

        if (!saveButtonClicked) {
            console.log('?좑툘 ???踰꾪듉??李얠쓣 ???놁쓬, ESC濡?紐⑤떖 ?リ린');
            await page.keyboard.press('Escape');
            await wait(1000);
        } else {
            // ??????湲?
            await wait(2000);
        }

        // ?????媛??뺤씤 (紐⑤떖???ロ삍?????덉쑝誘濡??ㅼ떆 ?닿린)
        console.log('?뱤 ?????媛??뺤씤...');
        
        try {
            // 紐⑤떖???꾩쭅 ?대젮?덈뒗吏 ?뺤씤
            const modalStillOpen = await page.locator('[role="dialog"]').isVisible();
            
            if (!modalStillOpen) {
                console.log('?봽 紐⑤떖???ロ삍?? ?ㅼ떆 ?닿린...');
                
                // DIV 移대뱶 ?뺥깭濡??ㅼ떆 ?대┃
                const cardElements = await page.locator('div.cursor-pointer').all();
                let reopened = false;
                
                for (const card of cardElements) {
                    try {
                        const text = await card.textContent();
                        if (text.includes('媛앹떎 ?뺣낫') || text.includes('?뫁媛앹떎')) {
                            await card.click();
                            reopened = true;
                            console.log(`??媛앹떎 ?뺣낫 移대뱶 ?ъ삤???깃났: "${text}"`);
                            break;
                        }
                    } catch (error) {
                        console.log(`?좑툘 移대뱶 ?ъ삤???ㅽ뙣: ${error.message}`);
                    }
                }
                
                if (!reopened) {
                    throw new Error('媛앹떎 ?뺣낫 移대뱶 ?ъ삤???ㅽ뙣');
                }
                
                await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
                await wait(1000);
            }

            // ??λ맂 媛??뺤씤
            const savedInputs = await page.locator('[role="dialog"] input[type="text"]').all();
            console.log('??λ맂 媛믩뱾:');
            
            for (let i = 0; i < savedInputs.length; i++) {
                try {
                    const value = await savedInputs[i].inputValue();
                    const name = await savedInputs[i].getAttribute('name') || `field-${i + 1}`;
                    console.log(`?꾨뱶 ${i + 1} [${name}]: "${value}"`);
                } catch (error) {
                    console.log(`?꾨뱶 ${i + 1} 媛??쎄린 ?ㅽ뙣: ${error.message}`);
                }
            }

            console.log('???먮룞????뚯뒪???꾨즺');
            
        } catch (error) {
            console.log(`???????媛??뺤씤 ?ㅽ뙣: ${error.message}`);
        }

    } catch (error) {
        console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// ?뚯뒪???ㅽ뻾
saveValuesTest().catch(console.error); 
