const { chromium } = require('playwright');
const fs = require('fs').promises;

class UltimateAutoFixer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isRunning = false;
    this.fixCount = 0;
    this.monitoringInterval = null;
  }

  async start() {
    console.log('🚀 궁극의 자동 수정기 시작 (4초마다 지속적 모니터링)');
    this.isRunning = true;
    
    // 지속적 브라우저 세션 시작
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--start-maximized']
    });
    this.page = await this.browser.newPage();
    
    await this.page.goto('http://localhost: {process.env.PORT || 3900}');
    await this.page.waitForLoadState('networkidle');
    
    // 초기 수정 적용
    await this.applyComprehensiveFixes();
    
    // 4초마다 지속적 모니터링 시작
    this.startContinuousMonitoring();
    
    console.log('✅ 궁극의 자동 수정기 실행 중 - 4초마다 체크 중...');
    console.log('브라우저 창을 유지하며 실시간 모니터링 중입니다.');
    
    // 무한 대기 (Ctrl+C로 종료)
    process.on('SIGINT', async () => {
      await this.stop();
    });
  }

  startContinuousMonitoring() {
    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAndFix();
      } catch (error) {
        console.error('❌ 모니터링 오류:', error.message);
      }
    }, 4000);
  }

  async checkAndFix() {
    console.log('🔍 실시간 UI 상태 체크 중...');
    
    // 페이지 새로고침이 있었는지 체크
    const needsRefresh = await this.page.evaluate(() => {
      return !window.uiFixesApplied;
    });
    
    if (needsRefresh) {
      console.log('🔄 페이지 새로고침 감지 - UI 수정 재적용 중...');
      await this.applyComprehensiveFixes();
      this.fixCount++;
    }
    
    // 버튼 크기 실시간 체크 & 수정
    const buttonIssues = await this.fixButtonSizes();
    
    // 레이아웃 오버플로우 체크 & 수정
    const layoutIssues = await this.fixLayoutOverflow();
    
    const totalIssues = buttonIssues + layoutIssues;
    
    if (totalIssues > 0) {
      console.log(`✅ ${totalIssues}개 문제 자동 수정 완료 (총 수정 횟수: ${this.fixCount})`);
    } else {
      console.log('✅ 모든 UI 상태 정상 - 문제 없음');
    }
  }

  async applyComprehensiveFixes() {
    console.log('🔧 종합 UI 수정 적용 중...');
    
    await this.page.evaluate(() => {
      // 수정 적용 표시
      window.uiFixesApplied = true;
      
      // 종합 CSS 스타일 주입
      let style = document.getElementById('ultimate-ui-fixes');
      if (!style) {
        style = document.createElement('style');
        style.id = 'ultimate-ui-fixes';
        document.head.appendChild(style);
      }
      
      style.textContent = `
        /* 궁극의 UI 수정 - 모든 버튼 강제 적용 */
        button, [role="button"], .bg-green-50 {
          min-width: 44px !important;
          min-height: 44px !important;
          padding: 8px 16px !important;
          box-sizing: border-box !important;
          cursor: pointer !important;
        }
        
        /* 저장 버튼 특별 처리 */
        button:contains("💾"), button:contains("전체"), button:contains("저장"),
        [aria-label*="저장"], .bg-green-50 {
          min-width: 120px !important;
          min-height: 44px !important;
          padding: 12px 20px !important;
        }
        
        /* 모바일 퍼스트 그리드 레이아웃 */
        main .grid, .grid {
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 1rem !important;
          padding: 0 1rem !important;
          max-width: 100vw !important;
          overflow-x: hidden !important;
        }
        
        @media (min-width: 768px) {
          main .grid, .grid {
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
            gap: 1.5rem !important;
            padding: 0 2rem !important;
          }
        }
        
        .grid > div {
          max-width: 100% !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        
        /* 전체 오버플로우 방지 */
        body, html {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }
      `;
      
      // 모든 버튼에 직접 스타일 적용
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(btn => {
        btn.style.minWidth = '44px';
        btn.style.minHeight = '44px';
        btn.style.padding = '8px 16px';
        btn.style.boxSizing = 'border-box';
        
        if (btn.textContent.includes('💾') || btn.textContent.includes('저장') || btn.textContent.includes('전체')) {
          btn.style.minWidth = '120px';
          btn.style.minHeight = '44px';
          btn.style.padding = '12px 20px';
        }
      });
      
      console.log('✅ 종합 UI 수정 완료');
    });
  }

  async fixButtonSizes() {
    return await this.page.evaluate(() => {
      let fixed = 0;
      const buttons = document.querySelectorAll('button, [role="button"]');
      
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          btn.style.minWidth = '44px';
          btn.style.minHeight = '44px';
          btn.style.padding = '8px 16px';
          btn.style.boxSizing = 'border-box';
          
          if (btn.textContent.includes('💾') || btn.textContent.includes('저장') || btn.textContent.includes('전체')) {
            btn.style.minWidth = '120px';
            btn.style.minHeight = '44px';
            btn.style.padding = '12px 20px';
          }
          fixed++;
        }
      });
      
      return fixed;
    });
  }

  async fixLayoutOverflow() {
    return await this.page.evaluate(() => {
      let fixed = 0;
      
      // body 오버플로우 체크
      if (document.body.scrollWidth > window.innerWidth) {
        document.body.style.overflowX = 'hidden';
        document.documentElement.style.overflowX = 'hidden';
        fixed++;
      }
      
      // 그리드 레이아웃 체크
      const grids = document.querySelectorAll('main .grid, .grid');
      grids.forEach(grid => {
        if (grid.scrollWidth > grid.clientWidth) {
          if (window.innerWidth < 768) {
            grid.style.gridTemplateColumns = '1fr';
          }
          grid.style.maxWidth = '100vw';
          grid.style.overflowX = 'hidden';
          fixed++;
        }
      });
      
      return fixed;
    });
  }

  async stop() {
    console.log('\n🛑 궁극의 자동 수정기 종료 중...');
    this.isRunning = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    if (this.browser) {
      await this.browser.close();
    }
    
    console.log(`✅ 총 ${this.fixCount}회 수정 적용 완료`);
    process.exit(0);
  }
}

const fixer = new UltimateAutoFixer();
fixer.start().catch(console.error); 