const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sections = [
  { name: '호텔 정보', buttonText: '💾 호텔정보 저장' },
  { name: '객실 정보', buttonText: '💾 객실정보 저장' },
  { name: '시설 정보', buttonText: '💾 시설정보 저장' },
  { name: '패키지', buttonText: '💾 패키지 저장' },
  { name: '추가요금', buttonText: '💾 추가요금 저장' }
];

async function testAllSaveFunctions() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await delay(3000);
    
    // 네트워크 요청 모니터링
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // alert 대화상자 처리
    const alerts = [];
    page.on('dialog', async dialog => {
      alerts.push(dialog.message());
      console.log('🚨 Alert:', dialog.message());
      await dialog.accept();
    });
    
    const results = [];
    
    for (const section of sections) {
      console.log(`\n🧪 테스트: ${section.name} 저장 기능`);
      
      try {
        // 섹션 클릭
        await page.evaluate((sectionName) => {
          const elements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent && el.textContent.includes(sectionName) && 
            (el.tagName === 'DIV' || el.tagName === 'BUTTON' || el.tagName === 'SPAN')
          );
          
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
          
          if (elements.length > 0) {
            elements[0].click();
            return true;
          }
          
          return false;
        }, section.name);
        
        await delay(2000);
        console.log(`✅ ${section.name} 모달 열림`);
        
        // 저장 버튼 클릭
        const saveResult = await page.evaluate((buttonText) => {
          const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes(buttonText)
          );
          
          if (saveButtons.length > 0) {
            const saveButton = saveButtons[0];
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
        }, section.buttonText);
        
        if (saveResult.success) {
          console.log(`✅ ${section.name} 저장 버튼 클릭 성공`);
          
          // 5초 대기 (저장 처리)
          await delay(5000);
          
          results.push({
            section: section.name,
            status: '성공',
            buttonText: section.buttonText
          });
        } else {
          console.log(`❌ ${section.name} 저장 실패: ${saveResult.reason}`);
          results.push({
            section: section.name,
            status: '실패',
            reason: saveResult.reason
          });
        }
        
        // 모달 닫기 (ESC)
        await page.keyboard.press('Escape');
        await delay(1000);
        
      } catch (error) {
        console.log(`❌ ${section.name} 테스트 중 오류: ${error.message}`);
        results.push({
          section: section.name,
          status: '오류',
          error: error.message
        });
        
        // 모달 닫기 시도
        try {
          await page.keyboard.press('Escape');
          await delay(1000);
        } catch (e) {
          // 무시
        }
      }
    }
    
    // 결과 출력
    console.log('\n📊 전체 저장 기능 테스트 결과:');
    console.log('==================================================');
    
    let successCount = 0;
    results.forEach((result, index) => {
      const statusIcon = result.status === '성공' ? '✅' : '❌';
      console.log(`${index + 1}. ${result.section}: ${statusIcon} ${result.status}`);
      if (result.reason) {
        console.log(`   이유: ${result.reason}`);
      }
      if (result.error) {
        console.log(`   오류: ${result.error}`);
      }
      
      if (result.status === '성공') successCount++;
    });
    
    console.log('==================================================');
    console.log(`총 ${results.length}개 섹션 중 ${successCount}개 성공 (${Math.round(successCount/results.length*100)}%)`);
    
    // API 요청 요약
    const postRequests = responses.filter(r => r.method === 'POST');
    console.log(`\n🌐 API 요청 요약:`);
    console.log(`- 총 API 요청: ${responses.length}개`);
    console.log(`- POST 요청 (저장): ${postRequests.length}개`);
    console.log(`- GET 요청 (로드): ${responses.length - postRequests.length}개`);
    
    if (postRequests.length > 0) {
      console.log('\n📝 저장 요청 상세:');
      postRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.timestamp} POST ${req.url} - ${req.status}`);
      });
    }
    
    // Alert 메시지 요약
    console.log(`\n🚨 Alert 메시지: ${alerts.length}개`);
    alerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert}`);
    });
    
    await delay(2000);
    
  } catch (error) {
    console.error('❌ 전체 테스트 중 오류:', error);
  } finally {
    await browser.close();
  }
}

testAllSaveFunctions().catch(console.error); 