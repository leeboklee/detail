const { chromium } = require('playwright');
const fs = require('fs');

class AutoHealingVisualSystem {
  constructor() {
    this.issues = [];
    this.autoFixes = [];
    this.serverUrl = 'http://localhost: {process.env.PORT || 3900}';
  }

  // 1. 실시간 모니터링
  async startContinuousMonitoring() {
    console.log('🔄 실시간 Visual 모니터링 시작...');
    
    setInterval(async () => {
      await this.detectAndFixIssues();
    }, 30000); // 30초마다 체크
  }

  // 2. 자동 문제 감지 + 해결
  async detectAndFixIssues() {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    try {
      await page.goto(this.serverUrl);
      await page.waitForLoadState('networkidle');
      
      // 실시간 에러 수집
      const errors = await this.collectRuntimeErrors(page);
      const layoutIssues = await this.detectLayoutIssues(page);
      const performanceIssues = await this.detectPerformanceIssues(page);
      
      // 자동 수정 시도
      if (errors.length > 0) {
        await this.autoFixErrors(errors, page);
      }
      
      if (layoutIssues.length > 0) {
        await this.autoFixLayoutIssues(layoutIssues, page);
      }
      
      // 로그 기록
      await this.logIssues(errors, layoutIssues, performanceIssues);
      
    } catch (error) {
      console.error('❌ 모니터링 중 오류:', error);
    } finally {
      await browser.close();
    }
  }

  // 3. 런타임 에러 수집
  async collectRuntimeErrors(page) {
    const errors = [];
    
    // Console 에러 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console_error',
          message: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // JavaScript 에러 수집
    page.on('pageerror', error => {
      errors.push({
        type: 'js_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });
    
    // Network 에러 수집
    page.on('response', response => {
      if (!response.ok()) {
        errors.push({
          type: 'network_error',
          url: response.url(),
          status: response.status(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    return errors;
  }

  // 4. 레이아웃 문제 감지
  async detectLayoutIssues(page) {
    const issues = await page.evaluate(() => {
      const problems = [];
      
      // 오버플로우 감지
      const elements = document.querySelectorAll('*');
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        
        // 뷰포트 밖으로 나간 요소
        if (rect.right > window.innerWidth) {
          problems.push({
            type: 'overflow_horizontal',
            element: el.tagName,
            className: el.className,
            id: el.id,
            position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
          });
        }
        
        // 겹친 요소 감지
        if (style.position === 'absolute' || style.position === 'fixed') {
          const zIndex = parseInt(style.zIndex) || 0;
          if (zIndex < 0) {
            problems.push({
              type: 'negative_z_index',
              element: el.tagName,
              className: el.className,
              zIndex: zIndex
            });
          }
        }
        
        // 너무 작은 클릭 영역
        if (el.onclick || el.querySelector('button, a')) {
          if (rect.width < 44 || rect.height < 44) {
            problems.push({
              type: 'small_click_area',
              element: el.tagName,
              className: el.className,
              size: { width: rect.width, height: rect.height }
            });
          }
        }
      });
      
      return problems;
    });
    
    return issues;
  }

  // 5. 성능 문제 감지
  async detectPerformanceIssues(page) {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
        firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime
      };
    });
    
    const issues = [];
    
    if (metrics.loadTime > 3000) {
      issues.push({ type: 'slow_load', time: metrics.loadTime });
    }
    
    if (metrics.firstContentfulPaint > 2500) {
      issues.push({ type: 'slow_fcp', time: metrics.firstContentfulPaint });
    }
    
    return issues;
  }

  // 6. 자동 에러 수정
  async autoFixErrors(errors, page) {
    for (const error of errors) {
      switch (error.type) {
        case 'network_error':
          if (error.url.includes('/api/')) {
            console.log('🔧 API 에러 감지, 재시도 중...');
            await page.reload({ waitUntil: 'networkidle' });
          }
          break;
          
        case 'js_error':
          if (error.message.includes('Cannot read property')) {
            console.log('🔧 Null reference 에러 감지, 페이지 새로고침...');
            await page.reload({ waitUntil: 'networkidle' });
          }
          break;
          
        case 'console_error':
          if (error.message.includes('404')) {
            console.log('🔧 리소스 404 에러 감지...');
            // 대체 리소스 로딩 시도 등
          }
          break;
      }
    }
  }

  // 7. 자동 레이아웃 수정
  async autoFixLayoutIssues(issues, page) {
    for (const issue of issues) {
      switch (issue.type) {
        case 'overflow_horizontal':
          console.log('🔧 수평 오버플로우 감지, CSS 수정 시도...');
          await page.addStyleTag({
            content: `
              .${issue.className} {
                max-width: 100% !important;
                overflow-x: auto !important;
              }
            `
          });
          break;
          
        case 'small_click_area':
          console.log('🔧 작은 클릭 영역 감지, 크기 확대...');
          await page.addStyleTag({
            content: `
              .${issue.className} {
                min-width: 44px !important;
                min-height: 44px !important;
                padding: 8px !important;
              }
            `
          });
          break;
          
        case 'negative_z_index':
          console.log('🔧 음수 z-index 감지, 수정...');
          await page.addStyleTag({
            content: `
              .${issue.className} {
                z-index: 1 !important;
              }
            `
          });
          break;
      }
    }
  }

  // 8. 이슈 로깅
  async logIssues(errors, layoutIssues, performanceIssues) {
    const timestamp = new Date().toISOString();
    const logData = {
      timestamp,
      errors: errors.length,
      layoutIssues: layoutIssues.length,
      performanceIssues: performanceIssues.length,
      details: { errors, layoutIssues, performanceIssues }
    };
    
    // 파일로 저장
    const logFile = `logs/visual-monitoring-${timestamp.split('T')[0]}.json`;
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    
    fs.writeFileSync(logFile, JSON.stringify(logData, null, 2));
    
    // 콘솔 출력
    console.log(`📊 모니터링 결과 (${timestamp}):`);
    console.log(`  에러: ${errors.length}개`);
    console.log(`  레이아웃 문제: ${layoutIssues.length}개`);
    console.log(`  성능 문제: ${performanceIssues.length}개`);
    
    // 심각한 문제 시 알림
    if (errors.length > 5 || layoutIssues.length > 3) {
      await this.sendAlert(logData);
    }
  }

  // 9. 알림 시스템
  async sendAlert(logData) {
    console.log('🚨 심각한 문제 감지! 즉시 수정 필요');
    
    // 실제로는 Slack, 이메일, Discord 등으로 알림
    // await fetch('webhook-url', {
    //   method: 'POST',
    //   body: JSON.stringify(logData)
    // });
  }

  // 10. 트레이스 수집
  async captureDetailedTrace(page) {
    await page.tracing.start({
      path: `traces/trace-${Date.now()}.zip`,
      screenshots: true,
      sources: true,
      snapshots: true
    });
    
    // 페이지 상호작용 후
    await page.tracing.stop();
  }
}

// 실행
const autoHealer = new AutoHealingVisualSystem();
autoHealer.startContinuousMonitoring();

module.exports = AutoHealingVisualSystem; 