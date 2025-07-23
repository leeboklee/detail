const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 결과 저장 디렉토리 생성
const resultsDir = 'test-results';
if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
}

// waitForTimeout 대체 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 개선된 대기 함수 - 요소가 로드될 때까지 대기
async function waitForElement(page, selector, timeout = 60000) {
    try {
        await page.waitForSelector(selector, { timeout });
        return true;
    } catch (error) {
        console.log(`⚠️ 요소 대기 실패: ${selector} (${timeout}ms)`);
        return false;
    }
}

// 개선된 페이지 로드 대기
async function waitForPageLoad(page, timeout = 60000) {
    try {
        await page.waitForLoadState('networkidle', { timeout });
        await wait(2000); // 추가 안정화 시간
        return true;
    } catch (error) {
        console.log(`⚠️ 페이지 로드 대기 실패: ${error.message}`);
        return false;
    }
}

// 재시도 로직이 포함된 안전한 클릭 함수
async function safeClick(page, selector, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await page.waitForSelector(selector, { timeout: 10000 });
            await page.click(selector);
            await wait(1000);
            return true;
        } catch (error) {
            console.log(`⚠️ 클릭 시도 ${i + 1}/${retries} 실패: ${error.message}`);
            if (i === retries - 1) throw error;
            await wait(2000);
        }
    }
    return false;
}

// 안전한 입력 함수
async function safeType(page, selector, text, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await page.waitForSelector(selector, { timeout: 10000 });
            await page.click(selector);
            await page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) element.value = '';
            }, selector);
            await page.type(selector, text);
            await wait(500);
            return true;
        } catch (error) {
            console.log(`⚠️ 입력 시도 ${i + 1}/${retries} 실패: ${error.message}`);
            if (i === retries - 1) throw error;
            await wait(1000);
        }
    }
    return false;
}

// 텍스트로 DIV 카드 찾기
async function findCardByText(page, searchText) {
    try {
        const cardElements = await page.$$('div.cursor-pointer');
        for (const card of cardElements) {
            const text = await page.evaluate(el => el.textContent, card);
            if (text.includes(searchText)) {
                return card;
            }
        }
        return null;
    } catch (error) {
        console.log(`⚠️ 카드 찾기 실패: ${error.message}`);
        return null;
    }
}

// 모달 닫기 함수
async function closeModal(page) {
    try {
        // X 버튼 클릭
        const closeButton = await page.$('button:has-text("×")');
        if (closeButton) {
            await closeButton.click();
            await wait(1000);
            return true;
        }
        
        // 취소 버튼 클릭
        const cancelButton = await page.$('button:has-text("취소")');
        if (cancelButton) {
            await cancelButton.click();
            await wait(1000);
            return true;
        }
        
        return false;
    } catch (error) {
        console.log(`⚠️ 모달 닫기 실패: ${error.message}`);
        return false;
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-web-security']
    });

    const page = await browser.newPage();
    const results = {
        timestamp: new Date().toISOString(),
        tests: [],
        summary: {
            total: 0,
            passed: 0,
            failed: 0
        }
    };

    try {
        console.log('🚀 종합 테스트 시작...');
        
        // 페이지 로드
        console.log('📄 페이지 로딩...');
        await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle0', timeout: 60000 });
        
        // React 컴포넌트 로드 대기
        await page.waitForSelector('div.cursor-pointer', { timeout: 60000 });
        await wait(3000);
        
        console.log('✅ 페이지 로드 완료');

        // 테스트할 섹션들 - 실제 페이지 구조에 맞게 수정
        const sections = [
            { 
                key: 'hotel', 
                name: '호텔 정보', 
                searchText: '🏠호텔 정보',
                testInputs: [
                    { selector: 'input[name="hotelName"]', value: '테스트 호텔', label: '호텔명' },
                    { selector: 'input[name="address"]', value: '서울시 강남구', label: '주소' },
                    { selector: 'textarea[name="description"]', value: '테스트 호텔 설명', label: '호텔 설명' }
                ]
            },
            { 
                key: 'rooms', 
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
                key: 'facilities', 
                name: '시설 정보', 
                searchText: '⚙️시설 정보',
                testInputs: [
                    { selector: 'textarea[name="facilities"]', value: '수영장, 피트니스센터, 스파', label: '시설 정보' }
                ]
            },
            { 
                key: 'packages', 
                name: '패키지', 
                searchText: '📄패키지',
                testInputs: [
                    { selector: 'input[name="packageName"]', value: '허니문 패키지', label: '패키지명' },
                    { selector: 'textarea[name="packageDesc"]', value: '신혼부부 전용 패키지', label: '패키지 설명' }
                ]
            },
            { 
                key: 'pricing', 
                name: '추가요금', 
                searchText: '💰추가요금',
                testInputs: [
                    { selector: 'input[name="additionalFee"]', value: '50000', label: '추가요금' },
                    { selector: 'textarea[name="feeDescription"]', value: '엑스트라 베드 요금', label: '요금 설명' }
                ]
            }
        ];

        // 각 섹션 테스트
        for (const section of sections) {
            console.log(`\n🔍 [${section.name}] 섹션 테스트 시작...`);
            
            const testResult = {
                section: section.name,
                key: section.key,
                steps: [],
                success: false,
                error: null
            };

            try {
                // 1. 섹션 카드 클릭
                console.log(`📋 ${section.name} 카드 클릭...`);
                const card = await findCardByText(page, section.searchText);
                
                if (!card) {
                    throw new Error(`${section.name} 카드를 찾을 수 없습니다`);
                }
                
                await card.click();
                await wait(2000);
                
                testResult.steps.push({
                    step: '카드 클릭',
                    success: true,
                    message: `${section.name} 카드 클릭 성공`
                });

                // 2. 모달 열림 확인
                const modalOpened = await page.waitForSelector('.modal-content, [role="dialog"]', { timeout: 10000 });
                if (!modalOpened) {
                    throw new Error('모달이 열리지 않았습니다');
                }
                
                testResult.steps.push({
                    step: '모달 열림',
                    success: true,
                    message: '모달이 성공적으로 열렸습니다'
                });

                // 3. 입력 필드 테스트 (해당 섹션에 입력 필드가 있는 경우)
                if (section.testInputs && section.testInputs.length > 0) {
                    console.log(`✏️ ${section.name} 입력 필드 테스트...`);
                    
                    for (const input of section.testInputs) {
                        try {
                            const inputElement = await page.$(input.selector);
                            if (inputElement) {
                                await safeType(page, input.selector, input.value);
                                console.log(`  ✅ ${input.label}: "${input.value}" 입력 성공`);
                                
                                testResult.steps.push({
                                    step: `${input.label} 입력`,
                                    success: true,
                                    message: `"${input.value}" 입력 성공`
                                });
                            } else {
                                console.log(`  ⚠️ ${input.label} 필드를 찾을 수 없습니다`);
                            }
                        } catch (error) {
                            console.log(`  ❌ ${input.label} 입력 실패: ${error.message}`);
                        }
                    }

                    // 4. 적용하기 버튼 클릭
                    console.log(`💾 ${section.name} 적용하기 버튼 클릭...`);
                    const applyButton = await page.$('button:has-text("적용하기")');
                    if (applyButton) {
                        await applyButton.click();
                        await wait(2000);
                        
                        testResult.steps.push({
                            step: '적용하기',
                            success: true,
                            message: '적용하기 버튼 클릭 성공'
                        });
                    }

                    // 5. 모달 닫기 (X 버튼 또는 취소 버튼)
                    console.log(`❌ ${section.name} 모달 닫기...`);
                    const modalClosed = await closeModal(page);
                    if (modalClosed) {
                        testResult.steps.push({
                            step: '모달 닫기',
                            success: true,
                            message: '모달이 성공적으로 닫혔습니다'
                        });
                    }

                    // 6. 다시 열어서 값 확인
                    console.log(`🔄 ${section.name} 다시 열어서 값 확인...`);
                    await wait(2000);
                    
                    const cardReopen = await findCardByText(page, section.searchText);
                    if (cardReopen) {
                        await cardReopen.click();
                        await wait(2000);
                        
                        // 값 확인
                        let valuesPreserved = 0;
                        for (const input of section.testInputs) {
                            try {
                                const currentValue = await page.$eval(input.selector, el => el.value);
                                if (currentValue === input.value) {
                                    console.log(`  ✅ ${input.label}: 값 유지됨 ("${currentValue}")`);
                                    valuesPreserved++;
                                } else {
                                    console.log(`  ⚠️ ${input.label}: 값 변경됨 ("${input.value}" → "${currentValue}")`);
                                }
                            } catch (error) {
                                console.log(`  ❌ ${input.label}: 값 확인 실패`);
                            }
                        }
                        
                        testResult.steps.push({
                            step: '값 확인',
                            success: valuesPreserved > 0,
                            message: `${valuesPreserved}/${section.testInputs.length} 값이 유지됨`
                        });
                        
                        // 모달 다시 닫기
                        await closeModal(page);
                    }
                }

                testResult.success = true;
                results.summary.passed++;
                console.log(`✅ [${section.name}] 테스트 완료`);

            } catch (error) {
                testResult.error = error.message;
                results.summary.failed++;
                console.log(`❌ [${section.name}] 테스트 실패: ${error.message}`);
            }

            results.tests.push(testResult);
            results.summary.total++;
            
            // 테스트 간 대기
            await wait(2000);
        }

        // 최종 결과 출력
        console.log('\n📊 === 최종 테스트 결과 ===');
        console.log(`총 테스트: ${results.summary.total}`);
        console.log(`성공: ${results.summary.passed}`);
        console.log(`실패: ${results.summary.failed}`);
        console.log(`성공률: ${((results.summary.passed / results.summary.total) * 100).toFixed(1)}%`);

        // 결과 파일 저장
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const resultFile = path.join(resultsDir, `comprehensive-test-${timestamp}.json`);
        fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
        console.log(`\n💾 결과 저장: ${resultFile}`);

    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
        await browser.close();
    }
})(); 