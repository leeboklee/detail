const { chromium } = require('playwright');

class InstantUIFixer {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async start() {
    console.log('⚡ 실시간 UI 수정기 시작...');
    
    this.browser = await chromium.launch({ headless: false });
    this.page = await this.browser.newPage();
    
    await this.page.goto('http://localhost: {process.env.PORT || 3900}');
    await this.page.waitForLoadState('networkidle');
    
    // 실시간 JavaScript 주입으로 UI 문제 강제 수정
    await this.injectUIFixes();
    
    // 결과 확인
    await this.verifyFixes();
    
    console.log('✅ 실시간 UI 수정 완료!');
    await this.browser.close();
  }

  async injectUIFixes() {
    console.log('🔧 JavaScript로 UI 강제 수정 중...');
    
    await this.page.evaluate(() => {
      // 모든 버튼 크기 강제 수정
      const buttons = document.querySelectorAll('button, [role="button"]');
      buttons.forEach(btn => {
        btn.style.minWidth = '44px';
        btn.style.minHeight = '44px';
        btn.style.padding = '8px 16px';
        btn.style.boxSizing = 'border-box';
        
        // 저장 버튼 특별 처리
        if (btn.textContent.includes('💾') || btn.textContent.includes('저장') || btn.textContent.includes('전체')) {
          btn.style.minWidth = '120px';
          btn.style.minHeight = '44px';
          btn.style.padding = '12px 20px';
        }
      });
      
      // 그리드 레이아웃 모바일 최적화
      const grids = document.querySelectorAll('main .grid, .grid');
      grids.forEach(grid => {
        grid.style.display = 'grid';
        grid.style.gap = '1rem';
        grid.style.padding = '0 1rem';
        grid.style.maxWidth = '100vw';
        grid.style.overflowX = 'hidden';
        
        // 화면 크기에 따른 컬럼 조정
        if (window.innerWidth < 768) {
          grid.style.gridTemplateColumns = '1fr';
        } else {
          grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
          grid.style.padding = '0 2rem';
          grid.style.gap = '1.5rem';
        }
        
        // 그리드 아이템 최적화
        const items = grid.children;
        Array.from(items).forEach(item => {
          item.style.maxWidth = '100%';
          item.style.boxSizing = 'border-box';
          item.style.overflow = 'hidden';
        });
      });
      
      // 전체 컨테이너 오버플로우 방지
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
      
      console.log('✅ JavaScript UI 수정 완료');
    });
  }

  async verifyFixes() {
    console.log('🔍 수정 결과 검증 중...');
    
    // 버튼 크기 검증
    const buttonSizes = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      return Array.from(buttons).map(btn => ({
        text: btn.textContent.trim(),
        width: btn.offsetWidth,
        height: btn.offsetHeight,
        computed: getComputedStyle(btn)
      }));
    });
    
    console.log('📊 버튼 크기 검증 결과:');
    buttonSizes.forEach(btn => {
      const isGoodSize = btn.width >= 44 && btn.height >= 44;
      console.log(`${isGoodSize ? '✅' : '❌'} ${btn.text.substring(0, 20)}: ${btn.width}x${btn.height}px`);
    });
    
    // 모바일 오버플로우 검증
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.waitForTimeout(1000);
    
    const overflow = await this.page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return {
        bodyScrollWidth: body.scrollWidth,
        bodyClientWidth: body.clientWidth,
        htmlScrollWidth: html.scrollWidth,
        htmlClientWidth: html.clientWidth,
        windowWidth: window.innerWidth
      };
    });
    
    const hasOverflow = overflow.bodyScrollWidth > overflow.windowWidth;
    console.log(`${hasOverflow ? '❌' : '✅'} 모바일 오버플로우: ${hasOverflow ? '있음' : '없음'}`);
    console.log(`   Body: ${overflow.bodyScrollWidth}px vs 화면: ${overflow.windowWidth}px`);
  }
}

const fixer = new InstantUIFixer();
fixer.start().catch(console.error); 