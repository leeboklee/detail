#!/usr/bin/env node

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 테스트 결과를 저장할 디렉토리
const testResultsDir = path.join(__dirname, '../test-results');
if (!fs.existsSync(testResultsDir)) {
  fs.mkdirSync(testResultsDir, { recursive: true });
}

async function testBookingPreview() {
  console.log('🚀 예약 안내 미리보기 테스트 시작...');
  
  const browser = await puppeteer.launch({
    headless: false, // 브라우저를 보이게 실행
    slowMo: 1000, // 각 동작 사이에 1초 대기
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // 페이지 로드
    console.log('📱 페이지 로딩 중...');
    await page.goto('http://localhost:3900/', { waitUntil: 'networkidle0' });
    
    // 페이지가 완전히 로드될 때까지 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ 페이지 로드 완료');
    
    // 예약 안내 탭 클릭
    console.log('📋 예약 안내 탭 클릭...');
    const bookingTab = await page.waitForSelector('[data-tab="booking"], [data-testid="booking-tab"], button:contains("예약 안내")');
    await bookingTab.click();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('✅ 예약 안내 탭 활성화');
    
    // 입력 필드에 테스트 데이터 입력
    console.log('✏️ 테스트 데이터 입력 중...');
    
    // 제목 입력
    const titleInput = await page.waitForSelector('input[placeholder*="제목"], input[placeholder*="title"], label:contains("제목") + input');
    await titleInput.type('테스트 숙박권 구매안내');
    
    // 숙박권 구매안내 입력
    const purchaseGuideTextarea = await page.waitForSelector('textarea[placeholder*="구매안내"], textarea[placeholder*="purchase"], label:contains("구매안내") + textarea');
    await purchaseGuideTextarea.type('1. 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송\n2. 희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송\n* 문자(카톡)는 근무시간내 수신자 번호로 전송');
    
    // 참고사항 입력
    const referenceNotesTextarea = await page.waitForSelector('textarea[placeholder*="참고사항"], textarea[placeholder*="reference"], label:contains("참고사항") + textarea');
    await referenceNotesTextarea.type('해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.\n예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.');
    
    console.log('✅ 테스트 데이터 입력 완료');
    
    // 생성 버튼 클릭
    console.log('🎯 생성 버튼 클릭...');
    const generateButton = await page.waitForSelector('button:contains("생성"), button[title*="생성"], .generate-button');
    await generateButton.click();
    
    console.log('✅ 생성 버튼 클릭 완료');
    
    // 미리보기 업데이트 대기
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 미리보기 영역에서 내용 확인
    console.log('🔍 미리보기 내용 확인 중...');
    
    // 미리보기 영역 찾기
    const previewArea = await page.waitForSelector('.preview, [data-testid="preview"], .preview-container');
    
    // 미리보기 내용 스크린샷
    const screenshotPath = path.join(testResultsDir, 'booking-preview-test.png');
    await previewArea.screenshot({ path: screenshotPath });
    console.log(`📸 미리보기 스크린샷 저장: ${screenshotPath}`);
    
    // 미리보기 텍스트 내용 확인
    const previewText = await previewArea.evaluate(el => el.textContent);
    console.log('📝 미리보기 텍스트 내용:');
    console.log(previewText);
    
    // 테스트 결과 검증
    const testResults = {
      timestamp: new Date().toISOString(),
      testName: '예약 안내 미리보기 테스트',
      results: {}
    };
    
    // 제목이 미리보기에 나타나는지 확인
    const hasTitle = previewText.includes('테스트 숙박권 구매안내');
    testResults.results.titleDisplayed = hasTitle;
    console.log(`📋 제목 표시: ${hasTitle ? '✅ 성공' : '❌ 실패'}`);
    
    // 구매안내가 미리보기에 나타나는지 확인
    const hasPurchaseGuide = previewText.includes('결제 → 희망날짜 접수');
    testResults.results.purchaseGuideDisplayed = hasPurchaseGuide;
    console.log(`📋 구매안내 표시: ${hasPurchaseGuide ? '✅ 성공' : '❌ 실패'}`);
    
    // 참고사항이 미리보기에 나타나는지 확인
    const hasReferenceNotes = previewText.includes('해피콜/문자수신 불가');
    testResults.results.referenceNotesDisplayed = hasReferenceNotes;
    console.log(`📋 참고사항 표시: ${hasReferenceNotes ? '✅ 성공' : '❌ 실패'}`);
    
    // 전체 테스트 결과
    const allTestsPassed = hasTitle && hasPurchaseGuide && hasReferenceNotes;
    testResults.success = allTestsPassed;
    testResults.summary = allTestsPassed ? '모든 테스트 통과' : '일부 테스트 실패';
    
    // 결과 저장
    const resultsPath = path.join(testResultsDir, 'booking-preview-test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
    console.log(`💾 테스트 결과 저장: ${resultsPath}`);
    
    // 최종 결과 출력
    console.log('\n🎯 테스트 최종 결과:');
    console.log(`📊 성공: ${allTestsPassed ? '✅' : '❌'}`);
    console.log(`📋 제목: ${hasTitle ? '✅' : '❌'}`);
    console.log(`📋 구매안내: ${hasPurchaseGuide ? '✅' : '❌'}`);
    console.log(`📋 참고사항: ${hasReferenceNotes ? '✅' : '❌'}`);
    
    if (allTestsPassed) {
      console.log('\n🎉 모든 테스트가 성공했습니다! 예약 안내 미리보기가 정상적으로 작동합니다.');
    } else {
      console.log('\n⚠️ 일부 테스트가 실패했습니다. 문제를 확인해주세요.');
    }
    
    // 브라우저 콘솔 로그 확인
    console.log('\n🔍 브라우저 콘솔 로그 확인 중...');
    const consoleLogs = await page.evaluate(() => {
      return window.consoleLogs || [];
    });
    
    if (consoleLogs.length > 0) {
      console.log('📝 콘솔 로그:');
      consoleLogs.forEach(log => console.log(`  ${log.type}: ${log.message}`));
    }
    
    // 10초 대기 후 브라우저 종료
    console.log('\n⏳ 10초 후 브라우저를 종료합니다...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
    
    // 오류 스크린샷 저장
    try {
      const errorScreenshotPath = path.join(testResultsDir, 'booking-preview-test-error.png');
      await page.screenshot({ path: errorScreenshotPath });
      console.log(`📸 오류 스크린샷 저장: ${errorScreenshotPath}`);
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError);
    }
    
    // 오류 결과 저장
    const errorResults = {
      timestamp: new Date().toISOString(),
      testName: '예약 안내 미리보기 테스트',
      success: false,
      error: error.message,
      stack: error.stack
    };
    
    const errorResultsPath = path.join(testResultsDir, 'booking-preview-test-error.json');
    fs.writeFileSync(errorResultsPath, JSON.stringify(errorResults, null, 2));
    console.log(`💾 오류 결과 저장: ${errorResultsPath}`);
    
  } finally {
    await browser.close();
    console.log('🔚 브라우저 종료');
  }
}

// 테스트 실행
if (require.main === module) {
  testBookingPreview().catch(console.error);
}

module.exports = { testBookingPreview };
