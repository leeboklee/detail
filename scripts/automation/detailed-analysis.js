const puppeteer = require('puppeteer');

async function detailedAnalysis() {
    console.log('🔍 상세 페이지 분석 시작...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ 페이지 로드 완료');
        
        // 1. 숨겨진 요소들도 포함하여 모든 버튼 검색
        const allButtonsIncludingHidden = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.map((btn, index) => ({
                index,
                text: btn.textContent.trim(),
                id: btn.id || '',
                className: btn.className || '',
                visible: btn.offsetParent !== null,
                disabled: btn.disabled,
                style: {
                    display: window.getComputedStyle(btn).display,
                    visibility: window.getComputedStyle(btn).visibility,
                    opacity: window.getComputedStyle(btn).opacity
                },
                parentInfo: {
                    tagName: btn.parentElement ? btn.parentElement.tagName : '',
                    className: btn.parentElement ? btn.parentElement.className : '',
                    id: btn.parentElement ? btn.parentElement.id : ''
                }
            }));
        });
        
        console.log('\n=== 모든 버튼 (숨겨진 것 포함) ===');
        allButtonsIncludingHidden.forEach(btn => {
            console.log(`${btn.index}: "${btn.text}"`);
            console.log(`  - ID: ${btn.id}`);
            console.log(`  - Class: ${btn.className.split(' ')[0]}`);
            console.log(`  - 가시성: ${btn.visible} (display: ${btn.style.display}, visibility: ${btn.style.visibility})`);
            console.log(`  - 부모: ${btn.parentInfo.tagName} (${btn.parentInfo.className.split(' ')[0]})`);
            console.log('');
        });
        
        // 2. 특정 클래스나 속성을 가진 요소들 검색
        const specialElements = await page.evaluate(() => {
            const selectors = [
                '[class*="section"]',
                '[class*="modal"]',
                '[class*="tab"]',
                '[class*="panel"]',
                '[data-tab]',
                '[role="button"]',
                '[role="tab"]',
                'div[onclick]',
                'span[onclick]'
            ];
            
            const results = {};
            selectors.forEach(selector => {
                const elements = Array.from(document.querySelectorAll(selector));
                results[selector] = elements.map(el => ({
                    tagName: el.tagName,
                    text: el.textContent ? el.textContent.trim().substring(0, 50) : '',
                    id: el.id || '',
                    className: el.className || '',
                    visible: el.offsetParent !== null
                }));
            });
            
            return results;
        });
        
        console.log('\n=== 특수 요소들 ===');
        Object.entries(specialElements).forEach(([selector, elements]) => {
            if (elements.length > 0) {
                console.log(`\n${selector}:`);
                elements.forEach(el => {
                    console.log(`  - ${el.tagName}: "${el.text}" (ID: ${el.id})`);
                });
            }
        });
        
        // 3. 클릭 가능한 모든 요소 찾기
        const clickableElements = await page.evaluate(() => {
            const clickables = [];
            
            // 버튼
            document.querySelectorAll('button').forEach(btn => {
                if (btn.textContent.trim()) {
                    clickables.push({
                        type: 'button',
                        text: btn.textContent.trim(),
                        id: btn.id,
                        className: btn.className,
                        visible: btn.offsetParent !== null
                    });
                }
            });
            
            // 클릭 이벤트가 있는 요소들
            document.querySelectorAll('*').forEach(el => {
                if (el.onclick || el.getAttribute('onclick')) {
                    clickables.push({
                        type: 'onclick',
                        text: el.textContent ? el.textContent.trim().substring(0, 50) : '',
                        tagName: el.tagName,
                        id: el.id,
                        className: el.className,
                        visible: el.offsetParent !== null
                    });
                }
            });
            
            return clickables;
        });
        
        console.log('\n=== 클릭 가능한 요소들 ===');
        clickableElements.forEach((el, index) => {
            console.log(`${index}: [${el.type}] "${el.text}" (${el.tagName || 'BUTTON'})`);
        });
        
        // 4. 현재 페이지에서 각 버튼 클릭해보기
        console.log('\n=== 버튼 클릭 테스트 ===');
        
        const mainButtons = [
            '👁️ 미리보기',
            '🔄 순서 조정', 
            '🎨 HTML 생성',
            '🗄️ DB 저장'
        ];
        
        for (const buttonText of mainButtons) {
            console.log(`\n--- ${buttonText} 클릭 테스트 ---`);
            
            try {
                const clicked = await page.evaluate((text) => {
                    const btn = Array.from(document.querySelectorAll('button')).find(b => 
                        b.textContent.trim() === text
                    );
                    if (btn && btn.offsetParent !== null && !btn.disabled) {
                        btn.click();
                        return true;
                    }
                    return false;
                }, buttonText);
                
                if (clicked) {
                    console.log(`✅ ${buttonText} 클릭 성공`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 클릭 후 새로 생긴 요소들 확인
                    const newElements = await page.evaluate(() => {
                        const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]');
                        const newButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
                            btn.textContent.trim() && btn.offsetParent !== null
                        );
                        
                        return {
                            modalCount: modals.length,
                            buttonCount: newButtons.length,
                            newButtonTexts: newButtons.map(btn => btn.textContent.trim())
                        };
                    });
                    
                    console.log(`  모달 개수: ${newElements.modalCount}`);
                    console.log(`  버튼 개수: ${newElements.buttonCount}`);
                    console.log(`  버튼들: ${newElements.newButtonTexts.join(', ')}`);
                    
                    // 모달이 열렸다면 닫기
                    if (newElements.modalCount > 0) {
                        await page.keyboard.press('Escape');
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } else {
                    console.log(`❌ ${buttonText} 클릭 실패`);
                }
            } catch (error) {
                console.log(`❌ ${buttonText} 클릭 중 오류:`, error.message);
            }
        }
        
        // 5. 스크린샷과 HTML 저장
        await page.screenshot({ path: 'detailed-analysis-screenshot.png', fullPage: true });
        
        const htmlContent = await page.content();
        require('fs').writeFileSync('page-content.html', htmlContent);
        
        console.log('\n📸 상세 분석 스크린샷 저장: detailed-analysis-screenshot.png');
        console.log('📄 HTML 내용 저장: page-content.html');
        
    } catch (error) {
        console.error('❌ 상세 분석 중 오류:', error);
    } finally {
        await browser.close();
        console.log('\n✅ 상세 페이지 분석 완료');
    }
}

detailedAnalysis().catch(console.error); 