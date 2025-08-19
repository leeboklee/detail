const { chromium } = require('@playwright/test');

async function quickConsoleCheck() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
  });
  
  try {
    console.log('🔍 빠른 콘솔 로그 확인 중...');
    await page.goto('http://localhost:3900/detail', { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });
    
    // 2초 대기
    await page.waitForTimeout(2000);
    
    console.log(`\n📊 결과: ${logs.length}개 로그, ${errors.length}개 오류`);
    
    if (errors.length > 0) {
      console.log('\n❌ 오류 목록:');
      errors.forEach((error, i) => console.log(`${i+1}. ${error}`));
    } else {
      console.log('✅ 오류 없음');
    }
    
    // 주요 로그만 출력
    const importantLogs = logs.filter(log => 
      log.type === 'error' || 
      log.type === 'warning' || 
      log.text.includes('error') || 
      log.text.includes('Error')
    );
    
    if (importantLogs.length > 0) {
      console.log('\n⚠️ 주요 로그:');
      importantLogs.forEach(log => console.log(`[${log.type}] ${log.text}`));
    }
    
  } catch (error) {
    console.error('❌ 연결 오류:', error.message);
  } finally {
    await browser.close();
  }
}

quickConsoleCheck(); 