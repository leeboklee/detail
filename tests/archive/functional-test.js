const puppeteer = require('puppeteer');

async function testFunctionality() {
    console.log('🚀 기능 테스트 시작...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        defaultViewport: null,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        // 페이지 로드
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ 페이지 로드 완료');
        
        // 1. 템플릿 기능 테스트
        console.log('\n=== 1. 템플릿 기능 테스트 ===');
        
        // 템플릿 목록 버튼 찾기
        const templateButtons = await page.$$eval('button', buttons => 
            buttons.filter(btn => btn.textContent.includes('💾 템플릿 목록'))
                   .map(btn => ({
                       text: btn.textContent.trim(),
                       visible: btn.offsetParent !== null,
                       disabled: btn.disabled
                   }))
        );
        
        console.log('템플릿 버튼들:', templateButtons);
        
        if (templateButtons.length > 0 && templateButtons[0].visible && !templateButtons[0].disabled) {
            // 템플릿 모달 열기
            await page.evaluate(() => {
                const btn = Array.from(document.querySelectorAll('button')).find(b => 
                    b.textContent.includes('💾 템플릿 목록')
                );
                if (btn) btn.click();
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 템플릿 모달 내용 확인
            const modalContent = await page.evaluate(() => {
                const modal = document.querySelector('[role="dialog"], .modal, [class*="modal"]');
                if (modal) {
                    const saveBtn = Array.from(modal.querySelectorAll('button')).find(btn => 
                        btn.textContent.includes('새로 저장')
                    );
                    const loadBtns = Array.from(modal.querySelectorAll('button')).filter(btn => 
                        btn.textContent.includes('불러오기')
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
            
            console.log('템플릿 모달 상태:', modalContent);
            
            // 모달 닫기
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 2. 섹션별 추가 버튼 테스트
        console.log('\n=== 2. 섹션별 추가 버튼 테스트 ===');
        
        const sections = [
            { name: '패키지', buttonId: 'addPackageBtn' },
            { name: '공지사항', buttonId: 'addNoticeBtn' },  
            { name: '시설 정보', buttonId: 'addFacilityBtn' }
        ];
        
        for (const section of sections) {
            console.log(`\n--- ${section.name} 섹션 테스트 ---`);
            
            // 섹션 버튼 클릭하여 모달 열기
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
                
                // 추가 버튼 상태 확인
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
                
                console.log(`${section.name} 추가 버튼 상태:`, addButtonStatus);
                
                // 추가 버튼 클릭 테스트
                if (addButtonStatus.found && addButtonStatus.visible && addButtonStatus.enabled) {
                    try {
                        await page.click(`#${section.buttonId}`);
                        await new Promise(resolve => setTimeout(resolve, 500));
                        console.log(`✅ ${section.name} 추가 버튼 클릭 성공`);
                        
                        // 추가된 항목 확인
                        const itemCount = await page.evaluate((sectionName) => {
                            if (sectionName === '패키지') {
                                return document.querySelectorAll('[class*="package"], [id*="package"]').length;
                            } else if (sectionName === '공지사항') {
                                return document.querySelectorAll('[class*="notice"], [id*="notice"]').length;
                            } else if (sectionName === '시설 정보') {
                                return document.querySelectorAll('[class*="facility"], [id*="facility"]').length;
                            }
                            return 0;
                        }, section.name);
                        
                        console.log(`${section.name} 항목 개수:`, itemCount);
                        
                    } catch (error) {
                        console.log(`❌ ${section.name} 추가 버튼 클릭 실패:`, error.message);
                    }
                } else {
                    console.log(`❌ ${section.name} 추가 버튼 클릭 불가`);
                }
                
                // 모달 닫기
                await page.keyboard.press('Escape');
                await new Promise(resolve => setTimeout(resolve, 500));
            } else {
                console.log(`❌ ${section.name} 섹션 버튼을 찾을 수 없음`);
            }
        }
        
        // 3. 추가요금 필드 확인
        console.log('\n=== 3. 추가요금 필드 확인 ===');
        
        // 판매기간&투숙일 섹션 열기
        const periodButtonFound = await page.evaluate(() => {
            const btn = Array.from(document.querySelectorAll('button')).find(b => 
                b.textContent.includes('📅 판매기간&투숙일')
            );
            if (btn) {
                btn.click();
                return true;
            }
            return false;
        });
        
        if (periodButtonFound) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // 추가요금 필드들 확인
            const additionalFeeFields = await page.evaluate(() => {
                const fields = [
                    { name: '주말 추가요금', selector: 'input[name*="weekend"], input[placeholder*="주말"]' },
                    { name: '성수기 추가요금', selector: 'input[name*="peak"], input[placeholder*="성수기"]' },
                    { name: '공휴일 추가요금', selector: 'input[name*="holiday"], input[placeholder*="공휴일"]' }
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
            
            console.log('추가요금 필드들:', additionalFeeFields);
            
            // 모달 닫기
            await page.keyboard.press('Escape');
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // 최종 스크린샷
        await page.screenshot({ path: 'functional-test-result.png', fullPage: true });
        console.log('\n📸 최종 스크린샷 저장: functional-test-result.png');
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
    } finally {
        await browser.close();
        console.log('\n✅ 기능 테스트 완료');
    }
}

// 스크립트 실행
testFunctionality().catch(console.error); 