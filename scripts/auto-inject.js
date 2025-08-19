const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class AutoInjector {
  constructor() {
    this.browser = null;
    this.page = null;
    this.injectionCode = this.getInjectionCode();
  }

  getInjectionCode() {
    return `
      (function() {
        console.log('🔗 WebSocket 연결 시도 중...');
        
        const ws = new WebSocket('ws://localhost:3900');
        
        ws.onopen = () => {
          console.log('✅ WebSocket 연결 성공! 오류 수집 시작');
          document.body.style.border = '3px solid #10b981';
          
          // 오류 수집 시작
          const originalError = console.error;
          const originalWarn = console.warn;
          
          // Hydration 오류 특별 감지
          console.error = function(...args) {
            const message = args.join(' ');
            
            // Hydration 오류 감지
            if (message.includes('Text content does not match server-rendered HTML') ||
                message.includes('Server:') && message.includes('Client:')) {
              ws.send(JSON.stringify({
                type: 'hydration-error',
                message: message,
                priority: 'high',
                timestamp: new Date().toISOString()
              }));
              console.log('🔍 Hydration 오류 감지됨:', message);
            }
            
            // 일반 오류도 전송
            ws.send(JSON.stringify({
              type: 'console-error',
              message: message,
              priority: 'high',
              timestamp: new Date().toISOString()
            }));
            
            originalError.apply(console, args);
          };
          
          console.warn = function(...args) {
            const message = args.join(' ');
            ws.send(JSON.stringify({
              type: 'console-warn',
              message: message,
              priority: 'medium',
              timestamp: new Date().toISOString()
            }));
            originalWarn.apply(console, args);
          };
          
          // 전역 오류 이벤트 리스너
          window.addEventListener('error', (event) => {
            const errorMessage = event.message || '';
            
            // Hydration 오류 감지
            if (errorMessage.includes('Text content does not match server-rendered HTML') ||
                errorMessage.includes('hydration') ||
                (errorMessage.includes('Server:') && errorMessage.includes('Client:'))) {
              ws.send(JSON.stringify({
                type: 'hydration-error',
                message: errorMessage,
                priority: 'high',
                timestamp: new Date().toISOString()
              }));
              console.log('🔍 Hydration 오류 감지됨:', errorMessage);
            }
            
            ws.send(JSON.stringify({
              type: 'window-error',
              message: errorMessage,
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno,
              priority: 'high',
              timestamp: new Date().toISOString()
            }));
          });
          
          // Promise 오류 리스너
          window.addEventListener('unhandledrejection', (event) => {
            ws.send(JSON.stringify({
              type: 'unhandled-rejection',
              message: event.reason?.toString() || 'Unknown rejection',
              priority: 'high',
              timestamp: new Date().toISOString()
            }));
          });
          
          // DOM 변경 감지 (Hydration 오류 탐지)
          const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
              if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                  if (node.nodeType === Node.ELEMENT_NODE) {
                    // Hydration 오류 관련 요소 탐지
                    const hydrationElements = node.querySelectorAll('[data-hydration-error], .hydration-error');
                    if (hydrationElements.length > 0) {
                      ws.send(JSON.stringify({
                        type: 'hydration-error',
                        message: 'DOM에서 Hydration 오류 요소 발견',
                        priority: 'high',
                        timestamp: new Date().toISOString()
                      }));
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
          
          // 주기적 Hydration 오류 체크
          setInterval(() => {
            const hydrationErrors = document.querySelectorAll('[data-hydration-error], .hydration-error');
            if (hydrationErrors.length > 0) {
              ws.send(JSON.stringify({
                type: 'hydration-error',
                message: '주기적 체크에서 Hydration 오류 발견',
                priority: 'high',
                timestamp: new Date().toISOString()
              }));
            }
          }, 3000);
          
          // 명령어 실행 함수
          window.executeFixCommand = function(command) {
            console.log('🔧 명령어 실행:', command);
            
            switch(command) {
              case 'fix-hydration':
                console.log('🔄 Hydration 오류 수정 시도: 페이지 새로고침');
                window.location.reload();
                break;
              case 'reload':
                console.log('🔄 페이지 새로고침');
                window.location.reload();
                break;
              case 'clear-storage':
                console.log('🗑️ 로컬 스토리지 클리어');
                localStorage.clear();
                sessionStorage.clear();
                break;
              default:
                console.log('❌ 알 수 없는 명령어:', command);
            }
          };
          
          // WebSocket 메시지 수신
          ws.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'fix-command' && window.executeFixCommand) {
                window.executeFixCommand(data.command);
              }
            } catch (error) {
              console.error('❌ WebSocket 메시지 처리 오류:', error);
            }
          };
        };
        
        ws.onclose = () => {
          console.log('❌ WebSocket 연결 해제됨');
          document.body.style.border = '3px solid #ef4444';
          
          // 자동 재연결 시도
          setTimeout(() => {
            console.log('🔄 WebSocket 재연결 시도...');
            location.reload();
          }, 3000);
        };
        
        ws.onerror = (error) => {
          console.error('❌ WebSocket 오류:', error);
          document.body.style.border = '3px solid #f59e0b';
        };
      })();
    `;
  }

  async start() {
    console.log('🚀 자동 주입 시작...');
    
    try {
      // 브라우저 시작
      this.browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized']
      });
      
      // 새 페이지 열기
      this.page = await this.browser.newPage();
      
      // 페이지 로드
      await this.page.goto('http://localhost:3900', { waitUntil: 'networkidle0' });
      
      // 코드 주입
      await this.page.evaluate(this.injectionCode);
      
      console.log('✅ 자동 주입 완료! 브라우저에서 실시간 오류 수집 시작');
      console.log('🎯 이제 브라우저에서 오류가 발생하면 자동으로 감지됩니다!');
      
      // 브라우저 유지
      await new Promise(() => {});
      
    } catch (error) {
      console.error('❌ 자동 주입 실패:', error.message);
    }
  }

  async stop() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 자동 주입 시작
const injector = new AutoInjector();
injector.start();

// 프로세스 종료 시 정리
process.on('SIGINT', async () => {
  await injector.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await injector.stop();
  process.exit(0);
});
