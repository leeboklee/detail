const puppeteer = require('puppeteer');

async function testOnclickDivs() {
    console.log('🔍 onclick DIV 정확한 분석 및 테스트...');
    
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
        
        // 1. 모든 onclick DIV들의 정확한 정보 수집
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
        
        console.log('\n=== 모든 onclick DIV들 ===');
        onclickDivs.forEach(div => {
            console.log(`${div.index}: "${div.textContent}"`);
            console.log(`  - Class: ${div.className}`);
            console.log(`  - ID: ${div.id}`);
            console.log(`  - Visible: ${div.visible}`);
            console.log(`  - OnClick: ${div.onclick.substring(0, 50)}...`);
            console.log('');
        });
        
        // 2. 각 DIV를 순서대로 클릭해보기
        console.log('\n=== DIV 클릭 테스트 ===');
        
        for (let i = 0; i < onclickDivs.length; i++) {
            const div = onclickDivs[i];
            console.log(`\n--- DIV ${i}: "${div.textContent}" 클릭 테스트 ---`);
            
            if (!div.visible) {
                console.log('❌ DIV가 보이지 않음');
                continue;
            }
            
            try {
                // DIV 클릭
                const clicked = await page.evaluate((index) => {
                    const divs = Array.from(document.querySelectorAll('div[onclick]'));
                    if (divs[index]) {
                        divs[index].click();
                        return true;
                    }
                    return false;
                }, i);
                
                if (clicked) {
                    console.log('✅ DIV 클릭 성공');
                    await new Promise(resolve => setTimeout(resolve, 1500));
                    
                    // 클릭 후 상태 확인
                    const afterClick = await page.evaluate(() => {
                        const modals = document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]');
                        const buttons = Array.from(document.querySelectorAll('button')).filter(btn => 
                            btn.offsetParent !== null && btn.textContent.trim()
                        );
                        
                        // 특정 ID 버튼들 확인
                        const specificButtons = {
                            addPackageBtn: document.getElementById('addPackageBtn'),
                            addNoticeBtn: document.getElementById('addNoticeBtn'),
                            addFacilityBtn: document.getElementById('addFacilityBtn')
                        };
                        
                        // 추가요금 관련 입력 필드들 확인
                        const additionalFeeInputs = [
                            ...document.querySelectorAll('input[placeholder*="주말"]'),
                            ...document.querySelectorAll('input[placeholder*="성수기"]'),
                            ...document.querySelectorAll('input[placeholder*="공휴일"]'),
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
                    
                    console.log(`  모달 개수: ${afterClick.modalCount}`);
                    console.log(`  버튼 개수: ${afterClick.buttonCount}`);
                    console.log(`  주요 버튼들: ${afterClick.buttonTexts.slice(0, 5).join(', ')}...`);
                    
                    // 특정 ID 버튼들 상태
                    console.log('  특정 ID 버튼들:');
                    afterClick.specificButtons.forEach(btn => {
                        if (btn.found) {
                            console.log(`    ${btn.id}: ✅ (visible: ${btn.visible}, enabled: ${btn.enabled}, text: "${btn.text}")`);
                            
                            // 찾은 버튼이 있으면 클릭해보기
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
                                    console.log(`    → ${btn.id} 클릭 시도 완료`);
                                });
                            }
                        } else {
                            console.log(`    ${btn.id}: ❌ 찾을 수 없음`);
                        }
                    });
                    
                    // 추가요금 입력 필드들
                    if (afterClick.additionalFeeInputCount > 0) {
                        console.log(`  추가요금 입력 필드 개수: ${afterClick.additionalFeeInputCount}`);
                        afterClick.additionalFeeInputs.forEach(input => {
                            console.log(`    - ${input.placeholder || input.name || input.id}: "${input.value}"`);
                        });
                    }
                    
                    // 스크린샷 저장
                    await page.screenshot({ path: `onclick-div-${i}-${div.textContent.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}.png` });
                    
                    // 모달 닫기
                    await page.keyboard.press('Escape');
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                } else {
                    console.log('❌ DIV 클릭 실패');
                }
                
            } catch (error) {
                console.log(`❌ DIV ${i} 클릭 중 오류:`, error.message);
            }
        }
        
        console.log('\n📸 모든 스크린샷이 저장되었습니다.');
        
    } catch (error) {
        console.error('❌ onclick DIV 테스트 중 오류:', error);
    } finally {
        await browser.close();
        console.log('\n✅ onclick DIV 테스트 완료');
    }
}

testOnclickDivs().catch(console.error); 