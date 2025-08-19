const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

class BrowserErrorMonitor {
  constructor() {
    this.wss = null;
    this.server = null;
    this.errorLog = [];
    this.autoFixEnabled = true;
    this.projectRoot = process.cwd();
    this.logsDir = path.join(this.projectRoot, 'logs');
  }

  async start() {
    console.log('🚀 브라우저 오류 모니터링 시작...');
    
    try {
      // 로그 디렉토리 생성
      if (!fs.existsSync(this.logsDir)) {
        fs.mkdirSync(this.logsDir, { recursive: true });
      }

      // WebSocket 서버 시작
      await this.startWebSocketServer();
      
      // 브라우저 주입 코드 출력
      this.printBrowserCode();
      
      console.log('✅ WebSocket 서버 시작됨: ws://localhost:3900');
      console.log('🎯 위의 코드를 브라우저 콘솔에 붙여넣어주세요!');
      console.log('📝 브라우저에서 F12 → Console 탭 → 코드 붙여넣기');
      
    } catch (error) {
      console.error('❌ 모니터링 시작 실패:', error.message);
    }
  }

  async startWebSocketServer() {
    this.server = http.createServer();
    this.wss = new WebSocket.Server({ server: this.server });

    this.wss.on('connection', (ws) => {
      console.log('✅ 브라우저 연결됨! 실시간 오류 수집 시작');
      
      // 연결 성공 시 시각적 피드백
      ws.send(JSON.stringify({ 
        type: 'connection-success', 
        message: '브라우저 연결 성공! 오류 수집 시작됨' 
      }));
      
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

      ws.on('error', (error) => {
        console.error('❌ WebSocket 오류:', error.message);
      });
    });

    const PORT = 3900;
    return new Promise((resolve) => {
      this.server.listen(PORT, () => {
        console.log(`✅ WebSocket 서버 시작: ws://localhost:${PORT}`);
        resolve();
      });
    });
  }

  printBrowserCode() {
    const browserCode = `
// 브라우저 콘솔에 붙여넣을 코드
(function() {
  console.log('🔗 WebSocket 연결 시도 중...');
  
  const ws = new WebSocket('ws://localhost:3900');
  
  ws.onopen = () => {
    console.log('✅ WebSocket 연결 성공! 오류 수집 시작');
    document.body.style.border = '3px solid #10b981';
    
    // 오류 수집 시작
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalLog = console.log;
    
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

    console.log('\n' + '='.repeat(80));
    console.log('📋 브라우저 콘솔에 붙여넣을 코드:');
    console.log('='.repeat(80));
    console.log(browserCode);
    console.log('='.repeat(80));
    console.log('📝 사용법:');
    console.log('1. 브라우저에서 F12 키를 누르세요');
    console.log('2. Console 탭을 클릭하세요');
    console.log('3. 위의 코드를 복사해서 붙여넣으세요');
    console.log('4. Enter 키를 누르세요');
    console.log('5. 페이지가 초록색 테두리로 변하면 연결 성공!');
    console.log('='.repeat(80));
  }

  handleBrowserMessage(message) {
    console.log(`🔍 오류 수신: ${message.type} - ${message.message}`);
    
    // 오류 로그에 추가
    this.errorLog.push({
      ...message,
      receivedAt: new Date().toISOString()
    });
    
    // 자동 수정 시도
    if (this.autoFixEnabled) {
      this.autoFixError(message);
    }
    
    // 로그 파일 저장
    this.saveErrorLog();
  }

  autoFixError(error) {
    console.log('🔧 자동 수정 시도:', error.type);
    
    // Hydration 오류 자동 수정
    if (error.type === 'hydration-error') {
      console.log('🔄 Hydration 오류 자동 수정: 페이지 새로고침 명령 전송');
      
      // 모든 연결된 클라이언트에게 수정 명령 전송
      this.wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'fix-command',
            command: 'fix-hydration'
          }));
        }
      });
    }
  }

  saveErrorLog() {
    const logFile = path.join(this.logsDir, 'real-time-errors.json');
    fs.writeFileSync(logFile, JSON.stringify(this.errorLog, null, 2));
  }

  async stop() {
    console.log('🛑 모니터링 중지...');
    
    if (this.wss) {
      this.wss.close();
    }
    
    if (this.server) {
      this.server.close();
    }
    
    console.log('✅ 모니터링 중지됨');
  }
}

// 모니터링 시작
const monitor = new BrowserErrorMonitor();
monitor.start();

// 프로세스 종료 시 정리
process.on('SIGINT', async () => {
  await monitor.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await monitor.stop();
  process.exit(0);
});
