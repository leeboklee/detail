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
    console.log('?뵇 醫낇빀 ?붿옄???뚯뒪???쒖옉...');
    
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 // 1珥덉뵫 泥쒖쿇???ㅽ뻾?댁꽌 ?ㅼ젣濡?蹂????덇쾶
    });
    
    this.page = await this.browser.newPage();
    
    // ?ㅼ뼇???붾㈃ ?ш린?먯꽌 ?뚯뒪??
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop Large' },
      { width: 1366, height: 768, name: 'Desktop Medium' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await this.testViewport(viewport);
      await this.sleep(4000); // 4珥덈줈 蹂寃?
    }

    await this.generateReport();
    await this.browser.close();
    
    console.log('?렞 醫낇빀 ?붿옄???뚯뒪???꾨즺!');
    console.log(`?뱤 諛쒓껄??臾몄젣: ${this.issues.length}媛?);
    console.log(`?뱚 由ы룷?? reports/design-test-report-${this.timestamp}.json`);
  }

  async testViewport(viewport) {
    console.log(`\n?뼢截?${viewport.name} (${viewport.width}x${viewport.height}) ?뚯뒪??以?..`);
    
    try {
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.goto('http://localhost: {process.env.PORT || 3900}/', { waitUntil: 'networkidle', timeout: 30000 });
      
      // ?ㅽ겕由곗꺑 ???
      await this.page.screenshot({ 
        path: `screenshots/design-test-${viewport.name.toLowerCase().replace(' ', '-')}-${this.timestamp}.png`,
        fullPage: true
      });
      
      // ?붿옄??臾몄젣 媛먯?
      await this.detectDesignIssues(viewport);
      
      console.log(`??${viewport.name} ?뚯뒪???꾨즺`);
      
    } catch (error) {
      console.log(`??${viewport.name} ?뚯뒪???ㅽ뙣:`, error.message);
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
    // 踰꾪듉 ?ш린 泥댄겕
    const buttons = await this.page.$$('button');
    for (const button of buttons) {
      const box = await button.boundingBox();
      const text = await button.textContent();
      
      if (box && (box.width < 44 || box.height < 44)) {
        this.issues.push({
          viewport: viewport.name,
          type: 'medium',
          issue: 'Small Click Target',
          description: `踰꾪듉 "${text}" ?ш린媛 ${Math.round(box.width)}x${Math.round(box.height)}px濡?沅뚯옣 ?ш린(44x44px)蹂대떎 ?묒쓬`,
          element: text,
          size: `${Math.round(box.width)}x${Math.round(box.height)}px`,
          timestamp: new Date().toISOString()
        });
      }
    }

    // ?띿뒪??媛?낆꽦 泥댄겕
    const elements = await this.page.$$('*');
    for (const element of elements.slice(0, 50)) { // 泥섏쓬 50媛쒕쭔 泥댄겕
      try {
        const styles = await element.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            fontSize: computed.fontSize
          };
        });
        
        // ?고듃 ?ш린媛 ?덈Т ?묒?吏 泥댄겕
        const fontSize = parseInt(styles.fontSize);
        if (fontSize < 12) {
          const text = await element.textContent();
          if (text && text.trim().length > 0) {
            this.issues.push({
              viewport: viewport.name,
              type: 'low',
              issue: 'Small Font Size',
              description: `?띿뒪???ш린媛 ${fontSize}px濡??덈Т ?묒쓬 (理쒖냼 12px 沅뚯옣)`,
              element: text.substring(0, 50),
              timestamp: new Date().toISOString()
            });
          }
        }
      } catch (e) {
        // ?ㅽ???泥댄겕 ?ㅽ뙣??臾댁떆
      }
    }

    // ?덉씠?꾩썐 ?ㅻ쾭?뚮줈??泥댄겕
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
        description: `${overflowElements}媛??붿냼媛 ?붾㈃ 諛뽰쑝濡??섏묠`,
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

    // reports ?대뜑 ?앹꽦
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

// ?ㅽ뻾
const tester = new ComprehensiveDesignTester();
tester.start().catch(console.error); 
