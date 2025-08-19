const puppeteer = require('puppeteer');
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');

class PuppeteerAPIServer {
  constructor() {
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.browser = null;
    this.page = null;
    this.errorLog = [];
    this.connectedClients = new Set();
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  setupRoutes() {
    // 브라우저 시작 API
    this.app.post('/api/browser/start', async (req, res) => {
      try {
        await this.startBrowser();
        res.json({ success: true, message: '브라우저 시작됨' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 브라우저 중지 API
    this.app.post('/api/browser/stop', async (req, res) => {
      try {
        await this.stopBrowser();
        res.json({ success: true, message: '브라우저 중지됨' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 페이지 이동 API
    this.app.post('/api/browser/navigate', async (req, res) => {
      try {
        const { url } = req.body;
        await this.navigateTo(url);
        res.json({ success: true, message: `페이지 이동: ${url}` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 코드 주입 API
    this.app.post('/api/browser/inject', async (req, res) => {
      try {
        const { code } = req.body;
        await this.injectCode(code);
        res.json({ success: true, message: '코드 주입 완료' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 오류 로그 조회 API
    this.app.get('/api/errors', (req, res) => {
      res.json({ errors: this.errorLog });
    });

    // 실시간 오류 모니터링 시작 API
    this.app.post('/api/monitor/start', async (req, res) => {
      try {
        await this.startErrorMonitoring();
        res.json({ success: true, message: '오류 모니터링 시작됨' });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 브라우저 상태 조회 API
    this.app.get('/api/browser/status', (req, res) => {
      res.json({
        isRunning: !!this.browser,
        currentUrl: this.page ? this.page.url() : null,
        connectedClients: this.connectedClients.size
      });
    });

    // 스크린샷 API
    this.app.get('/api/browser/screenshot', async (req, res) => {
      try {
        if (!this.page) {
          return res.status(400).json({ success: false, error: '브라우저가 실행되지 않음' });
        }
        const screenshot = await this.page.screenshot({ encoding: 'base64' });
        res.json({ success: true, screenshot: `data:image/png;base64,${screenshot}` });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // 콘솔 로그 조회 API
    this.app.get('/api/browser/console', async (req, res) => {
      try {
        if (!this.page) {
          return res.status(400).json({ success: false, error: '브라우저가 실행되지 않음' });
        }
        const logs = await this.page.evaluate(() => {
          return window.consoleLogs || [];
        });
        res.json({ success: true, logs });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    });
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('✅ 클라이언트 연결됨');
      this.connectedClients.add(ws);

      ws.on('close', () => {
        console.log('❌ 클라이언트 연결 해제');
        this.connectedClients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket 오류:', error);
        this.connectedClients.delete(ws);
      });
    });
  }

  async startBrowser() {
    if (this.browser) {
      console.log('브라우저가 이미 실행 중입니다.');
      return;
    }

    console.log('🚀 브라우저 시작 중...');
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox']
    });

    this.page = await this.browser.newPage();
    
    // 콘솔 로그 수집
    this.page.on('console', (msg) => {
      const logData = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      
      this.errorLog.push(logData);
      this.broadcastToClients('console-log', logData);
    });

    // 페이지 오류 수집
    this.page.on('pageerror', (error) => {
      const errorData = {
        type: 'page-error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      
      this.errorLog.push(errorData);
      this.broadcastToClients('page-error', errorData);
    });

    // 요청 실패 수집
    this.page.on('requestfailed', (request) => {
      const errorData = {
        type: 'request-failed',
        url: request.url(),
        failure: request.failure(),
        timestamp: new Date().toISOString()
      };
      
      this.errorLog.push(errorData);
      this.broadcastToClients('request-failed', errorData);
    });

    console.log('✅ 브라우저 시작 완료');
  }

  async stopBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      console.log('🛑 브라우저 중지됨');
    }
  }

  async navigateTo(url) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다.');
    }
    await this.page.goto(url, { waitUntil: 'networkidle0' });
    console.log(`✅ 페이지 이동: ${url}`);
  }

  async injectCode(code) {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다.');
    }
    await this.page.evaluate(code);
    console.log('✅ 코드 주입 완료');
  }

  async startErrorMonitoring() {
    if (!this.page) {
      throw new Error('브라우저가 실행되지 않았습니다.');
    }

    // 실시간 오류 모니터링 코드 주입
    const monitoringCode = `
      (function() {
        console.log('🔍 실시간 오류 모니터링 시작');
        
        // 콘솔 로그 수집
        window.consoleLogs = [];
        const originalLog = console.log;
        const originalError = console.error;
        const originalWarn = console.warn;
        
        console.log = function(...args) {
          window.consoleLogs.push({
            type: 'log',
            message: args.join(' '),
            timestamp: new Date().toISOString()
          });
          originalLog.apply(console, args);
        };
        
        console.error = function(...args) {
          const message = args.join(' ');
          window.consoleLogs.push({
            type: 'error',
            message: message,
            timestamp: new Date().toISOString()
          });
          
          // Hydration 오류 특별 감지
          if (message.includes('Text content does not match server-rendered HTML') ||
              message.includes('Server:') && message.includes('Client:')) {
            window.consoleLogs.push({
              type: 'hydration-error',
              message: message,
              priority: 'high',
              timestamp: new Date().toISOString()
            });
          }
          
          originalError.apply(console, args);
        };
        
        console.warn = function(...args) {
          window.consoleLogs.push({
            type: 'warn',
            message: args.join(' '),
            timestamp: new Date().toISOString()
          });
          originalWarn.apply(console, args);
        };
        
        // 전역 오류 이벤트 리스너
        window.addEventListener('error', (event) => {
          window.consoleLogs.push({
            type: 'window-error',
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            timestamp: new Date().toISOString()
          });
        });
        
        // Promise 오류 리스너
        window.addEventListener('unhandledrejection', (event) => {
          window.consoleLogs.push({
            type: 'unhandled-rejection',
            message: event.reason?.toString() || 'Unknown rejection',
            timestamp: new Date().toISOString()
          });
        });
        
        // DOM 변경 감지
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const hydrationElements = node.querySelectorAll('[data-hydration-error], .hydration-error');
                  if (hydrationElements.length > 0) {
                    window.consoleLogs.push({
                      type: 'hydration-error',
                      message: 'DOM에서 Hydration 오류 요소 발견',
                      priority: 'high',
                      timestamp: new Date().toISOString()
                    });
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
        
        console.log('✅ 실시간 오류 모니터링 활성화됨');
      })();
    `;

    await this.page.evaluate(monitoringCode);
    console.log('✅ 실시간 오류 모니터링 시작됨');
  }

  broadcastToClients(type, data) {
    const message = JSON.stringify({ type, data });
    this.connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  start(port = 3901) {
    this.server.listen(port, () => {
      console.log(`🚀 Puppeteer API 서버 시작: http://localhost:${port}`);
      console.log('📋 사용 가능한 API:');
      console.log('  POST /api/browser/start - 브라우저 시작');
      console.log('  POST /api/browser/stop - 브라우저 중지');
      console.log('  POST /api/browser/navigate - 페이지 이동');
      console.log('  POST /api/browser/inject - 코드 주입');
      console.log('  POST /api/monitor/start - 오류 모니터링 시작');
      console.log('  GET  /api/errors - 오류 로그 조회');
      console.log('  GET  /api/browser/status - 브라우저 상태');
      console.log('  GET  /api/browser/screenshot - 스크린샷');
      console.log('  GET  /api/browser/console - 콘솔 로그');
      console.log('  WebSocket - 실시간 오류 수신');
    });
  }
}

// 서버 시작
const server = new PuppeteerAPIServer();
server.start();

// 프로세스 종료 시 정리
process.on('SIGINT', async () => {
  await server.stopBrowser();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await server.stopBrowser();
  process.exit(0);
});
