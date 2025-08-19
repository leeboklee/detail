const puppeteer = require('puppeteer');

async function testUIInteraction() {
  console.log('🧪 UI 상호작용 테스트 시작...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // 페이지 로드
    console.log('📄 페이지 로딩 중...');
    await page.goto('http://localhost:3900', { waitUntil: 'networkidle0' });
    
    // 초기 상태 확인
    console.log('🔍 초기 상태 확인...');
    await page.waitForSelector('input[name="name"]', { timeout: 10000 });
    
    // 호텔 이름 입력
    console.log('✏️ 호텔 이름 입력 테스트...');
    await page.type('input[name="name"]', '테스트 호텔 123');
    
    // 잠시 대기
    await page.waitForTimeout(2000);
    
    // 오른쪽 미리보기에서 내용 확인
    console.log('👀 미리보기 내용 확인...');
    const previewContent = await page.evaluate(() => {
      const previewElement = document.querySelector('[ref="previewRef"]') || 
                           document.querySelector('.preview-content') ||
                           document.querySelector('[style*="overflow: auto"]');
      return previewElement ? previewElement.textContent : '미리보기 요소를 찾을 수 없음';
    });
    
    console.log('📋 미리보기 내용:', previewContent.substring(0, 100) + '...');
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'ui-interaction-test.png', 
      fullPage: true 
    });
    console.log('📸 스크린샷 저장됨: ui-interaction-test.png');
    
    // 결과 확인
    if (previewContent.includes('테스트 호텔 123')) {
      console.log('✅ 성공: 왼쪽 입력이 오른쪽에 반영됨!');
    } else {
      console.log('❌ 실패: 왼쪽 입력이 오른쪽에 반영되지 않음');
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

testUIInteraction(); 