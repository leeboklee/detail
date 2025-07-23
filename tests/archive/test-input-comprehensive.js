const { chromium } = require('playwright');

async function testInputComprehensive() {
  console.log('🏨 최적화된 입력 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500,
    timeout: 60000
  });
  
  try {
    const page = await browser.newPage();
    
    // 페이지 로딩 성능 측정
    const startTime = Date.now();
    console.log('📄 페이지 로딩 중...');
    
    await page.goto('http://localhost: {process.env.PORT || 34343}', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    const loadTime = Date.now() - startTime;
    console.log(`✅ 페이지 로딩 완료: ${loadTime}ms`);
    
    // 페이지 안정화 대기
    await page.waitForTimeout(3000);
    
    // 초기 상태 확인
    console.log('📋 초기 상태 확인...');
    const initialData = await page.evaluate(() => {
      return {
        buttons: document.querySelectorAll('button').length,
        inputs: document.querySelectorAll('input').length,
        textareas: document.querySelectorAll('textarea').length,
        modals: document.querySelectorAll('[role="dialog"]').length
      };
    });
    console.log('📊 초기 요소 수:', initialData);
    
    // 호텔 정보 섹션 찾기 및 클릭
    console.log('🏨 호텔 정보 섹션 찾는 중...');
    
    // 더 정확한 호텔 정보 카드 찾기
    const hotelCards = await page.evaluate(() => {
      const cards = [];
      document.querySelectorAll('div').forEach((div, i) => {
        const text = div.textContent?.trim() || '';
        if (text.includes('호텔 정보') && text.includes('기본 정보')) {
          const rect = div.getBoundingClientRect();
          cards.push({
            index: i,
            text: text.substring(0, 100),
            visible: rect.width > 0 && rect.height > 0,
            clickable: div.style.cursor === 'pointer' || div.onclick !== null,
            className: div.className
          });
        }
      });
      return cards;
    });
    
    console.log('🔍 발견된 호텔 정보 카드:', hotelCards.length);
    
    if (hotelCards.length > 0) {
      console.log('🎯 호텔 정보 카드 클릭 시도...');
      
      // 첫 번째 호텔 정보 카드 클릭
      await page.click('text=호텔 정보');
      await page.waitForTimeout(2000);
      
      // 모달 상태 확인
      const modalState = await page.evaluate(() => {
        const modals = document.querySelectorAll('[role="dialog"]');
        return {
          modalCount: modals.length,
          modalVisible: modals.length > 0 && modals[0].style.display !== 'none',
          modalContent: modals.length > 0 ? modals[0].textContent?.substring(0, 200) : null
        };
      });
      
      console.log('📋 모달 상태:', modalState);
      
      if (modalState.modalCount > 0) {
        console.log('✅ 모달 열림 확인');
        
        // 모달 내용 로딩 대기
        await page.waitForTimeout(2000);
        
        // 입력 필드 찾기
        const inputFields = await page.evaluate(() => {
          const inputs = [];
          
          // 모달 내부의 입력 필드만 찾기
          const modal = document.querySelector('[role="dialog"]');
          if (modal) {
            // input 태그들
            modal.querySelectorAll('input').forEach((input, i) => {
              inputs.push({
                index: i,
                type: 'input',
                name: input.name || '',
                placeholder: input.placeholder || '',
                value: input.value || '',
                visible: input.offsetParent !== null
              });
            });
            
            // textarea 태그들
            modal.querySelectorAll('textarea').forEach((textarea, i) => {
              inputs.push({
                index: i,
                type: 'textarea',
                name: textarea.name || '',
                placeholder: textarea.placeholder || '',
                value: textarea.value || '',
                visible: textarea.offsetParent !== null
              });
            });
          }
          
          return inputs;
        });
        
        console.log('📝 발견된 입력 필드:', inputFields.length);
        inputFields.forEach((field, i) => {
          console.log(`  ${i + 1}. ${field.type} - name: "${field.name}", placeholder: "${field.placeholder}"`);
        });
        
        if (inputFields.length > 0) {
          console.log('🖊️ 입력 테스트 시작...');
          
          // 테스트 데이터
          const testData = {
            hotelName: '테스트 호텔 ' + Date.now(),
            address: '서울시 강남구 테스트로 123',
            description: '테스트용 호텔 설명입니다. 자동 테스트로 입력된 내용입니다.'
          };
          
          // 호텔명 입력
          const hotelNameField = inputFields.find(f => f.name === 'hotelName' || f.placeholder.includes('호텔명'));
          if (hotelNameField) {
            console.log('🏨 호텔명 입력 중...');
            await page.fill(`[name="${hotelNameField.name}"]`, testData.hotelName);
            await page.waitForTimeout(500);
            
            // 입력 확인
            const inputValue = await page.inputValue(`[name="${hotelNameField.name}"]`);
            console.log(`✅ 호텔명 입력 완료: "${inputValue}"`);
          }
          
          // 주소 입력
          const addressField = inputFields.find(f => f.name === 'address' || f.placeholder.includes('주소'));
          if (addressField) {
            console.log('📍 주소 입력 중...');
            await page.fill(`[name="${addressField.name}"]`, testData.address);
            await page.waitForTimeout(500);
            
            // 입력 확인
            const inputValue = await page.inputValue(`[name="${addressField.name}"]`);
            console.log(`✅ 주소 입력 완료: "${inputValue}"`);
          }
          
          // 설명 입력
          const descField = inputFields.find(f => f.name === 'description' || f.placeholder.includes('설명'));
          if (descField) {
            console.log('📝 설명 입력 중...');
            if (descField.type === 'textarea') {
              await page.fill(`textarea[name="${descField.name}"]`, testData.description);
            } else {
              await page.fill(`[name="${descField.name}"]`, testData.description);
            }
            await page.waitForTimeout(500);
            
            // 입력 확인
            const inputValue = descField.type === 'textarea' 
              ? await page.inputValue(`textarea[name="${descField.name}"]`)
              : await page.inputValue(`[name="${descField.name}"]`);
            console.log(`✅ 설명 입력 완료: "${inputValue.substring(0, 50)}..."`);
          }
          
          // 입력 완료 후 잠시 대기
          await page.waitForTimeout(2000);
          
          // 최종 입력 값 확인
          console.log('🔍 최종 입력 값 확인...');
          const finalValues = await page.evaluate(() => {
            const modal = document.querySelector('[role="dialog"]');
            const values = {};
            
            if (modal) {
              modal.querySelectorAll('input, textarea').forEach(element => {
                if (element.name) {
                  values[element.name] = element.value;
                }
              });
            }
            
            return values;
          });
          
          console.log('📋 최종 입력 값:', finalValues);
          
          // 자동저장 확인 (3초 대기)
          console.log('💾 자동저장 확인 중...');
          await page.waitForTimeout(3000);
          
          // 저장 버튼 찾기 및 클릭
          const saveButton = await page.locator('button:has-text("저장"), button:has-text("적용")').first();
          if (await saveButton.isVisible()) {
            console.log('💾 저장 버튼 클릭...');
            await saveButton.click();
            await page.waitForTimeout(1000);
            console.log('✅ 저장 완료');
          }
          
          // 스크린샷 저장
          await page.screenshot({ path: 'test-input-result.png' });
          console.log('📸 결과 스크린샷 저장됨');
          
          // 성공 메시지
          console.log('🎉 입력 테스트 성공!');
          console.log('📊 테스트 결과:');
          console.log(`  - 호텔명: ${finalValues.hotelName || '입력 실패'}`);
          console.log(`  - 주소: ${finalValues.address || '입력 실패'}`);
          console.log(`  - 설명: ${finalValues.description ? finalValues.description.substring(0, 30) + '...' : '입력 실패'}`);
          
        } else {
          console.log('❌ 입력 필드를 찾을 수 없음');
        }
        
      } else {
        console.log('❌ 모달이 열리지 않음');
      }
      
    } else {
      console.log('❌ 호텔 정보 카드를 찾을 수 없음');
    }
    
    // 5초 더 대기 (결과 확인용)
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'test-input-error.png' });
  } finally {
    await browser.close();
    console.log('🔚 테스트 완료');
  }
}

testInputComprehensive(); 