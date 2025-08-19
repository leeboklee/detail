const puppeteer = require('puppeteer');

async function checkConsole() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  const consoleLogs = [];
  const errors = [];
  
  // 콘솔 로그 수집
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text()
    });
    
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  // 페이지 오류 수집
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  try {
    console.log('페이지 로딩 중...');
    await page.goto('http://localhost:3900/detail', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('페이지 로드 완료');
    
    // 3초 대기
    await page.waitForTimeout(3000);
    
    console.log('\n=== 브라우저 콘솔 로그 ===');
    consoleLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });
    
    console.log('\n=== 오류 목록 ===');
    if (errors.length === 0) {
      console.log('✅ 오류 없음');
    } else {
      errors.forEach(error => {
        console.log(`❌ ${error}`);
      });
    }
    
    // 페이지 내용 확인
    const pageContent = await page.content();
    console.log('\n=== 페이지 렌더링 상태 ===');
    
    if (pageContent.includes('Loading...') || pageContent.includes('로딩')) {
      console.log('⚠️ 페이지가 로딩 중입니다');
    } else if (pageContent.includes('AppContainer')) {
      console.log('✅ AppContainer가 렌더링되었습니다');
    } else {
      console.log('❌ 페이지 내용이 비어있습니다');
    }
    
    // 스크린샷 저장
    await page.screenshot({ path: 'debug-console-check.png' });
    console.log('스크린샷 저장: debug-console-check.png');
    
  } catch (error) {
    console.log('오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

checkConsole(); 