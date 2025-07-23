const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function finalCompleteTest() {
  console.log('🎯 최종 완전 한글 입력 테스트 시작...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    // 콘솔 로그 캡처
    page.on('console', msg => {
      if (msg.text().includes('SimpleInput') || msg.text().includes('한글') || msg.text().includes('[name]')) {
        console.log(`🖥️ 브라우저: ${msg.text()}`);
      }
    });
    
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'domcontentloaded' });
    console.log('✅ 페이지 로드 완료');
    
    await delay(3000);
    
    // 객실 정보 섹션 클릭
    console.log('🏨 객실 정보 섹션 클릭...');
    const roomSection = await page.evaluateHandle(() => {
      const elements = Array.from(document.querySelectorAll('.cursor-pointer'));
      return elements.find(el => el.textContent?.includes('객실 정보'));
    });
    
    if (roomSection) {
      await roomSection.click();
      console.log('✅ 객실 정보 섹션 클릭 완료');
      await delay(5000); // 더 긴 대기
      
      // 입력 필드 확인
      const inputCount = await page.evaluate(() => {
        return document.querySelectorAll('input[name]').length;
      });
      
      console.log(`📋 name 속성이 있는 입력 필드: ${inputCount}개`);
      
      if (inputCount === 0) {
        console.log('⚠️ 필드가 없습니다. 페이지 새로고침 후 재시도...');
        await page.reload({ waitUntil: 'domcontentloaded' });
        await delay(3000);
        
        // 다시 객실 정보 섹션 클릭
        const roomSection2 = await page.evaluateHandle(() => {
          const elements = Array.from(document.querySelectorAll('.cursor-pointer'));
          return elements.find(el => el.textContent?.includes('객실 정보'));
        });
        
        if (roomSection2) {
          await roomSection2.click();
          await delay(5000);
        }
      }
      
      // 테스트 케이스들
      const testCases = [
        { name: 'name', value: '디럭스 트윈룸', description: '객실명' },
        { name: 'type', value: '더블베드', description: '객실타입' },
        { name: 'structure', value: '35평', description: '구조' },
        { name: 'bedType', value: '킹사이즈 베드', description: '침대타입' },
        { name: 'view', value: 'City View', description: '전망' }
      ];
      
      let totalTests = 0;
      let successTests = 0;
      let partialTests = 0;
      
      for (const testCase of testCases) {
        totalTests++;
        console.log(`\n📝 ${testCase.description} 입력 테스트: "${testCase.value}"`);
        
        try {
          const inputSelector = `input[name="${testCase.name}"]`;
          const fieldExists = await page.$(inputSelector);
          
          if (!fieldExists) {
            console.log(`❌ 필드를 찾을 수 없음: ${testCase.name}`);
            continue;
          }
          
          // 필드에 포커스
          await page.focus(inputSelector);
          await delay(200);
          
          // 기존 값 완전히 지우기
          await page.keyboard.down('Control');
          await page.keyboard.press('KeyA');
          await page.keyboard.up('Control');
          await page.keyboard.press('Delete');
          await delay(300);
          
          // 한글 입력 (더 느린 속도로)
          console.log(`⌨️ "${testCase.value}" 입력 중...`);
          await page.type(inputSelector, testCase.value, { delay: 200 });
          
          // 입력 완료 후 블러 처리 (중요!)
          await delay(1000);
          await page.evaluate((selector) => {
            const input = document.querySelector(selector);
            if (input) {
              input.blur();
            }
          }, inputSelector);
          
          // 추가 대기
          await delay(2000);
          
          // 결과 확인
          const actualValue = await page.$eval(inputSelector, el => el.value);
          
          if (actualValue === testCase.value) {
            console.log(`✅ 완전 성공: "${actualValue}"`);
            successTests++;
          } else if (actualValue.length > 0) {
            console.log(`🟡 부분 성공: "${testCase.value}" → "${actualValue}"`);
            partialTests++;
          } else {
            console.log(`❌ 실패: 값이 비어있음`);
          }
          
        } catch (error) {
          console.log(`❌ 테스트 실패: ${testCase.name} - ${error.message}`);
        }
      }
      
      // 결과 요약
      console.log('\n📊 === 최종 테스트 결과 ===');
      console.log(`총 테스트: ${totalTests}개`);
      console.log(`완전 성공: ${successTests}개 (${totalTests > 0 ? Math.round(successTests/totalTests*100) : 0}%)`);
      console.log(`부분 성공: ${partialTests}개 (${totalTests > 0 ? Math.round(partialTests/totalTests*100) : 0}%)`);
      console.log(`실패: ${totalTests - successTests - partialTests}개 (${totalTests > 0 ? Math.round((totalTests - successTests - partialTests)/totalTests*100) : 0}%)`);
      
      if (totalTests > 0) {
        const overallSuccess = (successTests + partialTests) / totalTests * 100;
        console.log(`전체 성공률: ${Math.round(overallSuccess)}%`);
        
        if (overallSuccess >= 90) {
          console.log('🎉 완벽한 성공! (90% 이상)');
        } else if (overallSuccess >= 80) {
          console.log('🎊 테스트 통과! (80% 이상)');
        } else {
          console.log('⚠️ 추가 개선 필요');
        }
      }
      
    } else {
      console.log('❌ 객실 정보 섹션을 찾을 수 없음');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
  } finally {
    // 20초 후 브라우저 종료
    setTimeout(async () => {
      await browser.close();
      console.log('🔚 브라우저 종료');
    }, 20000);
  }
}

finalCompleteTest().catch(console.error); 