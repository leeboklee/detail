const { chromium } = require('playwright');

async function quickInputTest() {
  console.log('입력 성능 테스트 시작...');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    await page.waitForTimeout(2000);

    // 객실 정보 클릭
    await page.click('text=객실 정보');
    await page.waitForTimeout(1000);

    // 모든 보이는 입력 필드 찾기
    const inputs = await page.$$eval('input:visible, textarea:visible', elements => 
      elements.map(el => ({
        placeholder: el.placeholder,
        id: el.id,
        tag: el.tagName
      }))
    );

    console.log(`발견된 입력 필드: ${inputs.length}개`);
    inputs.forEach((input, i) => {
      console.log(`${i+1}. ${input.tag} - ${input.placeholder || input.id}`);
    });

    // 첫 번째 보이는 입력 필드에 입력 테스트
    if (inputs.length > 0) {
      const testText = '성능테스트입력';
      
      for (let i = 0; i < Math.min(3, inputs.length); i++) {
        try {
          const selector = inputs[i].id ? `#${inputs[i].id}` : 
                          inputs[i].placeholder ? `[placeholder*="${inputs[i].placeholder}"]` :
                          `${inputs[i].tag.toLowerCase()}`;
          
          const start = Date.now();
          await page.fill(selector, testText);
          const end = Date.now();
          
          console.log(`입력 필드 ${i+1} 응답시간: ${end - start}ms`);
          
          // 연속 입력 테스트
          const charStart = Date.now();
          await page.type(selector, 'abc', { delay: 10 });
          const charEnd = Date.now();
          
          console.log(`  문자별 입력 테스트: ${charEnd - charStart}ms`);
          
        } catch (error) {
          console.log(`입력 필드 ${i+1} 테스트 실패: ${error.message}`);
        }
      }
    } else {
      console.log('입력 필드를 찾을 수 없습니다.');
    }

  } catch (error) {
    console.error('테스트 오류:', error.message);
  } finally {
    await browser.close();
  }
}

quickInputTest(); 