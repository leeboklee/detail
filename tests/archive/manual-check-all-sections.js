const { chromium } = require('playwright');

// 대기 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 실제 필드 찾기 함수
async function findActualFields(page) {
    console.log('🔍 실제 입력 필드 찾기...');
    
    // 모든 입력 필드 찾기
    const inputs = await page.locator('input').all();
    const textareas = await page.locator('textarea').all();
    const selects = await page.locator('select').all();
    
    console.log(`📝 입력 필드 발견: input(${inputs.length}), textarea(${textareas.length}), select(${selects.length})`);
    
    // 각 필드의 정보 출력
    for (let i = 0; i < inputs.length; i++) {
        try {
            const input = inputs[i];
            const name = await input.getAttribute('name');
            const id = await input.getAttribute('id');
            const type = await input.getAttribute('type');
            const placeholder = await input.getAttribute('placeholder');
            const value = await input.inputValue();
            
            console.log(`  Input ${i + 1}: name="${name}", id="${id}", type="${type}", placeholder="${placeholder}", value="${value}"`);
        } catch (error) {
            console.log(`  Input ${i + 1}: 정보 읽기 실패`);
        }
    }
    
    for (let i = 0; i < textareas.length; i++) {
        try {
            const textarea = textareas[i];
            const name = await textarea.getAttribute('name');
            const id = await textarea.getAttribute('id');
            const placeholder = await textarea.getAttribute('placeholder');
            const value = await textarea.inputValue();
            
            console.log(`  Textarea ${i + 1}: name="${name}", id="${id}", placeholder="${placeholder}", value="${value}"`);
        } catch (error) {
            console.log(`  Textarea ${i + 1}: 정보 읽기 실패`);
        }
    }
}

// 버튼 찾기 함수
async function findButtons(page) {
    console.log('🔍 버튼 찾기...');
    
    const buttons = await page.locator('button').all();
    console.log(`🔲 버튼 발견: ${buttons.length}개`);
    
    for (let i = 0; i < buttons.length; i++) {
        try {
            const button = buttons[i];
            const text = await button.textContent();
            const className = await button.getAttribute('class');
            const disabled = await button.isDisabled();
            
            console.log(`  Button ${i + 1}: text="${text}", disabled=${disabled}, class="${className}"`);
        } catch (error) {
            console.log(`  Button ${i + 1}: 정보 읽기 실패`);
        }
    }
}

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🚀 모든 섹션 수동 확인 시작...');
        
        // 페이지 로드
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await page.waitForLoadState('networkidle');
        await wait(3000);
        
        console.log('✅ 페이지 로드 완료');
        
        // 섹션 카드들 찾기
        const sections = [
            { name: '호텔 정보', text: '🏠호텔 정보' },
            { name: '객실 정보', text: '👥객실 정보' },
            { name: '시설 정보', text: '⚙️시설 정보' },
            { name: '패키지', text: '📄패키지' },
            { name: '추가요금', text: '💰추가요금' },
            { name: '취소규정', text: '🛡️취소규정' },
            { name: '예약안내', text: '💾예약안내' },
            { name: '공지사항', text: '📄공지사항' }
        ];
        
        for (const section of sections) {
            console.log(`\n🔍 === [${section.name}] 섹션 확인 ===`);
            
            try {
                // 섹션 카드 찾기
                const cards = await page.locator('div.cursor-pointer').all();
                let targetCard = null;
                
                for (const card of cards) {
                    const text = await card.textContent();
                    if (text.includes(section.text)) {
                        targetCard = card;
                        console.log(`✅ ${section.name} 카드 발견: "${text}"`);
                        break;
                    }
                }
                
                if (!targetCard) {
                    console.log(`❌ ${section.name} 카드를 찾을 수 없습니다`);
                    continue;
                }
                
                // 카드 클릭
                console.log(`🖱️ ${section.name} 카드 클릭...`);
                await targetCard.click();
                await wait(2000);
                
                // 모달 확인
                const modal = await page.locator('.modal-content, [role="dialog"], .fixed').first();
                if (await modal.isVisible()) {
                    console.log(`✅ ${section.name} 모달 열림 확인`);
                    
                    // 필드 찾기
                    await findActualFields(page);
                    
                    // 버튼 찾기
                    await findButtons(page);
                    
                    // 입력 테스트 (첫 번째 입력 필드에 테스트 값 입력)
                    console.log(`✏️ ${section.name} 입력 테스트...`);
                    const firstInput = await page.locator('input:visible').first();
                    if (await firstInput.isVisible()) {
                        await firstInput.fill(`테스트 ${section.name} 값`);
                        console.log(`✅ 첫 번째 입력 필드에 값 입력 완료`);
                        
                        // 값 확인
                        const inputValue = await firstInput.inputValue();
                        console.log(`📝 입력된 값: "${inputValue}"`);
                    }
                    
                    // 저장 버튼 찾기 및 클릭
                    console.log(`💾 ${section.name} 저장 버튼 찾기...`);
                    const saveButtons = await page.locator('button').all();
                    let saveButton = null;
                    
                    for (const button of saveButtons) {
                        const text = await button.textContent();
                        if (text.includes('저장') || text.includes('적용') || text.includes('확인')) {
                            saveButton = button;
                            console.log(`✅ 저장 버튼 발견: "${text}"`);
                            break;
                        }
                    }
                    
                    if (saveButton) {
                        await saveButton.click();
                        await wait(2000);
                        console.log(`✅ ${section.name} 저장 버튼 클릭 완료`);
                    }
                    
                    // 모달 닫기
                    console.log(`❌ ${section.name} 모달 닫기...`);
                    const closeButtons = await page.locator('button').all();
                    let closeButton = null;
                    
                    for (const button of closeButtons) {
                        const text = await button.textContent();
                        if (text.includes('×') || text.includes('닫기') || text.includes('취소')) {
                            closeButton = button;
                            console.log(`✅ 닫기 버튼 발견: "${text}"`);
                            break;
                        }
                    }
                    
                    if (closeButton) {
                        await closeButton.click();
                        await wait(1000);
                        console.log(`✅ ${section.name} 모달 닫기 완료`);
                    } else {
                        // ESC 키로 닫기 시도
                        await page.keyboard.press('Escape');
                        await wait(1000);
                        console.log(`✅ ${section.name} ESC로 모달 닫기 시도`);
                    }
                    
                    // 다시 열어서 값 확인
                    console.log(`🔄 ${section.name} 다시 열어서 값 확인...`);
                    await wait(2000);
                    await targetCard.click();
                    await wait(2000);
                    
                    const reopenedInput = await page.locator('input:visible').first();
                    if (await reopenedInput.isVisible()) {
                        const savedValue = await reopenedInput.inputValue();
                        console.log(`📝 저장된 값: "${savedValue}"`);
                        
                        if (savedValue.includes(`테스트 ${section.name} 값`)) {
                            console.log(`✅ ${section.name} 값이 올바르게 저장되었습니다!`);
                        } else {
                            console.log(`⚠️ ${section.name} 값이 저장되지 않았거나 변경되었습니다`);
                        }
                    }
                    
                    // 모달 다시 닫기
                    await page.keyboard.press('Escape');
                    await wait(1000);
                    
                } else {
                    console.log(`❌ ${section.name} 모달이 열리지 않았습니다`);
                }
                
            } catch (error) {
                console.log(`❌ ${section.name} 테스트 실패: ${error.message}`);
            }
            
            // 섹션 간 대기
            await wait(2000);
        }
        
        console.log('\n🎉 모든 섹션 확인 완료!');
        
        // 브라우저 유지 (수동 확인을 위해)
        console.log('\n⏳ 브라우저를 열어둡니다. 수동으로 확인해보세요...');
        console.log('확인이 끝나면 브라우저를 닫아주세요.');
        
        // 브라우저 닫기 대기
        await page.waitForTimeout(300000); // 5분 대기
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
        await browser.close();
    }
})(); 