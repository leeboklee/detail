const { chromium } = require('playwright');

async function quickUITest() {
    console.log('🔍 빠른 UI 테스트 시작...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('📄 페이지 로딩 중...');
        await page.goto('http://localhost: {process.env.PORT || 34343}/');
        await page.waitForLoadState('networkidle');
        
        console.log('📝 페이지 제목:', await page.title());
        
        // 페이지 스크린샷 찍기
        await page.screenshot({ path: 'page-loaded.png' });
        console.log('📸 페이지 로딩 스크린샷 저장됨');
        
        // 호텔 정보 카드 찾기
        const hotelCard = page.locator('[data-testid="section-card-hotel"]');
        const isCardVisible = await hotelCard.isVisible();
        console.log('🏨 호텔 정보 카드 보임:', isCardVisible);
        
        if (isCardVisible) {
            console.log('🖱️ 호텔 정보 카드 클릭...');
            await hotelCard.click();
            
            // 모달 대기
            await page.waitForTimeout(3000);
            
            // 다양한 모달 셀렉터로 확인
            const modalSelectors = [
                'div[role="dialog"]',
                '[data-slot="wrapper"]',
                '[data-slot="backdrop"]',
                '.modal',
                '[aria-modal="true"]',
                '[role="dialog"]',
                'div[class*="modal"]',
                'div[class*="backdrop"]'
            ];
            
            let foundModal = null;
            for (const selector of modalSelectors) {
                const modal = page.locator(selector);
                const isVisible = await modal.isVisible();
                if (isVisible) {
                    console.log(`✅ 모달 발견: ${selector}`);
                    foundModal = modal;
                    break;
                } else {
                    console.log(`❌ 없음: ${selector}`);
                }
            }
            
            if (foundModal) {
                console.log('📸 모달 스크린샷 찍기...');
                await page.screenshot({ path: 'modal-found.png' });
                
                // 모달 내용 확인
                const modalText = await foundModal.textContent();
                console.log('📝 모달 내용 일부:', modalText?.substring(0, 200));
                
            } else {
                console.log('❌ 어떤 모달 셀렉터로도 찾을 수 없음');
                
                // DOM 구조 분석
                const body = await page.locator('body').innerHTML();
                console.log('🔍 body에서 "modal" 관련 클래스 찾기...');
                const modalMatches = body.match(/class="[^"]*modal[^"]*"/gi) || [];
                console.log('모달 클래스들:', modalMatches.slice(0, 5));
                
                // 새로 생긴 div들 찾기
                const allDivs = page.locator('div');
                const divCount = await allDivs.count();
                console.log('📊 총 div 개수:', divCount);
                
                // 화면에 새로 나타난 것들 확인
                await page.screenshot({ path: 'no-modal-found.png' });
            }
        } else {
            console.log('❌ 호텔 정보 카드를 찾을 수 없음');
        }
        
        console.log('⏱️ 5초 대기 (수동 확인용)...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('❌ 테스트 중 오류:', error);
    } finally {
        await browser.close();
        console.log('✅ 테스트 완료');
    }
}

quickUITest(); 