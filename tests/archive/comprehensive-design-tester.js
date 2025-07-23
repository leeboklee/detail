const { chromium } = require('playwright');
const fs = require('fs').promises;

class ComprehensiveDesignTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.issues = [];
    this.timestamp = new Date().toISOString().split('T')[0];
  }

  async start() {
    console.log('🔍 종합 디자인 테스터 시작...');
    
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // 1초씩 천천히 실행해서 실제로 볼 수 있게
    });
    
    this.page = await this.browser.newPage();
    
    // 다양한 화면 크기에서 테스트
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await this.testViewport(viewport);
      await this.sleep(4000); // 4초로 변경
    }

    await this.generateReport();
    await this.browser.close();
    
    console.log('🎯 종합 디자인 테스트 완료!');
    console.log(`📊 발견된 문제: ${this.issues.length}개`);
    console.log(`📁 리포트: reports/design-test-report-${this.timestamp}.json`);
  }

  async testViewport(viewport) {
    console.log(`\n🖥️ ${viewport.name} (${viewport.width}x${viewport.height}) 테스트 중...`);
    
    try {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.goto('http://localhost: {process.env.PORT || 34343}/', { waitUntil: 'networkidle', timeout: 30000 });
      
      // 스크린샷 저장
      await this.page.screenshot({ 
        path: `screenshots/design-test-${viewport.name.toLowerCase().replace(' ', '-')}-${this.timestamp}.png`,
        fullPage: true
      });
      
      // 디자인 문제 감지
      await this.detectDesignIssues(viewport);
      
      console.log(`✅ ${viewport.name} 테스트 완료`);
      
    } catch (error) {
      console.log(`❌ ${viewport.name} 테스트 실패:`, error.message);
      this.issues.push({
        viewport: viewport.name,
        type: 'critical',
        issue: 'Page Load Failed',
        description: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  async detectDesignIssues(viewport) {
    // 버튼 크기 체크
    const buttons = await this.page.$$('button');
    for (const button of buttons) {
      const box = await button.boundingBox();
      const text = await button.textContent();
      
      if (box && (box.width < 44 || box.height < 44)) {
        this.issues.push({
          viewport: viewport.name,
          type: 'medium',
          issue: 'Small Click Target',
          description: `버튼 "${text}" 크기가 ${Math.round(box.width)}x${Math.round(box.height)}px로 권장 크기(44x44px)보다 작음`,
          element: text,
          size: `${Math.round(box.width)}x${Math.round(box.height)}px`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 텍스트 가독성 체크
    const elements = await this.page.$$('*');
    for (const element of elements.slice(0, 50)) { // 처음 50개만 체크
      try {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // 폰트 크기가 너무 작은지 체크
        const fontSize = parseInt(styles.fontSize);
        if (fontSize < 12) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            this.issues.push({
              viewport: viewport.name,
              type: 'low',
              issue: 'Small Font Size',
              description: `텍스트 크기가 ${fontSize}px로 너무 작음 (최소 12px 권장)`,
              element: text.substring(0, 50),
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (e) {
        // 스타일 체크 실패는 무시
      }
    }

    // 레이아웃 오버플로우 체크
    const overflowElements = await this.page.$$eval('*', elements => {
      return elements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > window.innerWidth || rect.height > window.innerHeight;
      }).length;
    });

    if (overflowElements > 0) {
      this.issues.push({
        viewport: viewport.name,
        type: 'medium',
        issue: 'Layout Overflow',
        description: `${overflowElements}개 요소가 화면 밖으로 넘침`,
        timestamp: new Date().toISOString()
      });
    }
  }

  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: this.issues.length,
      issuesByType: {
        critical: this.issues.filter(i => i.type === 'critical').length,
        medium: this.issues.filter(i => i.type === 'medium').length,
        low: this.issues.filter(i => i.type === 'low').length
      },
      issues: this.issues
    };

    // reports 폴더 생성
    try {
      await fs.mkdir('reports', { recursive: true });
    } catch (e) {}

    await fs.writeFile(
      `reports/design-test-report-${this.timestamp}.json`,
      JSON.stringify(report, null, 2)
    );
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 실행
const tester = new ComprehensiveDesignTester();
tester.start().catch(console.error); 