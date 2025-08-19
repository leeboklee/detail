const { chromium } = require('playwright');
const fs = require('fs');

class AIVisionCodeFixer {
  constructor() {
    this.fixHistory = [];
    this.serverUrl = 'http://localhost: {process.env.PORT || 3900}';
  }

  // 1. 스크린샷 촬영 + AI 분석
  async captureAndAnalyze() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(this.serverUrl);
      await page.waitForLoadState('networkidle');
      
      // 고해상도 스크린샷
      const screenshotPath = `ai-analysis/screenshot-${Date.now()}.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        quality: 100 
      });
      
      // DOM 구조 수집
      const domStructure = await this.extractDOMStructure(page);
      
      // CSS 정보 수집  
      const cssInfo = await this.extractCSSInfo(page);
      
      // AI 분석 요청 (실제로는 OpenAI Vision API 등 사용)
      const analysisResult = await this.requestAIAnalysis({
        screenshot: screenshotPath,
        dom: domStructure,
        css: cssInfo
      });
      
      // 자동 코드 수정
      if (analysisResult.issues.length > 0) {
        await this.autoGenerateAndApplyFixes(analysisResult.issues);
      }
      
      return analysisResult;
      
    } finally {
      await browser.close();
    }
  }

  // 2. DOM 구조 추출
  async extractDOMStructure(page) {
    return await page.evaluate(() => {
      const extractElement = (element, maxDepth = 3, currentDepth = 0) => {
        if (currentDepth > maxDepth) return null;
        
        return {
          tag: element.tagName,
          id: element.id,
          className: element.className,
          attributes: Array.from(element.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {}),
          boundingRect: element.getBoundingClientRect(),
          children: Array.from(element.children)
            .map(child => extractElement(child, maxDepth, currentDepth + 1))
            .filter(Boolean)
        };
      };
      
      return extractElement(document.body);
    });
  }

  // 3. CSS 정보 추출
  async extractCSSInfo(page) {
    return await page.evaluate(() => {
      const cssRules = [];
      
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.type === CSSRule.STYLE_RULE) {
              cssRules.push({
                selector: rule.selectorText,
                styles: rule.style.cssText
              });
            }
          });
        } catch (e) {
          // Cross-origin stylesheet
        }
      });
      
      // 컴퓨티드 스타일 정보도 수집
      const computedStyles = {};
      const importantElements = document.querySelectorAll('main, .grid, [data-testid^="section-card-"], header');
      
      importantElements.forEach((el, index) => {
        const computed = getComputedStyle(el);
        computedStyles[`element_${index}`] = {
          element: el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''),
          display: computed.display,
          position: computed.position,
          width: computed.width,
          height: computed.height,
          margin: computed.margin,
          padding: computed.padding,
          gridTemplateColumns: computed.gridTemplateColumns,
          gap: computed.gap,
          flexDirection: computed.flexDirection,
          alignItems: computed.alignItems,
          justifyContent: computed.justifyContent
        };
      });
      
      return { cssRules, computedStyles };
    });
  }

  // 4. AI 분석 요청 (Mock - 실제로는 Vision API 사용)
  async requestAIAnalysis({ screenshot, dom, css }) {
    // 실제로는 OpenAI GPT-4 Vision, Google Vision API 등 사용
    console.log('🤖 AI Vision 분석 중...');
    
    // Mock 분석 결과 (실제로는 AI가 스크린샷을 보고 판단)
    const mockAnalysis = {
      issues: [
        {
          type: 'layout_broken',
          severity: 'high',
          description: 'Grid 레이아웃이 깨져서 카드들이 세로로 나열됨',
          affectedElements: ['main .grid'],
          suggestedFix: {
            action: 'css_modification',
            target: '.grid',
            changes: {
              'display': 'grid',
              'grid-template-columns': 'repeat(auto-fit, minmax(280px, 1fr))',
              'gap': '1.5rem'
            }
          }
        },
        {
          type: 'responsive_issue',
          severity: 'medium', 
          description: '모바일에서 카드 크기가 너무 큼',
          affectedElements: ['[data-testid^="section-card-"]'],
          suggestedFix: {
            action: 'responsive_css',
            target: '[data-testid^="section-card-"]',
            mediaQuery: '@media (max-width: 768px)',
            changes: {
              'min-height': '120px',
              'padding': '1rem'
            }
          }
        }
      ],
      confidence: 0.85,
      timestamp: new Date().toISOString()
    };
    
    return mockAnalysis;
  }

  // 5. 자동 코드 생성 및 적용
  async autoGenerateAndApplyFixes(issues) {
    console.log('🔧 자동 코드 수정 시작...');
    
    for (const issue of issues) {
      const fix = await this.generateCodeFix(issue);
      await this.applyCodeFix(fix);
      
      this.fixHistory.push({
        issue: issue,
        fix: fix,
        timestamp: new Date().toISOString()
      });
    }
  }

  // 6. 코드 수정 생성
  async generateCodeFix(issue) {
    switch (issue.suggestedFix.action) {
      case 'css_modification':
        return {
          type: 'css',
          target: issue.suggestedFix.target,
          content: this.generateCSSFix(issue.suggestedFix.changes),
          filePath: 'auto-fixes.css'
        };
        
      case 'responsive_css':
        return {
          type: 'responsive_css',
          target: issue.suggestedFix.target,
          mediaQuery: issue.suggestedFix.mediaQuery,
          content: this.generateResponsiveCSSFix(issue.suggestedFix),
          filePath: 'responsive-fixes.css'
        };
        
      case 'component_modification':
        return {
          type: 'component',
          content: await this.generateComponentFix(issue),
          filePath: issue.affectedComponents[0]
        };
        
      default:
        return null;
    }
  }

  // 7. CSS 수정 생성
  generateCSSFix(changes) {
    return Object.entries(changes)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');
  }

  // 8. 반응형 CSS 수정 생성
  generateResponsiveCSSFix({ target, mediaQuery, changes }) {
    const cssContent = this.generateCSSFix(changes);
    return `${mediaQuery} {\n  ${target} {\n${cssContent}\n  }\n}`;
  }

  // 9. 컴포넌트 수정 생성 (AI 코드 생성)
  async generateComponentFix(issue) {
    // 실제로는 AI 코드 생성 API 사용
    console.log('🤖 AI 컴포넌트 코드 생성 중...');
    
    // Mock 컴포넌트 수정
    return `
// Auto-generated fix for: ${issue.description}
export default function FixedComponent() {
  return (
    <div className="fixed-layout">
      {/* AI가 생성한 수정된 컴포넌트 코드 */}
    </div>
  );
}
    `;
  }

  // 10. 코드 적용
  async applyCodeFix(fix) {
    if (!fix) return;
    
    const fixDir = 'auto-generated-fixes';
    if (!fs.existsSync(fixDir)) {
      fs.mkdirSync(fixDir, { recursive: true });
    }
    
    const filePath = `${fixDir}/${fix.filePath}`;
    
    switch (fix.type) {
      case 'css':
      case 'responsive_css':
        let cssContent = '';
        if (fs.existsSync(filePath)) {
          cssContent = fs.readFileSync(filePath, 'utf8');
        }
        
        cssContent += `\n/* Auto-fix ${new Date().toISOString()} */\n`;
        cssContent += `${fix.target} {\n${fix.content}\n}\n`;
        
        if (fix.mediaQuery) {
          cssContent += `\n${fix.content}\n`;
        }
        
        fs.writeFileSync(filePath, cssContent);
        console.log(`✅ CSS 수정 적용: ${filePath}`);
        break;
        
      case 'component':
        fs.writeFileSync(filePath, fix.content);
        console.log(`✅ 컴포넌트 수정 적용: ${filePath}`);
        break;
    }
  }

  // 11. 실시간 모니터링 + 자동 수정
  async startAutoHealingMode() {
    console.log('🔄 AI Auto-Healing 모드 시작...');
    
    // 10분마다 체크
    setInterval(async () => {
      try {
        const result = await this.captureAndAnalyze();
        
        if (result.issues.length > 0) {
          console.log(`🚨 ${result.issues.length}개 문제 감지 및 자동 수정 완료`);
          
          // 수정 후 검증
          setTimeout(async () => {
            await this.verifyFixes();
          }, 5000);
        } else {
          console.log('✅ 문제 없음');
        }
      } catch (error) {
        console.error('❌ Auto-healing 중 오류:', error);
      }
    }, 600000); // 10분
  }

  // 12. 수정 검증
  async verifyFixes() {
    console.log('🔍 수정 사항 검증 중...');
    
    const postFixResult = await this.captureAndAnalyze();
    
    if (postFixResult.issues.length === 0) {
      console.log('✅ 모든 문제 해결됨');
    } else {
      console.log(`⚠️ ${postFixResult.issues.length}개 문제 여전히 존재`);
    }
  }
}

// 실행
const aiVisionFixer = new AIVisionCodeFixer();
aiVisionFixer.startAutoHealingMode();

module.exports = AIVisionCodeFixer; 