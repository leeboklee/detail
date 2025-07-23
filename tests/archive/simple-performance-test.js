const { chromium } = require('playwright');

async function simplePerformanceTest() {
    console.log('🔍 간단한 성능 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 200
    });
    
    try {
        const page = await browser.newPage();
        
        console.log('📄 페이지 로딩...');
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        // 모든 클릭 가능한 요소 찾기
        console.log('🔍 클릭 가능한 요소들 찾기...');
        const clickableElements = await page.evaluate(() => {
            const elements = Array.from(document.querySelectorAll('*')).filter(el => {
                const text = el.textContent?.trim();
                return text && text.includes('호텔') && el.offsetParent !== null;
            });
            return elements.map(el => ({
                text: el.textContent?.trim().substring(0, 50),
                tag: el.tagName,
                class: el.className
            }));
        });
        
        console.log(`📋 찾은 요소들 (${clickableElements.length}개):`);
        clickableElements.forEach((el, idx) => {
            console.log(`  ${idx + 1}. [${el.tag}] ${el.text} (${el.class})`);
        });
        
        // 첫 번째 호텔 관련 요소 클릭
        if (clickableElements.length > 0) {
            console.log('\n🖱️ 호텔 정보 섹션 클릭 시도...');
            
            try {
                // 다양한 셀렉터로 시도
                const selectors = [
                    'text=호텔 정보',
                    '[class*="hotel"]',
                    'div:has-text("호텔")',
                    'button:has-text("호텔")',
                    'span:has-text("호텔")'
                ];
                
                let clicked = false;
                for (const selector of selectors) {
                    try {
                        const element = page.locator(selector).first();
                        if (await element.isVisible()) {
                            await element.click();
                            console.log(`✅ 클릭 성공: ${selector}`);
                            clicked = true;
                            break;
                        }
                    } catch (e) {
                        // 다음 셀렉터 시도
                    }
                }
                
                if (!clicked) {
                    console.log('⚠️ 호텔 섹션 클릭 실패 - 직접 찾기 시도');
                    const hotelCards = await page.locator('*').filter({ hasText: '호텔' });
                    const count = await hotelCards.count();
                    console.log(`🔍 '호텔' 텍스트가 포함된 요소: ${count}개`);
                    
                    if (count > 0) {
                        await hotelCards.first().click();
                        console.log('✅ 첫 번째 호텔 요소 클릭됨');
                        clicked = true;
                    }
                }
                
                if (clicked) {
                    await page.waitForTimeout(2000);
                    
                    // 입력 필드들 찾기
                    console.log('\n📝 입력 필드 찾기...');
                    const inputs = await page.locator('input, textarea').all();
                    console.log(`🔍 찾은 입력 필드: ${inputs.length}개`);
                    
                    if (inputs.length > 0) {
                        const firstInput = inputs[0];
                        const placeholder = await firstInput.getAttribute('placeholder');
                        console.log(`📝 첫 번째 입력 필드: ${placeholder}`);
                        
                        // 성능 측정 시작
                        console.log('\n⏱️ 성능 측정 시작...');
                        
                        await firstInput.focus();
                        await page.waitForTimeout(100);
                        
                        // 10번의 짧은 입력으로 성능 측정
                        const results = [];
                        for (let i = 0; i < 10; i++) {
                            const startTime = Date.now();
                            await page.keyboard.type('a');
                            await page.waitForTimeout(50); // 자동저장 트리거 대기
                            const endTime = Date.now();
                            const duration = endTime - startTime;
                            results.push(duration);
                            console.log(`  테스트 ${i + 1}: ${duration}ms`);
                        }
                        
                        // 통계 계산
                        const avg = results.reduce((a, b) => a + b, 0) / results.length;
                        const min = Math.min(...results);
                        const max = Math.max(...results);
                        
                        console.log('\n📊 성능 통계:');
                        console.log(`  평균: ${avg.toFixed(1)}ms`);
                        console.log(`  최소: ${min}ms`);
                        console.log(`  최대: ${max}ms`);
                        
                        // 분석
                        if (avg > 500) {
                            console.log('🚨 심각한 성능 문제 확인됨!');
                        } else if (avg > 200) {
                            console.log('⚠️ 성능 문제 있음');
                        } else {
                            console.log('✅ 성능 양호');
                        }
                        
                        // 현재 값 확인
                        const currentValue = await firstInput.inputValue();
                        console.log(`📝 현재 입력값: "${currentValue}"`);
                        
                    } else {
                        console.log('❌ 입력 필드를 찾을 수 없음');
                    }
                } else {
                    console.log('❌ 호텔 섹션을 찾을 수 없음');
                }
                
            } catch (error) {
                console.error('❌ 클릭 오류:', error.message);
            }
        }
        
        console.log('\n📝 브라우저를 5초간 유지...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 테스트 오류:', error);
    } finally {
        await browser.close();
    }
}

simplePerformanceTest(); 