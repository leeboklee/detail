#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🤖 자동화된 UI 디버깅 실행기 시작...');

// 1. 서버 상태 확인
function checkServer() {
  try {
    const result = execSync('netstat -ano | findstr : {process.env.PORT || 3900}', { encoding: 'utf8' });
    if (result.trim()) {
      console.log('✅ 서버 실행 중');
      return true;
    }
  } catch (error) {
    console.log('❌ 서버 실행되지 않음');
    return false;
  }
}

// 2. 자동화 테스트 실행
function runAutoTests() {
  try {
    console.log('🧪 자동화 테스트 실행 중...');
    execSync('npx playwright test tests/auto-debug-test.js --project=chromium', { 
      stdio: 'inherit' 
    });
    console.log('✅ 자동화 테스트 완료');
  } catch (error) {
    console.log('❌ 자동화 테스트 실패:', error.message);
  }
}

// 3. 결과 분석
function analyzeResults() {
  console.log('📊 결과 분석 중...');
  
  // 스크린샷 파일 확인
  const screenshots = fs.readdirSync('.').filter(file => 
    file.startsWith('auto-debug-') && file.endsWith('.png')
  );
  
  console.log(`📸 생성된 스크린샷: ${screenshots.length}개`);
  screenshots.forEach(screenshot => {
    console.log(`  - ${screenshot}`);
  });
  
  // 로그 파일 확인
  if (fs.existsSync('auto-debug-logs.json')) {
    const logs = JSON.parse(fs.readFileSync('auto-debug-logs.json', 'utf8'));
    console.log(`📝 콘솔 로그: ${logs.logs.length}개`);
    console.log(`🌐 네트워크 요청: ${logs.requests.length}개`);
  }
  
  // HTML 리포트 생성
  try {
    execSync('npx playwright show-report --host 0.0.0.0 --port 9323', { 
      stdio: 'inherit',
      detached: true 
    });
    console.log('📋 HTML 리포트: http://localhost:9323');
  } catch (error) {
    console.log('❌ HTML 리포트 생성 실패');
  }
}

// 4. 메인 실행
async function main() {
  console.log('🚀 자동화된 디버깅 프로세스 시작...');
  
  // 서버 확인
  if (!checkServer()) {
    console.log('🔄 서버 시작 중...');
    execSync('npm run dev', { stdio: 'inherit', detached: true });
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10초 대기
  }
  
  // 테스트 실행
  runAutoTests();
  
  // 결과 분석
  analyzeResults();
  
  console.log('🎯 자동화된 디버깅 완료!');
  console.log('📁 결과 파일들:');
  console.log('  - auto-debug-*.png (스크린샷)');
  console.log('  - auto-debug-logs.json (로그)');
  console.log('  - playwright-report/ (HTML 리포트)');
}

main().catch(console.error); 