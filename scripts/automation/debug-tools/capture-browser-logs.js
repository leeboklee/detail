// 브라우저를 제어하여 콘솔 로그와 네트워크 로그를 수집하는 스크립트
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TARGET_URL = `http://localhost:${process.env.PORT || 3900}`;

// 로그 저장 디렉토리 설정
const LOG_DIR = path.join(__dirname, '..', 'logs', 'browser-logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

async function captureBrowserLogs() {
  console.log(`${TARGET_URL} 방문 및 로그 수집 시작...`);
  
  let browser;
  try {
    // Playwright로 브라우저 시작
    browser = await chromium.launch({ 
      headless: true, // 브라우저를 눈으로 확인하기 위해 headless 모드 끄기
      timeout: 120000 // 브라우저 시작 타임아웃 2분으로 설정
    });
    
    // 새 페이지 열기
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
      serviceWorkers: 'block',
      extraHTTPHeaders: {
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7'
      },
    });
    
    await context.setDefaultTimeout(120000); // 모든 작업의 기본 타임아웃 2분으로 설정
    
    const page = await context.newPage();
    
    // 콘솔 로그 수집
    const consoleLogs = [];
    page.on('console', msg => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        time: new Date().toISOString()
      };
      consoleLogs.push(logEntry);
      console.log(`[콘솔] [${logEntry.type}] ${logEntry.text}`);
    });
    
    // 페이지 오류 수집
    const pageErrors = [];
    page.on('pageerror', error => {
      const errorEntry = {
        message: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      };
      pageErrors.push(errorEntry);
      console.error(`[페이지 오류] ${errorEntry.message}`);
    });
    
    // 네트워크 요청 수집
    const networkRequests = [];
    page.on('request', request => {
      const requestEntry = {
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        time: new Date().toISOString(),
        headers: request.headers()
      };
      networkRequests.push(requestEntry);
    });
    
    // 네트워크 응답 수집
    const networkResponses = [];
    page.on('response', async response => {
      let responseBody = null;
      
      try {
        // JSON 응답인 경우에만 본문 저장
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          responseBody = await response.json().catch(() => null);
        }
      } catch (e) {
        // 응답 본문 처리 오류 무시
      }
      
      const responseEntry = {
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        method: response.request().method(),
        resourceType: response.request().resourceType(),
        time: new Date().toISOString(),
        headers: response.headers(),
        body: responseBody
      };
      
      networkResponses.push(responseEntry);
      
      // 실패한 요청 로깅
      if (response.status() >= 400) {
        console.error(`[네트워크 오류] ${response.status()} ${response.statusText()} - ${response.url()}`);
      }
    });
    
    // 페이지 이동
    console.log(`페이지 이동: ${TARGET_URL}`);
    await page.goto(TARGET_URL, { 
      waitUntil: 'networkidle', 
      timeout: 120000 // 페이지 로드 타임아웃 2분으로 증가
    });
    
    // 페이지 로드 후 스크린샷 캡처
    console.log('페이지 로드 완료, 스크린샷 촬영');
    await page.screenshot({ path: path.join(LOG_DIR, 'screenshot-initial.png'), fullPage: true });
    
    // 잠시 대기 (비동기 로드 완료 기다림)
    await page.waitForTimeout(3000);
    
    // "템플릿 목록" 버튼 클릭
    try {
      console.log('"템플릿 목록" 버튼 찾는 중...');
      const templateListButton = await page.locator('div.cursor-pointer:has-text("템플릿 목록")').first();
      
      if (await templateListButton.count() > 0) {
        console.log('"템플릿 목록" 버튼을 찾았습니다. 클릭 중...');
        await templateListButton.click();
        console.log('"템플릿 목록" 버튼 클릭 완료');
        
        // 모달이 열릴 때까지 대기
        await page.waitForSelector('[role="dialog"]'); 
        console.log('모달 열림 확인');
        
        // 모달 안에서 첫 번째 "불러오기" 버튼 클릭 (활성화된 버튼 중)
        console.log('모달 안에서 "불러오기" 버튼 찾는 중...');
        const loadButton = await page.locator('[role="dialog"] button:has-text("불러오기"):not([disabled])').first();

        if (await loadButton.count() > 0) {
          console.log('모달 안에서 "불러오기" 버튼을 찾았습니다. 클릭 중...');
          await loadButton.click();
          console.log('모달 안에서 "불러오기" 버튼 클릭 완료');
          await page.waitForTimeout(3000); // 데이터 로드 및 UI 업데이트 대기
        } else {
          console.log('모달 안에서 활성화된 "불러오기" 버튼을 찾지 못했습니다. 이미 사용 중인 템플릿일 수 있습니다.');
        }

      } else {
        console.log('"템플릿 목록" 버튼을 찾지 못했습니다');
      }
    } catch (error) {
      console.error('"템플릿 목록" 또는 "불러오기" 버튼 클릭 중 오류:', error);
    }
    
    // DOM 정보 추출
    const htmlContent = await page.content();
    fs.writeFileSync(path.join(LOG_DIR, 'page-html.html'), htmlContent);
    console.log('HTML 콘텐츠 저장 완료');
    
    // 수집한 로그들 저장
    console.log('수집한 로그 저장 중...');
    
    // 콘솔 로그 저장
    fs.writeFileSync(
      path.join(LOG_DIR, 'console-logs.json'), 
      JSON.stringify(consoleLogs, null, 2)
    );
    console.log(`콘솔 로그 ${consoleLogs.length}개 저장 완료`);
    
    // 페이지 오류 저장
    fs.writeFileSync(
      path.join(LOG_DIR, 'page-errors.json'),
      JSON.stringify(pageErrors, null, 2)
    );
    console.log(`페이지 오류 ${pageErrors.length}개 저장 완료`);
    
    // 네트워크 요청 저장
    fs.writeFileSync(
      path.join(LOG_DIR, 'network-requests.json'),
      JSON.stringify(networkRequests, null, 2)
    );
    console.log(`네트워크 요청 ${networkRequests.length}개 저장 완료`);
    
    // 네트워크 응답 저장
    fs.writeFileSync(
      path.join(LOG_DIR, 'network-responses.json'),
      JSON.stringify(networkResponses, null, 2)
    );
    console.log(`네트워크 응답 ${networkResponses.length}개 저장 완료`);
    
    // 실패한 응답만 별도로 저장
    const failedResponses = networkResponses.filter(response => response.status >= 400);
    fs.writeFileSync(
      path.join(LOG_DIR, 'failed-responses.json'),
      JSON.stringify(failedResponses, null, 2)
    );
    console.log(`실패한 응답 ${failedResponses.length}개 저장 완료`);
    
    console.log(`모든 로그가 ${LOG_DIR} 디렉토리에 저장되었습니다`);
    
  } catch (error) {
    console.error('로그 수집 중 오류 발생:', error);
  } finally {
    // 브라우저 종료
    if (browser) {
      await browser.close();
    }
    console.log('브라우저 종료 & 로그 수집 완료');
  }
}

// 스크립트 실행
captureBrowserLogs(); 