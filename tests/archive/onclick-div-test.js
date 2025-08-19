const puppeteer = require('puppeteer');

async function testOnclickDivs() {
    console.log('?뵇 onclick DIV ?뺥솗??遺꾩꽍 諛??뚯뒪??..');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
        
        // 1. 紐⑤뱺 onclick DIV?ㅼ쓽 ?뺥솗???뺣낫 ?섏쭛
        const onclickDivs = await page.evaluate(() => {
            const divs = Array.from(document.querySelectorAll('div[onclick]'));
            return divs.map((div, index) => ({
                index,
                textContent: div.textContent.trim(),
                innerHTML: div.innerHTML.trim().substring(0, 200),
                className: div.className,
                id: div.id,
                visible: div.offsetParent !== null,
                onclick: div.getAttribute('onclick') || div.onclick?.toString().substring(0, 100) || ''
            }));
        });
        
        console.log('\n=== 紐⑤뱺 onclick DIV??===');
        onclickDivs.forEach(div => {
            console.log(`${div.index}: "${div.textContent}"`);
            console.log(`  - Class: ${div.className}`);
            console.log(`  - ID: ${div.id}`);
            console.log(`  - Visible: ${div.visible}`);
            console.log(`  - OnClick: ${div.onclick.substring(0, 50)}...`);
            console.log('');
        });
        
        // 2. 媛?DIV瑜??쒖꽌?濡??대┃?대낫湲?
        console.log('\n=== DIV ?대┃ ?뚯뒪??===');
        
        for (let i = 0; i < onclickDivs.length; i++) {
            const div = onclickDivs[i];
            console.log(`\n--- DIV ${i}: "${div.textContent}" ?대┃ ?뚯뒪??---`);
            
            if (!div.visible) {
                console.log('??DIV媛 蹂댁씠吏 ?딆쓬');
                continue;
            }
            
            try {
                // DIV ?대┃
                const clicked = await page.evaluate((index) => {
                    const divs = Array.from(document.querySelectorAll('div[onclick]'));
                    if (divs[index]) {
                        divs[index].click();
                        return true;
                    }
                    return false;
                }, i);
                
                if (clicked) {
                    console.log('??DIV ?대┃ ?깃났');
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // ?대┃ ???곹깭 ?뺤씤
                    const afterClick = await page.evaluate(() => {
                        const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]');
                        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
                            btn.offsetParent !== null && btn.textContent.trim()
                        );
                        
                        // ?뱀젙 ID 踰꾪듉???뺤씤
                        const specificButtons = {
                            addPackageBtn: document.getElementById('addPackageBtn'),
                            addNoticeBtn: document.getElementById('addNoticeBtn'),
                            addFacilityBtn: document.getElementById('addFacilityBtn')
                        };
                        
                        // 異붽??붽툑 愿???낅젰 ?꾨뱶???뺤씤
                        const additionalFeeInputs = [
                            ...document.querySelectorAll('input[placeholder*="二쇰쭚"]'),
                            ...document.querySelectorAll('input[placeholder*="?깆닔湲?]'),
                            ...document.querySelectorAll('input[placeholder*="怨듯쑕??]'),
                            ...document.querySelectorAll('input[name*="weekend"]'),
                            ...document.querySelectorAll('input[name*="peak"]'),
                            ...document.querySelectorAll('input[name*="holiday"]')
                        ];
                        
                        return {
                            modalCount: modals.length,
                            buttonCount: buttons.length,
                            buttonTexts: buttons.map(btn => btn.textContent.trim()),
                            specificButtons: Object.entries(specificButtons).map(([id, btn]) => ({
                                id,
                                found: !!btn,
                                visible: btn ? btn.offsetParent !== null : false,
                                enabled: btn ? !btn.disabled : false,
                                text: btn ? btn.textContent.trim() : ''
                            })),
                            additionalFeeInputCount: additionalFeeInputs.length,
                            additionalFeeInputs: additionalFeeInputs.map(input => ({
                                placeholder: input.placeholder,
                                name: input.name,
                                id: input.id,
                                value: input.value
                            }))
                        };
                    });
                    
                    console.log(`  紐⑤떖 媛쒖닔: ${afterClick.modalCount}`);
                    console.log(`  踰꾪듉 媛쒖닔: ${afterClick.buttonCount}`);
                    console.log(`  二쇱슂 踰꾪듉?? ${afterClick.buttonTexts.slice(0, 5).join(', ')}...`);
                    
                    // ?뱀젙 ID 踰꾪듉???곹깭
                    console.log('  ?뱀젙 ID 踰꾪듉??');
                    afterClick.specificButtons.forEach(btn => {
                        if (btn.found) {
                            console.log(`    ${btn.id}: ??(visible: ${btn.visible}, enabled: ${btn.enabled}, text: "${btn.text}")`);
                            
                            // 李얠? 踰꾪듉???덉쑝硫??대┃?대낫湲?
                            if (btn.visible && btn.enabled) {
                                page.evaluate((buttonId) => {
                                    const button = document.getElementById(buttonId);
                                    if (button) {
                                        try {
                                            button.click();
                                            console.log(`Button ${buttonId} clicked successfully`);
                                        } catch (e) {
                                            console.log(`Button ${buttonId} click failed:`, e.message);
                                        }
                                    }
                                }, btn.id).then(() => {
                                    console.log(`    ??${btn.id} ?대┃ ?쒕룄 ?꾨즺`);
                                });
                            }
                        } else {
                            console.log(`    ${btn.id}: ??李얠쓣 ???놁쓬`);
                        }
                    });
                    
                    // 異붽??붽툑 ?낅젰 ?꾨뱶??
                    if (afterClick.additionalFeeInputCount > 0) {
                        console.log(`  異붽??붽툑 ?낅젰 ?꾨뱶 媛쒖닔: ${afterClick.additionalFeeInputCount}`);
                        afterClick.additionalFeeInputs.forEach(input => {
                            console.log(`    - ${input.placeholder || input.name || input.id}: "${input.value}"`);
                        });
                    }
                    
                    // ?ㅽ겕由곗꺑 ???
                    await page.screenshot({ path: `onclick-div-${i}-${div.textContent.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png` });
                    
                    // 紐⑤떖 ?リ린
                    await page.keyboard.press('Escape');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } else {
                    console.log('??DIV ?대┃ ?ㅽ뙣');
                }
                
            } catch (error) {
                console.log(`??DIV ${i} ?대┃ 以??ㅻ쪟:`, error.message);
            }
        }
        
        console.log('\n?벝 紐⑤뱺 ?ㅽ겕由곗꺑????λ릺?덉뒿?덈떎.');
        
    } catch (error) {
        console.error('??onclick DIV ?뚯뒪??以??ㅻ쪟:', error);
    } finally {
        await browser.close();
        console.log('\n??onclick DIV ?뚯뒪???꾨즺');
    }
}

testOnclickDivs().catch(console.error); 
