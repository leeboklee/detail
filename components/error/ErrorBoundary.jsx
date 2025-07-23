// ErrorBoundary.jsx - 오류 경계 컴포넌트

import React, { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 대체 UI가 보이도록 상태를 업데이트합니다.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // 오류 정보를 로깅하고 오류 추적 시스템에 보고합니다.
    console.error('ErrorBoundary 오류:', error, errorInfo);
    
    // 오류 정보를 상태에 저장
    this.setState({ errorInfo });
    
    // 로컬 스토리지에 오류 저장
    try {
      const errorLog = {
        time: new Date().toISOString(),
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        url: window.location.href
      };
      
      // 기존 오류 로그 가져오기
      const storedErrors = JSON.parse(localStorage.getItem('app_errors') || '[]');
      
      // 최신 오류 추가 (최대 20개 유지)
      storedErrors.unshift(errorLog);
      if (storedErrors.length > 20) {
        storedErrors.length = 20;
      }
      
      localStorage.setItem('app_errors', JSON.stringify(storedErrors));
    } catch (storageError) {
      console.error('로컬 스토리지에 오류 저장 실패:', storageError);
    }
  }

  handleResetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-red-700 mb-2">오류가 발생했습니다</h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
          
          {/* 개발자에게만 보이는 상세 정보 */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-800 text-white rounded overflow-auto max-h-64 font-mono text-xs">
              <div className="text-red-300 mb-2">Error Stack:</div>
              <pre>{this.state.error?.stack || 'No stack trace available'}</pre>
              
              {this.state.errorInfo?.componentStack && (
                <>
                  <div className="text-yellow-300 mt-4 mb-2">Component Stack:</div>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </>
              )}
            </div>
          )}
          
          <div className="mt-4 flex gap-2">
            <button
              onClick={this.handleResetError}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              다시 시도
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 