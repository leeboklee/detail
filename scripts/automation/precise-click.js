const puppeteer = require('puppeteer');

async function preciseClick() {
  const browser = await puppeteer.launch({
    headless: false,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  try {
    console.log('🎯 정확한 클릭 테스트 시작...');
    
    // 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('✅ 페이지 로드 완료');
    
    // 객실 정보 섹션 정확히 찾기
    const roomSections = await page.evaluate(() => {
      const elements = document.querySelectorAll('div');
      const results = [];
      
      for (const el of elements) {
        const text = el.textContent.trim();
        // 정확히 객실 정보 섹션만 찾기
        if (text.includes('👥객실 정보') && text.length < 100) {
          results.push({
            text: text,
            className: el.className,
            id: el.id,
            rect: el.getBoundingClientRect(),
            hasClick: el.onclick !== null || el.style.cursor === 'pointer'
          });
        }
      }
      
      return results;
    });
    
    console.log('\n📋 발견된 객실 정보 섹션들:');
    roomSections.forEach((section, index) => {
      console.log(`${index + 1}. "${section.text}" (${section.rect.width}x${section.rect.height})`);
    });
    
    if (roomSections.length === 0) {
      console.log('❌ 객실 정보 섹션 없음');
      return false;
    }
    
    // 가장 적절한 섹션 선택 (크기가 있고 텍스트가 짧은 것)
    const targetSection = roomSections.find(s => s.rect.width > 0 && s.rect.height > 0) || roomSections[0];
    console.log(`\n🎯 선택된 섹션: "${targetSection.text}"`);
    
    // 정확한 클릭 실행
    const clicked = await page.evaluate((targetText) => {
      const elements = document.querySelectorAll('div');
      for (const el of elements) {
        const text = el.textContent.trim();
        if (text === targetText) {
          console.log('정확한 클릭 대상:', el);
          el.click();
          return true;
        }
      }
      return false;
    }, targetSection.text);
    
    if (!clicked) {
      console.log('❌ 클릭 실패');
      return false;
    }
    
    console.log('✅ 클릭 성공');
    
    // 클릭 후 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 모달 또는 입력 필드 확인
    const result = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, textarea');
      const visibleInputs = Array.from(inputs).filter(input => input.offsetParent !== null);
      
      return {
        totalInputs: inputs.length,
        visibleInputs: visibleInputs.length,
        inputDetails: visibleInputs.map(input => ({
          name: input.name,
          type: input.type,
          placeholder: input.placeholder,
          value: input.value
        }))
      };
    });
    
    console.log('\n📊 클릭 후 결과:');
    console.log(`전체 입력 필드: ${result.totalInputs}`);
    console.log(`보이는 입력 필드: ${result.visibleInputs}`);
    
    if (result.visibleInputs > 0) {
      console.log('\n📝 입력 필드들:');
      result.inputDetails.forEach((input, index) => {
        console.log(`${index + 1}. name="${input.name}" type="${input.type}" placeholder="${input.placeholder}"`);
      });
      
      // 객실 정보 필드가 있는지 확인
      const roomFields = ['name', 'type', 'bedType', 'structure', 'view'];
      const foundRoomFields = result.inputDetails.filter(input => roomFields.includes(input.name));
      
      if (foundRoomFields.length > 0) {
        console.log(`\n🎉 객실 정보 필드 ${foundRoomFields.length}개 발견!`);
        
        // 간단한 입력 테스트
        console.log('\n🧪 간단한 입력 테스트...');
        const testField = foundRoomFields[0];
        
        await page.click(`input[name="${testField.name}"]`);
        await page.type(`input[name="${testField.name}"]`, '테스트값', { delay: 100 });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const testValue = await page.evaluate((name) => {
          const input = document.querySelector(`input[name="${name}"]`);
          return input ? input.value : '';
        }, testField.name);
        
        console.log(`테스트 결과: ${testField.name} = "${testValue}"`);
        
        return testValue === '테스트값';
      }
    }
    
    return false;
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
    return false;
  } finally {
    // 브라우저 열어두기 (수동 확인용)
    console.log('\n🔍 브라우저를 열어두고 수동 확인하세요. 10초 후 자동 종료...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
}

preciseClick().then(success => {
  console.log(success ? '\n🎉 테스트 성공!' : '\n❌ 테스트 실패');
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ 치명적 오류:', error);
  process.exit(1);
}); 