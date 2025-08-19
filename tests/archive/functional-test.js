const puppeteer = require('puppeteer');

async function testFunctionality() {
    console.log('?? 湲곕뒫 ?뚯뒪???쒖옉...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        // ?섏씠吏 濡쒕뱶
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
        
        // 1. ?쒗뵆由?湲곕뒫 ?뚯뒪??
        console.log('\n=== 1. ?쒗뵆由?湲곕뒫 ?뚯뒪??===');
        
        // ?쒗뵆由?紐⑸줉 踰꾪듉 李얘린
        const templateButtons = await page.$$eval('button', buttons => 
            buttons.filter(btn => btn.textContent.includes('?뮶 ?쒗뵆由?紐⑸줉'))
                   .map(btn => ({
                       text: btn.textContent.trim(),
                       visible: btn.offsetParent !== null,
                       disabled: btn.disabled
                   }))
        );
        
        console.log('?쒗뵆由?踰꾪듉??', templateButtons);
        
        if (templateButtons.length > 0 && templateButtons[0].visible && !templateButtons[0].disabled) {
            // ?쒗뵆由?紐⑤떖 ?닿린
            await page.evaluate(() => {
                const btn = Array.from(document.querySelectorAll('button')).find(b => 
                    b.textContent.includes('?뮶 ?쒗뵆由?紐⑸줉')
                );
                if (btn) btn.click();
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // ?쒗뵆由?紐⑤떖 ?댁슜 ?뺤씤
            const modalContent = await page.evaluate(() => {
                const modal = document.querySelector('[role="dialog"], .modal, [class*="modal"]');
                if (modal) {
                    const saveBtn = Array.from(modal.querySelectorAll('button')).find(btn => 
                        btn.textContent.includes('?덈줈 ???)
                    );
                    const loadBtns = Array.from(modal.querySelectorAll('button')).filter(btn => 
                        btn.textContent.includes('遺덈윭?ㅺ린')
                    );
                    
                    return {
                        modalFound: true,
                        hasSaveButton: !!saveBtn,
                        loadButtonCount: loadBtns.length,
                        saveButtonEnabled: saveBtn ? !saveBtn.disabled : false
                    };
                }
                return { modalFound: false };
            });
            
            console.log('?쒗뵆由?紐⑤떖 ?곹깭:', modalContent);
            
            // 紐⑤떖 ?リ린
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 2. ?뱀뀡蹂?異붽? 踰꾪듉 ?뚯뒪??
        console.log('\n=== 2. ?뱀뀡蹂?異붽? 踰꾪듉 ?뚯뒪??===');
        
        const sections = [
            { name: '?⑦궎吏', buttonId: 'addPackageBtn' },
            { name: '怨듭??ы빆', buttonId: 'addNoticeBtn' },  
            { name: '?쒖꽕 ?뺣낫', buttonId: 'addFacilityBtn' }
        ];
        
        for (const section of sections) {
            console.log(`\n--- ${section.name} ?뱀뀡 ?뚯뒪??---`);
            
            // ?뱀뀡 踰꾪듉 ?대┃?섏뿬 紐⑤떖 ?닿린
            const sectionButtonFound = await page.evaluate((sectionName) => {
                const btn = Array.from(document.querySelectorAll('button')).find(b => 
                    b.textContent.includes(sectionName)
                );
                if (btn) {
                    btn.click();
                    return true;
                }
                return false;
            }, section.name);
            
            if (sectionButtonFound) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 異붽? 踰꾪듉 ?곹깭 ?뺤씤
                const addButtonStatus = await page.evaluate((buttonId) => {
                    const btn = document.getElementById(buttonId);
                    if (btn) {
                        return {
                            found: true,
                            visible: btn.offsetParent !== null,
                            enabled: !btn.disabled,
                            text: btn.textContent.trim(),
                            zIndex: window.getComputedStyle(btn).zIndex,
                            rect: btn.getBoundingClientRect()
                        };
                    }
                    return { found: false };
                }, section.buttonId);
                
                console.log(`${section.name} 異붽? 踰꾪듉 ?곹깭:`, addButtonStatus);
                
                // 異붽? 踰꾪듉 ?대┃ ?뚯뒪??
                if (addButtonStatus.found && addButtonStatus.visible && addButtonStatus.enabled) {
                    try {
                        await page.click(`#${section.buttonId}`);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        console.log(`??${section.name} 異붽? 踰꾪듉 ?대┃ ?깃났`);
                        
                        // 異붽?????ぉ ?뺤씤
                        const itemCount = await page.evaluate((sectionName) => {
                            if (sectionName === '?⑦궎吏') {
                                return document.querySelectorAll('[class*="package"], [id*="package"]').length;
                            } else if (sectionName === '怨듭??ы빆') {
                                return document.querySelectorAll('[class*="notice"], [id*="notice"]').length;
                            } else if (sectionName === '?쒖꽕 ?뺣낫') {
                                return document.querySelectorAll('[class*="facility"], [id*="facility"]').length;
                            }
                            return 0;
                        }, section.name);
                        
                        console.log(`${section.name} ??ぉ 媛쒖닔:`, itemCount);
                        
                    } catch (error) {
                        console.log(`??${section.name} 異붽? 踰꾪듉 ?대┃ ?ㅽ뙣:`, error.message);
                    }
                } else {
                    console.log(`??${section.name} 異붽? 踰꾪듉 ?대┃ 遺덇?`);
                }
                
                // 紐⑤떖 ?リ린
                await page.keyboard.press('Escape');
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                console.log(`??${section.name} ?뱀뀡 踰꾪듉??李얠쓣 ???놁쓬`);
            }
        }
        
        // 3. 異붽??붽툑 ?꾨뱶 ?뺤씤
        console.log('\n=== 3. 異붽??붽툑 ?꾨뱶 ?뺤씤 ===');
        
        // ?먮ℓ湲곌컙&?ъ닕???뱀뀡 ?닿린
        const periodButtonFound = await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => 
                b.textContent.includes('?뱟 ?먮ℓ湲곌컙&?ъ닕??)
            );
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        });
        
        if (periodButtonFound) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 異붽??붽툑 ?꾨뱶???뺤씤
            const additionalFeeFields = await page.evaluate(() => {
                const fields = [
                    { name: '二쇰쭚 異붽??붽툑', selector: 'input[name*="weekend"], input[placeholder*="二쇰쭚"]' },
                    { name: '?깆닔湲?異붽??붽툑', selector: 'input[name*="peak"], input[placeholder*="?깆닔湲?]' },
                    { name: '怨듯쑕??異붽??붽툑', selector: 'input[name*="holiday"], input[placeholder*="怨듯쑕??]' }
                ];
                
                return fields.map(field => {
                    const element = document.querySelector(field.selector);
                    return {
                        name: field.name,
                        found: !!element,
                        visible: element ? element.offsetParent !== null : false,
                        value: element ? element.value : null
                    };
                });
            });
            
            console.log('異붽??붽툑 ?꾨뱶??', additionalFeeFields);
            
            // 紐⑤떖 ?リ린
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 理쒖쥌 ?ㅽ겕由곗꺑
        await page.screenshot({ path: 'functional-test-result.png', fullPage: true });
        console.log('\n?벝 理쒖쥌 ?ㅽ겕由곗꺑 ??? functional-test-result.png');
        
    } catch (error) {
        console.error('???뚯뒪??以??ㅻ쪟 諛쒖깮:', error);
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    } finally {
        await browser.close();
        console.log('\n??湲곕뒫 ?뚯뒪???꾨즺');
    }
}

// ?ㅽ겕由쏀듃 ?ㅽ뻾
testFunctionality().catch(console.error); 
