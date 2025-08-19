/**
 * 자동화된 테스트 시스템
 * 서버 상태, API, 미리보기, 오류 처리 등을 자동으로 테스트
 */

const fs = require('fs');
const path = require('path');

// 테스트 결과 저장
const testResults = {
  timestamp: new Date().toISOString(),
  tests: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  }
};

// 테스트 헬퍼 함수
function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString('ko-KR');
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

// 서버 상태 테스트
async function testServerHealth() {
  log('서버 상태 테스트 시작', 'test');
  
  try {
    const response = await fetch('http://localhost:3900/api/health');
    const data = await response.json();
    
    if (response.ok && data.status === 'ok') {
      log('서버 정상 작동', 'success');
      return { passed: true, message: '서버 정상 작동' };
    } else {
      log('서버 오류', 'error');
      return { passed: false, message: `서버 오류: ${response.status}` };
    }
  } catch (error) {
    log(`서버 연결 실패: ${error.message}`, 'error');
    return { passed: false, message: `서버 연결 실패: ${error.message}` };
  }
}

// API 테스트
async function testAPIs() {
  log('API 테스트 시작', 'test');
  const apis = [
    { name: '호텔 목록', url: '/api/hotels' },
    { name: '테스트 오류', url: '/api/test-error' },
    { name: '테스트 500 오류', url: '/api/test-error?type=500' }
  ];
  
  const results = [];
  
  for (const api of apis) {
    try {
      const response = await fetch(`http://localhost:3900${api.url}`);
      const data = await response.json();
      
      if (response.ok || (api.url.includes('test-error') && response.status >= 400)) {
        log(`${api.name} API 정상`, 'success');
        results.push({ 
          name: api.name, 
          passed: true, 
          message: `상태 코드: ${response.status}` 
        });
      } else {
        log(`${api.name} API 오류: ${response.status}`, 'error');
        results.push({ 
          name: api.name, 
          passed: false, 
          message: `오류: ${response.status}` 
        });
      }
    } catch (error) {
      log(`${api.name} API 실패: ${error.message}`, 'error');
      results.push({ 
        name: api.name, 
        passed: false, 
        message: `실패: ${error.message}` 
      });
    }
  }
  
  return results;
}

// 미리보기 기능 테스트
async function testPreviewFunctionality() {
  log('미리보기 기능 테스트 시작', 'test');
  
  // 미리보기 컴포넌트 파일 존재 확인
  const previewFile = path.join(__dirname, '../components/Preview.jsx');
  if (!fs.existsSync(previewFile)) {
    return { passed: false, message: '미리보기 컴포넌트 파일 없음' };
  }
  
  // 미리보기 컴포넌트 내용 확인
  const previewContent = fs.readFileSync(previewFile, 'utf8');
  const checks = [
    { name: 'div 기반 렌더링', pattern: /previewRef/, message: 'div 기반 미리보기 구현됨' },
    { name: '로딩 상태', pattern: /isLoading.*useState/, message: '로딩 상태 처리됨' },
    { name: '오류 처리', pattern: /error.*useState/, message: '오류 상태 처리됨' },
    { name: '서버 오류 처리', pattern: /serverErrors.*useState/, message: '서버 오류 처리됨' },
    { name: '실시간 업데이트', pattern: /previewContent/, message: '실시간 업데이트 구현됨' }
  ];
  
  const results = [];
  for (const check of checks) {
    if (check.pattern.test(previewContent)) {
      log(check.message, 'success');
      results.push({ name: check.name, passed: true, message: check.message });
    } else {
      log(`${check.name} 누락`, 'error');
      results.push({ name: check.name, passed: false, message: `${check.name} 기능 누락` });
    }
  }
  
  return results;
}

// 오류 처리 시스템 테스트
async function testErrorHandling() {
  log('오류 처리 시스템 테스트 시작', 'test');
  
  // 오류 핸들러 파일 확인
  const errorHandlerFile = path.join(__dirname, '../components/ErrorHandler.jsx');
  if (!fs.existsSync(errorHandlerFile)) {
    return { passed: false, message: '오류 핸들러 파일 없음' };
  }
  
  // 오류 핸들러 내용 확인
  const errorHandlerContent = fs.readFileSync(errorHandlerFile, 'utf8');
  const checks = [
    { name: '서버 오류 이벤트', pattern: /triggerServerError/, message: '서버 오류 이벤트 처리됨' },
    { name: '전역 오류 핸들러', pattern: /setupGlobalErrorHandler/, message: '전역 오류 핸들러 구현됨' },
    { name: '네트워크 오류 감지', pattern: /response\.ok/, message: '네트워크 오류 감지됨' },
    { name: 'Promise 오류 감지', pattern: /unhandledrejection/, message: 'Promise 오류 감지됨' }
  ];
  
  const results = [];
  for (const check of checks) {
    if (check.pattern.test(errorHandlerContent)) {
      log(check.message, 'success');
      results.push({ name: check.name, passed: true, message: check.message });
    } else {
      log(`${check.name} 누락`, 'error');
      results.push({ name: check.name, passed: false, message: `${check.name} 기능 누락` });
    }
  }
  
  return results;
}

// 성능 테스트
async function testPerformance() {
  log('성능 테스트 시작', 'test');
  
  const startTime = Date.now();
  
  // API 응답 시간 테스트
  const apiResponseTimes = [];
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    try {
      await fetch('http://localhost:3900/api/health');
      const end = Date.now();
      apiResponseTimes.push(end - start);
    } catch (error) {
      apiResponseTimes.push(9999); // 오류 시 큰 값
    }
  }
  
  const avgResponseTime = apiResponseTimes.reduce((a, b) => a + b, 0) / apiResponseTimes.length;
  const totalTime = Date.now() - startTime;
  
  const results = [
    {
      name: '평균 API 응답 시간',
      passed: avgResponseTime < 1000,
      message: `${avgResponseTime.toFixed(1)}ms (목표: <1000ms)`
    },
    {
      name: '전체 테스트 시간',
      passed: totalTime < 10000,
      message: `${totalTime}ms (목표: <10000ms)`
    }
  ];
  
  results.forEach(result => {
    if (result.passed) {
      log(result.message, 'success');
    } else {
      log(result.message, 'warning');
    }
  });
  
  return results;
}

// 메인 테스트 실행
async function runAllTests() {
  log('🚀 자동화된 테스트 시스템 시작', 'test');
  log('=' * 50);
  
  // 1. 서버 상태 테스트
  const serverTest = await testServerHealth();
  testResults.tests.push({ category: '서버', ...serverTest });
  
  if (!serverTest.passed) {
    log('서버가 작동하지 않아 다른 테스트를 건너뜁니다.', 'warning');
    return testResults;
  }
  
  // 2. API 테스트
  const apiTests = await testAPIs();
  testResults.tests.push(...apiTests.map(test => ({ category: 'API', ...test })));
  
  // 3. 미리보기 기능 테스트
  const previewTests = await testPreviewFunctionality();
  testResults.tests.push(...previewTests.map(test => ({ category: '미리보기', ...test })));
  
  // 4. 오류 처리 테스트
  const errorTests = await testErrorHandling();
  testResults.tests.push(...errorTests.map(test => ({ category: '오류처리', ...test })));
  
  // 5. 성능 테스트
  const performanceTests = await testPerformance();
  testResults.tests.push(...performanceTests.map(test => ({ category: '성능', ...test })));
  
  // 결과 요약
  testResults.summary.total = testResults.tests.length;
  testResults.summary.passed = testResults.tests.filter(t => t.passed).length;
  testResults.summary.failed = testResults.summary.total - testResults.summary.passed;
  testResults.summary.errors = testResults.tests.filter(t => !t.passed).map(t => t.message);
  
  // 결과 출력
  log('=' * 50);
  log(`📊 테스트 결과 요약:`, 'test');
  log(`   총 테스트: ${testResults.summary.total}개`);
  log(`   통과: ${testResults.summary.passed}개`);
  log(`   실패: ${testResults.summary.failed}개`);
  log(`   성공률: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1)}%`);
  
  if (testResults.summary.failed > 0) {
    log('❌ 실패한 테스트:', 'error');
    testResults.summary.errors.forEach(error => {
      log(`   - ${error}`, 'error');
    });
  } else {
    log('🎉 모든 테스트 통과!', 'success');
  }
  
  // 결과 파일 저장
  const reportFile = path.join(__dirname, `../test-results/auto-test-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify(testResults, null, 2));
  log(`📄 테스트 리포트 저장됨: ${reportFile}`, 'info');
  
  return testResults;
}

// 스크립트 실행
if (require.main === module) {
  runAllTests().catch(error => {
    log(`테스트 실행 실패: ${error.message}`, 'error');
    process.exit(1);
  });
}

module.exports = { runAllTests }; 