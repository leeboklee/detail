#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 테스트 결과를 저장할 디렉토리
const testResultsDir = path.join(__dirname, '../test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

// 서버 상태 확인
async function checkServerStatus() {
  console.log('🔍 서버 상태 확인 중...');
  
  return new Promise((resolve) => {
    exec('ss -tlnp | grep :3900', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ 서버가 실행되지 않음');
        resolve(false);
      } else {
        console.log('✅ 서버 실행 중:', stdout.trim());
        resolve(true);
      }
    });
  });
}

// curl로 기본 연결 테스트
async function testBasicConnection() {
  console.log('🌐 기본 연결 테스트 중...');
  
  return new Promise((resolve) => {
    exec('curl -s -o /dev/null -w "%{http_code}" http://localhost:3900/', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ 연결 실패:', error.message);
        resolve(false);
      } else {
        const statusCode = parseInt(stdout);
        if (statusCode === 200) {
          console.log('✅ 연결 성공 (HTTP 200)');
          resolve(true);
        } else {
          console.log(`⚠️ 연결은 되지만 HTTP 상태: ${statusCode}`);
          resolve(true);
        }
      }
    });
  });
}

// 페이지 내용 확인
async function testPageContent() {
  console.log('📄 페이지 내용 테스트 중...');
  
  return new Promise((resolve) => {
    exec('curl -s http://localhost:3900/', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ 페이지 내용 가져오기 실패:', error.message);
        resolve(false);
      } else {
        const content = stdout;
        const hasReact = content.includes('React') || content.includes('react');
        const hasHotel = content.includes('호텔') || content.includes('hotel');
        const hasBooking = content.includes('예약') || content.includes('booking');
        
        console.log(`📊 페이지 분석 결과:`);
        console.log(`  React 프레임워크: ${hasReact ? '✅' : '❌'}`);
        console.log(`  호텔 관련 내용: ${hasHotel ? '✅' : '❌'}`);
        console.log(`  예약 관련 내용: ${hasBooking ? '✅' : '❌'}`);
        
        resolve({ hasReact, hasHotel, hasBooking });
      }
    });
  });
}

// Puppeteer 테스트 (설치된 경우에만)
async function testWithPuppeteer() {
  console.log('🤖 Puppeteer 테스트 시도 중...');
  
  try {
    const puppeteer = require('puppeteer');
    console.log('✅ Puppeteer 설치됨, 자동화 테스트 실행...');
    
    const { testBookingPreview } = require('./test-booking-preview');
    await testBookingPreview();
    
  } catch (error) {
    console.log('⚠️ Puppeteer가 설치되지 않음, 수동 테스트 안내');
    console.log('📋 수동 테스트 방법:');
    console.log('  1. 브라우저에서 http://localhost:3900/ 접속');
    console.log('  2. "예약 안내" 탭 클릭');
    console.log('  3. 입력 필드에 내용 입력');
    console.log('  4. "생성" 버튼 클릭');
    console.log('  5. 오른쪽 미리보기에서 내용 확인');
  }
}

// 메인 테스트 실행
async function runAllTests() {
  console.log('🚀 예약 안내 미리보기 통합 테스트 시작...\n');
  
  const testResults = {
    timestamp: new Date().toISOString(),
    testName: '예약 안내 미리보기 통합 테스트',
    results: {}
  };
  
  try {
    // 1. 서버 상태 확인
    const serverRunning = await checkServerStatus();
    testResults.results.serverStatus = serverRunning;
    
    if (!serverRunning) {
      console.log('\n❌ 서버가 실행되지 않음. 테스트를 중단합니다.');
      console.log('💡 서버를 시작하려면: npm run dev');
      return;
    }
    
    // 2. 기본 연결 테스트
    const connectionOk = await testBasicConnection();
    testResults.results.basicConnection = connectionOk;
    
    // 3. 페이지 내용 테스트
    const pageContent = await testPageContent();
    testResults.results.pageContent = pageContent;
    
    // 4. Puppeteer 자동화 테스트
    await testWithPuppeteer();
    
    // 전체 테스트 결과 계산
    const allBasicTestsPassed = serverRunning && connectionOk && pageContent.hasReact;
    testResults.success = allBasicTestsPassed;
    testResults.summary = allBasicTestsPassed ? '기본 테스트 통과' : '기본 테스트 실패';
    
    // 결과 저장
    const resultsPath = path.join(testResultsDir, 'booking-preview-integration-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 통합 테스트 결과 저장: ${resultsPath}`);
    
    // 최종 결과 출력
    console.log('\n🎯 통합 테스트 최종 결과:');
    console.log(`📊 서버 상태: ${serverRunning ? '✅' : '❌'}`);
    console.log(`📊 기본 연결: ${connectionOk ? '✅' : '❌'}`);
    console.log(`📊 React 프레임워크: ${pageContent.hasReact ? '✅' : '❌'}`);
    console.log(`📊 호텔 내용: ${pageContent.hasHotel ? '✅' : '❌'}`);
    console.log(`📊 예약 내용: ${pageContent.hasBooking ? '✅' : '❌'}`);
    
    if (allBasicTestsPassed) {
      console.log('\n🎉 기본 테스트가 모두 통과했습니다!');
      console.log('💡 이제 브라우저에서 수동으로 "생성" 버튼을 테스트해보세요.');
    } else {
      console.log('\n⚠️ 일부 기본 테스트가 실패했습니다.');
      console.log('💡 서버 상태와 연결을 확인해주세요.');
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 실행 중 오류 발생:', error);
    
    testResults.success = false;
    testResults.error = error.message;
    testResults.stack = error.stack;
    
    // 오류 결과 저장
    const errorResultsPath = path.join(testResultsDir, 'booking-preview-integration-test-error.json');
    fs.writeFileSync(errorResultsPath, JSON.stringify(testResults, null, 2));
    console.log(`💾 오류 결과 저장: ${errorResultsPath}`);
  }
}

// 테스트 실행
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests };
