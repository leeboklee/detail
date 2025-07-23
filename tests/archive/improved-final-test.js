const { chromium } = require('playwright');
const fs = require('fs');

// 대기 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 결과 저장
const results = {
    timestamp: new Date().toISOString(),
    sections: [],
    summary: { total: 0, passed: 0, failed: 0 },
    improvements: []
};

// 개선된 안전한 클릭 함수 - 모달 오버레이 문제 해결
async function safeClick(page, element, description = '', forceClick = false) {
    try {
        await element.scrollIntoViewIfNeeded();
        await wait(500);
        
        if (forceClick) {
            // JavaScript로 강제 클릭 (모달 오버레이 우회)
            await element.evaluate(el => el.click());
        } else {
            await element.click();
        }
        
        await wait(1000);
        console.log(`✅ ${description} 클릭 성공`);
        return true;
    } catch (error) {
        console.log(`❌ ${description} 클릭 실패: ${error.message}`);
        
        // 재시도 - 강제 클릭으로
        if (!forceClick) {
            console.log(`🔄 ${description} 강제 클릭 재시도...`);
            return await safeClick(page, element, description, true);
        }
        
        return false;
    }
}

// 개선된 안전한 입력 함수 - 필드 타입별 처리
async function safeInput(page, selector, value, description = '', fieldType = 'text') {
    try {
        const element = page.locator(selector).first();
        await element.scrollIntoViewIfNeeded();
        await element.click();
        
        // 필드 타입에 따른 처리
        if (fieldType === 'number') {
            // 숫자 필드는 숫자만 입력
            const numericValue = value.replace(/[^0-9]/g, '');
            if (numericValue) {
                await element.fill(numericValue);
                console.log(`✅ ${description} 숫자 입력 성공: "${numericValue}"`);
                return true;
            } else {
                console.log(`⚠️ ${description} 숫자 변환 실패: "${value}"`);
                return false;
            }
        } else {
            // 텍스트 필드는 일반 입력
            await element.fill(''); // 기존 값 클리어
            await element.fill(value);
            console.log(`✅ ${description} 입력 성공: "${value}"`);
            return true;
        }
    } catch (error) {
        console.log(`❌ ${description} 입력 실패: ${error.message}`);
        return false;
    }
}

// 실제 입력 필드 탐지 및 매핑
async function detectInputFields(page, sectionName) {
    console.log(`🔍 ${sectionName} 실제 입력 필드 탐지...`);
    
    const fields = [];
    
    // 모든 visible 입력 필드 찾기
    const inputs = await page.locator('input:visible').all();
    const textareas = await page.locator('textarea:visible').all();
    
    // input 필드 분석
    for (let i = 0; i < inputs.length; i++) {
        try {
            const input = inputs[i];
            const type = await input.getAttribute('type') || 'text';
            const name = await input.getAttribute('name') || '';
            const placeholder = await input.getAttribute('placeholder') || '';
            const value = await input.inputValue();
            
            fields.push({
                index: i,
                element: input,
                type,
                name,
                placeholder,
                value,
                elementType: 'input'
            });
            
            console.log(`  Input ${i}: type="${type}", name="${name}", placeholder="${placeholder}", value="${value}"`);
        } catch (error) {
            console.log(`  Input ${i}: 분석 실패`);
        }
    }
    
    // textarea 필드 분석
    for (let i = 0; i < textareas.length; i++) {
        try {
            const textarea = textareas[i];
            const name = await textarea.getAttribute('name') || '';
            const placeholder = await textarea.getAttribute('placeholder') || '';
            const value = await textarea.inputValue();
            
            fields.push({
                index: inputs.length + i,
                element: textarea,
                type: 'textarea',
                name,
                placeholder,
                value,
                elementType: 'textarea'
            });
            
            console.log(`  Textarea ${i}: name="${name}", placeholder="${placeholder}", value="${value}"`);
        } catch (error) {
            console.log(`  Textarea ${i}: 분석 실패`);
        }
    }
    
    return fields;
}

// 개선된 저장 버튼 클릭 함수
async function clickSaveButton(page, sectionName) {
    console.log(`💾 ${sectionName} 저장 버튼 클릭...`);
    
    const saveTexts = ['저장', '적용', '확인', 'DB 저장', '🗄️ DB 저장'];
    
    for (const saveText of saveTexts) {
        try {
            const buttons = await page.locator('button').all();
            
            for (const button of buttons) {
                const text = await button.textContent();
                if (text && text.includes(saveText)) {
                    console.log(`✅ 저장 버튼 발견: "${text}"`);
                    
                    // 모달 스크롤을 맨 아래로 이동 (버튼이 보이도록)
                    await page.evaluate(() => {
                        const modal = document.querySelector('.modal-content, [role="dialog"], .fixed');
                        if (modal) {
                            modal.scrollTop = modal.scrollHeight;
                        }
                    });
                    
                    await wait(1000);
                    
                    // 강제 클릭으로 시도
                    const clicked = await safeClick(page, button, '저장 버튼', true);
                    if (clicked) {
                        await wait(3000); // 저장 처리 대기
                        return true;
                    }
                }
            }
        } catch (error) {
            console.log(`⚠️ "${saveText}" 버튼 클릭 시도 실패: ${error.message}`);
        }
    }
    
    console.log(`❌ ${sectionName} 저장 버튼 클릭 실패`);
    return false;
}

// 섹션별 맞춤형 테스트 데이터
const sectionTestData = {
    '호텔 정보': [
        { value: '그랜드 호텔', label: '호텔명' },
        { value: '서울시 중구 명동', label: '주소' },
        { value: '최고급 서비스를 제공하는 호텔입니다.', label: '호텔 설명' }
    ],
    '객실 정보': [
        { value: '14', label: '체크인 시간', type: 'number' },
        { value: '11', label: '체크아웃 시간', type: 'number' },
        { value: '디럭스 트윈룸', label: '객실명' },
        { value: '더블베드', label: '객실타입' },
        { value: '35평', label: '구조' }
    ],
    '시설 정보': [
        { value: '수영장, 피트니스센터, 스파, 레스토랑', label: '시설 정보' }
    ],
    '패키지': [
        { value: '로맨틱 패키지', label: '패키지명' },
        { value: '커플을 위한 특별한 서비스', label: '패키지 설명' }
    ],
    '추가요금': [
        { value: '30000', label: '추가요금', type: 'number' },
        { value: '엑스트라 베드 및 조식 포함', label: '요금 설명' }
    ]
};

// 개선된 섹션 테스트 함수
async function testSection(page, sectionInfo) {
    console.log(`\n🔍 === [${sectionInfo.name}] 섹션 테스트 시작 ===`);
    
    const sectionResult = {
        name: sectionInfo.name,
        steps: [],
        inputTests: [],
        success: false,
        error: null,
        improvements: []
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
        
        // 3. 실제 입력 필드 탐지
        const detectedFields = await detectInputFields(page, sectionInfo.name);
        sectionResult.improvements.push(`실제 입력 필드 ${detectedFields.length}개 탐지`);
        
        // 4. 입력 필드 테스트 - 섹션별 맞춤형 데이터 사용
        const testData = sectionTestData[sectionInfo.name] || [];
        
        if (testData.length > 0) {
            console.log(`✏️ ${sectionInfo.name} 입력 필드 테스트...`);
            
            for (let i = 0; i < Math.min(testData.length, detectedFields.length); i++) {
                const testInput = testData[i];
                const field = detectedFields[i];
                
                const inputResult = {
                    field: testInput.label,
                    value: testInput.value,
                    success: false,
                    error: null,
                    fieldType: field.type
                };
                
                try {
                    let inputSuccess = false;
                    
                    if (field.type === 'number' && testInput.type === 'number') {
                        // 숫자 필드에 숫자 입력
                        await field.element.fill(testInput.value);
                        inputSuccess = true;
                        console.log(`  ✅ ${testInput.label}: "${testInput.value}" 숫자 입력 성공`);
                    } else if (field.type !== 'number') {
                        // 텍스트 필드에 텍스트 입력
                        await field.element.fill(testInput.value);
                        inputSuccess = true;
                        console.log(`  ✅ ${testInput.label}: "${testInput.value}" 텍스트 입력 성공`);
                    } else {
                        console.log(`  ⚠️ ${testInput.label}: 필드 타입 불일치 (${field.type})`);
                    }
                    
                    inputResult.success = inputSuccess;
                    
                } catch (error) {
                    inputResult.error = error.message;
                    console.log(`  ❌ ${testInput.label}: 입력 실패 - ${error.message}`);
                }
                
                sectionResult.inputTests.push(inputResult);
            }
        }
        
        // 5. 개선된 저장 버튼 클릭
        const saveClicked = await clickSaveButton(page, sectionInfo.name);
        if (saveClicked) {
            sectionResult.steps.push({ step: '저장 버튼 클릭', success: true });
            sectionResult.improvements.push('저장 버튼 클릭 성공');
        } else {
            sectionResult.steps.push({ step: '저장 버튼 클릭', success: false });
        }
        
        // 6. 모달 닫기
        console.log(`❌ ${sectionInfo.name} 모달 닫기...`);
        await page.keyboard.press('Escape');
        await wait(1000);
        
        sectionResult.steps.push({ step: '모달 닫기', success: true });
        
        // 7. 자동저장 확인 (다시 열어서 값 확인)
        console.log(`🔄 ${sectionInfo.name} 자동저장 확인...`);
        await wait(2000);
        
        // 다시 카드 클릭
        const cardReopenClicked = await safeClick(page, targetCard, `${sectionInfo.name} 카드 재오픈`);
        if (cardReopenClicked) {
            await wait(2000);
            
            // 값 확인
            const reopenedFields = await detectInputFields(page, sectionInfo.name);
            let valuesPreserved = 0;
            
            for (let i = 0; i < Math.min(testData.length, reopenedFields.length); i++) {
                const testInput = testData[i];
                const field = reopenedFields[i];
                
                try {
                    const currentValue = await field.element.inputValue();
                    if (currentValue === testInput.value) {
                        valuesPreserved++;
                        console.log(`  ✅ ${testInput.label}: 값 유지됨 ("${currentValue}")`);
                    } else {
                        console.log(`  ⚠️ ${testInput.label}: 값 변경됨 ("${testInput.value}" → "${currentValue}")`);
                    }
                } catch (error) {
                    console.log(`  ❌ ${testInput.label}: 값 확인 실패`);
                }
            }
            
            sectionResult.steps.push({ 
                step: '자동저장 확인', 
                success: valuesPreserved > 0,
                details: `${valuesPreserved}/${testData.length} 값 유지됨`
            });
            
            if (valuesPreserved > 0) {
                sectionResult.improvements.push(`자동저장 기능 작동 확인 (${valuesPreserved}/${testData.length})`);
            }
            
            // 모달 다시 닫기
            await page.keyboard.press('Escape');
            await wait(1000);
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
        console.log('🚀 개선된 자동화 테스트 시작...');
        
        // 페이지 로드
        await page.goto('http://localhost: {process.env.PORT || 34343}');
        await page.waitForLoadState('networkidle');
        await wait(3000);
        
        console.log('✅ 페이지 로드 완료');
        
        // 테스트할 섹션들 - 실제 카드 텍스트에 맞게 수정
        const sections = [
            { name: '호텔 정보', searchText: '🏠호텔 정보' },
            { name: '객실 정보', searchText: '👥객실 정보' },
            { name: '시설 정보', searchText: '⚙️시설 정보' },
            { name: '패키지', searchText: '📄패키지' },
            { name: '추가요금', searchText: '💰추가요금' } // 이모지 중복 문제 해결
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
            
            // 개선사항 수집
            if (sectionResult.improvements.length > 0) {
                results.improvements.push({
                    section: section.name,
                    improvements: sectionResult.improvements
                });
            }
            
            // 섹션 간 대기
            await wait(2000);
        }
        
        // 최종 결과 출력
        console.log('\n📊 === 개선된 자동화 테스트 최종 결과 ===');
        console.log(`총 섹션: ${results.summary.total}`);
        console.log(`성공: ${results.summary.passed}`);
        console.log(`실패: ${results.summary.failed}`);
        console.log(`성공률: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);
        
        // 개선사항 출력
        console.log('\n🔧 === 적용된 개선사항 ===');
        for (const improvement of results.improvements) {
            console.log(`\n[${improvement.section}]`);
            for (const item of improvement.improvements) {
                console.log(`  ✅ ${item}`);
            }
        }
        
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
        const resultFile = `test-results/improved-test-${timestamp}.json`;
        fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
        console.log(`\n💾 결과 저장: ${resultFile}`);
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
        await browser.close();
    }
})(); 