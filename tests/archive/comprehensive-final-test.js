const { chromium } = require('playwright');

async function comprehensiveFinalTest() {
  console.log('🚀 최종 통합 테스트 시작...');
  
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 300 
  });
  
  try {
    const context = await browser.newContext({
      locale: 'ko-KR',
      viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // 콘솔 로그 수집
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('SimpleInput') || text.includes('debounced') || text.includes('조합') || text.includes('포커스')) {
        logs.push(text);
      }
    });
    
    // 페이지 로드
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    
    // 객실 정보 카드 클릭
    console.log('🏠 객실 정보 카드 클릭...');
    await page.locator('text=객실 정보').click();
    
    // 모달 대기
    console.log('⏳ 모달 대기...');
    await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
    
    // 입력 필드 확인
    const inputs = await page.locator('input[type="text"]').all();
    console.log(`📝 입력 필드 ${inputs.length}개 발견`);
    
    // 테스트 케이스들
    const testCases = [
      { field: 0, value: '디럭스 트윈룸', description: '첫 번째 필드 - 한글 입력' },
      { field: 1, value: '더블베드', description: '두 번째 필드 - 한글 입력' },
      { field: 2, value: '35평', description: '세 번째 필드 - 한글+숫자 입력' },
      { field: 3, value: '킹사이즈 베드', description: '네 번째 필드 - 한글 입력' },
      { field: 4, value: 'City View', description: '다섯 번째 필드 - 영문 입력' }
    ];
    
    const results = [];
    
    // 각 테스트 케이스 실행
    for (const testCase of testCases) {
      if (testCase.field < inputs.length) {
        console.log(`\\n🧪 테스트: ${testCase.description}`);
        
        const input = inputs[testCase.field];
        
        // 포커스 및 클리어
        await input.focus();
        await input.fill('');
        
        // 입력 시작 시간 기록
        const startTime = Date.now();
        
        // 한글 입력
        await input.type(testCase.value, { delay: 100 });
        
        // 잠시 대기
        await page.waitForTimeout(1000);
        
        // 결과 확인
        const actualValue = await input.inputValue();
        const duration = Date.now() - startTime;
        
        const success = actualValue === testCase.value;
        const result = {
          field: testCase.field,
          description: testCase.description,
          expected: testCase.value,
          actual: actualValue,
          success,
          duration
        };
        
        results.push(result);
        
        console.log(`${success ? '✅' : '❌'} 결과: "${actualValue}" (${duration}ms)`);
      }
    }
    
    // 결과 요약
    console.log('\\n📊 테스트 결과 요약:');
    console.log('=' .repeat(50));
    
    let successCount = 0;
    results.forEach((result, index) => {
      const status = result.success ? '✅ 성공' : '❌ 실패';
      console.log(`${index + 1}. ${result.description}: ${status}`);
      if (!result.success) {
        console.log(`   예상: "${result.expected}", 실제: "${result.actual}"`);
      }
      if (result.success) successCount++;
    });
    
    console.log('=' .repeat(50));
    console.log(`총 ${results.length}개 테스트 중 ${successCount}개 성공 (${Math.round(successCount/results.length*100)}%)`);
    
    // 성능 분석
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`평균 입력 시간: ${Math.round(avgDuration)}ms`);
    
    // 로그 분석
    const focusProtectionCount = logs.filter(log => log.includes('포커스 중이므로 동기화 차단')).length;
    const debounceCount = logs.filter(log => log.includes('debounced onChange 실행')).length;
    
    console.log(`\\n🔍 로그 분석:`);
    console.log(`- 포커스 보호 동작: ${focusProtectionCount}회`);
    console.log(`- Debounce 실행: ${debounceCount}회`);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'comprehensive-final-test-result.png' });
    console.log('📸 최종 스크린샷 저장됨');
    
    // 수동 확인을 위해 잠시 대기
    console.log('\\n⏰ 10초 대기 중... (수동 확인 가능)');
    await page.waitForTimeout(10000);
    
    return results;
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    return [];
  } finally {
    await browser.close();
    console.log('🏁 테스트 완료');
  }
}

// 테스트 실행
comprehensiveFinalTest()
  .then(results => {
    console.log('\\n🎯 최종 결과:', results.length > 0 ? '테스트 완료' : '테스트 실패');
  })
  .catch(console.error); 