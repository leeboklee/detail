const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

class UserBrowserMonitor {
  constructor() {
    this.app = http.createServer();
    this.wss = new WebSocket.Server({ server: this.app });
    this.errorLog = [];
    this.connectedClients = new Set();
    
    this.setupWebSocket();
    this.setupRoutes();
  }

  setupRoutes() {
    this.app.on('request', (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.url === '/api/errors') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ errors: this.errorLog }));
        return;
      }

      if (req.url === '/api/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          connectedClients: this.connectedClients.size,
          errorCount: this.errorLog.length
        }));
        return;
      }

      // HTML 페이지 제공
      if (req.url === '/' || req.url === '/index.html') {
        this.serveHTML(res);
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });
  }

  serveHTML(res) {
    const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>실시간 브라우저 오류 모니터링</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 15px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            text-align: center;
            margin-bottom: 30px;
            font-size: 2.5em;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        .status {
            text-align: center;
            padding: 15px;
            border-radius: 10px;
            margin: 20px 0;
            font-weight: bold;
        }
        .status.connected {
            background: rgba(76, 175, 80, 0.3);
            border: 2px solid #4CAF50;
        }
        .status.disconnected {
            background: rgba(244, 67, 54, 0.3);
            border: 2px solid #f44336;
        }
        .code-block {
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            overflow-x: auto;
            margin: 15px 0;
            border: 1px solid rgba(255, 255, 255, 0.2);
            white-space: pre-wrap;
        }
        .error-list {
            max-height: 400px;
            overflow-y: auto;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 15px;
        }
        .error-item {
            background: rgba(255, 255, 255, 0.1);
            margin: 10px 0;
            padding: 10px;
            border-radius: 5px;
            border-left: 4px solid #ff6b6b;
        }
        .error-item.hydration {
            border-left-color: #ffd93d;
        }
        .error-item.network-request {
            border-left-color: #4CAF50;
        }
        .error-item.network-error {
            border-left-color: #ff9800;
        }
        .error-time {
            font-size: 12px;
            color: #ccc;
        }
        .error-message {
            font-weight: bold;
            margin: 5px 0;
        }
        .instructions {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .step {
            margin: 15px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
        }
        .copy-button {
            background: #ff6b6b;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            margin: 10px 0;
            font-weight: bold;
        }
        .copy-button:hover {
            background: #ff5252;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 실시간 브라우저 오류 모니터링</h1>
        
        <div id="status" class="status disconnected">
            ❌ 브라우저 연결 대기 중...
        </div>

        <div class="instructions">
            <h2>📋 사용 방법</h2>
            
            <div class="step">
                <strong>1단계:</strong> http://localhost:3900 페이지에서 F12를 누르세요
            </div>
            
            <div class="step">
                <strong>2단계:</strong> Console 탭을 클릭하세요
            </div>
            
            <div class="step">
                <strong>3단계:</strong> 아래 코드를 복사해서 붙여넣으세요
            </div>
            
            <div class="step">
                <strong>4단계:</strong> Enter 키를 누르면 연결됩니다!
            </div>
        </div>

        <div class="code-block" id="monitoring-code">
// 실시간 오류 모니터링 코드
(function() {
  console.log('🔗 WebSocket 연결 시도 중...');
  
  const ws = new WebSocket('ws://localhost:3901');
  
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
})();</div>

        <button class="copy-button" onclick="copyCode()">📋 코드 복사</button>

        <h2>📊 실시간 오류 로그</h2>
        <div id="error-list" class="error-list">
            <div style="text-align: center; color: #ccc;">오류가 수집되면 여기에 표시됩니다...</div>
        </div>
    </div>

    <script>
        let ws = null;
        let errorCount = 0;

        function copyCode() {
            const codeElement = document.getElementById('monitoring-code');
            const text = codeElement.textContent;
            
            navigator.clipboard.writeText(text).then(() => {
                alert('✅ 코드가 클립보드에 복사되었습니다!');
            }).catch(() => {
                // 폴백: 텍스트 선택
                const range = document.createRange();
                range.selectNodeContents(codeElement);
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                document.execCommand('copy');
                alert('✅ 코드가 클립보드에 복사되었습니다!');
            });
        }

        function updateStatus(connected) {
            const statusElement = document.getElementById('status');
            if (connected) {
                statusElement.className = 'status connected';
                statusElement.textContent = '✅ 브라우저 연결됨 (오류: ' + errorCount + '개)';
            } else {
                statusElement.className = 'status disconnected';
                statusElement.textContent = '❌ 브라우저 연결 대기 중...';
            }
        }

        function addError(error) {
            errorCount++;
            const errorList = document.getElementById('error-list');
            
            const errorItem = document.createElement('div');
            errorItem.className = 'error-item ' + (error.type === 'hydration-error' ? 'hydration' : '') + (error.type === 'network-request' ? ' network-request' : '') + (error.type === 'network-error' ? ' network-error' : '');
            
            const time = new Date(error.timestamp).toLocaleTimeString();
            const message = error.message || error.text || '알 수 없는 오류';
            
            let details = ''
            if (error.type === 'network-request') {
                details = '<div style="font-size: 11px; color: #4CAF50;">URL: ' + (error.url || 'N/A') + '</div>' +
                         '<div style="font-size: 11px; color: #4CAF50;">Status: ' + (error.status || 'N/A') + ' (' + (error.duration || 0) + 'ms)</div>'
            } else if (error.type === 'network-error') {
                details = '<div style="font-size: 11px; color: #ff9800;">URL: ' + (error.url || 'N/A') + '</div>' +
                         '<div style="font-size: 11px; color: #ff9800;">Error: ' + (error.error || 'N/A') + '</div>'
            }
            
            errorItem.innerHTML = 
                '<div class="error-time">' + time + '</div>' +
                '<div class="error-message">' + message + '</div>' +
                '<div style="font-size: 12px; color: #ccc;">타입: ' + error.type + '</div>' +
                details;
            
            errorList.insertBefore(errorItem, errorList.firstChild);
            updateStatus(true);
        }

        function connectWebSocket() {
            ws = new WebSocket('ws://localhost:3901');
            
            ws.onopen = () => {
                console.log('✅ 모니터링 대시보드 연결됨');
                updateStatus(false);
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type && data.data) {
                        addError(data.data);
                    }
                } catch (error) {
                    console.error('❌ 메시지 파싱 오류:', error);
                }
            };

            ws.onclose = () => {
                console.log('❌ 모니터링 대시보드 연결 해제됨');
                updateStatus(false);
                setTimeout(connectWebSocket, 3000);
            };

            ws.onerror = (error) => {
                console.error('❌ WebSocket 오류:', error);
            };
        }

        // 페이지 로드 시 WebSocket 연결
        connectWebSocket();
    </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  setupWebSocket() {
    this.wss.on('connection', (ws) => {
      console.log('✅ 브라우저 연결됨! 실시간 오류 수집 시작');
      this.connectedClients.add(ws);
      
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
        this.connectedClients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket 오류:', error.message);
        this.connectedClients.delete(ws);
      });
    });
  }

  handleBrowserMessage(message) {
    console.log(`🔍 오류 수신: ${message.type} - ${message.message}`);
    
    // 오류 로그에 추가
    this.errorLog.push({
      ...message,
      receivedAt: new Date().toISOString()
    });
    
    // 자동 수정 시도
    this.autoFixError(message);
    
    // 모든 클라이언트에게 브로드캐스트
    this.broadcastToClients(message.type, message);
    
    // 로그 파일 저장
    this.saveErrorLog();
  }

  autoFixError(error) {
    console.log('🔧 자동 수정 시도:', error.type);
    
    // Hydration 오류 자동 수정
    if (error.type === 'hydration-error') {
      console.log('🔄 Hydration 오류 자동 수정: 페이지 새로고침 명령 전송');
      
      // 모든 연결된 클라이언트에게 수정 명령 전송
      this.connectedClients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'fix-command',
            command: 'fix-hydration'
          }));
        }
      });
    }
  }

  broadcastToClients(type, data) {
    const message = JSON.stringify({ type, data });
    this.connectedClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  saveErrorLog() {
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    
    const logFile = path.join(logsDir, 'user-browser-errors.json');
    fs.writeFileSync(logFile, JSON.stringify(this.errorLog, null, 2));
  }

  start(port = 3901) {
    this.app.listen(port, () => {
      console.log(`🚀 사용자 브라우저 모니터링 서버 시작: http://localhost:${port}`);
      console.log('📋 사용법:');
      console.log('1. http://localhost:3900 페이지에서 F12 누르기');
      console.log('2. Console 탭에서 위 코드 붙여넣기');
      console.log('3. 실시간 오류 수집 시작!');
    });
  }
}

// 서버 시작
const monitor = new UserBrowserMonitor();
monitor.start();

// 프로세스 종료 시 정리
process.on('SIGINT', () => {
  console.log('🛑 모니터링 중지...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 모니터링 중지...');
  process.exit(0);
});
