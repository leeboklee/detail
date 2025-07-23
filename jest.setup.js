import '@testing-library/jest-dom';

// Jest DOM 확장 라이브러리 추가 (필요시)
// require('@testing-library/jest-dom');

// 테스트에서 사용할 전역 모의(mock) 객체들
global.showNotification = jest.fn(); // showNotification 함수 모의

// 브라우저 API 모의
global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// 브라우저 이벤트 모의 (필요시)
global.MutationObserver = class {
  constructor(callback) {}
  disconnect() {}
  observe(element, initObject) {}
};

// 전역 테스트 설정
global.fetch = global.fetch || jest.fn();

// 환경 변수 모킹
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

// 콘솔 에러/경고 필터링 (테스트 중 불필요한 로그 제거)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args[0];
  
  // React 18 hydration 경고 등 무시
  if (
    typeof message === 'string' &&
    (message.includes('Warning: ReactDOM.render is no longer supported') ||
     message.includes('Warning: Text content did not match') ||
     message.includes('hydration'))
  ) {
    return;
  }
  
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args[0];
  
  // 개발 모드 관련 경고 무시
  if (
    typeof message === 'string' &&
    (message.includes('Warning: Component') ||
     message.includes('DevTools'))
  ) {
    return;
  }
  
  originalConsoleWarn.apply(console, args);
};

// 테스트 후 정리
afterEach(() => {
  jest.clearAllMocks();
});

// 전역 테스트 유틸리티
global.testUtils = {
  waitFor: (condition, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      };
      
      check();
    });
  }
};

// FormDataCollector 모의 객체 생성
global.FormDataCollector = {
    collect: jest.fn().mockReturnValue({
        hotelName: '테스트 호텔',
        location: '테스트 위치'
    })
}; 