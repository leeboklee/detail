/**
 * MCP 디버깅 도우미 함수들
 */

// 콘솔 로그를 파일로 저장하는 함수
function saveLogs(logs, filename) {
  if (typeof window !== 'undefined') {
    try {
      // 로그 데이터를 JSON 문자열로 변환
      const logData = JSON.stringify(logs, null, 2);
      
      // 다운로드용 링크 생성
      const blob = new Blob([logData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // 다운로드 링크 생성 및 클릭
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `debug-log-${new Date().toISOString().replace(/[:\.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      
      // 링크 제거
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      return true;
    } catch (err) {
      console.error('로그 저장 중 오류:', err);
      return false;
    }
  }
  return false;
}

// 콘솔 로그 가로채기 시작
function startLogging() {
  if (typeof window !== 'undefined') {
    window.DEBUG_LOGS = {
      console: [],
      errors: [],
      network: [],
      timestamp: new Date().toISOString()
    };
    
    // 원래 콘솔 메서드 저장
    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };
    
    // 콘솔 로그 가로채기
    console.log = function() {
      window.DEBUG_LOGS.console.push({
        type: 'log',
        timestamp: new Date().toISOString(),
        args: Array.from(arguments).map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
      });
      originalConsole.log.apply(console, arguments);
    };
    
    console.error = function() {
      const entry = {
        type: 'error',
        timestamp: new Date().toISOString(),
        args: Array.from(arguments).map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
      };
      window.DEBUG_LOGS.console.push(entry);
      window.DEBUG_LOGS.errors.push(entry);
      originalConsole.error.apply(console, arguments);
    };
    
    console.warn = function() {
      window.DEBUG_LOGS.console.push({
        type: 'warn',
        timestamp: new Date().toISOString(),
        args: Array.from(arguments).map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
      });
      originalConsole.warn.apply(console, arguments);
    };
    
    console.info = function() {
      window.DEBUG_LOGS.console.push({
        type: 'info',
        timestamp: new Date().toISOString(),
        args: Array.from(arguments).map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )
      });
      originalConsole.info.apply(console, arguments);
    };
    
    // 네트워크 요청 모니터링
    if (window.fetch) {
      const originalFetch = window.fetch;
      window.fetch = function() {
        const startTime = new Date();
        const request = {
          url: arguments[0],
          options: arguments[1],
          startTime: startTime.toISOString()
        };
        
        window.DEBUG_LOGS.network.push(request);
        
        return originalFetch.apply(window, arguments)
          .then(response => {
            request.endTime = new Date().toISOString();
            request.status = response.status;
            request.statusText = response.statusText;
            request.duration = new Date() - startTime;
            
            // 응답 복제 (응답 본문은 스트림이라 소비되면 사라지므로)
            const clonedResponse = response.clone();
            
            // JSON 응답이면 내용 저장
            if (response.headers.get('content-type')?.includes('application/json')) {
              clonedResponse.json().then(data => {
                request.responseData = data;
              }).catch(() => {});
            }
            
            return response;
          })
          .catch(error => {
            request.endTime = new Date().toISOString();
            request.error = error.toString();
            request.duration = new Date() - startTime;
            throw error;
          });
      };
    }
    
    // 오류 이벤트 캡처
    window.addEventListener('error', function(event) {
      const errorEntry = {
        type: 'uncaught',
        timestamp: new Date().toISOString(),
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        error: event.error ? event.error.stack : null
      };
      
      window.DEBUG_LOGS.errors.push(errorEntry);
    });
    
    // 프로미스 오류 캡처
    window.addEventListener('unhandledrejection', function(event) {
      const errorEntry = {
        type: 'unhandledrejection',
        timestamp: new Date().toISOString(),
        reason: event.reason ? (
          typeof event.reason === 'object' 
            ? JSON.stringify(event.reason) 
            : String(event.reason)
        ) : 'Unknown reason'
      };
      
      window.DEBUG_LOGS.errors.push(errorEntry);
    });
    
    console.log('🔍 디버깅 로깅이 시작되었습니다.');
    return true;
  }
  return false;
}

// 로깅 중지 및 로그 저장
function stopLogging(filename) {
  if (typeof window !== 'undefined' && window.DEBUG_LOGS) {
    window.DEBUG_LOGS.endTimestamp = new Date().toISOString();
    
    console.log('🔍 디버깅 로깅이 종료되었습니다.');
    console.log(`📊 수집된 로그: ${window.DEBUG_LOGS.console.length}개의 콘솔 로그, ${window.DEBUG_LOGS.errors.length}개의 오류`);
    
    // 로그 저장
    return saveLogs(window.DEBUG_LOGS, filename);
  }
  return false;
}

// 중복 미리보기 관리자 제거 - Preview 컴포넌트로 통합

// 이벤트 이미터 생성
function createEventEmitter() {
  if (typeof window !== 'undefined') {
    window.eventEmitter = {
      events: {},
      
      on: function(event, callback) {
        if (!this.events[event]) {
          this.events[event] = [];
        }
        this.events[event].push(callback);
        return this;
      },
      
      off: function(event, callback) {
        if (!this.events[event]) return this;
        
        if (callback) {
          this.events[event] = this.events[event].filter(cb => cb !== callback);
        } else {
          delete this.events[event];
        }
        
        return this;
      },
      
      emit: function(event, data) {
        if (!this.events[event]) return this;
        
        this.events[event].forEach(callback => {
          try {
            callback(data);
          } catch (err) {
            console.error(`이벤트 핸들러 실행 중 오류 (${event}):`, err);
          }
        });
        
        return this;
      }
    };
    
    console.log('🔧 이벤트 이미터가 생성되었습니다. window.eventEmitter로 접근할 수 있습니다.');
  }
}

// 글로벌 객체에 노출
if (typeof window !== 'undefined') {
  window.debugHelpers = {
    startLogging,
    stopLogging,
    saveLogs,
    getLogs: function() {
      return window.DEBUG_LOGS;
    },
    createPreviewManager,
    createEventEmitter,
    initAll: function() {
      startLogging();
      createPreviewManager();
      createEventEmitter();
      
      // 미리보기 컨테이너 생성 (필요한 경우)
      if (!document.getElementById('previewContainer')) {
        const container = document.createElement('div');
        container.id = 'previewContainer';
        container.className = 'preview-container';
        container.style.width = '100%';
        container.style.minHeight = '300px';
        container.style.border = '1px solid #ddd';
        container.style.borderRadius = '4px';
        container.style.padding = '16px';
        container.style.marginTop = '20px';
        container.style.backgroundColor = '#fff';
        
        // 적절한 위치에 추가
        const mainContent = document.querySelector('main') || document.body;
        mainContent.appendChild(container);
        
        console.log('미리보기 컨테이너가 생성되었습니다.');
      }
      
      return true;
    }
  };
  
  // 자동 초기화
  setTimeout(() => {
    console.log('🔧 디버깅 도우미 함수가 로드되었습니다. window.debugHelpers로 접근할 수 있습니다.');
    window.debugHelpers.initAll();
  }, 500);
} 