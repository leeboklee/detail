const WebSocket = require('ws');

class BrowserController {
  constructor(apiUrl = 'http://localhost:3901') {
    this.apiUrl = apiUrl;
    this.ws = null;
  }

  async startBrowser() {
    const response = await fetch(`${this.apiUrl}/api/browser/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async stopBrowser() {
    const response = await fetch(`${this.apiUrl}/api/browser/stop`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async navigateTo(url) {
    const response = await fetch(`${this.apiUrl}/api/browser/navigate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return response.json();
  }

  async injectCode(code) {
    const response = await fetch(`${this.apiUrl}/api/browser/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    return response.json();
  }

  async startMonitoring() {
    const response = await fetch(`${this.apiUrl}/api/monitor/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.json();
  }

  async getErrors() {
    const response = await fetch(`${this.apiUrl}/api/errors`);
    return response.json();
  }

  async getStatus() {
    const response = await fetch(`${this.apiUrl}/api/browser/status`);
    return response.json();
  }

  async getScreenshot() {
    const response = await fetch(`${this.apiUrl}/api/browser/screenshot`);
    return response.json();
  }

  async getConsoleLogs() {
    const response = await fetch(`${this.apiUrl}/api/browser/console`);
    return response.json();
  }

  connectWebSocket() {
    this.ws = new WebSocket('ws://localhost:3901');
    
    this.ws.on('open', () => {
      console.log('✅ WebSocket 연결됨 - 실시간 오류 수신 시작');
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleWebSocketMessage(message);
      } catch (error) {
        console.error('❌ WebSocket 메시지 파싱 오류:', error);
      }
    });

    this.ws.on('close', () => {
      console.log('❌ WebSocket 연결 해제됨');
    });

    this.ws.on('error', (error) => {
      console.error('❌ WebSocket 오류:', error);
    });
  }

  handleWebSocketMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case 'console-log':
        console.log(`📝 콘솔 로그 [${data.type}]: ${data.text}`);
        break;
      case 'page-error':
        console.log(`❌ 페이지 오류: ${data.message}`);
        break;
      case 'request-failed':
        console.log(`🌐 요청 실패: ${data.url} - ${data.failure}`);
        break;
      default:
        console.log(`📨 ${type}:`, data);
    }
  }

  async setupCompleteMonitoring() {
    console.log('🚀 완전한 브라우저 모니터링 설정 시작...');
    
    try {
      // 1. 브라우저 시작
      console.log('1️⃣ 브라우저 시작 중...');
      await this.startBrowser();
      
      // 2. 페이지 이동
      console.log('2️⃣ 페이지 이동 중...');
      await this.navigateTo('http://localhost:3900');
      
      // 3. 실시간 모니터링 시작
      console.log('3️⃣ 실시간 모니터링 시작 중...');
      await this.startMonitoring();
      
      // 4. WebSocket 연결
      console.log('4️⃣ WebSocket 연결 중...');
      this.connectWebSocket();
      
      console.log('✅ 완전한 브라우저 모니터링 설정 완료!');
      console.log('🎯 이제 브라우저에서 발생하는 모든 오류를 실시간으로 수집합니다.');
      
    } catch (error) {
      console.error('❌ 모니터링 설정 실패:', error);
    }
  }

  async quickStart() {
    console.log('⚡ 빠른 시작 - 브라우저 모니터링');
    
    try {
      // 브라우저 시작 및 모니터링 설정
      await this.setupCompleteMonitoring();
      
      // 주기적 상태 확인
      setInterval(async () => {
        const status = await this.getStatus();
        if (status.isRunning) {
          console.log(`🟢 브라우저 실행 중: ${status.currentUrl}`);
        } else {
          console.log('🔴 브라우저가 실행되지 않음');
        }
      }, 30000); // 30초마다 확인
      
    } catch (error) {
      console.error('❌ 빠른 시작 실패:', error);
    }
  }
}

// 사용 예시
async function main() {
  const controller = new BrowserController();
  
  // 빠른 시작
  await controller.quickStart();
  
  // 또는 단계별 실행
  // await controller.setupCompleteMonitoring();
}

// 스크립트가 직접 실행될 때만 실행
if (require.main === module) {
  main().catch(console.error);
}

module.exports = BrowserController;
