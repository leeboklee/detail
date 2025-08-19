import React from 'react';
const { chromium } = require('playwright');

async function profileReactPerformance() {
    console.log('?뵇 React ?깅뒫 ?꾨줈?뚯씪留??쒖옉');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100,
        args: ['--enable-devtools-experiments']
    });
    
    try {
        const page = await browser.newPage();
        
        // ?깅뒫 痢≪젙 ?쒖꽦??
        await page.addInitScript(() => {
            window.performanceMarks = [];
            
            // React ?뚮뜑留?紐⑤땲?곕쭅
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
            
            // ?깅뒫 observer 異붽?
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
        
        console.log('?뱞 ?섏씠吏 濡쒕뵫...');
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log('?뵺 ?명뀛 ?뺣낫 ?뱀뀡 ?닿린...');
        await page.click('text=?명뀛 ?뺣낫');
        await page.waitForTimeout(2000);
        
        // ?낅젰 ?꾨뱶 李얘린
        const inputField = await page.locator('input[placeholder*="?명뀛紐?]').first();
        if (await inputField.isVisible()) {
            console.log('?뱷 ?낅젰 ?꾨뱶 ?깅뒫 痢≪젙 ?쒖옉...');
            
            // ?깅뒫 留덊겕 ?쒖옉
            await page.evaluate(() => {
                if (window.performance && window.performance.mark) {
                    window.performance.mark('input-start');
                }
            });
            
            // ?낅젰 ?쒖옉
            await inputField.focus();
            await page.waitForTimeout(100);
            
            // ??湲?먯뵫 ?낅젰?섎ŉ ?깅뒫 痢≪젙
            const testText = '?뚯뒪?명샇??;
            for (let i = 0; i < testText.length; i++) {
                const char = testText[i];
                const startTime = Date.now();
                
                await page.evaluate((character) => {
                    if (window.performance && window.performance.mark) {
                        window.performance.mark(`char-${character}-start`);
                    }
                }, char);
                
                await page.keyboard.type(char);
                await page.waitForTimeout(100); // 媛??낅젰 媛?媛꾧꺽
                
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                await page.evaluate((character, dur) => {
                    if (window.performance && window.performance.mark) {
                        window.performance.mark(`char-${character}-end`);
                        window.performance.measure(`char-${character}-duration`, `char-${character}-start`, `char-${character}-end`);
                    }
                }, char, duration);
                
                console.log(`  ??'${char}' ?낅젰: ${duration}ms`);
            }
            
            // ?깅뒫 留덊겕 醫낅즺
            await page.evaluate(() => {
                if (window.performance && window.performance.mark) {
                    window.performance.mark('input-end');
                    window.performance.measure('input-total', 'input-start', 'input-end');
                }
            });
            
            // ?깅뒫 ?곗씠???섏쭛
            console.log('\n?뱤 ?깅뒫 遺꾩꽍 寃곌낵:');
            
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
            
            console.log('?뵢 ?깅뒫 留덊겕:', performanceData.marks.length, '媛?);
            performanceData.marks.forEach(mark => {
                console.log(`  ??${mark.message || mark.name}: ${mark.duration || 0}ms`);
            });
            
            console.log('\n?깍툘 痢≪젙媛?', performanceData.measures.length, '媛?);
            performanceData.measures.forEach(measure => {
                console.log(`  ??${measure.name}: ${measure.duration.toFixed(2)}ms`);
            });
            
            // React DevTools ?뺣낫 (媛?ν븳 寃쎌슦)
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
                console.log('\n?쏉툘 React ?뺣낫:');
                console.log(`  ??踰꾩쟾: ${reactInfo.version}`);
                console.log(`  ??DevTools: ${reactInfo.hasDevTools ? '?쒖꽦' : '鍮꾪솢??}`);
            }
        }
        
        console.log('\n?뱷 釉뚮씪?곗?瑜?10珥덇컙 ?좎??섏뿬 ?섎룞 ?뺤씤 媛??..');
        await page.waitForTimeout(10000);
        
    } catch (error) {
        console.error('???꾨줈?뚯씪留??ㅻ쪟:', error);
    } finally {
        await browser.close();
    }
}

profileReactPerformance(); 
