const { chromium } = require('@playwright/test');

async function captureConsoleLogs() {
  const browser = await chromium.launch({ 
    headless: false, // 브라우저 창을 열어서 확인
    slowMo: 1000 
  });
  const page = await browser.newPage();
  
  const consoleLogs = [];
  const errors = [];
  const warnings = [];
  const networkErrors = [];
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    const logEntry = {
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    };
    
    consoleLogs.push(logEntry);
    
    if (msg.type() === 'error') {
      errors.push(logEntry);
    } else if (msg.type() === 'warning') {
      warnings.push(logEntry);
    }
  });
  
  // 페이지 오류 수집
  page.on('pageerror', error => {
    errors.push({
      text: `Page Error: ${error.message}`,
      type: 'pageerror',
      stack: error.stack
    });
  });
  
  // 네트워크 오류 수집
  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push({
        status: response.status(),
        url: response.url(),
        statusText: response.statusText()
      });
    }
  });
  
  try {
    console.log('🌐 페이지 로딩 중...');
    await page.goto('http://localhost:3900/detail', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ 페이지 로드 완료');
    
    // 5초 대기하여 모든 로그 수집
    await page.waitForTimeout(5000);
    
    console.log('\n📊 === 브라우저 콘솔 로그 분석 결과 ===');
    console.log(`📝 총 로그 수: ${consoleLogs.length}`);
    console.log(`❌ 오류 수: ${errors.length}`);
    console.log(`⚠️ 경고 수: ${warnings.length}`);
    console.log(`🌐 네트워크 오류 수: ${networkErrors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ === 발견된 오류 ===');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. [${error.type}] ${error.text}`);
        if (error.location) {
          console.log(`   위치: ${error.location.url}:${error.location.lineNumber}`);
        }
      });
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ === 발견된 경고 ===');
      warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.text}`);
      });
    }
    
    if (networkErrors.length > 0) {
      console.log('\n🌐 === 네트워크 오류 ===');
      networkErrors.forEach((error, index) => {
        console.log(`${index + 1}. HTTP ${error.status}: ${error.url}`);
      });
    }
    
    if (errors.length === 0 && warnings.length === 0 && networkErrors.length === 0) {
      console.log('\n✅ 모든 오류가 해결되었습니다!');
    }
    
    // 스크린샷 캡처
    await page.screenshot({ 
      path: 'console-log-check.png',
      fullPage: true 
    });
    console.log('\n📸 스크린샷 저장: console-log-check.png');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

captureConsoleLogs(); 