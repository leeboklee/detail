const puppeteer = require('puppeteer');

async function analyzeDOMStructure() {
    console.log('🔍 DOM 구조 분석 시작...');
    
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
        
        // 1. 모든 버튼 찾기
        const allButtons = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            return buttons.map((btn, index) => ({
                index,
                text: btn.textContent.trim(),
                id: btn.id || '',
                className: btn.className || '',
                visible: btn.offsetParent !== null,
                disabled: btn.disabled,
                ariaLabel: btn.getAttribute('aria-label') || '',
                dataTestId: btn.getAttribute('data-testid') || ''
            })).filter(btn => btn.text.length > 0); // 텍스트가 있는 버튼만
        });
        
        console.log('\n=== 모든 버튼 목록 ===');
        allButtons.forEach(btn => {
            console.log(`${btn.index}: "${btn.text}" (ID: ${btn.id}, Class: ${btn.className.split(' ')[0]})`);
        });
        
        // 2. 특정 키워드로 버튼 검색
        const keywords = ['템플릿', '패키지', '공지사항', '시설', '호텔', '객실', '추가요금', '판매기간'];
        
        console.log('\n=== 키워드별 버튼 검색 ===');
        keywords.forEach(keyword => {
            const matchedButtons = allButtons.filter(btn => 
                btn.text.includes(keyword) || 
                btn.id.includes(keyword) || 
                btn.className.includes(keyword)
            );
            
            if (matchedButtons.length > 0) {
                console.log(`\n"${keyword}" 관련 버튼들:`);
                matchedButtons.forEach(btn => {
                    console.log(`  - "${btn.text}" (ID: ${btn.id}, 활성: ${btn.visible && !btn.disabled})`);
                });
            } else {
                console.log(`\n"${keyword}" 관련 버튼 없음`);
            }
        });
        
        // 3. 추가 버튼 ID로 직접 검색
        const addButtonIds = ['addPackageBtn', 'addNoticeBtn', 'addFacilityBtn'];
        
        console.log('\n=== 추가 버튼 ID 직접 검색 ===');
        const addButtonResults = await page.evaluate((ids) => {
            return ids.map(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    return {
                        id,
                        found: true,
                        text: btn.textContent.trim(),
                        visible: btn.offsetParent !== null,
                        disabled: btn.disabled,
                        className: btn.className,
                        parentElement: btn.parentElement ? btn.parentElement.tagName : null
                    };
                }
                return { id, found: false };
            });
        }, addButtonIds);
        
        addButtonResults.forEach(result => {
            if (result.found) {
                console.log(`✅ ${result.id}: "${result.text}" (활성: ${result.visible && !result.disabled})`);
            } else {
                console.log(`❌ ${result.id}: 찾을 수 없음`);
            }
        });
        
        // 4. 현재 페이지의 주요 구조 확인
        const pageStructure = await page.evaluate(() => {
            const structure = {
                title: document.title,
                hasModals: document.querySelectorAll('[role="dialog"], .modal, [class*="modal"]').length,
                hasOverlay: document.querySelectorAll('[class*="overlay"], [class*="backdrop"]').length,
                mainContainers: Array.from(document.querySelectorAll('main, [class*="container"], [class*="app"]')).map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    id: el.id
                })),
                buttonContainers: Array.from(document.querySelectorAll('[class*="button"], [class*="controls"], [class*="actions"]')).map(el => ({
                    tagName: el.tagName,
                    className: el.className,
                    buttonCount: el.querySelectorAll('button').length
                }))
            };
            
            return structure;
        });
        
        console.log('\n=== 페이지 구조 ===');
        console.log('제목:', pageStructure.title);
        console.log('모달 개수:', pageStructure.hasModals);
        console.log('오버레이 개수:', pageStructure.hasOverlay);
        console.log('주요 컨테이너:', pageStructure.mainContainers);
        console.log('버튼 컨테이너:', pageStructure.buttonContainers);
        
        // 5. 스크린샷 저장
        await page.screenshot({ path: 'dom-analysis-screenshot.png', fullPage: true });
        console.log('\n📸 DOM 분석 스크린샷 저장: dom-analysis-screenshot.png');
        
    } catch (error) {
        console.error('❌ DOM 분석 중 오류:', error);
    } finally {
        await browser.close();
        console.log('\n✅ DOM 구조 분석 완료');
    }
}

analyzeDOMStructure().catch(console.error); 