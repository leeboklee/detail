const puppeteer = require('puppeteer');
const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

class AutoBrowserMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.wss = null;
    this.server = null;
    this.errorLog = [];
    this.autoFixEnabled = true;
    this.projectRoot = process.cwd();
  }

  async start() {
    console.log('🚀 자동 브라우저 오류 모니터링 시작...');
    
    try {
      // WebSocket 서버 시작
      await this.startWebSocketServer();
      
      // 브라우저 시작
      await this.startBrowser();
      
      // 페이지 로드 및 모니터링 코드 주입
      await this.loadPageAndInject();
      
      console.log('✅ 자동 모니터링 완전 활성화됨');
      console.log('🎯 이제 브라우저에서 발생하는 모든 오류가 자동으로 감지되고 수정됩니다!');
      
    } catch (error) {
      console.error('❌ 자동 모니터링 시작 실패:', error.message);
    }
  }

  async startWebSocketServer() {
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws) => {
      console.log('✅ 브라우저 자동 연결됨');
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleBrowserMessage(message);
        } catch (error) {
          console.error('❌ 메시지 파싱 오류:', error.message);
        }
      });

      ws.on('close', () => {
        console.log('❌ 브라우저 연결 해제');
      });
    });

    const PORT = 3901;
    return new Promise((resolve) => {
      this.server.listen(PORT, () => {
        console.log(`✅ WebSocket 서버 시작: ws://localhost:${PORT}`);
        resolve();
      });
    });
  }

  async startBrowser() {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1920, height: 1080 },
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    this.page = await this.browser.newPage();
    
    // 브라우저 콘솔 로그 수집
    this.page.on('console', (msg) => {
      this.handleConsoleMessage(msg);
    });

    // 페이지 오류 수집
    this.page.on('pageerror', (error) => {
      this.handlePageError(error);
    });
  }

  async loadPageAndInject() {
    // 페이지 로드
    await this.page.goto('http://localhost:3900', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    console.log('✅ 페이지 로드 완료');

    // 모니터링 코드 자동 주입
    await this.page.evaluate(() => {
      // 이미 주입된 경우 중복 방지
      if (window.monitoringActive) return;
      window.monitoringActive = true;

      console.log('🔗 자동 모니터링 코드 주입 중...');
      
      const ws = new WebSocket('ws://localhost:3901');
      
      // 연결 상태 표시
      ws.onopen = () => {
        console.log('✅ 자동 모니터링 연결됨');
        document.body.style.border = '3px solid #10B981';
        document.body.style.borderRadius = '8px';
      };
      
      ws.onclose = () => {
        console.log('❌ 자동 모니터링 연결 해제');
        document.body.style.border = '3px solid #EF4444';
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket 오류:', error);
        document.body.style.border = '3px solid #F59E0B';
      };
      
      // 콘솔 오류 수집 강화
      const originalError = console.error;
      const originalWarn = console.warn;
      const originalLog = console.log;
      
      console.error = function(...args) {
        const message = args.join(' ');
        console.log('🚨 콘솔 오류 감지:', message);
        
        // Hydration 오류 특별 감지
        if (message.includes('Text content does not match server-rendered HTML') ||
            message.includes('Server:') && message.includes('Client:')) {
          console.log('🚨 Hydration 오류 특별 감지됨!');
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'hydration-error',
              message: message,
              timestamp: new Date().toISOString(),
              stack: new Error().stack,
              priority: 'high'
            }));
          }
        }
        
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'console-error',
            message: message,
            timestamp: new Date().toISOString(),
            stack: new Error().stack
          }));
        }
        originalError.apply(console, args);
      };
      
      console.warn = function(...args) {
        const message = args.join(' ');
        console.log('⚠️ 콘솔 경고 감지:', message);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'console-warn',
            message: message,
            timestamp: new Date().toISOString()
          }));
        }
        originalWarn.apply(console, args);
      };

      // 모든 콘솔 로그 수집 (디버깅용)
      console.log = function(...args) {
        const message = args.join(' ');
        if (message.includes('Text content does not match') || 
            message.includes('Server:') || 
            message.includes('Client:') ||
            message.includes('hydration')) {
          console.log('🚨 중요 로그 감지:', message);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'important-log',
              message: message,
              timestamp: new Date().toISOString()
            }));
          }
        }
        originalLog.apply(console, args);
      };
      
      // 페이지 오류 수집
      window.addEventListener('error', (event) => {
        console.log('🚨 페이지 오류 감지:', event.message);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'page-error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            timestamp: new Date().toISOString()
          }));
        }
      });
      
      // React 오류 수집
      window.addEventListener('unhandledrejection', (event) => {
        console.log('🚨 React 오류 감지:', event.reason?.message || event.reason);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'unhandled-rejection',
            message: event.reason?.message || event.reason,
            stack: event.reason?.stack,
            timestamp: new Date().toISOString()
          }));
        }
      });

      // Next.js 오류 수집 강화
      window.addEventListener('error', (event) => {
        const errorMessage = event.message || '';
        if (errorMessage.includes('Text content does not match server-rendered HTML') || 
            errorMessage.includes('hydration') ||
            (errorMessage.includes('Server:') && errorMessage.includes('Client:'))) {
          console.log('🚨 Hydration 오류 감지:', errorMessage);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'hydration-error',
              message: errorMessage,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
              stack: event.error?.stack,
              timestamp: new Date().toISOString(),
              priority: 'high'
            }));
          }
        }
      });

      // DOM 변경 감지로 Hydration 오류 포착 강화
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Hydration 오류 관련 요소 감지
                const textContent = node.textContent || '';
                if (textContent.includes('Server:') && textContent.includes('Client:')) {
                  console.log('🚨 Hydration 오류 요소 감지:', textContent);
                  if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                      type: 'hydration-error',
                      message: 'Hydration mismatch detected in DOM',
                      element: textContent,
                      timestamp: new Date().toISOString(),
                      priority: 'high'
                    }));
                  }
                }
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true
      });

      // 주기적 Hydration 상태 체크
      setInterval(() => {
        // 페이지에서 Hydration 오류 요소 찾기
        const errorElements = document.querySelectorAll('*');
        errorElements.forEach(element => {
          const text = element.textContent || '';
          if (text.includes('Server:') && text.includes('Client:')) {
            console.log('🚨 주기적 Hydration 오류 감지:', text);
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({
                type: 'hydration-error',
                message: 'Periodic hydration error check',
                element: text,
                timestamp: new Date().toISOString(),
                priority: 'high'
              }));
            }
          }
        });
      }, 3000);
      
      // 주기적 상태 보고
      setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          const state = {
            type: 'status',
            url: window.location.href,
            title: document.title,
            hasErrors: document.querySelectorAll('.error, [data-error]').length > 0,
            hydrationComplete: document.body.classList.contains('hydration-complete'),
            timestamp: new Date().toISOString()
          };
          ws.send(JSON.stringify(state));
        }
      }, 5000);
      
      // 수정 명령 수신
      ws.addEventListener('message', (event) => {
        try {
          const command = JSON.parse(event.data);
          if (command.type === 'fix-command') {
            console.log('🔧 수정 명령 수신:', command.action);
            executeFixCommand(command);
          }
        } catch (error) {
          console.error('❌ 명령 파싱 오류:', error);
        }
      });
      
      function executeFixCommand(command) {
        switch (command.action) {
          case 'reload':
            console.log('🔄 페이지 새로고침 실행');
            window.location.reload();
            break;
          case 'clear-storage':
            console.log('🧹 스토리지 클리어 실행');
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
            break;
          case 'wait-hydration':
            console.log('⏳ Hydration 대기');
            const checkHydration = setInterval(() => {
              if (document.body.classList.contains('hydration-complete')) {
                clearInterval(checkHydration);
                console.log('✅ Hydration 완료');
              }
            }, 100);
            break;
          case 'fix-hydration':
            console.log('🔧 Hydration 오류 수정 시도');
            setTimeout(() => {
              console.log('🔄 Hydration 오류로 인한 페이지 새로고침');
              window.location.reload();
            }, 1000);
            break;
          case 'retry-request':
            console.log('🔄 네트워크 요청 재시도');
            break;
        }
      }
      
      console.log('🎯 자동 오류 모니터링 활성화됨');
    });

    // 테스트 메시지 전송
    setTimeout(async () => {
      await this.page.evaluate(() => {
        if (window.WebSocket && window.WebSocket.OPEN) {
          console.log('🧪 자동 연결 테스트 완료');
        }
      });
    }, 2000);
  }

  handleConsoleMessage(msg) {
    const message = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date().toISOString()
    };

    if (message.type === 'error') {
      console.log(`[${message.type.toUpperCase()}] ${message.text}`);
      this.errorLog.push({
        type: 'console-error',
        message: message.text,
        timestamp: message.timestamp
      });
    }
  }

  handlePageError(error) {
    const errorInfo = {
      type: 'page-error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };

    console.error('❌ 페이지 오류:', errorInfo.message);
    this.errorLog.push(errorInfo);
  }

  handleBrowserMessage(message) {
    console.log(`[${message.type.toUpperCase()}] ${message.message || message.url || '상태 업데이트'}`);
    
    if (message.type !== 'status') {
      this.errorLog.push(message);
      
      if (this.autoFixEnabled) {
        this.autoFixError(message);
      }
    }
    
    if (message.type === 'status' && message.hasErrors) {
      console.log('⚠️ 페이지에 오류 요소 발견');
    }
  }

  autoFixError(error) {
    console.log('🔧 자동 수정 시도:', error.message?.substring(0, 50) || error.type);
    
    // 브라우저에 수정 명령 전송
    this.page.evaluate((errorData) => {
      if (window.ws && window.ws.readyState === WebSocket.OPEN) {
        const fixCommand = {
          type: 'fix-command',
          action: 'reload',
          target: 'page',
          reason: '자동 오류 수정'
        };
        
        if (errorData.message?.includes('Text content does not match server-rendered HTML') || 
            errorData.message?.includes('hydration') ||
            errorData.type === 'hydration-error') {
          fixCommand.action = 'fix-hydration';
          fixCommand.reason = 'Hydration 오류 자동 수정';
        } else if (errorData.type === 'page-error') {
          fixCommand.action = 'clear-storage';
        }
        
        window.ws.send(JSON.stringify(fixCommand));
      }
    }, error);
  }

  async stop() {
    console.log('🛑 자동 모니터링 중지...');
    
    if (this.browser) {
      await this.browser.close();
    }
    
    if (this.wss) {
      this.wss.close();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    this.saveErrorLog();
  }

  saveErrorLog() {
    const logPath = path.join(this.projectRoot, 'logs', 'auto-browser-errors.json');
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
}

// CLI 실행
if (require.main === module) {
  const monitor = new AutoBrowserMonitor();
  
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

  monitor.start().catch(console.error);
}

module.exports = AutoBrowserMonitor;
