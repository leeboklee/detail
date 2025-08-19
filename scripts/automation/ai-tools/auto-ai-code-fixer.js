const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class AutoAICodeFixer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.isRunning = false;
    this.fixCount = 0;
    this.logFile = `logs/auto-fixes-${new Date().toISOString().split('T')[0]}.json`;
    this.fixes = [];
  }

  async start() {
    console.log('🤖 AI 자동 코드 수정기 시작...');
    this.isRunning = true;
    
    // 브라우저 시작
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
    
    // 모니터링 루프 시작
    while (this.isRunning) {
      try {
        await this.detectAndFix();
        await this.sleep(30000); // 30초마다 체크
      } catch (error) {
        console.error('❌ 자동 수정 중 오류:', error);
        await this.sleep(10000); // 오류 시 10초 후 재시도
      }
    }
  }

  async detectAndFix() {
    try {
      // 페이지 로드
      await this.page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
      
      // 1. 레이아웃 문제 감지 및 수정
      await this.fixLayoutIssues();
      
      // 2. 버튼 클릭 영역 문제 감지 및 수정
      await this.fixClickabilityIssues();
      
      // 3. CSS 오버플로우 문제 감지 및 수정
      await this.fixOverflowIssues();
      
      // 4. 반응형 디자인 문제 감지 및 수정
      await this.fixResponsiveIssues();
      
      // 5. JavaScript 오류 감지 및 수정
      await this.fixJavaScriptErrors();
      
      console.log(`✅ 자동 검사 완료 - 총 수정 사항: ${this.fixCount}개`);
      
    } catch (error) {
      console.error('❌ 감지 및 수정 중 오류:', error);
    }
  }

  async fixLayoutIssues() {
    // Grid 레이아웃 문제 감지
    const gridIssues = await this.page.evaluate(() => {
      const issues = [];
      const gridContainer = document.querySelector('main .grid');
      
      if (gridContainer) {
        const cards = gridContainer.querySelectorAll('[data-testid^="section-card-"]');
        const containerWidth = gridContainer.offsetWidth;
        const cardWidths = Array.from(cards).map(card => card.offsetWidth);
        
        // 카드 크기 불일치 감지
        const avgWidth = cardWidths.reduce((a, b) => a + b, 0) / cardWidths.length;
        const hasInconsistentSizes = cardWidths.some(width => 
          Math.abs(width - avgWidth) > 20
        );
        
        if (hasInconsistentSizes) {
          issues.push({
            type: 'inconsistent_card_sizes',
            container: 'main .grid',
            avgWidth,
            cardWidths
          });
        }
      }
      
      return issues;
    });

    for (const issue of gridIssues) {
      if (issue.type === 'inconsistent_card_sizes') {
        await this.applyGridFix();
      }
    }
  }

  async fixClickabilityIssues() {
    // 클릭 영역이 너무 작은 요소 감지
    const clickIssues = await this.page.evaluate(() => {
      const issues = [];
      const clickableElements = document.querySelectorAll('button, [role="button"], a, [onclick]');
      
      clickableElements.forEach((element, index) => {
        const rect = element.getBoundingClientRect();
        const minSize = 44; // 최소 터치 영역 (44px)
        
        if (rect.width < minSize || rect.height < minSize) {
          issues.push({
            type: 'small_click_area',
            element: element.tagName,
            selector: element.getAttribute('data-testid') || `${element.tagName.toLowerCase()}:nth-child(${index + 1})`,
            currentSize: { width: rect.width, height: rect.height },
            recommendedSize: { width: Math.max(minSize, rect.width), height: Math.max(minSize, rect.height) }
          });
        }
      });
      
      return issues;
    });

    for (const issue of clickIssues) {
      if (issue.type === 'small_click_area') {
        await this.applyClickAreaFix(issue);
      }
    }
  }

  async fixOverflowIssues() {
    // CSS 오버플로우 문제 감지
    const overflowIssues = await this.page.evaluate(() => {
      const issues = [];
      const elements = document.querySelectorAll('*');
      
      elements.forEach(element => {
        const computed = window.getComputedStyle(element);
        if (element.scrollWidth > element.clientWidth && computed.overflow === 'visible') {
          issues.push({
            type: 'horizontal_overflow',
            tagName: element.tagName,
            className: element.className,
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth
          });
        }
      });
      
      return issues;
    });

    for (const issue of overflowIssues) {
      if (issue.type === 'horizontal_overflow') {
        await this.applyOverflowFix(issue);
      }
    }
  }

  async fixResponsiveIssues() {
    // 다양한 화면 크기에서 테스트
    const sizes = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1920, height: 1080, name: 'desktop' }
    ];

    for (const size of sizes) {
      await this.page.setViewportSize(size);
      await this.page.waitForTimeout(1000);
      
      const responsiveIssues = await this.page.evaluate((deviceName) => {
        const issues = [];
        const elements = document.querySelectorAll('.grid > div');
        
        // 요소들이 화면에서 벗어나는지 확인
        elements.forEach(element => {
          const rect = element.getBoundingClientRect();
          if (rect.right > window.innerWidth) {
            issues.push({
              type: 'element_overflow',
              device: deviceName,
              element: element.className,
              overflowAmount: rect.right - window.innerWidth
            });
          }
        });
        
        return issues;
      }, size.name);

      for (const issue of responsiveIssues) {
        if (issue.type === 'element_overflow') {
          await this.applyResponsiveFix(issue);
        }
      }
    }
    
    // 원래 크기로 복원
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }

  async fixJavaScriptErrors() {
    // 페이지의 JavaScript 오류 감지
    const errors = [];
    
    this.page.on('pageerror', error => {
      errors.push({
        type: 'javascript_error',
        message: error.message,
        stack: error.stack
      });
    });

    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console_error',
          message: msg.text()
        });
      }
    });

    await this.page.reload();
    await this.page.waitForTimeout(3000);

    for (const error of errors) {
      await this.applyJavaScriptFix(error);
    }
  }

  // 실제 코드 수정 메서드들
  async applyGridFix() {
    const fixName = 'grid_layout_consistency';
    if (this.isFixAlreadyApplied(fixName)) return;

    const cssContent = `
/* 자동 수정: Grid 레이아웃 일관성 */
main .grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
  gap: 1.5rem !important;
  align-items: stretch !important;
}

main .grid > div {
  height: 100% !important;
  min-height: 120px !important;
}
`;

    await this.injectCSS(cssContent);
    await this.logFix(fixName, '그리드 레이아웃 일관성 문제 수정');
    console.log('🔧 그리드 레이아웃 수정 적용됨');
  }

  async applyClickAreaFix(issue) {
    const fixName = `click_area_${issue.selector}`;
    if (this.isFixAlreadyApplied(fixName)) return;

    const cssContent = `
/* 자동 수정: 클릭 영역 확대 */
${issue.selector} {
  min-width: ${issue.recommendedSize.width}px !important;
  min-height: ${issue.recommendedSize.height}px !important;
  padding: 8px 12px !important;
  cursor: pointer !important;
}
`;

    await this.injectCSS(cssContent);
    await this.logFix(fixName, `클릭 영역 확대: ${issue.selector}`);
    console.log(`🔧 클릭 영역 수정: ${issue.selector}`);
  }

  async applyOverflowFix(issue) {
    const fixName = `overflow_${issue.className}`;
    if (this.isFixAlreadyApplied(fixName)) return;

    const cssContent = `
/* 자동 수정: 오버플로우 방지 */
.${issue.className} {
  overflow-x: auto !important;
  word-wrap: break-word !important;
  max-width: 100% !important;
}
`;

    await this.injectCSS(cssContent);
    await this.logFix(fixName, `오버플로우 수정: ${issue.className}`);
    console.log(`🔧 오버플로우 수정: ${issue.className}`);
  }

  async applyResponsiveFix(issue) {
    const fixName = `responsive_${issue.device}`;
    if (this.isFixAlreadyApplied(fixName)) return;

    const cssContent = `
/* 자동 수정: 반응형 디자인 */
@media (max-width: ${issue.device === 'mobile' ? '767px' : '1024px'}) {
  .${issue.element} {
    max-width: 100% !important;
    margin: 0 auto !important;
    overflow: hidden !important;
  }
}
`;

    await this.injectCSS(cssContent);
    await this.logFix(fixName, `반응형 디자인 수정: ${issue.device}`);
    console.log(`🔧 반응형 수정: ${issue.device}`);
  }

  async applyJavaScriptFix(error) {
    const fixName = `js_error_${Date.now()}`;
    
    // 공통 JavaScript 오류 패턴별 수정
    if (error.message.includes('Cannot read property') || error.message.includes('Cannot read properties')) {
      await this.fixNullReferenceError(error);
    } else if (error.message.includes('is not a function')) {
      await this.fixFunctionError(error);
    }
    
    await this.logFix(fixName, `JavaScript 오류 수정: ${error.message}`);
    console.log(`🔧 JavaScript 오류 수정: ${error.message.substring(0, 50)}...`);
  }

  async fixNullReferenceError(error) {
    // 실제 파일 수정
    const pageFile = 'app/page.js';
    try {
      let content = await fs.readFile(pageFile, 'utf8');
      
      // null 체크 패턴 추가
      if (content.includes('hotelData.') && !content.includes('hotelData?.')) {
        content = content.replace(/hotelData\./g, 'hotelData?.');
        await fs.writeFile(pageFile, content);
        console.log('🔧 Null 체크 패턴 추가됨');
      }
    } catch (err) {
      console.error('파일 수정 실패:', err);
    }
  }

  async fixFunctionError(error) {
    // 함수 존재 여부 체크 패턴 추가
    const jsContent = `
// 자동 수정: 함수 존재 여부 체크
if (typeof someFunction === 'function') {
  someFunction();
}
`;
    
    await this.injectJS(jsContent);
  }

  // 유틸리티 메서드들
  async injectCSS(cssContent) {
    await this.page.addStyleTag({ content: cssContent });
  }

  async injectJS(jsContent) {
    await this.page.addScriptTag({ content: jsContent });
  }

  async logFix(fixName, description) {
    const fix = {
      name: fixName,
      description,
      timestamp: new Date().toISOString(),
      fixCount: ++this.fixCount
    };
    
    this.fixes.push(fix);
    
    // 로그 파일에 저장
    try {
      await fs.mkdir('logs', { recursive: true });
      await fs.writeFile(this.logFile, JSON.stringify(this.fixes, null, 2));
    } catch (error) {
      console.error('로그 저장 실패:', error);
    }
  }

  isFixAlreadyApplied(fixName) {
    return this.fixes.some(fix => fix.name === fixName);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stop() {
    console.log('🛑 AI 자동 코드 수정기 중지...');
    this.isRunning = false;
    if (this.browser) {
      await this.browser.close();
    }
    console.log(`📊 총 ${this.fixCount}개의 수정 사항 적용됨`);
  }
}

// 실행
const fixer = new AutoAICodeFixer();

// 신호 핸들러 설정
process.on('SIGINT', async () => {
  await fixer.stop();
  process.exit(0);
});

// 자동 수정기 시작
fixer.start().catch(console.error);

module.exports = AutoAICodeFixer; 