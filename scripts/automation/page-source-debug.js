import React from 'react';
const puppeteer = require('puppeteer');

async function debugPageSource() {
  console.log('🔍 페이지 소스 및 React 상태 디버깅...');
  
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('1️⃣ 페이지 소스 분석...');
    
    // 페이지 HTML 가져오기
    const pageHTML = await page.content();
    console.log(`📄 페이지 HTML 길이: ${pageHTML.length}자`);
    
    // React 관련 요소 확인
    const reactAnalysis = await page.evaluate(() => {
      const result = {
        hasReact: !!window.React || !!window._N_E,
        reactRoots: document.querySelectorAll('#__next, [id*="react"]').length,
        totalElements: document.querySelectorAll('*').length,
        divs: document.querySelectorAll('div').length,
        buttons: document.querySelectorAll('button').length,
        scripts: document.querySelectorAll('script').length,
        reactComponents: [],
        errors: []
      };
      
      // React 컴포넌트 찾기 시도
      const possibleComponents = document.querySelectorAll('[data-reactroot], [class*="react"], [class*="jsx"]');
      result.reactComponents = Array.from(possibleComponents).map(el => ({
        tagName: el.tagName,
        className: el.className,
        dataAttributes: Array.from(el.attributes).filter(attr => attr.name.startsWith('data-')).map(attr => attr.name)
      }));
      
      // 콘솔 에러 확인
      if (window.console && window.console.error) {
        // 에러는 직접 접근이 어려우므로 DOM에서 에러 관련 요소 찾기
        const errorElements = document.querySelectorAll('[class*="error"], [class*="Error"]');
        result.errors = Array.from(errorElements).map(el => el.textContent.substring(0, 100));
      }
      
      return result;
    });
    
    console.log(`📊 React 감지: ${reactAnalysis.hasReact}`);
    console.log(`📊 React 루트: ${reactAnalysis.reactRoots}개`);
    console.log(`📊 총 요소: ${reactAnalysis.totalElements}개`);
    console.log(`📊 div: ${reactAnalysis.divs}개, button: ${reactAnalysis.buttons}개`);
    console.log(`📊 React 컴포넌트: ${reactAnalysis.reactComponents.length}개`);
    
    if (reactAnalysis.errors.length > 0) {
      console.log('❌ 발견된 에러들:');
      reactAnalysis.errors.forEach(error => console.log(`  ${error}`));
    }
    
    console.log('\\n2️⃣ 객실 정보 섹션 분석...');
    
    // 객실 정보 관련 요소들 상세 분석
    const roomAnalysis = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const roomElements = elements.filter(el => 
        el.textContent && (
          el.textContent.includes('객실 정보') || 
          el.textContent.includes('객실') ||
          el.textContent.includes('룸')
        )
      );
      
      return roomElements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        textContent: el.textContent.substring(0, 100),
        innerHTML: el.innerHTML.substring(0, 200),
        hasClickHandler: el.onclick !== null || el.addEventListener !== undefined,
        isVisible: el.offsetParent !== null,
        style: {
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility
        }
      }));
    });
    
    console.log(`📊 객실 관련 요소: ${roomAnalysis.length}개`);
    roomAnalysis.forEach((el, index) => {
      console.log(`\\n  [${index}] ${el.tagName}: "${el.textContent}"`);
      console.log(`      ID: ${el.id}, Class: ${el.className}`);
      console.log(`      Visible: ${el.isVisible}, Display: ${el.style.display}`);
    });
    
    console.log('\\n3️⃣ 객실 정보 클릭 후 분석...');
    
    // 첫 번째 객실 정보 요소 클릭
    await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      const roomSection = elements.find(el => 
        el.textContent && el.textContent.includes('객실 정보')
      );
      if (roomSection) {
        roomSection.click();
      }
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000)); // 길게 대기
    
    // 클릭 후 다시 분석
    const afterClickAnalysis = await page.evaluate(() => {
      return {
        totalInputs: document.querySelectorAll('input').length,
        totalTextareas: document.querySelectorAll('textarea').length,
        totalSelects: document.querySelectorAll('select').length,
        modals: Array.from(document.querySelectorAll('[class*="modal"], [style*="display: block"], [style*="opacity: 1"]')).filter(el => el.offsetParent !== null).length,
        newElements: document.querySelectorAll('[class*="room"], [class*="객실"]').length
      };
    });
    
    console.log(`📊 클릭 후 - 입력필드: ${afterClickAnalysis.totalInputs}개`);
    console.log(`📊 클릭 후 - 텍스트영역: ${afterClickAnalysis.totalTextareas}개`);
    console.log(`📊 클릭 후 - 셀렉트: ${afterClickAnalysis.totalSelects}개`);
    console.log(`📊 클릭 후 - 모달: ${afterClickAnalysis.modals}개`);
    console.log(`📊 클릭 후 - 새 요소: ${afterClickAnalysis.newElements}개`);
    
    // 페이지 소스 저장
    const finalHTML = await page.content();
    require('fs').writeFileSync('debug-page-source.html', finalHTML);
    console.log('\\n📄 페이지 소스 저장: debug-page-source.html');
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'debug-page-analysis.png',
      fullPage: true 
    });
    console.log('📸 스크린샷 저장: debug-page-analysis.png');
    
  } finally {
    await browser.close();
  }
}

debugPageSource().catch(console.error); 