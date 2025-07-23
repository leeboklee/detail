const puppeteer = require('puppeteer');

async function modalTabTest() {
    console.log('🚀 모달 탭 테스트 시작');
    
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    try {
        console.log('📱 페이지 로딩 중...');
        await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle2' });
        
        // 페이지 로드 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 순서 조정 버튼 클릭 (모달 열기)
        console.log('\n🔄 순서 조정 버튼 클릭');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find(btn => btn.textContent.includes('🔄 순서 조정'));
            if (btn) btn.click();
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 모달 내부 탭 구조 확인
        console.log('\n📑 모달 내부 탭 구조:');
        const modalTabs = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('button, [role="tab"], .tab, [data-tab]'));
            return tabs.map(tab => ({
                text: tab.textContent.trim(),
                className: tab.className,
                id: tab.id,
                dataset: tab.dataset,
                tagName: tab.tagName,
                visible: tab.offsetParent !== null
            })).filter(tab => tab.visible && tab.text.length > 0);
        });
        
        modalTabs.forEach((tab, i) => {
            console.log(`  ${i+1}. "${tab.text}" - ${tab.tagName} - class: ${tab.className}`);
        });
        
        // 스크린샷
        await page.screenshot({ 
            path: 'modal-tabs-analysis.png',
            fullPage: true 
        });
        
        console.log('\n📸 모달 스크린샷 저장: modal-tabs-analysis.png');
        
        // 각 탭 클릭 테스트
        const tabKeywords = ['호텔', '객실', '시설', '패키지', '판매', '추가', '요금', '체크', '취소', '예약', '공지', '템플릿', '데이터'];
        
        for (let i = 0; i < tabKeywords.length; i++) {
            const keyword = tabKeywords[i];
            console.log(`\n📑 [${i+1}/${tabKeywords.length}] "${keyword}" 관련 탭 테스트`);
            
            try {
                // 키워드가 포함된 버튼 찾기
                const tabButton = await page.evaluate((keyword) => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.find(btn => 
                        btn.textContent.includes(keyword) && 
                        btn.offsetParent !== null
                    );
                }, keyword);
                
                if (tabButton) {
                    // 버튼 클릭
                    await page.evaluate((keyword) => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const btn = buttons.find(btn => 
                            btn.textContent.includes(keyword) && 
                            btn.offsetParent !== null
                        );
                        if (btn) btn.click();
                    }, keyword);
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 버튼과 입력 필드 개수 확인
                    const buttons = await page.$$('button:visible');
                    const inputs = await page.$$('input:visible, textarea:visible, select:visible');
                    
                    console.log(`  ✅ "${keyword}" 탭 클릭 성공`);
                    console.log(`  🔘 버튼 ${buttons.length}개 발견`);
                    console.log(`  ⌨️ 입력 필드 ${inputs.length}개 발견`);
                    
                    // 스크린샷
                    await page.screenshot({ 
                        path: `modal-tab-${i+1}-${keyword}.png`,
                        fullPage: true 
                    });
                    
                } else {
                    console.log(`  ⚠️ "${keyword}" 관련 탭을 찾을 수 없음`);
                }
                
            } catch (error) {
                console.log(`  ❌ "${keyword}" 탭 테스트 실패:`, error.message);
            }
        }
        
        console.log('\n🎉 모달 탭 테스트 완료!');
        
        // 브라우저를 열어둔 상태로 대기
        console.log('\n⏳ 브라우저를 열어둔 상태로 대기 중... (30초)');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
    } catch (error) {
        console.error('❌ 테스트 오류:', error);
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    modalTabTest();
}