const { chromium } = require('playwright');

// ?湲??⑥닔
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ?ㅼ젣 ?꾨뱶 李얘린 ?⑥닔
async function findActualFields(page) {
    console.log('?뵇 ?ㅼ젣 ?낅젰 ?꾨뱶 李얘린...');
    
    // 紐⑤뱺 ?낅젰 ?꾨뱶 李얘린
    const inputs = await page.locator('input').all();
    const textareas = await page.locator('textarea').all();
    const selects = await page.locator('select').all();
    
    console.log(`?뱷 ?낅젰 ?꾨뱶 諛쒓껄: input(${inputs.length}), textarea(${textareas.length}), select(${selects.length})`);
    
    // 媛??꾨뱶???뺣낫 異쒕젰
    for (let i = 0; i < inputs.length; i++) {
        try {
            const input = inputs[i];
            const name = await input.getAttribute('name');
            const id = await input.getAttribute('id');
            const type = await input.getAttribute('type');
            const placeholder = await input.getAttribute('placeholder');
            const value = await input.inputValue();
            
            console.log(`  Input ${i + 1}: name="${name}", id="${id}", type="${type}", placeholder="${placeholder}", value="${value}"`);
        } catch (error) {
            console.log(`  Input ${i + 1}: ?뺣낫 ?쎄린 ?ㅽ뙣`);
        }
    }
    
    for (let i = 0; i < textareas.length; i++) {
        try {
            const textarea = textareas[i];
            const name = await textarea.getAttribute('name');
            const id = await textarea.getAttribute('id');
            const placeholder = await textarea.getAttribute('placeholder');
            const value = await textarea.inputValue();
            
            console.log(`  Textarea ${i + 1}: name="${name}", id="${id}", placeholder="${placeholder}", value="${value}"`);
        } catch (error) {
            console.log(`  Textarea ${i + 1}: ?뺣낫 ?쎄린 ?ㅽ뙣`);
        }
    }
}

// 踰꾪듉 李얘린 ?⑥닔
async function findButtons(page) {
    console.log('?뵇 踰꾪듉 李얘린...');
    
    const buttons = await page.locator('button').all();
    console.log(`?뵴 踰꾪듉 諛쒓껄: ${buttons.length}媛?);
    
    for (let i = 0; i < buttons.length; i++) {
        try {
            const button = buttons[i];
            const text = await button.textContent();
            const className = await button.getAttribute('class');
            const disabled = await button.isDisabled();
            
            console.log(`  Button ${i + 1}: text="${text}", disabled=${disabled}, class="${className}"`);
        } catch (error) {
            console.log(`  Button ${i + 1}: ?뺣낫 ?쎄린 ?ㅽ뙣`);
        }
    }
}

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('?? 紐⑤뱺 ?뱀뀡 ?섎룞 ?뺤씤 ?쒖옉...');
        
        // ?섏씠吏 濡쒕뱶
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await page.waitForLoadState('networkidle');
        await wait(3000);
        
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
        
        // ?뱀뀡 移대뱶??李얘린
        const sections = [
            { name: '?명뀛 ?뺣낫', text: '?룧?명뀛 ?뺣낫' },
            { name: '媛앹떎 ?뺣낫', text: '?뫁媛앹떎 ?뺣낫' },
            { name: '?쒖꽕 ?뺣낫', text: '?숋툘?쒖꽕 ?뺣낫' },
            { name: '?⑦궎吏', text: '?뱞?⑦궎吏' },
            { name: '異붽??붽툑', text: '?뮥異붽??붽툑' },
            { name: '痍⑥냼洹쒖젙', text: '?썳截륁랬?뚭퇋?? },
            { name: '?덉빟?덈궡', text: '?뮶?덉빟?덈궡' },
            { name: '怨듭??ы빆', text: '?뱞怨듭??ы빆' }
        ];
        
        for (const section of sections) {
            console.log(`\n?뵇 === [${section.name}] ?뱀뀡 ?뺤씤 ===`);
            
            try {
                // ?뱀뀡 移대뱶 李얘린
                const cards = await page.locator('div.cursor-pointer').all();
                let targetCard = null;
                
                for (const card of cards) {
                    const text = await card.textContent();
                    if (text.includes(section.text)) {
                        targetCard = card;
                        console.log(`??${section.name} 移대뱶 諛쒓껄: "${text}"`);
                        break;
                    }
                }
                
                if (!targetCard) {
                    console.log(`??${section.name} 移대뱶瑜?李얠쓣 ???놁뒿?덈떎`);
                    continue;
                }
                
                // 移대뱶 ?대┃
                console.log(`?뼮截?${section.name} 移대뱶 ?대┃...`);
                await targetCard.click();
                await wait(2000);
                
                // 紐⑤떖 ?뺤씤
                const modal = await page.locator('.modal-content, [role="dialog"], .fixed').first();
                if (await modal.isVisible()) {
                    console.log(`??${section.name} 紐⑤떖 ?대┝ ?뺤씤`);
                    
                    // ?꾨뱶 李얘린
                    await findActualFields(page);
                    
                    // 踰꾪듉 李얘린
                    await findButtons(page);
                    
                    // ?낅젰 ?뚯뒪??(泥?踰덉㎏ ?낅젰 ?꾨뱶???뚯뒪??媛??낅젰)
                    console.log(`?륅툘 ${section.name} ?낅젰 ?뚯뒪??..`);
                    const firstInput = await page.locator('input:visible').first();
                    if (await firstInput.isVisible()) {
                        await firstInput.fill(`?뚯뒪??${section.name} 媛?);
                        console.log(`??泥?踰덉㎏ ?낅젰 ?꾨뱶??媛??낅젰 ?꾨즺`);
                        
                        // 媛??뺤씤
                        const inputValue = await firstInput.inputValue();
                        console.log(`?뱷 ?낅젰??媛? "${inputValue}"`);
                    }
                    
                    // ???踰꾪듉 李얘린 諛??대┃
                    console.log(`?뮶 ${section.name} ???踰꾪듉 李얘린...`);
                    const saveButtons = await page.locator('button').all();
                    let saveButton = null;
                    
                    for (const button of saveButtons) {
                        const text = await button.textContent();
                        if (text.includes('???) || text.includes('?곸슜') || text.includes('?뺤씤')) {
                            saveButton = button;
                            console.log(`?????踰꾪듉 諛쒓껄: "${text}"`);
                            break;
                        }
                    }
                    
                    if (saveButton) {
                        await saveButton.click();
                        await wait(2000);
                        console.log(`??${section.name} ???踰꾪듉 ?대┃ ?꾨즺`);
                    }
                    
                    // 紐⑤떖 ?リ린
                    console.log(`??${section.name} 紐⑤떖 ?リ린...`);
                    const closeButtons = await page.locator('button').all();
                    let closeButton = null;
                    
                    for (const button of closeButtons) {
                        const text = await button.textContent();
                        if (text.includes('횞') || text.includes('?リ린') || text.includes('痍⑥냼')) {
                            closeButton = button;
                            console.log(`???リ린 踰꾪듉 諛쒓껄: "${text}"`);
                            break;
                        }
                    }
                    
                    if (closeButton) {
                        await closeButton.click();
                        await wait(1000);
                        console.log(`??${section.name} 紐⑤떖 ?リ린 ?꾨즺`);
                    } else {
                        // ESC ?ㅻ줈 ?リ린 ?쒕룄
                        await page.keyboard.press('Escape');
                        await wait(1000);
                        console.log(`??${section.name} ESC濡?紐⑤떖 ?リ린 ?쒕룄`);
                    }
                    
                    // ?ㅼ떆 ?댁뼱??媛??뺤씤
                    console.log(`?봽 ${section.name} ?ㅼ떆 ?댁뼱??媛??뺤씤...`);
                    await wait(2000);
                    await targetCard.click();
                    await wait(2000);
                    
                    const reopenedInput = await page.locator('input:visible').first();
                    if (await reopenedInput.isVisible()) {
                        const savedValue = await reopenedInput.inputValue();
                        console.log(`?뱷 ??λ맂 媛? "${savedValue}"`);
                        
                        if (savedValue.includes(`?뚯뒪??${section.name} 媛?)) {
                            console.log(`??${section.name} 媛믪씠 ?щ컮瑜닿쾶 ??λ릺?덉뒿?덈떎!`);
                        } else {
                            console.log(`?좑툘 ${section.name} 媛믪씠 ??λ릺吏 ?딆븯嫄곕굹 蹂寃쎈릺?덉뒿?덈떎`);
                        }
                    }
                    
                    // 紐⑤떖 ?ㅼ떆 ?リ린
                    await page.keyboard.press('Escape');
                    await wait(1000);
                    
                } else {
                    console.log(`??${section.name} 紐⑤떖???대━吏 ?딆븯?듬땲??);
                }
                
            } catch (error) {
                console.log(`??${section.name} ?뚯뒪???ㅽ뙣: ${error.message}`);
            }
            
            // ?뱀뀡 媛??湲?
            await wait(2000);
        }
        
        console.log('\n?럦 紐⑤뱺 ?뱀뀡 ?뺤씤 ?꾨즺!');
        
        // 釉뚮씪?곗? ?좎? (?섎룞 ?뺤씤???꾪빐)
        console.log('\n??釉뚮씪?곗?瑜??댁뼱?〓땲?? ?섎룞?쇰줈 ?뺤씤?대낫?몄슂...');
        console.log('?뺤씤???앸굹硫?釉뚮씪?곗?瑜??レ븘二쇱꽭??');
        
        // 釉뚮씪?곗? ?リ린 ?湲?
        await page.waitForTimeout(300000); // 5遺??湲?
        
    } catch (error) {
        console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
    } finally {
        await browser.close();
    }
})(); 
