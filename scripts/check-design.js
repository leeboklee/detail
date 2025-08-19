const puppeteer = require('puppeteer');
const path = require('path');

async function checkDesign() {
  console.log('🎨 디자인 개선 확인 시작...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    // 메인 페이지 로드
    console.log('📱 메인 페이지 로딩...');
    await page.goto('http://localhost:3900', { waitUntil: 'networkidle2' });
    
    // 메인 페이지 스크린샷
    await page.screenshot({ 
      path: 'design-check-main.png',
      fullPage: true 
    });
    console.log('✅ 메인 페이지 스크린샷 저장: design-check-main.png');
    
    // 관리자 페이지로 이동
    console.log('🔧 관리자 페이지 로딩...');
    await page.goto('http://localhost:3900/admin', { waitUntil: 'networkidle2' });
    
    // 관리자 페이지 스크린샷
    await page.screenshot({ 
      path: 'design-check-admin.png',
      fullPage: true 
    });
    console.log('✅ 관리자 페이지 스크린샷 저장: design-check-admin.png');
    
    // 테이블 디자인 확인
    console.log('📊 테이블 디자인 확인...');
    
    // 객실 정보 테이블 확인
    const roomTable = await page.$('[data-testid="room-table"], .room-table, table');
    if (roomTable) {
      await roomTable.screenshot({ path: 'design-check-room-table.png' });
      console.log('✅ 객실 테이블 스크린샷 저장: design-check-room-table.png');
    }
    
    // 패키지 테이블 확인
    const packageTable = await page.$('[data-testid="package-table"], .package-table, table');
    if (packageTable) {
      await packageTable.screenshot({ path: 'design-check-package-table.png' });
      console.log('✅ 패키지 테이블 스크린샷 저장: design-check-package-table.png');
    }
    
    // 공지사항 테이블 확인
    const noticeTable = await page.$('[data-testid="notice-table"], .notice-table, table');
    if (noticeTable) {
      await noticeTable.screenshot({ path: 'design-check-notice-table.png' });
      console.log('✅ 공지사항 테이블 스크린샷 저장: design-check-notice-table.png');
    }
    
    console.log('\n🎯 디자인 확인 완료!');
    console.log('📁 저장된 파일들:');
    console.log('  - design-check-main.png (메인 페이지)');
    console.log('  - design-check-admin.png (관리자 페이지)');
    console.log('  - design-check-room-table.png (객실 테이블)');
    console.log('  - design-check-package-table.png (패키지 테이블)');
    console.log('  - design-check-notice-table.png (공지사항 테이블)');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

checkDesign(); 