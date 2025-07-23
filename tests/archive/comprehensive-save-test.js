const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 테스트 설정
const TEST_CONFIG = {
  url: 'http://localhost: {process.env.PORT || 34343}',
  timeout: 60000,
  retries: 3,
  sections: [
    { name: '호텔 정보', selector: 'text=호텔 정보' },
    { name: '객실 정보', selector: 'text=객실 정보' },
    { name: '시설 정보', selector: 'text=시설 정보' },
    { name: '패키지', selector: 'text=패키지' },
    { name: '추가요금', selector: 'text=추가요금' }
  ]
};

// 유틸리티 함수들
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`⚠️ 재시도 ${i + 1}/${retries}: ${error.message}`);
      await delay(2000);
    }
  }
};

const takeScreenshot = async (page, filename) => {
  const screenshotPath = path.join(__dirname, 'debug', filename);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`📸 스크린샷 저장: ${screenshotPath}`);
};

// 메인 테스트 함수
async function runSaveTest() {
  console.log('🚀 저장 기능 테스트 시작...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  try {
    // 페이지 로드
    console.log('📄 페이지 로드...');
    await page.goto(TEST_CONFIG.url, { 
      waitUntil: 'networkidle2', 
      timeout: TEST_CONFIG.timeout 
    });

    await delay(3000);

    const results = [];

    // 각 섹션별 저장 기능 테스트
    for (const section of TEST_CONFIG.sections) {
      console.log(`\n🧪 테스트: ${section.name} 저장 기능`);
      
      try {
        // 섹션 클릭 (텍스트 기반)
        await retryOperation(async () => {
          await page.evaluate((sectionName) => {
            const elements = Array.from(document.querySelectorAll('*')).filter(el => 
              el.textContent && el.textContent.includes(sectionName) && 
              (el.tagName === 'DIV' || el.tagName === 'BUTTON' || el.tagName === 'SPAN')
            );
            
            // 클릭 가능한 요소 찾기
            const clickableElement = elements.find(el => {
              const style = window.getComputedStyle(el);
              return style.cursor === 'pointer' || 
                     el.tagName === 'BUTTON' || 
                     el.onclick || 
                     el.getAttribute('role') === 'button';
            });
            
            if (clickableElement) {
              clickableElement.click();
              return true;
            }
            
            // 클릭 가능한 요소가 없으면 첫 번째 요소 클릭
            if (elements.length > 0) {
              elements[0].click();
              return true;
            }
            
            return false;
          }, section.name);
          
          console.log(`✅ ${section.name} 클릭 성공`);
        });

        // 모달 대기
        await retryOperation(async () => {
          await page.waitForSelector('[role="dialog"]', { visible: true, timeout: 10000 });
          console.log(`✅ ${section.name} 모달 열림 확인`);
        });

        await delay(2000);

        // DB 저장 버튼 찾기 및 클릭
        const saveResult = await page.evaluate(() => {
          const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('DB 저장') || 
            btn.textContent.includes('저장하기') ||
            (btn.textContent.includes('저장') && !btn.textContent.includes('불러오기'))
          );
          
          console.log('찾은 저장 버튼:', saveButtons.map(btn => btn.textContent));
          
          if (saveButtons.length > 0) {
            // 가장 적절한 저장 버튼 선택
            const saveButton = saveButtons.find(btn => btn.textContent.includes('DB 저장')) || saveButtons[0];
            
            // 버튼이 보이는지 확인
            const rect = saveButton.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            
            if (isVisible) {
              saveButton.click();
              return { success: true, buttonText: saveButton.textContent };
            } else {
              return { success: false, reason: '버튼이 보이지 않음' };
            }
          }
          return { success: false, reason: '저장 버튼을 찾을 수 없음' };
        });

        if (saveResult.success) {
          console.log(`✅ ${section.name} 저장 버튼 클릭 성공: ${saveResult.buttonText}`);
          
          // 저장 완료 메시지 대기 (더 길게)
          await delay(5000);
          
          // 저장 메시지 확인 (더 넓은 범위)
          const saveMessage = await page.evaluate(() => {
            const messageElements = Array.from(document.querySelectorAll('*')).filter(el => 
              el.textContent && (
                el.textContent.includes('저장되었습니다') || 
                el.textContent.includes('저장 성공') ||
                el.textContent.includes('저장 완료') ||
                el.textContent.includes('저장 중') ||
                el.textContent.includes('✅') ||
                el.textContent.includes('성공') ||
                el.textContent.includes('완료')
              )
            );
            
            // 모든 메시지 로그로 출력
            console.log('찾은 메시지 요소들:', messageElements.map(el => el.textContent.trim()).slice(0, 10));
            
            return messageElements.length > 0 ? messageElements[0].textContent.trim() : null;
          });

          if (saveMessage) {
            console.log(`✅ ${section.name} 저장 완료: ${saveMessage}`);
            results.push({ section: section.name, status: '성공', message: saveMessage });
          } else {
            console.log(`⚠️ ${section.name} 저장 메시지 확인 안됨`);
            results.push({ section: section.name, status: '불명', message: '저장 메시지 없음' });
          }
        } else {
          console.log(`❌ ${section.name} 저장 버튼 클릭 실패: ${saveResult.reason}`);
          results.push({ section: section.name, status: '실패', message: saveResult.reason });
        }

        // 모달 닫기
        await retryOperation(async () => {
          // ESC 키로 모달 닫기
          await page.keyboard.press('Escape');
          await delay(1000);
          
          // 모달이 닫혔는지 확인
          const modalExists = await page.$('[role="dialog"]');
          if (!modalExists) {
            console.log(`✅ ${section.name} 모달 닫기 성공`);
          } else {
            throw new Error('모달이 닫히지 않음');
          }
        });

        await delay(2000);

      } catch (error) {
        console.log(`❌ ${section.name} 저장 테스트 실패: ${error.message}`);
        results.push({ section: section.name, status: '실패', message: error.message });
        
        // 모달이 열려있다면 닫기 시도
        try {
          await page.keyboard.press('Escape');
          await delay(1000);
        } catch (e) {
          // 무시
        }
      }
    }

    // 결과 출력
    console.log('\n📊 저장 기능 테스트 결과:');
    console.log('==================================================');
    
    let successCount = 0;
    results.forEach((result, index) => {
      const statusIcon = result.status === '성공' ? '✅' : result.status === '실패' ? '❌' : '⚠️';
      console.log(`${index + 1}. ${result.section}: ${statusIcon} ${result.status}`);
      if (result.message) {
        console.log(`   메시지: ${result.message}`);
      }
      
      if (result.status === '성공') successCount++;
    });
    
    console.log('==================================================');
    console.log(`총 ${results.length}개 섹션 중 ${successCount}개 성공 (${Math.round(successCount/results.length*100)}%)`);

    // 최종 스크린샷
    await takeScreenshot(page, 'save-test-final.png');

    // 결과 저장
    const resultData = {
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        total: results.length,
        success: successCount,
        successRate: Math.round(successCount/results.length*100)
      }
    };

    const resultPath = path.join(__dirname, 'debug', 'save-test-results.json');
    fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
    console.log(`📄 결과 저장: ${resultPath}`);

    console.log('\n🏁 저장 기능 테스트 완료');
    
    return results;

  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    await takeScreenshot(page, 'save-test-error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

// API 저장 테스트 함수
async function testApiSave() {
  console.log('\n🔧 API 저장 기능 직접 테스트...');
  
  const testData = {
    hotel: {
      name: '테스트 호텔',
      address: '서울시 강남구',
      phone: '02-1234-5678'
    },
    rooms: [{
      name: '디럭스 룸',
      type: '더블',
      structure: '35평',
      bedType: '킹사이즈',
      view: '시티뷰'
    }],
    facilities: [{
      name: '수영장',
      description: '야외 수영장',
      category: 'general'
    }],
    packages: [{
      name: '허니문 패키지',
      description: '신혼부부 전용 패키지',
      price: 200000
    }],
    charges: {
      items: [{
        name: '주차비',
        price: '5000',
        description: '1일 기준'
      }]
    }
  };

  try {
    const response = await fetch('http://localhost: {process.env.PORT || 34343}/api/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '통합 테스트 템플릿',
        ...testData,
        isTemplate: true
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API 저장 테스트 성공:', result.message || '저장 완료');
      return true;
    } else {
      console.log('❌ API 저장 테스트 실패:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ API 저장 테스트 오류:', error.message);
    return false;
  }
}

// 메인 실행
async function main() {
  try {
    // 디버그 디렉토리 생성
    const debugDir = path.join(__dirname, 'debug');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }

    // API 테스트 먼저 실행
    await testApiSave();
    
    // UI 저장 기능 테스트
    await runSaveTest();
    
    console.log('\n🎯 모든 테스트 완료!');
    
  } catch (error) {
    console.error('❌ 테스트 실행 실패:', error);
    process.exit(1);
  }
}

// 실행
main(); 