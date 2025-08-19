import puppeteer from 'puppeteer';
import fs from 'fs';

async function analyzeScreenshot() {
  console.log('🔍 스크린샷 분석 시작...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
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
    
    // 테이블 요소 분석
    console.log('📊 테이블 디자인 분석...');
    
    // 테이블 존재 확인
    const tableExists = await page.$('table, .nextui-table');
    if (tableExists) {
      console.log('✅ 테이블 발견');
      
      // 테이블 스타일 분석
      const tableStyles = await page.evaluate(() => {
        const table = document.querySelector('table, .nextui-table');
        if (!table) return null;
        
        const computedStyle = window.getComputedStyle(table);
        return {
          backgroundColor: computedStyle.backgroundColor,
          borderColor: computedStyle.borderColor,
          borderRadius: computedStyle.borderRadius,
          boxShadow: computedStyle.boxShadow
        };
      });
      
      console.log('🎨 테이블 스타일:', tableStyles);
      
      // 행 스타일 분석
      const rowStyles = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tr, .nextui-table tr');
        if (rows.length === 0) return null;
        
        const firstRow = rows[0];
        const computedStyle = window.getComputedStyle(firstRow);
        return {
          backgroundColor: computedStyle.backgroundColor,
          borderBottom: computedStyle.borderBottom,
          padding: computedStyle.padding
        };
      });
      
      console.log('📋 행 스타일:', rowStyles);
      
      // 헤더 스타일 분석
      const headerStyles = await page.evaluate(() => {
        const headers = document.querySelectorAll('table th, .nextui-table th');
        if (headers.length === 0) return null;
        
        const firstHeader = headers[0];
        const computedStyle = window.getComputedStyle(firstHeader);
        return {
          backgroundColor: computedStyle.backgroundColor,
          color: computedStyle.color,
          fontWeight: computedStyle.fontWeight,
          fontSize: computedStyle.fontSize
        };
      });
      
      console.log('📝 헤더 스타일:', headerStyles);
      
      // 버튼 존재 확인
      const addButton = await page.$('button:has-text("추가")');
      if (addButton) {
        console.log('✅ 추가 버튼 발견');
      }
      
      const editButtons = await page.$$('button:has-text("✏️")');
      console.log(`✅ 편집 버튼 ${editButtons.length}개 발견`);
      
      const deleteButtons = await page.$$('button:has-text("🗑️")');
      console.log(`✅ 삭제 버튼 ${deleteButtons.length}개 발견`);
      
    } else {
      console.log('❌ 테이블을 찾을 수 없음');
    }
    
    // CSS 클래스 확인
    const enhancedTableClass = await page.$('.enhanced-table');
    if (enhancedTableClass) {
      console.log('✅ enhanced-table 클래스 발견');
    }
    
    // NextUI 컴포넌트 확인
    const nextuiTable = await page.$('.nextui-table');
    if (nextuiTable) {
      console.log('✅ NextUI 테이블 컴포넌트 발견');
    }
    
    console.log('\n🎯 분석 완료!');
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

analyzeScreenshot(); 