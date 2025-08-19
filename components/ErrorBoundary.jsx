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
    this.serverErrors = [];
    this.clientErrors = [];
    this.maxErrors = 50; // 최대 저장 개수
  }

  addError(type, message, stack = '', isServerError = false) {
    const timestamp = new Date().toISOString();
    const errorData = { 
      timestamp, 
      message, 
      stack, 
      isServerError,
      severity: this.determineSeverity(message)
    };
    
    this[type].unshift(errorData);
    if (this[type].length > this.maxErrors) {
      this[type] = this[type].slice(0, this.maxErrors);
    }
    
    // 서버/클라이언트 오류 분류
    if (isServerError) {
      this.serverErrors.unshift(errorData);
      if (this.serverErrors.length > this.maxErrors) {
        this.serverErrors = this.serverErrors.slice(0, this.maxErrors);
      }
    } else {
      this.clientErrors.unshift(errorData);
      if (this.clientErrors.length > this.maxErrors) {
        this.clientErrors = this.clientErrors.slice(0, this.maxErrors);
      }
    }
    
    this.saveToStorage();
    this.sendToServer(errorData);
  }

  determineSeverity(message) {
    const criticalKeywords = ['fatal', 'critical', 'crash', 'memory leak', 'database connection'];
    const highKeywords = ['error', 'failed', 'exception', 'timeout'];
    const mediumKeywords = ['warning', 'deprecated', 'performance'];
    
    const lowerMessage = message.toLowerCase();
    
    if (criticalKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'critical';
    } else if (highKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'high';
    } else if (mediumKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return 'medium';
    }
    
    return 'low';
  }

  async sendToServer(errorData) {
    try {
      // 무한 루프 방지: 이미 전송된 오류는 다시 전송하지 않음
      const sentErrors = JSON.parse(localStorage.getItem('sent_errors') || '[]');
      const errorKey = `${errorData.message}-${errorData.timestamp}`;
      
      if (sentErrors.includes(errorKey)) {
        return; // 이미 전송된 오류는 건너뛰기
      }
      
      // 전송된 오류 목록에 추가
      sentErrors.push(errorKey);
      if (sentErrors.length > 100) {
        sentErrors.splice(0, 50); // 최대 100개까지만 유지
      }
      localStorage.setItem('sent_errors', JSON.stringify(sentErrors));

      // 안전한 데이터 준비 - JSON 파싱 오류 방지
      const safeErrorData = {
        type: errorData.isServerError ? 'server_error' : 'client_error',
        message: String(errorData.message || '').substring(0, 1000), // 길이 제한
        stack: String(errorData.stack || '').substring(0, 2000), // 길이 제한
        timestamp: errorData.timestamp || new Date().toISOString(),
        url: window.location.href,
        severity: errorData.severity || 'medium',
        isServerError: Boolean(errorData.isServerError)
      };

      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(safeErrorData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ 오류 서버 전송 성공:', result);

      // 클라이언트 오류 자동 복구 시도
      if (!errorData.isServerError) {
        await this.attemptClientErrorRecovery(errorData);
      }

    } catch (error) {
      console.error('❌ 오류 서버 전송 실패:', error);
      
      // 전송 실패 시에도 클라이언트 오류 복구 시도
      if (!errorData.isServerError) {
        await this.attemptClientErrorRecovery(errorData);
      }
    }
  }

  // 클라이언트 오류 자동 복구 시도
  async attemptClientErrorRecovery(errorData) {
    try {
      console.log('🔄 클라이언트 오류 자동 복구 시도:', errorData.message);
      
      // React Context 오류 복구 - 즉시 페이지 재로드
      if (errorData.message?.includes('Context') || errorData.message?.includes('render is not a function')) {
        console.log('🔄 React Context 오류 복구 시도...');
        // 즉시 페이지 재로드
        window.location.reload();
        return;
      }
      
      // 네트워크 오류 복구
      if (errorData.message?.includes('network') || errorData.message?.includes('fetch') || errorData.message?.includes('404')) {
        console.log('🔄 네트워크 오류 복구 시도...');
        // 즉시 페이지 재로드
        window.location.reload();
        return;
      }
      
      // AbortError 복구
      if (errorData.message?.includes('aborted')) {
        console.log('🔄 AbortError 복구 시도...');
        // 즉시 페이지 재로드
        window.location.reload();
        return;
      }
      
      console.log('🔄 클라이언트 오류 자동 복구 시도 완료');
      
    } catch (recoveryError) {
      console.error('❌ 클라이언트 오류 복구 실패:', recoveryError);
      // 복구 실패 시 강제 페이지 재로드
      window.location.reload();
    }
  }

  saveToStorage() {
    try {
      const data = {
        errors: this.errors,
        warnings: this.warnings,
        uncaughtErrors: this.uncaughtErrors,
        unhandledRejections: this.unhandledRejections,
        serverErrors: this.serverErrors,
        clientErrors: this.clientErrors,
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
        this.serverErrors = data.serverErrors || [];
        this.clientErrors = data.clientErrors || [];
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
    this.serverErrors = [];
    this.clientErrors = [];
    localStorage.removeItem('app_errors');
  }

  getTotalCount() {
    return this.errors.length + this.warnings.length + 
           this.uncaughtErrors.length + this.unhandledRejections.length +
           this.serverErrors.length + this.clientErrors.length;
  }

  getServerErrorCount() {
    return this.serverErrors.length;
  }

  getClientErrorCount() {
    return this.clientErrors.length;
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
      totalErrors: 0,
      serverErrorCount: 0,
      clientErrorCount: 0,
      isUpdating: false // 상태 업데이트 중 플래그
    };

    // 로컬 스토리지에서 기존 에러 로드
    errorStore.loadFromStorage();
    this.setupGlobalErrorHandlers();
  }

  setupGlobalErrorHandlers() {
    if (typeof window === 'undefined' || this.handlersSetup) return;
    
    // 개발 모드에서만 제한적으로 활성화
    if (process.env.NODE_ENV === 'development') {
      // 전역 에러 핸들러 - 제한적 활성화
      window.addEventListener('error', (event) => {
        const errorMessage = `${event.message} (${event.filename}:${event.lineno}:${event.colno})`;
        const isServerError = this.isServerError(event);
        errorStore.addError('uncaughtErrors', errorMessage, event.error?.stack, isServerError);
        
        // 상태 업데이트 완전 비활성화
        // setTimeout(() => this.updateErrorCount(), 0);
      });

      // 처리되지 않은 Promise 거부 - 제한적 활성화
      window.addEventListener('unhandledrejection', (event) => {
        const message = event.reason?.message || String(event.reason) || '처리되지 않은 Promise 거부';
        const isServerError = this.isServerError(event);
        errorStore.addError('unhandledRejections', message, event.reason?.stack, isServerError);
        
        // 상태 업데이트 완전 비활성화
        // setTimeout(() => this.updateErrorCount(), 0);
      });

      // 네트워크 오류 감지 - 제한적 활성화
      this.setupNetworkErrorHandlers();

      // 콘솔 메서드 오버라이드 - 제한적 활성화
      this.overrideConsole();
    }

    this.handlersSetup = true;
  }

  setupNetworkErrorHandlers() {
    // fetch 오류 감지
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        if (!response.ok) {
          const errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          errorStore.addError('uncaughtErrors', errorMessage, '', true);
          this.updateErrorCount();
        }
        return response;
      } catch (error) {
        const errorMessage = `네트워크 오류: ${error.message}`;
        errorStore.addError('uncaughtErrors', errorMessage, error.stack, true);
        this.updateErrorCount();
        throw error;
      }
    };
  }

  isServerError(event) {
    // 서버 오류 판별 로직
    const message = event.message || event.reason?.message || '';
    const url = event.filename || '';
    
    return message.includes('500') || 
           message.includes('server') || 
           message.includes('database') ||
           message.includes('prisma') ||
           url.includes('/api/') ||
           event.status >= 500;
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
        const isServerError = message.includes('server') || message.includes('database');
        errorStore.addError('errors', message, '', isServerError);
        
        // 상태 업데이트 완전 비활성화
        // setTimeout(() => this.updateErrorCount(), 0);
      }
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      if (!message.includes('[ErrorBoundary]')) {
        errorStore.addError('warnings', message);
        
        // 상태 업데이트 완전 비활성화
        // setTimeout(() => this.updateErrorCount(), 0);
      }
    };
  }

  updateErrorCount = () => {
    // render 중 상태 업데이트 방지
    if (this.state.isUpdating) return;
    
    this.setState({ 
      isUpdating: true,
      totalErrors: errorStore.getTotalCount(),
      serverErrorCount: errorStore.getServerErrorCount(),
      clientErrorCount: errorStore.getClientErrorCount()
    }, () => {
      // 상태 업데이트 완료 후 플래그 리셋
      setTimeout(() => {
        this.setState({ isUpdating: false });
      }, 100);
    });
  };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] 컴포넌트 오류:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    const errorMessage = `${error?.name}: ${error?.message}`;
    const isServerError = this.isServerError({ message: errorMessage });
    
    errorStore.addError('uncaughtErrors', errorMessage, error?.stack, isServerError);
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
    this.setState({ 
      totalErrors: 0,
      serverErrorCount: 0,
      clientErrorCount: 0
    });
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
경고: ${errorStore.warnings.length}개
미처리 오류: ${errorStore.uncaughtErrors.length}개
미처리 Promise: ${errorStore.unhandledRejections.length}개
서버 오류: ${errorStore.serverErrors.length}개
클라이언트 오류: ${errorStore.clientErrors.length}개
총 오류: ${errorStore.getTotalCount()}개
`;
    
    navigator.clipboard.writeText(errorText).then(() => {
      alert('에러 정보가 클립보드에 복사되었습니다.');
    }).catch(() => {
      alert('클립보드 복사에 실패했습니다.');
    });
  };

  render() {
    const { hasError, error, errorInfo, totalErrors, serverErrorCount, clientErrorCount } = this.state;
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

          {/* 오류 통계 */}
          <div style={{ marginBottom: '15px', fontSize: '14px' }}>
            <div>서버 오류: {serverErrorCount}개</div>
            <div>클라이언트 오류: {clientErrorCount}개</div>
            <div>총 오류: {totalErrors}개</div>
          </div>

          {/* 개발자에게만 보이는 상세 정보 */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#2d3748',
              color: '#e2e8f0',
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '200px',
              fontFamily: 'monospace',
              fontSize: '12px'
            }}>
              <div style={{ color: '#fc8181', marginBottom: '5px' }}>Error Stack:</div>
              <pre>{error?.stack || 'No stack trace available'}</pre>
              
              {errorInfo?.componentStack && (
                <>
                  <div style={{ color: '#f6e05e', marginTop: '10px', marginBottom: '5px' }}>Component Stack:</div>
                  <pre>{errorInfo.componentStack}</pre>
                </>
              )}
            </div>
          )}
          
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '8px 16px',
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2c5aa0'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3182ce'}
            >
              다시 시도
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#718096',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4a5568'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#718096'}
            >
              페이지 새로고침
            </button>

            {process.env.NODE_ENV === 'development' && (
              <>
                <button
                  onClick={this.copyErrorInfo}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#38a169',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#2f855a'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#38a169'}
                >
                  오류 정보 복사
                </button>
                
                <button
                  onClick={this.handleClearErrors}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#c53030'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#e53e3e'}
                >
                  오류 로그 초기화
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary; 