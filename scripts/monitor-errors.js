const puppeteer = require('puppeteer');

async function monitorErrors() {
  console.log('🔍 오류 모니터링 시작...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  const page = await browser.newPage();
  const errors = [];

  // 콘솔 오류 수집
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const error = {
        type: 'console_error',
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      errors.push(error);
      console.log('🚨 콘솔 오류:', error);
    }
  });

  // 페이지 오류 수집
  page.on('pageerror', error => {
    const pageError = {
      type: 'page_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    errors.push(pageError);
    console.log('🚨 페이지 오류:', pageError);
  });

  // 네트워크 오류 수집
  page.on('response', response => {
    if (response.status() >= 400) {
      const networkError = {
        type: 'network_error',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      };
      errors.push(networkError);
      console.log('🚨 네트워크 오류:', networkError);
    }
  });

  try {
    // admin 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 34343}/admin', { waitUntil: 'networkidle2' });
    console.log('✅ Admin 페이지 로드 완료');

    // 30초간 모니터링
    console.log('⏰ 30초간 오류 모니터링 중...');
    await page.waitForTimeout(30000);

    // 결과 요약
    console.log('\n📊 오류 감지 결과:');
    console.log(`총 오류 수: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n🚨 감지된 오류들:');
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type}:`);
        console.log('   메시지:', error.message || error.text);
        console.log('   시간:', error.timestamp);
        if (error.url) console.log('   URL:', error.url);
        if (error.stack) console.log('   스택:', error.stack);
      });
    } else {
      console.log('✅ 오류가 감지되지 않았습니다!');
    }

  } catch (error) {
    console.error('❌ 모니터링 중 오류 발생:', error);
  } finally {
    await browser.close();
    console.log('🔍 모니터링 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  monitorErrors().catch(console.error);
}

module.exports = { monitorErrors }; 