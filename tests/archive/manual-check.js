const { chromium } = require('playwright');

async function manualCheck() {
    console.log('🔍 수동 확인을 위해 브라우저를 열어둡니다.');
    console.log('📌 다음을 확인해주세요:');
    console.log('   1. 페이지가 정상적으로 로드되는지');
    console.log('   2. 어떤 버튼/영역을 클릭해야 입력 필드가 나타나는지');
    console.log('   3. 입력 필드에서 타이핑할 때 버벅거리는지');
    console.log('   4. 자동저장이 언제 동작하는지');
    console.log('');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 300,
        args: ['--start-maximized'] // 브라우저 최대화
    });
    
    try {
        const page = await browser.newPage();
        
        // 브라우저 크기 설정
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // 콘솔 메시지 출력
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('AutoSave') || text.includes('저장') || text.includes('오류') || text.includes('Error')) {
                console.log(`🌐 [${msg.type()}] ${text}`);
            }
        });
        
        console.log('📄 http://localhost: {process.env.PORT || 34343} 로딩...');
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // 현재 상태 출력
        const pageInfo = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text);
            const inputs = document.querySelectorAll('input, textarea, select').length;
            const cards = Array.from(document.querySelectorAll('.cursor-pointer')).length;
            const modals = document.querySelectorAll('[role="dialog"], .modal, .fixed.inset-0').length;
            
            return { buttons, inputs, cards, modals };
        });
        
        console.log('\n📊 현재 페이지 상태:');
        console.log(`   - 버튼들: [${pageInfo.buttons.join(', ')}]`);
        console.log(`   - 입력 필드: ${pageInfo.inputs}개`);
        console.log(`   - 클릭 가능한 카드: ${pageInfo.cards}개`);
        console.log(`   - 열린 모달: ${pageInfo.modals}개`);
        
        console.log('\n⏳ 브라우저를 열어둡니다. 수동으로 테스트해보세요!');
        console.log('   💡 팁: 각 섹션 카드나 버튼을 클릭해보세요.');
        console.log('   💡 팁: 입력 필드가 나타나면 타이핑 테스트해보세요.');
        console.log('   💡 팁: 브라우저 콘솔에서 추가 정보를 확인하세요.');
        console.log('\n   종료하려면 이 터미널에서 Ctrl+C를 누르세요.');
        
        // 무한 대기 (사용자가 수동으로 종료할 때까지)
        await new Promise(resolve => {
            // 60초마다 상태 업데이트
            const interval = setInterval(async () => {
                try {
                    const currentInputs = await page.evaluate(() => document.querySelectorAll('input, textarea, select').length);
                    console.log(`⏰ 현재 입력 필드 수: ${currentInputs}개`);
                } catch (err) {
                    console.log('⚠️ 페이지 접근 오류 - 브라우저가 닫혔을 수 있습니다.');
                    clearInterval(interval);
                    resolve();
                }
            }, 60000);
            
            // 페이지 닫힘 감지
            page.on('close', () => {
                console.log('🔚 페이지가 닫혔습니다.');
                clearInterval(interval);
                resolve();
            });
        });
        
    } catch (error) {
        console.error('❌ 오류 발생:', error);
    } finally {
        console.log('🔚 수동 확인 종료.');
        await browser.close();
    }
}

manualCheck().catch(console.error); 