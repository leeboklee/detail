const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class SmartAutoFixer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isRunning = false;
    this.fixCount = 0;
    this.appliedFixes = new Set();
  }

  async start() {
    console.log('🤖 스마트 자동 수정기 시작...');
    this.isRunning = true;
    
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    
    while (this.isRunning) {
      try {
        await this.detectAndAutoFix();
        await this.sleep(4000); // 4초마다
      } catch (error) {
        console.error('❌ 자동 수정 오류:', error);
        await this.sleep(10000);
      }
    }
  }

  async detectAndAutoFix() {
    try {
      await this.page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
      
      // 문제 감지 및 실제 파일 수정
      await this.fixActualCodeIssues();
      
      console.log(`✅ 자동 검사 완료 - 수정: ${this.fixCount}개`);
      
    } catch (error) {
      console.error('❌ 감지 중 오류:', error);
    }
  }

  async fixActualCodeIssues() {
    // 1. 작은 클릭 영역 문제 실제 CSS 파일 수정
    const smallButtons = await this.page.evaluate(() => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      const small = [];
      
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          small.push({
            className: btn.className,
            testId: btn.getAttribute('data-testid'),
            size: { width: rect.width, height: rect.height }
          });
        }
      });
      
      return small;
    });

    if (smallButtons.length > 0 && !this.appliedFixes.has('button_size_fix')) {
      await this.fixButtonSizesInCSS();
      this.appliedFixes.add('button_size_fix');
    }

    // 2. Grid 레이아웃 문제 실제 수정
    const gridIssues = await this.page.evaluate(() => {
      const grid = document.querySelector('main .grid');
      if (!grid) return false;
      
      const cards = grid.querySelectorAll('div');
      if (cards.length === 0) return false;
      
      const heights = Array.from(cards).map(card => card.offsetHeight);
      const maxHeight = Math.max(...heights);
      const minHeight = Math.min(...heights);
      
      return (maxHeight - minHeight) > 50; // 50px 이상 차이나면 문제
    });

    if (gridIssues && !this.appliedFixes.has('grid_fix')) {
      await this.fixGridLayoutInCSS();
      this.appliedFixes.add('grid_fix');
    }

    // 3. JavaScript 오류 실제 파일 수정
    const jsErrors = [];
    this.page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    await this.page.reload();
    await this.page.waitForTimeout(2000);

    if (jsErrors.length > 0 && !this.appliedFixes.has('js_error_fix')) {
      await this.fixJavaScriptErrorsInCode(jsErrors);
      this.appliedFixes.add('js_error_fix');
    }
  }

  // 실제 CSS 파일 수정
  async fixButtonSizesInCSS() {
    const globalsCssPath = 'app/globals.css';
    
    try {
      let content = await fs.readFile(globalsCssPath, 'utf8');
      
      // 이미 수정되었는지 확인
      if (content.includes('/* AUTO-FIX: Button sizes */')) {
        return;
      }
      
      const buttonFix = `
/* AUTO-FIX: Button sizes */
button, [role="button"] {
  min-width: 44px !important;
  min-height: 44px !important;
  padding: 8px 16px !important;
  cursor: pointer !important;
}

.grid > div {
  min-height: 140px !important;
  transition: all 0.2s ease !important;
}

.grid > div:hover {
  transform: scale(1.02) !important;
}
`;
      
      content += buttonFix;
      await fs.writeFile(globalsCssPath, content);
      
      this.fixCount++;
      console.log('🔧 CSS 파일에 버튼 크기 수정 적용됨');
      
    } catch (error) {
      console.error('❌ CSS 파일 수정 실패:', error);
    }
  }

  // Grid 레이아웃 실제 수정
  async fixGridLayoutInCSS() {
    const globalsCssPath = 'app/globals.css';
    
    try {
      let content = await fs.readFile(globalsCssPath, 'utf8');
      
      if (content.includes('/* AUTO-FIX: Grid layout */')) {
        return;
      }
      
      const gridFix = `
/* AUTO-FIX: Grid layout */
main .grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)) !important;
  gap: 1.5rem !important;
  align-items: stretch !important;
}

main .grid > div {
  display: flex !important;
  flex-direction: column !important;
  justify-content: space-between !important;
  height: 100% !important;
}
`;
      
      content += gridFix;
      await fs.writeFile(globalsCssPath, content);
      
      this.fixCount++;
      console.log('🔧 CSS 파일에 그리드 레이아웃 수정 적용됨');
      
    } catch (error) {
      console.error('❌ CSS 파일 수정 실패:', error);
    }
  }

  // JavaScript 코드 실제 수정
  async fixJavaScriptErrorsInCode(errors) {
    const pageJsPath = 'app/page.js';
    
    try {
      let content = await fs.readFile(pageJsPath, 'utf8');
      let modified = false;
      
      // null/undefined 체크 추가
      if (content.includes('hotelData.') && !content.includes('hotelData?.')) {
        content = content.replace(/hotelData\./g, 'hotelData?.');
        modified = true;
        console.log('🔧 null 체크 패턴 추가됨');
      }
      
      // tempHotelData 체크 추가
      if (content.includes('tempHotelData.') && !content.includes('tempHotelData?.')) {
        content = content.replace(/tempHotelData\./g, 'tempHotelData?.');
        modified = true;
        console.log('🔧 tempHotelData null 체크 추가됨');
      }
      
      // 함수 존재 체크 추가
      if (content.includes('updateData(') && !content.includes('typeof updateData === "function"')) {
        content = content.replace(
          /updateData\(/g, 
          '(typeof updateData === "function" ? updateData : () => {})('
        );
        modified = true;
        console.log('🔧 함수 존재 체크 추가됨');
      }
      
      if (modified) {
        await fs.writeFile(pageJsPath, content);
        this.fixCount++;
        console.log('🔧 JavaScript 파일 수정 완료');
      }
      
    } catch (error) {
      console.error('❌ JavaScript 파일 수정 실패:', error);
    }
  }

  // 컴포넌트 파일 자동 수정
  async fixComponentStyles() {
    const componentPaths = [
      'app/components/hotel/HotelInfo.module.css',
      'app/components/AppContainer.module.css'
    ];

    for (const cssPath of componentPaths) {
      try {
        const exists = await fs.access(cssPath).then(() => true).catch(() => false);
        if (!exists) continue;

        let content = await fs.readFile(cssPath, 'utf8');
        
        if (content.includes('/* AUTO-FIX */')) continue;

        const responsiveFix = `
/* AUTO-FIX: Responsive design improvements */
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr !important;
    gap: 1rem !important;
  }
  
  button, [role="button"] {
    width: 100% !important;
    min-height: 48px !important;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.5rem !important;
  }
}
`;

        content += responsiveFix;
        await fs.writeFile(cssPath, content);
        
        this.fixCount++;
        console.log(`🔧 ${cssPath} 반응형 스타일 수정됨`);
        
      } catch (error) {
        console.error(`❌ ${cssPath} 수정 실패:`, error);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stop() {
    console.log('🛑 스마트 자동 수정기 중지...');
    this.isRunning = false;
    if (this.browser) {
      await this.browser.close();
    }
    console.log(`📊 총 ${this.fixCount}개 파일 수정 완료`);
  }
}

// 즉시 실행
const fixer = new SmartAutoFixer();

process.on('SIGINT', async () => {
  await fixer.stop();
  process.exit(0);
});

fixer.start().catch(console.error);

module.exports = SmartAutoFixer; 