import puppeteer from 'puppeteer';
import fs from 'fs';

async function mcpBrowserAnalysis() {
  console.log('🔍 MCP 브라우저 분석 시작...');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: { width: 1920, height: 1080 }
  });
  
  const page = await browser.newPage();
  
  try {
    // 관리자 페이지로 이동
    console.log('🔧 관리자 페이지 로딩...');
    await page.goto('http://localhost:3900/admin', { waitUntil: 'networkidle2' });
    
    // 각 탭별 분석
    const tabs = [
      { name: '객실 정보', selector: 'text=객실 정보' },
      { name: '패키지', selector: 'text=패키지' },
      { name: '공지사항', selector: 'text=공지사항' }
    ];
    
    const analysisResults = [];
    
    for (const tab of tabs) {
      console.log(`\n📊 ${tab.name} 탭 분석...`);
      
      // 탭 클릭
      await page.click(tab.selector);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 스크린샷 촬영
      const screenshotPath = `mcp-analysis-${tab.name.replace(/\s+/g, '-')}.png`;
      await page.screenshot({ 
        path: screenshotPath,
        fullPage: true 
      });
      
      // DOM 분석
      const domAnalysis = await page.evaluate(() => {
        const table = document.querySelector('table, .nextui-table, .enhanced-table');
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
         const addButton = Array.from(document.querySelectorAll('button')).find(btn => btn.textContent.includes('추가'));
         const editButtons = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.includes('✏️'));
         const deleteButtons = Array.from(document.querySelectorAll('button')).filter(btn => btn.textContent.includes('🗑️'));
        
        // CSS 클래스 확인
        const hasEnhancedTable = table.classList.contains('enhanced-table');
        const hasNextUITable = table.classList.contains('nextui-table');
        
        return {
          headers,
          rows,
          cells,
          styles,
          buttons: {
            add: !!addButton,
            edit: editButtons.length,
            delete: deleteButtons.length
          },
          classes: {
            enhancedTable: hasEnhancedTable,
            nextUITable: hasNextUITable
          }
        };
      });
      
      // 개선사항 검증
      const improvements = {
        tableExists: !!domAnalysis,
        enhancedTableClass: domAnalysis?.classes?.enhancedTable || false,
        nextUIComponents: domAnalysis?.classes?.nextUITable || false,
        properStyling: domAnalysis?.styles?.borderRadius !== '0px',
        actionButtons: domAnalysis?.buttons?.add && domAnalysis?.buttons?.edit > 0,
        tableStructure: domAnalysis?.headers?.length > 0
      };
      
      const result = {
        tab: tab.name,
        screenshot: screenshotPath,
        domAnalysis,
        improvements,
        successRate: (Object.values(improvements).filter(Boolean).length / Object.keys(improvements).length * 100).toFixed(1) + '%'
      };
      
      analysisResults.push(result);
      console.log(`✅ ${tab.name} 분석 완료 - 성공률: ${result.successRate}`);
    }
    
    // 전체 결과 저장
    const mcpAnalysisReport = {
      timestamp: new Date().toISOString(),
      totalTabs: analysisResults.length,
      results: analysisResults,
      summary: {
        averageSuccessRate: (analysisResults.reduce((sum, r) => sum + parseFloat(r.successRate), 0) / analysisResults.length).toFixed(1) + '%',
        totalImprovements: analysisResults.reduce((sum, r) => sum + Object.values(r.improvements).filter(Boolean).length, 0),
        totalChecks: analysisResults.reduce((sum, r) => sum + Object.keys(r.improvements).length, 0)
      }
    };
    
    fs.writeFileSync('mcp-analysis-report.json', JSON.stringify(mcpAnalysisReport, null, 2));
    console.log('\n📄 MCP 분석 리포트 저장: mcp-analysis-report.json');
    
    console.log('\n🎯 MCP 브라우저 분석 완료!');
    console.log(`📈 평균 성공률: ${mcpAnalysisReport.summary.averageSuccessRate}`);
    console.log(`📊 총 개선사항: ${mcpAnalysisReport.summary.totalImprovements}/${mcpAnalysisReport.summary.totalChecks}`);
    
    // 스크린샷 파일 목록
    console.log('\n📸 생성된 스크린샷:');
    analysisResults.forEach(result => {
      console.log(`  - ${result.screenshot} (${result.tab})`);
    });
    
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
  } finally {
    await browser.close();
  }
}

mcpBrowserAnalysis(); 