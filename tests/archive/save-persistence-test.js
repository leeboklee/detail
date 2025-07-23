const { chromium } = require('playwright');

// 대기 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 안전한 클릭 함수
async function safeClick(page, element, description = '') {
    try {
        await element.scrollIntoViewIfNeeded();
        await wait(500);
        await element.click();
        await wait(1000);
        console.log(`✅ ${description} 클릭 성공`);
        return true;
    } catch (error) {
        console.log(`❌ ${description} 클릭 실패: ${error.message}`);
        try {
            await element.evaluate(el => el.click());
            await wait(1000);
            console.log(`✅ ${description} 강제 클릭 성공`);
            return true;
        } catch (e) {
            console.log(`❌ ${description} 강제 클릭도 실패: ${e.message}`);
            return false;
        }
    }
}

// 저장 확인 함수
async function testSavePersistence(page, sectionName, testData) {
    console.log(`\n🔍 === [${sectionName}] 저장 지속성 테스트 ===`);
    
    try {
        // 1. 섹션 카드 찾기
        const cards = await page.locator('div.cursor-pointer').all();
        let targetCard = null;
        
        for (const card of cards) {
            const text = await card.textContent();
            if (text.includes(sectionName)) {
                targetCard = card;
                console.log(`✅ ${sectionName} 카드 발견: "${text}"`);
                break;
            }
        }
        
        if (!targetCard) {
            console.log(`❌ ${sectionName} 카드를 찾을 수 없습니다`);
            return false;
        }
        
        // 2. 첫 번째 모달 열기
        await safeClick(page, targetCard, `${sectionName} 카드 첫 번째 열기`);
        await wait(2000);
        
        // 3. 입력 필드 찾기 및 수정
        const inputs = await page.locator('input:visible').all();
        const textareas = await page.locator('textarea:visible').all();
        
        console.log(`📝 ${sectionName} 필드 수정 시작...`);
        
        // 첫 번째 입력 필드에 테스트 값 입력
        if (inputs.length > 0) {
            const firstInput = inputs[0];
            const originalValue = await firstInput.inputValue();
            console.log(`원래 값: "${originalValue}"`);
            
            await firstInput.fill(testData.value);
            await wait(1000);
            
            const newValue = await firstInput.inputValue();
            console.log(`수정된 값: "${newValue}"`);
            
            // 4. 저장 버튼 클릭
            console.log(`💾 ${sectionName} 저장 버튼 클릭...`);
            const saveButtons = await page.locator('button').all();
            
            for (const button of saveButtons) {
                const text = await button.textContent();
                if (text && (text.includes('저장') || text.includes('DB 저장') || text.includes('적용'))) {
                    console.log(`✅ 저장 버튼 발견: "${text}"`);
                    await safeClick(page, button, '저장 버튼');
                    await wait(3000); // 저장 완료 대기
                    break;
                }
            }
            
            // 5. 모달 닫기
            console.log(`❌ ${sectionName} 모달 닫기...`);
            await page.keyboard.press('Escape');
            await wait(2000);
            
            // 6. 다시 모달 열기
            console.log(`🔄 ${sectionName} 다시 열기...`);
            await safeClick(page, targetCard, `${sectionName} 카드 재오픈`);
            await wait(2000);
            
            // 7. 값 확인
            const reopenedInputs = await page.locator('input:visible').all();
            if (reopenedInputs.length > 0) {
                const savedValue = await reopenedInputs[0].inputValue();
                console.log(`재오픈 후 값: "${savedValue}"`);
                
                if (savedValue === testData.value) {
                    console.log(`✅ ${sectionName} 값이 정상적으로 저장되었습니다!`);
                    
                    // 모달 닫기
                    await page.keyboard.press('Escape');
                    await wait(1000);
                    
                    return true;
                } else {
                    console.log(`❌ ${sectionName} 값이 저장되지 않았습니다. 원래 값으로 돌아갔습니다.`);
                    console.log(`  기대값: "${testData.value}"`);
                    console.log(`  실제값: "${savedValue}"`);
                    
                    // 모달 닫기
                    await page.keyboard.press('Escape');
                    await wait(1000);
                    
                    return false;
                }
            }
        }
        
        return false;
        
    } catch (error) {
        console.log(`❌ ${sectionName} 테스트 중 오류: ${error.message}`);
        return false;
    }
}

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🚀 === 저장 지속성 테스트 시작 ===');
        
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await page.waitForLoadState('networkidle');
        await wait(3000);
        
        console.log('✅ 페이지 로드 완료');
        
        // 네트워크 요청 모니터링
        const requests = [];
        page.on('request', request => {
            if (request.url().includes('/api/') && (request.method() === 'PUT' || request.method() === 'POST')) {
                requests.push({
                    method: request.method(),
                    url: request.url(),
                    timestamp: new Date().toISOString()
                });
                console.log(`📡 API 요청: ${request.method()} ${request.url()}`);
            }
        });
        
        page.on('response', response => {
            if (response.url().includes('/api/') && (response.request().method() === 'PUT' || response.request().method() === 'POST')) {
                console.log(`📡 API 응답: ${response.status()} ${response.url()}`);
            }
        });
        
        // 테스트할 섹션들과 테스트 데이터
        const testSections = [
            { 
                name: '호텔 정보', 
                data: { value: '테스트 호텔 수정됨', label: '호텔명' }
            },
            { 
                name: '객실 정보', 
                data: { value: '테스트 객실 수정됨', label: '객실명' }
            },
            { 
                name: '시설 정보', 
                data: { value: '테스트 시설 수정됨', label: '시설명' }
            }
        ];
        
        const results = [];
        
        // 각 섹션 테스트
        for (const section of testSections) {
            const result = await testSavePersistence(page, section.name, section.data);
            results.push({
                section: section.name,
                success: result,
                data: section.data
            });
            
            await wait(2000);
        }
        
        // 최종 결과 출력
        console.log('\n📊 === 저장 지속성 테스트 결과 ===');
        
        let successCount = 0;
        for (const result of results) {
            if (result.success) {
                console.log(`✅ ${result.section}: 저장 성공`);
                successCount++;
            } else {
                console.log(`❌ ${result.section}: 저장 실패`);
            }
        }
        
        console.log(`\n🎯 총 ${results.length}개 섹션 중 ${successCount}개 성공 (${((successCount / results.length) * 100).toFixed(1)}%)`);
        
        // API 요청 분석
        console.log('\n📡 === API 요청 분석 ===');
        if (requests.length > 0) {
            console.log(`총 ${requests.length}개의 저장 요청이 발생했습니다:`);
            for (const req of requests) {
                console.log(`  ${req.method} ${req.url} - ${req.timestamp}`);
            }
        } else {
            console.log('❌ 저장 요청이 전혀 발생하지 않았습니다!');
            console.log('💡 이것이 값이 저장되지 않는 원인입니다.');
        }
        
        if (successCount === 0) {
            console.log('\n🔧 === 문제 진단 ===');
            console.log('❌ 모든 섹션에서 저장이 실패했습니다.');
            console.log('💡 가능한 원인:');
            console.log('   1. 저장 버튼이 실제로 API를 호출하지 않음');
            console.log('   2. 프론트엔드에서 백엔드로 데이터를 전송하지 않음');
            console.log('   3. 자동저장 기능이 비활성화됨');
            console.log('   4. 저장 로직에 버그가 있음');
        }
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
        await browser.close();
    }
})(); 