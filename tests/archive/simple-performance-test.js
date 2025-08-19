const { chromium } = require('playwright');

async function simplePerformanceTest() {
    console.log('?뵇 媛꾨떒???깅뒫 ?뚯뒪???쒖옉');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('?뱞 ?섏씠吏 濡쒕뵫...');
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // 紐⑤뱺 ?대┃ 媛?ν븳 ?붿냼 李얘린
        console.log('?뵇 ?대┃ 媛?ν븳 ?붿냼??李얘린...');
        const clickableElements = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent?.trim();
                return text && text.includes('?명뀛') && el.offsetParent !== null;
            });
            return elements.map(el => ({
                text: el.textContent?.trim().substring(0, 50),
                tag: el.tagName,
                class: el.className
            }));
        });
        
        console.log(`?뱥 李얠? ?붿냼??(${clickableElements.length}媛?:`);
        clickableElements.forEach((el, idx) => {
            console.log(`  ${idx + 1}. [${el.tag}] ${el.text} (${el.class})`);
        });
        
        // 泥?踰덉㎏ ?명뀛 愿???붿냼 ?대┃
        if (clickableElements.length > 0) {
            console.log('\n?뼮截??명뀛 ?뺣낫 ?뱀뀡 ?대┃ ?쒕룄...');
            
            try {
                // ?ㅼ뼇????됲꽣濡??쒕룄
                const selectors = [
                    'text=?명뀛 ?뺣낫',
                    '[class*="hotel"]',
                    'div:has-text("?명뀛")',
                    'button:has-text("?명뀛")',
                    'span:has-text("?명뀛")'
                ];
                
                let clicked = false;
                for (const selector of selectors) {
                    try {
                        const element = page.locator(selector).first();
                        if (await element.isVisible()) {
                            await element.click();
                            console.log(`???대┃ ?깃났: ${selector}`);
                            clicked = true;
                            break;
                        }
                    } catch (e) {
                        // ?ㅼ쓬 ??됲꽣 ?쒕룄
                    }
                }
                
                if (!clicked) {
                    console.log('?좑툘 ?명뀛 ?뱀뀡 ?대┃ ?ㅽ뙣 - 吏곸젒 李얘린 ?쒕룄');
                    const hotelCards = await page.locator('*').filter({ hasText: '?명뀛' });
                    const count = await hotelCards.count();
                    console.log(`?뵇 '?명뀛' ?띿뒪?멸? ?ы븿???붿냼: ${count}媛?);
                    
                    if (count > 0) {
                        await hotelCards.first().click();
                        console.log('??泥?踰덉㎏ ?명뀛 ?붿냼 ?대┃??);
                        clicked = true;
                    }
                }
                
                if (clicked) {
                    await page.waitForTimeout(2000);
                    
                    // ?낅젰 ?꾨뱶??李얘린
                    console.log('\n?뱷 ?낅젰 ?꾨뱶 李얘린...');
                    const inputs = await page.locator('input, textarea').all();
                    console.log(`?뵇 李얠? ?낅젰 ?꾨뱶: ${inputs.length}媛?);
                    
                    if (inputs.length > 0) {
                        const firstInput = inputs[0];
                        const placeholder = await firstInput.getAttribute('placeholder');
                        console.log(`?뱷 泥?踰덉㎏ ?낅젰 ?꾨뱶: ${placeholder}`);
                        
                        // ?깅뒫 痢≪젙 ?쒖옉
                        console.log('\n?깍툘 ?깅뒫 痢≪젙 ?쒖옉...');
                        
                        await firstInput.focus();
                        await page.waitForTimeout(100);
                        
                        // 10踰덉쓽 吏㏃? ?낅젰?쇰줈 ?깅뒫 痢≪젙
                        const results = [];
                        for (let i = 0; i < 10; i++) {
                            const startTime = Date.now();
                            await page.keyboard.type('a');
                            await page.waitForTimeout(50); // ?먮룞????몃━嫄??湲?
                            const endTime = Date.now();
                            const duration = endTime - startTime;
                            results.push(duration);
                            console.log(`  ?뚯뒪??${i + 1}: ${duration}ms`);
                        }
                        
                        // ?듦퀎 怨꾩궛
                        const avg = results.reduce((a, b) => a + b, 0) / results.length;
                        const min = Math.min(...results);
                        const max = Math.max(...results);
                        
                        console.log('\n?뱤 ?깅뒫 ?듦퀎:');
                        console.log(`  ?됯퇏: ${avg.toFixed(1)}ms`);
                        console.log(`  理쒖냼: ${min}ms`);
                        console.log(`  理쒕?: ${max}ms`);
                        
                        // 遺꾩꽍
                        if (avg > 500) {
                            console.log('?슚 ?ш컖???깅뒫 臾몄젣 ?뺤씤??');
                        } else if (avg > 200) {
                            console.log('?좑툘 ?깅뒫 臾몄젣 ?덉쓬');
                        } else {
                            console.log('???깅뒫 ?묓샇');
                        }
                        
                        // ?꾩옱 媛??뺤씤
                        const currentValue = await firstInput.inputValue();
                        console.log(`?뱷 ?꾩옱 ?낅젰媛? "${currentValue}"`);
                        
                    } else {
                        console.log('???낅젰 ?꾨뱶瑜?李얠쓣 ???놁쓬');
                    }
                } else {
                    console.log('???명뀛 ?뱀뀡??李얠쓣 ???놁쓬');
                }
                
            } catch (error) {
                console.error('???대┃ ?ㅻ쪟:', error.message);
            }
        }
        
        console.log('\n?뱷 釉뚮씪?곗?瑜?5珥덇컙 ?좎?...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('???뚯뒪???ㅻ쪟:', error);
    } finally {
        await browser.close();
    }
}

simplePerformanceTest(); 
