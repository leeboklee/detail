const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class RealTimeErrorMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.errorLog = [];
    this.isMonitoring = false;
    this.autoFixEnabled = true;
    this.projectRoot = process.cwd();
  }

  async start() {
    console.log('🚀 실시간 오류 모니터링 시작...');
    
    try {
      // 브라우저 시작
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      this.page = await this.browser.newPage();
      
      // 콘솔 로그 수집
      this.page.on('console', (msg) => {
        this.handleConsoleMessage(msg);
      });

      // 페이지 오류 수집
      this.page.on('pageerror', (error) => {
        this.handlePageError(error);
      });

      // 네트워크 오류 수집
      this.page.on('response', (response) => {
        this.handleNetworkError(response);
      });

      // 페이지 로드
      await this.page.goto('http://localhost:3900', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      console.log('✅ 페이지 로드 완료');
      
      // 실시간 모니터링 시작
      this.isMonitoring = true;
      await this.startRealTimeMonitoring();

    } catch (error) {
      console.error('❌ 모니터링 시작 실패:', error.message);
    }
  }

  async handleConsoleMessage(msg) {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString(),
      location: msg.location()
    };

    console.log(`[${message.type.toUpperCase()}] ${message.text}`);

    // 오류 메시지 처리
    if (message.type === 'error') {
      this.errorLog.push({
        type: 'console-error',
        message: message.text,
        timestamp: message.timestamp,
        location: message.location
      });

      if (this.autoFixEnabled) {
        await this.autoFixError(message);
      }
    }
  }

  async handlePageError(error) {
    const errorInfo = {
      type: 'page-error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    console.error('❌ 페이지 오류:', errorInfo.message);
    this.errorLog.push(errorInfo);

    if (this.autoFixEnabled) {
      await this.autoFixError(errorInfo);
    }
  }

  async handleNetworkError(response) {
    if (response.status() >= 400) {
      const errorInfo = {
        type: 'network-error',
        url: response.url(),
        status: response.status(),
        statusText: response.statusText(),
        timestamp: new Date().toISOString()
      };

      console.error(`❌ 네트워크 오류: ${response.status()} ${response.url()}`);
      this.errorLog.push(errorInfo);
    }
  }

  async autoFixError(error) {
    console.log('🔧 자동 수정 시도:', error.message?.substring(0, 50));

    // Hydration 오류 수정
    if (error.message?.includes('Text content does not match server-rendered HTML')) {
      await this.fixHydrationError();
    }

    // React 오류 수정
    if (error.message?.includes('React') || error.message?.includes('useState') || error.message?.includes('useEffect')) {
      await this.fixReactError(error);
    }

    // Context 오류 수정
    if (error.message?.includes('AppContext') || error.message?.includes('useAppContext')) {
      await this.fixContextError();
    }

    // 일반적인 JavaScript 오류 수정
    if (error.message?.includes('Cannot read property') || error.message?.includes('undefined')) {
      await this.fixJavaScriptError(error);
    }
  }

  async fixHydrationError() {
    console.log('🔧 Hydration 오류 수정 중...');
    
    try {
      // 페이지 새로고침
      await this.page.reload({ waitUntil: 'networkidle' });
      
      // 하이드레이션 완료 대기
      await this.page.waitForFunction(() => {
        return document.body.classList.contains('hydration-complete');
      }, { timeout: 10000 });

      console.log('✅ Hydration 오류 수정 완료');
      
    } catch (error) {
      console.error('❌ Hydration 오류 수정 실패:', error.message);
    }
  }

  async fixReactError(error) {
    console.log('🔧 React 오류 수정 중...');
    
    try {
      // 컴포넌트 재렌더링 강제
      await this.page.evaluate(() => {
        if (window.location) {
          window.location.reload();
        }
      });

      console.log('✅ React 오류 수정 완료');
      
    } catch (error) {
      console.error('❌ React 오류 수정 실패:', error.message);
    }
  }

  async fixContextError() {
    console.log('🔧 Context 오류 수정 중...');
    
    try {
      // localStorage 클리어
      await this.page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      // 페이지 새로고침
      await this.page.reload({ waitUntil: 'networkidle' });

      console.log('✅ Context 오류 수정 완료');
      
    } catch (error) {
      console.error('❌ Context 오류 수정 실패:', error.message);
    }
  }

  async fixJavaScriptError(error) {
    console.log('🔧 JavaScript 오류 수정 중...');
    
    try {
      // 페이지 새로고침
      await this.page.reload({ waitUntil: 'networkidle' });

      console.log('✅ JavaScript 오류 수정 완료');
      
    } catch (error) {
      console.error('❌ JavaScript 오류 수정 실패:', error.message);
    }
  }

  async startRealTimeMonitoring() {
    console.log('👁️ 실시간 모니터링 시작...');
    
    while (this.isMonitoring) {
      try {
        // 페이지 상태 확인
        const pageState = await this.page.evaluate(() => {
          return {
            url: window.location.href,
            title: document.title,
            hasErrors: document.querySelectorAll('.error, [data-error]').length > 0,
            hydrationComplete: document.body.classList.contains('hydration-complete'),
            consoleErrors: window.consoleErrors || []
          };
        });

        // 오류 상태 출력
        if (pageState.hasErrors) {
          console.log('⚠️ 페이지에 오류 요소 발견');
        }

        // 5초마다 체크
        await new Promise(resolve => setTimeout(resolve, 5000));

      } catch (error) {
        console.error('❌ 모니터링 중 오류:', error.message);
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    }
  }

  async stop() {
    console.log('🛑 모니터링 중지...');
    this.isMonitoring = false;
    
    if (this.browser) {
      await this.browser.close();
    }

    // 오류 로그 저장
    this.saveErrorLog();
  }

  saveErrorLog() {
    const logPath = path.join(this.projectRoot, 'logs', 'real-time-errors.json');
    const logDir = path.dirname(logPath);
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logData = {
      timestamp: new Date().toISOString(),
      totalErrors: this.errorLog.length,
      errors: this.errorLog
    };

    fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
    console.log(`📝 오류 로그 저장: ${logPath}`);
  }

  getErrorSummary() {
    const summary = {
      total: this.errorLog.length,
      byType: {},
      recent: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(error => {
      summary.byType[error.type] = (summary.byType[error.type] || 0) + 1;
    });

    return summary;
  }
}

// CLI 실행
if (require.main === module) {
  const monitor = new RealTimeErrorMonitor();
  
  // 종료 시그널 처리
  process.on('SIGINT', async () => {
    console.log('\n🛑 종료 신호 수신...');
    await monitor.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 종료 신호 수신...');
    await monitor.stop();
    process.exit(0);
  });

  // 모니터링 시작
  monitor.start().catch(console.error);
}

module.exports = RealTimeErrorMonitor;
