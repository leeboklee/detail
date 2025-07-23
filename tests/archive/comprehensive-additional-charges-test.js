/**
 * 추가요금 기능 종합 테스트 스크립트
 * 복구된 추가요금 필드들과 새로운 기능들을 모두 테스트
 */

console.log('🧪 추가요금 기능 종합 테스트 시작');

// 테스트 결과 저장
const testResults = {
  fieldTests: [],
  buttonTests: [],
  dataTests: [],
  errors: []
};

// 1. 필드 존재 확인 테스트
function testFieldsExistence() {
  console.log('📋 1. 필드 존재 확인 테스트');
  
  const fieldsToCheck = [
    { name: '주말 추가요금', selector: 'input[placeholder*="20%"]' },
    { name: '성수기/공휴일 추가요금', selector: 'input[placeholder*="30%"]' },
    { name: '계절별 요금 정보', selector: 'textarea[placeholder*="계절별"]' },
    { name: '추가 요금 안내', selector: 'textarea[placeholder*="조식"]' }
  ];
  
  fieldsToCheck.forEach(field => {
    const element = document.querySelector(field.selector);
    const exists = element !== null;
    
    testResults.fieldTests.push({
      field: field.name,
      exists: exists,
      element: element
    });
    
    console.log(`  ${exists ? '✅' : '❌'} ${field.name}: ${exists ? '존재함' : '없음'}`);
  });
}

// 2. 버튼 클릭 테스트
function testButtons() {
  console.log('🔘 2. 버튼 클릭 테스트');
  
  const buttonsToTest = [
    { name: '항목 추가', text: '+ 항목 추가' },
    { name: '템플릿 저장', text: '💾 템플릿 저장' },
    { name: '템플릿 불러오기', text: '📂 템플릿 불러오기' },
    { name: '초기화', text: '🗑️ 초기화' },
    { name: '테스트 데이터 입력', text: '🧪 테스트 데이터 입력' },
    { name: '데이터 확인', text: '🔍 데이터 확인' }
  ];
  
  buttonsToTest.forEach(buttonInfo => {
    const button = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes(buttonInfo.text)
    );
    
    const exists = button !== undefined;
    const enabled = exists && !button.disabled;
    
    testResults.buttonTests.push({
      button: buttonInfo.name,
      exists: exists,
      enabled: enabled,
      element: button
    });
    
    console.log(`  ${exists ? '✅' : '❌'} ${buttonInfo.name}: ${exists ? (enabled ? '활성화됨' : '비활성화됨') : '없음'}`);
  });
}

// 3. 데이터 입력/출력 테스트
function testDataInputOutput() {
  console.log('📝 3. 데이터 입력/출력 테스트');
  
  // 테스트 데이터 입력 버튼 클릭
  const testDataButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('🧪 테스트 데이터 입력')
  );
  
  if (testDataButton) {
    console.log('  🔄 테스트 데이터 입력 버튼 클릭...');
    testDataButton.click();
    
    // 잠시 대기 후 데이터 확인
    setTimeout(() => {
      // 주말 추가요금 필드 확인
      const weekendField = document.querySelector('input[placeholder*="20%"]');
      const weekendValue = weekendField ? weekendField.value : '';
      
      // 성수기/공휴일 추가요금 필드 확인
      const holidayField = document.querySelector('input[placeholder*="30%"]');
      const holidayValue = holidayField ? holidayField.value : '';
      
      // 계절별 요금 정보 필드 확인
      const seasonalField = document.querySelector('textarea[placeholder*="계절별"]');
      const seasonalValue = seasonalField ? seasonalField.value : '';
      
      testResults.dataTests.push({
        field: '주말 추가요금',
        value: weekendValue,
        hasData: weekendValue.length > 0
      });
      
      testResults.dataTests.push({
        field: '성수기/공휴일 추가요금',
        value: holidayValue,
        hasData: holidayValue.length > 0
      });
      
      testResults.dataTests.push({
        field: '계절별 요금 정보',
        value: seasonalValue,
        hasData: seasonalValue.length > 0
      });
      
      console.log('  📊 데이터 입력 결과:');
      console.log(`    주말 추가요금: "${weekendValue}"`);
      console.log(`    성수기/공휴일 추가요금: "${holidayValue}"`);
      console.log(`    계절별 요금 정보: "${seasonalValue}"`);
      
      // 데이터 확인 버튼 클릭
      const dataCheckButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('🔍 데이터 확인')
      );
      
      if (dataCheckButton) {
        console.log('  🔍 데이터 확인 버튼 클릭...');
        dataCheckButton.click();
      }
      
      // 최종 결과 출력
      setTimeout(() => {
        showTestResults();
      }, 1000);
      
    }, 1000);
  } else {
    console.log('  ❌ 테스트 데이터 입력 버튼을 찾을 수 없음');
    showTestResults();
  }
}

// 4. 테스트 결과 출력
function showTestResults() {
  console.log('\n📊 === 추가요금 기능 종합 테스트 결과 ===');
  
  // 필드 테스트 결과
  console.log('\n🏷️ 필드 존재 테스트:');
  const fieldsPassed = testResults.fieldTests.filter(t => t.exists).length;
  console.log(`  ${fieldsPassed}/${testResults.fieldTests.length} 개 필드 존재`);
  
  // 버튼 테스트 결과
  console.log('\n🔘 버튼 테스트:');
  const buttonsPassed = testResults.buttonTests.filter(t => t.exists && t.enabled).length;
  console.log(`  ${buttonsPassed}/${testResults.buttonTests.length} 개 버튼 활성화`);
  
  // 데이터 테스트 결과
  console.log('\n📝 데이터 테스트:');
  const dataPassed = testResults.dataTests.filter(t => t.hasData).length;
  console.log(`  ${dataPassed}/${testResults.dataTests.length} 개 필드에 데이터 입력됨`);
  
  // 전체 점수
  const totalTests = testResults.fieldTests.length + testResults.buttonTests.length + testResults.dataTests.length;
  const totalPassed = fieldsPassed + buttonsPassed + dataPassed;
  const score = Math.round((totalPassed / totalTests) * 100);
  
  console.log(`\n🎯 전체 점수: ${score}% (${totalPassed}/${totalTests})`);
  
  if (score >= 90) {
    console.log('🎉 우수! 추가요금 기능이 정상적으로 복구되었습니다.');
  } else if (score >= 70) {
    console.log('👍 양호! 대부분의 기능이 작동합니다.');
  } else {
    console.log('⚠️ 개선 필요! 일부 기능에 문제가 있습니다.');
  }
  
  // 상세 결과를 전역 변수로 저장
  window.additionalChargesTestResults = testResults;
}

// 5. 메인 테스트 실행
function runComprehensiveTest() {
  try {
    testFieldsExistence();
    testButtons();
    testDataInputOutput();
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    testResults.errors.push(error.message);
    showTestResults();
  }
}

// 페이지 로드 확인 후 테스트 실행
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runComprehensiveTest, 2000);
  });
} else {
  setTimeout(runComprehensiveTest, 2000);
}

console.log('⏳ 2초 후 테스트가 시작됩니다...'); 