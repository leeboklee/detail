/**
 * 오류 처리 유틸리티
 * 서버 오류를 감지하고 미리보기 컴포넌트에 전달
 */

'use client';

import { useEffect } from 'react';

// 오류를 JSON 파일로 저장하는 함수
export const saveErrorToFile = async (errorData) => {
  try {
    const errorLog = {
      ...errorData,
      savedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // API를 통해 오류를 파일로 저장
    const response = await fetch('/api/errors/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorLog)
    });

    if (response.ok) {
      console.log('오류가 파일에 저장되었습니다.');
      return true;
    }
  } catch (error) {
    console.error('오류 저장 실패:', error);
  }
  return false;
};

// 오류 복사 함수
export const copyErrorToClipboard = async (errorData) => {
  try {
    const errorText = `
오류 발생 시간: ${errorData.timestamp}
오류 유형: ${errorData.type}
오류 메시지: ${errorData.message}
${errorData.stack ? `스택 트레이스:\n${errorData.stack}` : ''}
URL: ${window.location.href}
사용자 에이전트: ${navigator.userAgent}
    `.trim();

    await navigator.clipboard.writeText(errorText);
    return true;
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    return false;
  }
};

// 서버 오류 이벤트 발생 함수
export const triggerServerError = async (message, severity = 'medium', stack = null) => {
  const errorData = {
    type: 'server_error',
    message,
    severity,
    timestamp: new Date().toISOString(),
    stack
  };

  // 오류를 파일에 자동 저장
  await saveErrorToFile(errorData);

  const errorEvent = new CustomEvent('server-error', {
    detail: errorData
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
        await triggerServerError(`HTTP ${response.status}: ${response.statusText}`, 'high');
      }
      return response;
    } catch (error) {
      await triggerServerError(`네트워크 오류: ${error.message}`, 'high', error.stack);
      throw error;
    }
  };

  // 콘솔 오류 감지
  const originalConsoleError = console.error;
  console.error = async (...args) => {
    const errorMessage = args.join(' ');
    if (errorMessage.includes('server') || errorMessage.includes('API') || errorMessage.includes('500')) {
      await triggerServerError(`콘솔 오류: ${errorMessage}`, 'medium');
    }
    originalConsoleError.apply(console, args);
  };

  // 전역 오류 이벤트 감지
  window.addEventListener('error', async (event) => {
    if (event.error && event.error.message) {
      await triggerServerError(`JavaScript 오류: ${event.error.message}`, 'high', event.error.stack);
    }
  });

  // Promise 오류 감지
  window.addEventListener('unhandledrejection', async (event) => {
    await triggerServerError(`Promise 오류: ${event.reason}`, 'high');
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