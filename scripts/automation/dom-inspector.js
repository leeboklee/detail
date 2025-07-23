const puppeteer = require('puppeteer');

async function inspectDOM() {
    console.log('🔍 DOM 구조 분석 시작');
    
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
        
        // 모든 버튼 텍스트 확인
        console.log('\n🔘 모든 버튼 텍스트:');
        const buttons = await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            return btns.map(btn => ({
                text: btn.textContent.trim(),
                className: btn.className,
                id: btn.id,
                dataset: btn.dataset
            })).filter(btn => btn.text.length > 0);
        });
        
        buttons.forEach((btn, i) => {
            console.log(`  ${i+1}. "${btn.text}" - class: ${btn.className} - id: ${btn.id}`);
        });
        
        // 탭 관련 요소 확인
        console.log('\n📑 탭 관련 요소:');
        const tabElements = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('[data-tab], [role="tab"], .tab, .nav-tab'));
            return tabs.map(tab => ({
                text: tab.textContent.trim(),
                className: tab.className,
                id: tab.id,
                dataset: tab.dataset,
                tagName: tab.tagName
            }));
        });
        
        tabElements.forEach((tab, i) => {
            console.log(`  ${i+1}. "${tab.text}" - ${tab.tagName} - class: ${tab.className} - data-tab: ${tab.dataset.tab}`);
        });
        
        // 모달 관련 요소 확인
        console.log('\n🔒 모달 관련 요소:');
        const modalElements = await page.evaluate(() => {
            const modals = Array.from(document.querySelectorAll('[role="dialog"], .modal, [data-slot="wrapper"]'));
            return modals.map(modal => ({
                className: modal.className,
                id: modal.id,
                visible: modal.offsetParent !== null,
                dataset: modal.dataset
            }));
        });
        
        modalElements.forEach((modal, i) => {
            console.log(`  ${i+1}. class: ${modal.className} - visible: ${modal.visible}`);
        });
        
        // 스크린샷
        await page.screenshot({ 
            path: 'dom-analysis-current.png',
            fullPage: true 
        });
        
        console.log('\n📸 스크린샷 저장: dom-analysis-current.png');
        
        // 브라우저를 열어둔 상태로 대기
        console.log('\n⏳ 브라우저를 열어둔 상태로 대기 중... (30초)');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
    } catch (error) {
        console.error('❌ 분석 오류:', error);
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    inspectDOM();
}