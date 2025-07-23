const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 개선된 대기 함수
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 재시도 로직이 포함된 안전한 클릭 함수
async function safeClick(page, selector, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const element = await page.locator(selector).first();
            await element.scrollIntoViewIfNeeded();
            await wait(500);
            await element.click();
            return true;
        } catch (error) {
            console.log(`⚠️ 클릭 시도 ${i + 1}/${retries} 실패: ${error.message}`);
            if (i === retries - 1) throw error;
            await wait(1000);
        }
    }
    return false;
}

// 안전한 입력 함수
async function safeType(page, selector, text, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const element = await page.locator(selector).first();
            await element.scrollIntoViewIfNeeded();
            await element.click();
            await element.clear();
            await element.type(text, { delay: 50 });
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

async function saveValuesTest() {
    console.log('🚀 개선된 저장 시점 값 수집 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 100
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        // 페이지 로드 (타임아웃 60초)
        await page.goto('http://localhost: {process.env.PORT || 34343}', { 
            waitUntil: 'networkidle',
            timeout: 60000 
        });
        
        // 페이지 완전 로드 대기
        await wait(5000);
        
        // React 컴포넌트 로드 확인
        await page.waitForSelector('button', { timeout: 30000 });
        console.log('✅ 페이지 로드 완료');

        // 객실 정보 카드 클릭 (개선된 클릭)
        console.log('�� 객실 정보 카드 클릭...');
        
        // 실제 페이지 구조에 맞게 DIV 카드 선택
        const roomsButtonClicked = await safeClick(page, 'div.cursor-pointer:has-text("👥객실 정보")');
        
        if (!roomsButtonClicked) {
            // 대안 선택자 시도
            const cardElements = await page.locator('div.cursor-pointer').all();
            let foundCard = false;
            
            for (const card of cardElements) {
                try {
                    const text = await card.textContent();
                    if (text.includes('객실 정보') || text.includes('👥객실')) {
                        await card.click();
                        foundCard = true;
                        console.log(`✅ 객실 정보 카드 클릭 성공: "${text}"`);
                        break;
                    }
                } catch (error) {
                    console.log(`⚠️ 카드 텍스트 확인 실패: ${error.message}`);
                }
            }
            
            if (!foundCard) {
                throw new Error('객실 정보 카드를 찾을 수 없음');
            }
        }
        
        // 모달 로드 대기
        await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
        await wait(2000);

        // 입력 필드 찾기
        const inputFields = await page.locator('[role="dialog"] input[type="text"]').all();
        console.log(`📝 입력 필드 ${inputFields.length}개 발견`);

        if (inputFields.length === 0) {
            throw new Error('입력 필드를 찾을 수 없음');
        }

        // 테스트 데이터
        const testData = [
            "디럭스 트윈룸",
            "더블베드", 
            "35평",
            "킹사이즈 베드",
            "City View"
        ];

        // 각 필드에 데이터 입력
        for (let i = 0; i < Math.min(testData.length, inputFields.length); i++) {
            console.log(`📝 필드 ${i + 1}에 "${testData[i]}" 입력...`);
            
            try {
                await inputFields[i].scrollIntoViewIfNeeded();
                await inputFields[i].click();
                await inputFields[i].clear();
                await inputFields[i].type(testData[i], { delay: 50 });
                await wait(500);
                
                // 입력 확인
                const value = await inputFields[i].inputValue();
                if (value === testData[i]) {
                    console.log(`✅ 입력 완료: "${value}"`);
                } else {
                    console.log(`⚠️ 입력 불일치: 예상 "${testData[i]}", 실제 "${value}"`);
                }
            } catch (error) {
                console.log(`❌ 필드 ${i + 1} 입력 실패: ${error.message}`);
            }
        }

        // 자동저장 대기
        console.log('💾 자동저장 대기 중...');
        await wait(3000);

        // 저장 전 모든 필드 값 수집
        console.log('💾 저장 전 모든 필드 값 수집...');
        const allInputs = await page.locator('[role="dialog"] input[type="text"]').all();
        
        for (let i = 0; i < allInputs.length; i++) {
            try {
                const value = await allInputs[i].inputValue();
                const name = await allInputs[i].getAttribute('name') || `field-${i + 1}`;
                console.log(`필드 ${i + 1} [${name}]: "${value}"`);
            } catch (error) {
                console.log(`필드 ${i + 1} 값 읽기 실패: ${error.message}`);
            }
        }

        // JavaScript로 DOM 값 수집
        console.log('🔍 JavaScript로 DOM 값 수집...');
        const domValues = await page.evaluate(() => {
            const inputs = document.querySelectorAll('[role="dialog"] input[type="text"]');
            return Array.from(inputs).map((input, index) => ({
                index: index + 1,
                name: input.name || `field-${index + 1}`,
                value: input.value
            }));
        });

        console.log('DOM에서 수집한 값들:');
        domValues.forEach(item => {
            console.log(`필드 ${item.index} [${item.name}]: "${item.value}"`);
        });

        // 저장 버튼 클릭
        console.log('💾 저장 버튼 클릭...');
        const saveButtonSelectors = [
            'button:has-text("저장")',
            'button:has-text("완료")',
            'button:has-text("확인")',
            '[data-testid="save-button"]'
        ];

        let saveButtonClicked = false;
        for (const selector of saveButtonSelectors) {
            try {
                const saveButton = page.locator(selector).first();
                if (await saveButton.isVisible()) {
                    await saveButton.click();
                    saveButtonClicked = true;
                    console.log(`✅ 저장 버튼 클릭 성공: ${selector}`);
                    break;
                }
            } catch (error) {
                console.log(`⚠️ 저장 버튼 시도 실패: ${selector}`);
            }
        }

        if (!saveButtonClicked) {
            console.log('⚠️ 저장 버튼을 찾을 수 없음, ESC로 모달 닫기');
            await page.keyboard.press('Escape');
            await wait(1000);
        } else {
            // 저장 후 대기
            await wait(2000);
        }

        // 저장 후 값 확인 (모달이 닫혔을 수 있으므로 다시 열기)
        console.log('📊 저장 후 값 확인...');
        
        try {
            // 모달이 아직 열려있는지 확인
            const modalStillOpen = await page.locator('[role="dialog"]').isVisible();
            
            if (!modalStillOpen) {
                console.log('🔄 모달이 닫혔음, 다시 열기...');
                
                // DIV 카드 형태로 다시 클릭
                const cardElements = await page.locator('div.cursor-pointer').all();
                let reopened = false;
                
                for (const card of cardElements) {
                    try {
                        const text = await card.textContent();
                        if (text.includes('객실 정보') || text.includes('👥객실')) {
                            await card.click();
                            reopened = true;
                            console.log(`✅ 객실 정보 카드 재오픈 성공: "${text}"`);
                            break;
                        }
                    } catch (error) {
                        console.log(`⚠️ 카드 재오픈 실패: ${error.message}`);
                    }
                }
                
                if (!reopened) {
                    throw new Error('객실 정보 카드 재오픈 실패');
                }
                
                await page.waitForSelector('[role="dialog"]', { timeout: 30000 });
                await wait(1000);
            }

            // 저장된 값 확인
            const savedInputs = await page.locator('[role="dialog"] input[type="text"]').all();
            console.log('저장된 값들:');
            
            for (let i = 0; i < savedInputs.length; i++) {
                try {
                    const value = await savedInputs[i].inputValue();
                    const name = await savedInputs[i].getAttribute('name') || `field-${i + 1}`;
                    console.log(`필드 ${i + 1} [${name}]: "${value}"`);
                } catch (error) {
                    console.log(`필드 ${i + 1} 값 읽기 실패: ${error.message}`);
                }
            }

            console.log('✅ 자동저장 테스트 완료');
            
        } catch (error) {
            console.log(`❌ 저장 후 값 확인 실패: ${error.message}`);
        }

    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
saveValuesTest().catch(console.error); 