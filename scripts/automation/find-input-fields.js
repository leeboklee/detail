const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function findInputFields() {
  console.log('🔍 실제 입력 필드 찾기...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'domcontentloaded' });
    console.log('✅ 페이지 로드 완료');
    
    await delay(3000);
    
    // 테스트할 섹션들
    const sections = ['호텔 정보', '객실 정보', '시설 정보', '패키지'];
    
    for (const sectionText of sections) {
      console.log(`\n🏷️ === ${sectionText} 섹션 분석 ===`);
      
      try {
        // 섹션 클릭
        const sectionElement = await page.evaluateHandle((text) => {
          const elements = Array.from(document.querySelectorAll('.cursor-pointer'));
          return elements.find(el => el.textContent?.includes(text));
        }, sectionText);
        
        if (sectionElement) {
          await sectionElement.click();
          console.log(`✅ ${sectionText} 섹션 클릭 완료`);
          await delay(3000);
          
          // 모든 입력 필드 찾기
          const inputFields = await page.evaluate(() => {
            const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
            return inputs.map(input => ({
              tagName: input.tagName,
              type: input.type || 'N/A',
              name: input.name || 'N/A',
              id: input.id || 'N/A',
              placeholder: input.placeholder || 'N/A',
              value: input.value || 'N/A',
              className: input.className || 'N/A'
            }));
          });
          
          console.log(`📋 발견된 입력 필드들 (${inputFields.length}개):`);
          inputFields.forEach((field, i) => {
            console.log(`${i + 1}. ${field.tagName} - name:"${field.name}" id:"${field.id}" placeholder:"${field.placeholder}"`);
            if (field.className !== 'N/A') {
              console.log(`   className: ${field.className}`);
            }
          });
          
          // 모달이 열렸는지 확인
          const modalExists = await page.evaluate(() => {
            const modals = document.querySelectorAll('[class*="modal"], [class*="dialog"], [class*="popup"]');
            return modals.length > 0;
          });
          
          console.log(`모달 상태: ${modalExists ? '열림' : '닫힘'}`);
          
          // 현재 페이지의 모든 텍스트 내용 확인
          const pageContent = await page.evaluate(() => {
            return document.body.textContent?.substring(0, 500) || '';
          });
          
          console.log(`현재 페이지 내용 (첫 500자): ${pageContent.replace(/\s+/g, ' ').trim()}`);
          
        } else {
          console.log(`❌ ${sectionText} 섹션을 찾을 수 없음`);
        }
        
      } catch (error) {
        console.log(`❌ ${sectionText} 섹션 분석 실패:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    setTimeout(async () => {
      await browser.close();
      console.log('🔚 브라우저 종료');
    }, 15000);
  }
}

findInputFields().catch(console.error); 