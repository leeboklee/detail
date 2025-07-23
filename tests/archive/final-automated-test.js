const { chromium } = require('playwright');
const fs = require('fs');

// 대기 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 결과 저장
const results = {
    timestamp: new Date().toISOString(),
    sections: [],
    summary: { total: 0, passed: 0, failed: 0 }
};

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
        return false;
    }
}

// 안전한 입력 함수
async function safeInput(page, selector, value, description = '') {
    try {
        const element = page.locator(selector).first();
        await element.scrollIntoViewIfNeeded();
        await element.click();
        await element.fill(''); // 기존 값 클리어
        await element.fill(value);
        await wait(500);
        console.log(`✅ ${description} 입력 성공: "${value}"`);
        return true;
    } catch (error) {
        console.log(`❌ ${description} 입력 실패: ${error.message}`);
        return false;
    }
}

// 섹션 테스트 함수
async function testSection(page, sectionInfo) {
    console.log(`\n🔍 === [${sectionInfo.name}] 섹션 테스트 시작 ===`);
    
    const sectionResult = {
        name: sectionInfo.name,
        steps: [],
        inputTests: [],
        success: false,
        error: null
    };
    
    try {
        // 1. 섹션 카드 찾기 및 클릭
        console.log(`🔍 ${sectionInfo.name} 카드 찾기...`);
        const cards = await page.locator('div.cursor-pointer').all();
        let targetCard = null;
        
        for (const card of cards) {
            const text = await card.textContent();
            if (text.includes(sectionInfo.searchText)) {
                targetCard = card;
                console.log(`✅ ${sectionInfo.name} 카드 발견: "${text}"`);
                break;
            }
        }
        
        if (!targetCard) {
            throw new Error(`${sectionInfo.name} 카드를 찾을 수 없습니다`);
        }
        
        // 카드 클릭
        const cardClicked = await safeClick(page, targetCard, `${sectionInfo.name} 카드`);
        if (!cardClicked) {
            throw new Error('카드 클릭 실패');
        }
        
        sectionResult.steps.push({ step: '카드 클릭', success: true });
        
        // 2. 모달 열림 확인
        console.log(`🔍 ${sectionInfo.name} 모달 확인...`);
        await page.waitForSelector('.fixed, [role="dialog"], .modal', { timeout: 10000 });
        
        const modalVisible = await page.locator('.fixed, [role="dialog"], .modal').first().isVisible();
        if (!modalVisible) {
            throw new Error('모달이 열리지 않았습니다');
        }
        
        console.log(`✅ ${sectionInfo.name} 모달 열림 확인`);
        sectionResult.steps.push({ step: '모달 열림', success: true });
        
        // 3. 입력 필드 테스트
        if (sectionInfo.testInputs && sectionInfo.testInputs.length > 0) {
            console.log(`✏️ ${sectionInfo.name} 입력 필드 테스트...`);
            
            for (const inputTest of sectionInfo.testInputs) {
                const inputResult = {
                    field: inputTest.label,
                    value: inputTest.value,
                    success: false,
                    error: null
                };
                
                try {
                    // 다양한 선택자로 시도
                    const selectors = [
                        inputTest.selector,
                        `input[placeholder*="${inputTest.label}"]`,
                        `input[name*="${inputTest.label.toLowerCase()}"]`,
                        `textarea[placeholder*="${inputTest.label}"]`,
                        `textarea[name*="${inputTest.label.toLowerCase()}"]`
                    ];
                    
                    let inputSuccess = false;
                    for (const selector of selectors) {
                        try {
                            const element = page.locator(selector).first();
                            if (await element.isVisible()) {
                                await element.fill(inputTest.value);
                                inputSuccess = true;
                                console.log(`  ✅ ${inputTest.label}: "${inputTest.value}" 입력 성공`);
                                break;
                            }
                        } catch (e) {
                            continue;
                        }
                    }
                    
                    if (!inputSuccess) {
                        // 모든 visible input/textarea에 순서대로 입력 시도
                        const allInputs = await page.locator('input:visible, textarea:visible').all();
                        if (allInputs.length > 0) {
                            const index = sectionInfo.testInputs.indexOf(inputTest);
                            if (index < allInputs.length) {
                                await allInputs[index].fill(inputTest.value);
                                inputSuccess = true;
                                console.log(`  ✅ ${inputTest.label}: "${inputTest.value}" 입력 성공 (인덱스 ${index})`);
                            }
                        }
                    }
                    
                    inputResult.success = inputSuccess;
                    if (!inputSuccess) {
                        inputResult.error = '입력 필드를 찾을 수 없습니다';
                        console.log(`  ⚠️ ${inputTest.label}: 입력 필드를 찾을 수 없습니다`);
                    }
                    
                } catch (error) {
                    inputResult.error = error.message;
                    console.log(`  ❌ ${inputTest.label}: 입력 실패 - ${error.message}`);
                }
                
                sectionResult.inputTests.push(inputResult);
            }
        }
        
        // 4. 저장/적용 버튼 찾기 및 클릭
        console.log(`💾 ${sectionInfo.name} 저장 버튼 찾기...`);
        const buttons = await page.locator('button').all();
        let saveButton = null;
        
        for (const button of buttons) {
            const text = await button.textContent();
            if (text && (text.includes('저장') || text.includes('적용') || text.includes('확인'))) {
                saveButton = button;
                console.log(`✅ 저장 버튼 발견: "${text}"`);
                break;
            }
        }
        
        if (saveButton) {
            const saveClicked = await safeClick(page, saveButton, '저장 버튼');
            if (saveClicked) {
                sectionResult.steps.push({ step: '저장 버튼 클릭', success: true });
                await wait(2000); // 저장 처리 대기
            }
        }
        
        // 5. 모달 닫기
        console.log(`❌ ${sectionInfo.name} 모달 닫기...`);
        let modalClosed = false;
        
        // ESC 키로 닫기 시도
        await page.keyboard.press('Escape');
        await wait(1000);
        
        // 모달이 닫혔는지 확인
        const modalStillVisible = await page.locator('.fixed, [role="dialog"], .modal').first().isVisible();
        if (!modalStillVisible) {
            modalClosed = true;
            console.log(`✅ ${sectionInfo.name} 모달 닫기 성공 (ESC)`);
        } else {
            // 닫기 버튼 찾기
            const closeButtons = await page.locator('button').all();
            for (const button of closeButtons) {
                const text = await button.textContent();
                if (text && (text.includes('×') || text.includes('닫기') || text.includes('취소'))) {
                    await safeClick(page, button, '닫기 버튼');
                    modalClosed = true;
                    break;
                }
            }
        }
        
        if (modalClosed) {
            sectionResult.steps.push({ step: '모달 닫기', success: true });
        }
        
        // 6. 값 유지 확인 (다시 열어서 확인)
        if (sectionInfo.testInputs && sectionInfo.testInputs.length > 0) {
            console.log(`🔄 ${sectionInfo.name} 값 유지 확인...`);
            await wait(2000);
            
            // 다시 카드 클릭
            const cardReopenClicked = await safeClick(page, targetCard, `${sectionInfo.name} 카드 재오픈`);
            if (cardReopenClicked) {
                await wait(2000);
                
                // 값 확인
                let valuesPreserved = 0;
                for (const inputTest of sectionInfo.testInputs) {
                    try {
                        const allInputs = await page.locator('input:visible, textarea:visible').all();
                        const index = sectionInfo.testInputs.indexOf(inputTest);
                        if (index < allInputs.length) {
                            const currentValue = await allInputs[index].inputValue();
                            if (currentValue === inputTest.value) {
                                valuesPreserved++;
                                console.log(`  ✅ ${inputTest.label}: 값 유지됨 ("${currentValue}")`);
                            } else {
                                console.log(`  ⚠️ ${inputTest.label}: 값 변경됨 ("${inputTest.value}" → "${currentValue}")`);
                            }
                        }
                    } catch (error) {
                        console.log(`  ❌ ${inputTest.label}: 값 확인 실패`);
                    }
                }
                
                sectionResult.steps.push({ 
                    step: '값 유지 확인', 
                    success: valuesPreserved > 0,
                    details: `${valuesPreserved}/${sectionInfo.testInputs.length} 값 유지됨`
                });
                
                // 모달 다시 닫기
                await page.keyboard.press('Escape');
                await wait(1000);
            }
        }
        
        sectionResult.success = true;
        console.log(`✅ [${sectionInfo.name}] 섹션 테스트 완료`);
        
    } catch (error) {
        sectionResult.error = error.message;
        console.log(`❌ [${sectionInfo.name}] 섹션 테스트 실패: ${error.message}`);
    }
    
    return sectionResult;
}

(async () => {
    const browser = await chromium.launch({ 
        headless: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        console.log('🚀 자동화 테스트 시작...');
        
        // 페이지 로드
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await page.waitForLoadState('networkidle');
        await wait(3000);
        
        console.log('✅ 페이지 로드 완료');
        
        // 테스트할 섹션들
        const sections = [
            {
                name: '호텔 정보',
                searchText: '🏠호텔 정보',
                testInputs: [
                    { selector: 'input[name="hotelName"]', value: '테스트 호텔', label: '호텔명' },
                    { selector: 'input[name="address"]', value: '서울시 강남구', label: '주소' },
                    { selector: 'textarea[name="description"]', value: '테스트 호텔 설명', label: '호텔 설명' }
                ]
            },
            {
                name: '객실 정보',
                searchText: '👥객실 정보',
                testInputs: [
                    { selector: 'input[name="roomName"]', value: '디럭스 트윈룸', label: '객실명' },
                    { selector: 'input[name="roomType"]', value: '더블베드', label: '객실타입' },
                    { selector: 'input[name="roomSize"]', value: '35평', label: '구조' },
                    { selector: 'input[name="bedType"]', value: '킹사이즈 베드', label: '침대타입' },
                    { selector: 'input[name="roomView"]', value: 'City View', label: '전망' }
                ]
            },
            {
                name: '시설 정보',
                searchText: '⚙️시설 정보',
                testInputs: [
                    { selector: 'textarea[name="facilities"]', value: '수영장, 피트니스센터, 스파', label: '시설 정보' }
                ]
            },
            {
                name: '패키지',
                searchText: '📄패키지',
                testInputs: [
                    { selector: 'input[name="packageName"]', value: '허니문 패키지', label: '패키지명' },
                    { selector: 'textarea[name="packageDesc"]', value: '신혼부부 전용 패키지', label: '패키지 설명' }
                ]
            },
            {
                name: '추가요금',
                searchText: '💰추가요금',
                testInputs: [
                    { selector: 'input[name="additionalFee"]', value: '50000', label: '추가요금' },
                    { selector: 'textarea[name="feeDescription"]', value: '엑스트라 베드 요금', label: '요금 설명' }
                ]
            }
        ];
        
        // 각 섹션 테스트 실행
        for (const section of sections) {
            const sectionResult = await testSection(page, section);
            results.sections.push(sectionResult);
            results.summary.total++;
            
            if (sectionResult.success) {
                results.summary.passed++;
            } else {
                results.summary.failed++;
            }
            
            // 섹션 간 대기
            await wait(2000);
        }
        
        // 최종 결과 출력
        console.log('\n📊 === 자동화 테스트 최종 결과 ===');
        console.log(`총 섹션: ${results.summary.total}`);
        console.log(`성공: ${results.summary.passed}`);
        console.log(`실패: ${results.summary.failed}`);
        console.log(`성공률: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
        
        // 상세 결과
        console.log('\n📋 === 상세 결과 ===');
        for (const section of results.sections) {
            console.log(`\n[${section.name}] ${section.success ? '✅ 성공' : '❌ 실패'}`);
            if (section.error) {
                console.log(`  오류: ${section.error}`);
            }
            
            if (section.inputTests.length > 0) {
                const successInputs = section.inputTests.filter(t => t.success).length;
                console.log(`  입력 테스트: ${successInputs}/${section.inputTests.length} 성공`);
            }
            
            console.log(`  완료된 단계: ${section.steps.filter(s => s.success).length}/${section.steps.length}`);
        }
        
        // 결과 파일 저장
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultFile = `test-results/automated-test-${timestamp}.json`;
        fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
        console.log(`\n💾 결과 저장: ${resultFile}`);
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
        await browser.close();
    }
})(); 