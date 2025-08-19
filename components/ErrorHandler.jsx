/**
 * 오류 처리 유틸리티
 * 서버 오류를 감지하고 미리보기 컴포넌트에 전달
 */

'use client';

import { useEffect } from 'react';

// 서버 오류 이벤트 발생 함수
export const triggerServerError = (message, severity = 'medium') => {
  const errorEvent = new CustomEvent('server-error', {
    detail: {
      type: 'server_error',
      message,
      severity,
      timestamp: new Date().toISOString()
    }
  });
  window.dispatchEvent(errorEvent);
};

// 전역 오류 핸들러
export const setupGlobalErrorHandler = () => {
  // 네트워크 오류 감지
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      if (!response.ok) {
        triggerServerError(`HTTP ${response.status}: ${response.statusText}`, 'high');
      }
      return response;
    } catch (error) {
      triggerServerError(`네트워크 오류: ${error.message}`, 'high');
      throw error;
    }
  };

  // 콘솔 오류 감지
  const originalConsoleError = console.error;
  console.error = (...args) => {
    const errorMessage = args.join(' ');
    if (errorMessage.includes('server') || errorMessage.includes('API') || errorMessage.includes('500')) {
      triggerServerError(`콘솔 오류: ${errorMessage}`, 'medium');
    }
    originalConsoleError.apply(console, args);
  };

  // 전역 오류 이벤트 감지
  window.addEventListener('error', (event) => {
    if (event.error && event.error.message) {
      triggerServerError(`JavaScript 오류: ${event.error.message}`, 'high');
    }
  });

  // Promise 오류 감지
  window.addEventListener('unhandledrejection', (event) => {
    triggerServerError(`Promise 오류: ${event.reason}`, 'high');
  });
};

// 오류 처리 컴포넌트
export const ErrorHandler = ({ children }) => {
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  return children;
};

export default ErrorHandler; 