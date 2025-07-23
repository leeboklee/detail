const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function captureScreenshotAndTest() {
  console.log('테스트 시작: 브라우저 실행 및 스크린샷 캡처...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--window-size=1440,900'],
    slowMo: 100
  });
  
  const page = await browser.newPage();
  console.log('새 페이지 생성 완료');
  
  try {
    // 1. 페이지 로드
    console.log('페이지 접속 중...');
    await page.goto('http://localhost:4200', { 
      waitUntil: ['load', 'networkidle2'],
      timeout: 30000
    });
    console.log('페이지 로드 완료');
    
    // 페이지 로딩 대기
    console.log('페이지 로딩 대기 중...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 2. 초기 상태 스크린샷
    console.log('초기 상태 스크린샷 캡처...');
    await page.screenshot({ path: 'ui-screenshot.png', fullPage: true });
    console.log('초기 상태 스크린샷 저장 완료: ui-screenshot.png');
    
    // 3. 페이지 요소 확인
    console.log('페이지 요소 확인 중...');
    const pageTitle = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      return h1 ? h1.textContent : 'h1 요소 없음';
    });
    console.log('페이지 제목:', pageTitle);
    
    // 4. 입력 필드 가져오기 (이름 속성으로)
    const inputNames = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      return inputs.map(input => ({
        name: input.name || '이름 없음',
        id: input.id || '아이디 없음',
        type: input.type,
        placeholder: input.placeholder || '플레이스홀더 없음'
      }));
    });
    console.log('입력 필드 목록:', JSON.stringify(inputNames, null, 2));
    
    // 5. 모든 버튼 텍스트 가져오기
    const buttonTexts = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(button => button.textContent.trim());
    });
    console.log('버튼 목록:', buttonTexts);
    
    // 6. 호텔 이름 입력
    // ID를 사용하여 입력 시도
    console.log('호텔 이름 입력 시도...');
    try {
      const nameInputExists = await page.evaluate(() => {
        return !!document.querySelector('#name');
      });
      
      if (nameInputExists) {
        await page.type('#name', '테스트 호텔 이름');
        console.log('호텔 이름 입력 성공 (#name)');
      } else {
        // ID가 없으면 name 속성으로 시도
        const firstInput = await page.$('input[name="name"]');
        if (firstInput) {
          await firstInput.type('테스트 호텔 이름');
          console.log('호텔 이름 입력 성공 (input[name="name"])');
        } else {
          console.log('호텔 이름 입력 필드를 찾지 못했습니다');
          
          // 모든 입력 필드 확인
          const allInputs = await page.$$('input');
          console.log(`총 입력 필드 수: ${allInputs.length}`);
          
          // 첫 번째 입력 필드에 입력 시도
          if (allInputs.length > 0) {
            await allInputs[0].type('테스트 호텔 이름');
            console.log('첫 번째 입력 필드에 입력 성공');
          }
        }
      }
    } catch (inputError) {
      console.error('입력 오류:', inputError.message);
    }
    
    // 7. 입력 후 스크린샷
    console.log('입력 후 스크린샷 캡처...');
    await page.screenshot({ path: 'ui-after-input.png', fullPage: true });
    console.log('입력 후 스크린샷 저장 완료: ui-after-input.png');
    
    // 8. "미리보기 생성" 버튼 클릭
    console.log('미리보기 버튼 찾기 시도...');
    try {
      // 텍스트로 버튼 찾기
      const previewButton = await page.$('button:is(:text("미리보기 생성"), :text("미리보기"))');
      
      if (previewButton) {
        console.log('미리보기 버튼 찾음, 클릭 시도...');
        await previewButton.click();
        console.log('미리보기 버튼 클릭 성공');
      } else {
        console.log('미리보기 버튼을 찾지 못했습니다.');
        
        // 모든 버튼을 찾아서 첫 번째 버튼 클릭
        const allButtons = await page.$$('button');
        if (allButtons.length > 0) {
          console.log(`총 버튼 수: ${allButtons.length}, 첫 번째 버튼 클릭 시도...`);
          await allButtons[0].click();
          console.log('첫 번째 버튼 클릭 성공');
        }
      }
    } catch (clickError) {
      console.error('버튼 클릭 오류:', clickError.message);
    }
    
    // 9. 미리보기 로딩 대기
    console.log('미리보기 로딩 대기...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 10. 미리보기 후 스크린샷
    console.log('미리보기 후 스크린샷 캡처...');
    await page.screenshot({ path: 'ui-after-preview.png', fullPage: true });
    console.log('미리보기 후 스크린샷 저장 완료: ui-after-preview.png');
    
    // 11. 미리보기 영역 부동 스크린샷
    console.log('미리보기 영역 스크린샷 캡처...');
    try {
      const previewArea = await page.$('#previewContainer');
      if (previewArea) {
        await previewArea.screenshot({ path: 'ui-after-preview-floating.png' });
        console.log('미리보기 영역 스크린샷 저장 완료: ui-after-preview-floating.png');
      } else {
        console.log('미리보기 영역을 찾지 못했습니다.');
      }
    } catch (previewError) {
      console.error('미리보기 영역 캡처 오류:', previewError.message);
    }
    
    // 12. 콘솔 로그 확인
    const consoleLogs = await page.evaluate(() => {
      return Array.from(window.performance.getEntries())
        .filter(entry => entry.entryType === 'resource')
        .map(entry => ({
          name: entry.name,
          duration: entry.duration,
          transferSize: entry.transferSize
        }));
    });
    
    await fs.writeFile('page.html', await page.content());
    console.log('페이지 소스 저장 완료: page.html');
    
    console.log('테스트 완료');
    
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
    console.log('오류 상태 스크린샷 저장 완료: error-state.png');
  } finally {
    // 13. 브라우저 종료
    await browser.close();
    console.log('브라우저 종료 완료');
  }
}

captureScreenshotAndTest().catch(console.error); 