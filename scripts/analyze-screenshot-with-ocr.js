import puppeteer from 'puppeteer';
import Tesseract from 'tesseract.js';
import fs from 'fs';

async function analyzeScreenshotWithOCR() {
  console.log('🔍 OCR + 이미지 분석 시작...');
  
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
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 전체 페이지 스크린샷
    console.log('📸 스크린샷 촬영...');
    await page.screenshot({ 
      path: 'analysis-screenshot.png',
      fullPage: true 
    });
    
    // 테이블 영역 스크린샷
    const tableElement = await page.$('table, .nextui-table');
    if (tableElement) {
      await tableElement.screenshot({ 
        path: 'table-only.png' 
      });
      console.log('✅ 테이블 영역 스크린샷 저장');
    } else {
      console.log('❌ 테이블을 찾을 수 없음 - 전체 페이지 스크린샷만 사용');
    }
    
    // DOM 분석
    console.log('🔍 DOM 요소 분석...');
    const domAnalysis = await page.evaluate(() => {
      const table = document.querySelector('table, .nextui-table');
      if (!table) return null;
      
      // 테이블 구조 분석
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      const rows = Array.from(table.querySelectorAll('tr')).length;
      const cells = Array.from(table.querySelectorAll('td')).length;
      
      // 스타일 분석
      const computedStyle = window.getComputedStyle(table);
      const styles = {
        backgroundColor: computedStyle.backgroundColor,
        borderColor: computedStyle.borderColor,
        borderRadius: computedStyle.borderRadius,
        boxShadow: computedStyle.boxShadow,
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize
      };
      
      // 버튼 분석
      const addButton = document.querySelector('button:has-text("추가")');
      const editButtons = document.querySelectorAll('button:has-text("✏️")');
      const deleteButtons = document.querySelectorAll('button:has-text("🗑️")');
      
      return {
        headers,
        rows,
        cells,
        styles,
        buttons: {
          add: !!addButton,
          edit: editButtons.length,
          delete: deleteButtons.length
        }
      };
    });
    
    console.log('📊 DOM 분석 결과:', domAnalysis);
    
    // OCR 텍스트 추출
    console.log('📝 OCR 텍스트 추출...');
    const imagePath = tableElement ? 'table-only.png' : 'analysis-screenshot.png';
    const ocrResult = await Tesseract.recognize(
      imagePath,
      'kor+eng',
      { 
        logger: m => console.log(m.status, m.progress) 
      }
    );
    
    console.log('🔤 OCR 결과:', ocrResult.data.text);
    
    // 개선사항 검증
    console.log('✅ 개선사항 검증...');
    const improvements = {
      enhancedTable: !!domAnalysis,
      nextUIComponents: domAnalysis?.styles?.borderRadius !== '0px',
      properStyling: domAnalysis?.styles?.backgroundColor !== 'rgba(0, 0, 0, 0)',
      actionButtons: domAnalysis?.buttons?.add && domAnalysis?.buttons?.edit > 0,
      textContent: ocrResult.data.text.includes('객실') || ocrResult.data.text.includes('추가')
    };
    
    console.log('🎯 개선사항 검증 결과:', improvements);
    
    // 결과 저장
    const analysisReport = {
      timestamp: new Date().toISOString(),
      domAnalysis,
      ocrText: ocrResult.data.text,
      improvements,
      summary: {
        totalImprovements: Object.values(improvements).filter(Boolean).length,
        totalChecks: Object.keys(improvements).length,
        successRate: (Object.values(improvements).filter(Boolean).length / Object.keys(improvements).length * 100).toFixed(1) + '%'
      }
    };
    
    fs.writeFileSync('analysis-report.json', JSON.stringify(analysisReport, null, 2));
    console.log('📄 분석 리포트 저장: analysis-report.json');
    
    console.log('\n🎯 분석 완료!');
    console.log(`📈 성공률: ${analysisReport.summary.successRate}`);
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

analyzeScreenshotWithOCR(); 