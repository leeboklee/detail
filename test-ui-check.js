const puppeteer = require('puppeteer');

async function testUI() {
  console.log('🧪 UI 테스트 시작...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1440, height: 900 }
  });
  
  const page = await browser.newPage();
  
  try {
    // 1. 페이지 로드
    console.log('📄 페이지 로드 중...');
    await page.goto('http://localhost:3900', { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('✅ 페이지 로드 완료');
    
    // 2. 스크린샷 캡처
    await page.screenshot({ path: 'ui-test-result.png', fullPage: true });
    console.log('📷 스크린샷 저장: ui-test-result.png');
    
    // 3. 입력 필드 확인
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(input => ({
        id: input.id,
        name: input.name,
        type: input.type,
        placeholder: input.placeholder
      }));
    });
    console.log('📝 입력 필드:', inputs);
    
    // 4. 미리보기 영역 확인
    const preview = await page.evaluate(() => {
      const previewEl = document.querySelector('[class*="preview"], [id*="preview"]');
      return previewEl ? {
        text: previewEl.textContent.substring(0, 100),
        hasWhiteText: previewEl.querySelector('*[style*="color: white"], *[style*="color: #fff"]')
      } : null;
    });
    console.log('👁️ 미리보기:', preview);
    
    // 5. 호텔 이름 입력 테스트
    const nameInput = await page.$('input[name="name"], input[id="name"], input[placeholder*="호텔"]');
    if (nameInput) {
      await nameInput.type('테스트 호텔');
      console.log('✏️ 호텔 이름 입력 완료');
      
      // 입력 후 미리보기 확인
      await page.waitForTimeout(2000);
      const updatedPreview = await page.evaluate(() => {
        const previewEl = document.querySelector('[class*="preview"], [id*="preview"]');
        return previewEl ? previewEl.textContent.substring(0, 100) : null;
      });
      console.log('🔄 업데이트된 미리보기:', updatedPreview);
    } else {
      console.log('❌ 호텔 이름 입력 필드를 찾을 수 없음');
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'ui-test-error.png' });
  } finally {
    await browser.close();
  }
}

testUI(); 