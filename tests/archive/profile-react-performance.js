const { chromium } = require('playwright');

async function profileReactPerformance() {
    console.log('🔍 React 성능 프로파일링 시작');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100,
        args: ['--enable-devtools-experiments']
    });
    
    try {
        const page = await browser.newPage();
        
        // 성능 측정 활성화
        await page.addInitScript(() => {
            window.performanceMarks = [];
            
            // React 렌더링 모니터링
            const originalLog = console.log;
            console.log = function(...args) {
                if (args[0] && args[0].includes && args[0].includes('AppContext')) {
                    window.performanceMarks.push({
                        timestamp: Date.now(),
                        message: args.join(' ')
                    });
                }
                originalLog.apply(console, args);
            };
            
            // 성능 observer 추가
            if (window.PerformanceObserver) {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'measure' || entry.entryType === 'mark') {
                            window.performanceMarks.push({
                                timestamp: Date.now(),
                                type: entry.entryType,
                                name: entry.name,
                                duration: entry.duration || 0
                            });
                        }
                    }
                });
                observer.observe({ entryTypes: ['mark', 'measure'] });
            }
        });
        
        console.log('📄 페이지 로딩...');
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log('🔸 호텔 정보 섹션 열기...');
        await page.click('text=호텔 정보');
        await page.waitForTimeout(2000);
        
        // 입력 필드 찾기
        const inputField = await page.locator('input[placeholder*="호텔명"]').first();
        if (await inputField.isVisible()) {
            console.log('📝 입력 필드 성능 측정 시작...');
            
            // 성능 마크 시작
            await page.evaluate(() => {
                if (window.performance && window.performance.mark) {
                    window.performance.mark('input-start');
                }
            });
            
            // 입력 시작
            await inputField.focus();
            await page.waitForTimeout(100);
            
            // 한 글자씩 입력하며 성능 측정
            const testText = '테스트호텔';
            for (let i = 0; i < testText.length; i++) {
                const char = testText[i];
                const startTime = Date.now();
                
                await page.evaluate((character) => {
                    if (window.performance && window.performance.mark) {
                        window.performance.mark(`char-${character}-start`);
                    }
                }, char);
                
                await page.keyboard.type(char);
                await page.waitForTimeout(100); // 각 입력 간 간격
                
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                await page.evaluate((character, dur) => {
                    if (window.performance && window.performance.mark) {
                        window.performance.mark(`char-${character}-end`);
                        window.performance.measure(`char-${character}-duration`, `char-${character}-start`, `char-${character}-end`);
                    }
                }, char, duration);
                
                console.log(`  → '${char}' 입력: ${duration}ms`);
            }
            
            // 성능 마크 종료
            await page.evaluate(() => {
                if (window.performance && window.performance.mark) {
                    window.performance.mark('input-end');
                    window.performance.measure('input-total', 'input-start', 'input-end');
                }
            });
            
            // 성능 데이터 수집
            console.log('\n📊 성능 분석 결과:');
            
            const performanceData = await page.evaluate(() => {
                const marks = window.performanceMarks || [];
                const perfEntries = window.performance.getEntriesByType('measure');
                
                return {
                    marks: marks,
                    measures: perfEntries.map(entry => ({
                        name: entry.name,
                        duration: entry.duration,
                        startTime: entry.startTime
                    }))
                };
            });
            
            console.log('🔢 성능 마크:', performanceData.marks.length, '개');
            performanceData.marks.forEach(mark => {
                console.log(`  → ${mark.message || mark.name}: ${mark.duration || 0}ms`);
            });
            
            console.log('\n⏱️ 측정값:', performanceData.measures.length, '개');
            performanceData.measures.forEach(measure => {
                console.log(`  → ${measure.name}: ${measure.duration.toFixed(2)}ms`);
            });
            
            // React DevTools 정보 (가능한 경우)
            const reactInfo = await page.evaluate(() => {
                if (window.React && window.React.version) {
                    return {
                        version: window.React.version,
                        hasDevTools: !!window.__REACT_DEVTOOLS_GLOBAL_HOOK__
                    };
                }
                return null;
            });
            
            if (reactInfo) {
                console.log('\n⚛️ React 정보:');
                console.log(`  → 버전: ${reactInfo.version}`);
                console.log(`  → DevTools: ${reactInfo.hasDevTools ? '활성' : '비활성'}`);
            }
        }
        
        console.log('\n📝 브라우저를 10초간 유지하여 수동 확인 가능...');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('❌ 프로파일링 오류:', error);
    } finally {
        await browser.close();
    }
}

profileReactPerformance(); 