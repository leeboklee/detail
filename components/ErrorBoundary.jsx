'use client';

import React, { Component } from 'react';

/**
 * 에러 발생 시 애플리케이션 전체가 중단되지 않도록 하는 ErrorBoundary 컴포넌트
 * React의 Error Boundary 패턴 구현
 */

// 전역 에러 저장소
class ErrorStore {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.uncaughtErrors = [];
    this.unhandledRejections = [];
    this.maxErrors = 50; // 최대 저장 개수
  }

  addError(type, message, stack = '') {
    const timestamp = new Date().toISOString();
    const errorData = { timestamp, message, stack };
    
    this[type].unshift(errorData);
    if (this[type].length > this.maxErrors) {
      this[type] = this[type].slice(0, this.maxErrors);
    }
    
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      const data = {
        errors: this.errors,
        warnings: this.warnings,
        uncaughtErrors: this.uncaughtErrors,
        unhandledRejections: this.unhandledRejections,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('app_errors', JSON.stringify(data));
    } catch (e) {
      console.warn('로컬 스토리지 저장 실패:', e);
    }
  }

  loadFromStorage() {
    try {
      const stored = localStorage.getItem('app_errors');
      if (stored) {
        const data = JSON.parse(stored);
        this.errors = data.errors || [];
        this.warnings = data.warnings || [];
        this.uncaughtErrors = data.uncaughtErrors || [];
        this.unhandledRejections = data.unhandledRejections || [];
      }
    } catch (e) {
      console.warn('로컬 스토리지 로드 실패:', e);
    }
  }

  clear() {
    this.errors = [];
    this.warnings = [];
    this.uncaughtErrors = [];
    this.unhandledRejections = [];
    localStorage.removeItem('app_errors');
  }

  getTotalCount() {
    return this.errors.length + this.warnings.length + 
           this.uncaughtErrors.length + this.unhandledRejections.length;
  }
}

// 전역 에러 저장소 인스턴스
const errorStore = new ErrorStore();

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      totalErrors: 0
    };

    // 로컬 스토리지에서 기존 에러 로드
    errorStore.loadFromStorage();
    this.setupGlobalErrorHandlers();
  }

  setupGlobalErrorHandlers() {
    if (typeof window === 'undefined' || this.handlersSetup) return;
    
    // 전역 에러 핸들러
    window.addEventListener('error', (event) => {
      const errorMessage = `${event.message} (${event.filename}:${event.lineno}:${event.colno})`;
      errorStore.addError('uncaughtErrors', errorMessage, event.error?.stack);
      this.updateErrorCount();
    });

    // 처리되지 않은 Promise 거부
    window.addEventListener('unhandledrejection', (event) => {
      const message = event.reason?.message || String(event.reason) || '처리되지 않은 Promise 거부';
      errorStore.addError('unhandledRejections', message, event.reason?.stack);
      this.updateErrorCount();
    });

    // 콘솔 메서드 오버라이드 (개발 모드에서만)
    if (process.env.NODE_ENV === 'development') {
      this.overrideConsole();
    }

    this.handlersSetup = true;
  }

  overrideConsole() {
    const originalError = console.error;
    const originalWarn = console.warn;

    console.error = (...args) => {
      originalError.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (!message.includes('[ErrorBoundary]')) {
        errorStore.addError('errors', message);
        this.updateErrorCount();
      }
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (!message.includes('[ErrorBoundary]')) {
        errorStore.addError('warnings', message);
        this.updateErrorCount();
      }
    };
  }

  updateErrorCount = () => {
    this.setState({ totalErrors: errorStore.getTotalCount() });
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] 컴포넌트 오류:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    const errorMessage = `${error?.name}: ${error?.message}`;
    
    errorStore.addError('uncaughtErrors', errorMessage, error?.stack);
    this.updateErrorCount();
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleClearErrors = () => {
    errorStore.clear();
    this.setState({ totalErrors: 0 });
  };

  copyErrorInfo = () => {
    const { error, errorInfo } = this.state;
    
    const errorText = `
===== 에러 정보 =====
${error?.toString() || '컴포넌트 오류 없음'}

===== 컴포넌트 스택 =====
${errorInfo?.componentStack || '스택 정보 없음'}

===== 전체 오류 개수 =====
콘솔 오류: ${errorStore.errors.length}개
콘솔 경고: ${errorStore.warnings.length}개
처리되지 않은 오류: ${errorStore.uncaughtErrors.length}개
Promise 거부: ${errorStore.unhandledRejections.length}개

생성 시간: ${new Date().toISOString()}
`.trim();

    if (navigator.clipboard) {
      navigator.clipboard.writeText(errorText)
        .then(() => alert('오류 정보가 클립보드에 복사되었습니다.'))
        .catch(() => this.fallbackCopy(errorText));
    } else {
      this.fallbackCopy(errorText);
    }
  };

  fallbackCopy = (text) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('오류 정보가 클립보드에 복사되었습니다.');
  };

  render() {
    const { hasError, error, errorInfo, totalErrors } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      // 사용자 정의 fallback UI가 있으면 사용
      if (fallback) {
        return fallback(error, errorInfo, this.handleReset);
      }

      // 기본 에러 UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #e53e3e',
          borderRadius: '8px',
          backgroundColor: '#fed7d7',
          color: '#2d3748'
        }}>
          <h2 style={{ color: '#e53e3e', marginBottom: '10px' }}>
            ⚠️ 오류가 발생했습니다
          </h2>
          <p style={{ marginBottom: '15px' }}>
            애플리케이션에서 예기치 않은 오류가 발생했습니다. 
            개발자에게 문의하거나 페이지를 새로고침해 주세요.
          </p>
          
          <div style={{ marginBottom: '15px' }}>
            <strong>오류 메시지:</strong>
            <div style={{
              backgroundColor: '#f7fafc',
              padding: '10px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              marginTop: '5px'
            }}>
              {error?.message || '알 수 없는 오류'}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 다시 시도
            </button>
            
            <button
              onClick={this.copyErrorInfo}
              style={{
                backgroundColor: '#38a169',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              📋 오류 정보 복사
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#dd6b20',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              🔄 페이지 새로고침
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && errorInfo && (
            <details style={{ marginTop: '15px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                🔍 개발자 정보 (컴포넌트 스택)
              </summary>
              <pre style={{
                backgroundColor: '#f7fafc',
                padding: '10px',
                borderRadius: '4px',
                fontSize: '12px',
                overflow: 'auto',
                marginTop: '5px'
              }}>
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // 에러가 없을 때는 에러 개수만 표시 (개발 모드에서만)
    if (process.env.NODE_ENV === 'development' && totalErrors > 0) {
      return (
        <>
          {children}
          <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            backgroundColor: '#fed7d7',
            color: '#e53e3e',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            border: '1px solid #e53e3e',
            zIndex: 1000,
            cursor: 'pointer'
          }} onClick={this.handleClearErrors}>
            ⚠️ 에러 {totalErrors}개 (클릭하여 초기화)
          </div>
        </>
      );
    }

    return children;
  }
}

export default ErrorBoundary; 