const puppeteer = require('puppeteer');
const path = require('path');

async function checkDesign() {
  console.log('🎨 디자인 개선 확인 시작...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    // 관리자 페이지로 이동
    console.log('🔧 관리자 페이지 로딩...');
    await page.goto('http://localhost:3900/admin', { waitUntil: 'networkidle2' });
    
    // 객실 정보 탭 클릭
    console.log('🏠 객실 정보 탭 클릭...');
    await page.click('text=객실 정보');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 객실 정보 테이블 스크린샷
    await page.screenshot({ 
      path: 'design-check-room-tab.png',
      fullPage: true 
    });
    console.log('✅ 객실 정보 탭 스크린샷 저장: design-check-room-tab.png');
    
    // 패키지 탭 클릭
    console.log('📦 패키지 탭 클릭...');
    await page.click('text=패키지');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 패키지 테이블 스크린샷
    await page.screenshot({ 
      path: 'design-check-package-tab.png',
      fullPage: true 
    });
    console.log('✅ 패키지 탭 스크린샷 저장: design-check-package-tab.png');
    
    // 공지사항 탭 클릭
    console.log('📢 공지사항 탭 클릭...');
    await page.click('text=공지사항');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 공지사항 테이블 스크린샷
    await page.screenshot({ 
      path: 'design-check-notice-tab.png',
      fullPage: true 
    });
    console.log('✅ 공지사항 탭 스크린샷 저장: design-check-notice-tab.png');
    
    console.log('\n🎯 테이블 디자인 확인 완료!');
    console.log('📁 저장된 파일들:');
    console.log('  - design-check-room-tab.png (객실 정보 테이블)');
    console.log('  - design-check-package-tab.png (패키지 테이블)');
    console.log('  - design-check-notice-tab.png (공지사항 테이블)');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

checkDesign(); 