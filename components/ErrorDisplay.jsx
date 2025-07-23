'use client';

import React, { useState, useEffect } from 'react';

/**
 * 실시간으로 오류를 화면에 표시하는 컴포넌트
 * 브라우저에서 발생하는 모든 오류를 캡처하고 표시합니다.
 */
const ErrorDisplay = () => {
  const [errors, setErrors] = useState([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // window._errors가 없으면 초기화
    if (typeof window !== 'undefined') {
      window._errors = window._errors || [];

      // 1초마다 오류 목록 업데이트
      const intervalId = setInterval(() => {
        if (window._errors?.length > 0) {
          setErrors([...window._errors]);
        }
      }, 1000);

      // 전역 오류 핸들러 추가
      const errorHandler = (event) => {
        if (window._errors) {
          window._errors.unshift({
            message: event.message || '알 수 없는 오류',
            stack: event.error?.stack || '',
            source: event.filename,
            line: event.lineno,
            column: event.colno,
            time: new Date().toISOString(),
            type: 'unhandled-error'
          });
        }
      };

      // 미처리 Promise 오류 핸들러
      const unhandledRejectionHandler = (event) => {
        if (window._errors) {
          window._errors.unshift({
            message: `미처리 Promise 오류: ${event.reason?.message || event.reason || '알 수 없는 오류'}`,
            stack: event.reason?.stack || '',
            time: new Date().toISOString(),
            type: 'unhandled-promise'
          });
        }
      };

      window.addEventListener('error', errorHandler);
      window.addEventListener('unhandledrejection', unhandledRejectionHandler);

      return () => {
        clearInterval(intervalId);
        window.removeEventListener('error', errorHandler);
        window.removeEventListener('unhandledrejection', unhandledRejectionHandler);
      };
    }
  }, []);

  // 오류가 없으면 null 반환
  if (!errors.length && !isOpen) return null;

  return (
    <div 
      className="fixed bottom-0 right-0 bg-white shadow-lg border border-red-200 rounded-tl-lg max-w-lg z-50"
      style={{ 
        maxHeight: isOpen ? '300px' : '30px', 
        width: isOpen ? '500px' : '200px',
        transition: 'all 0.3s ease'
      }}
    >
      {/* 헤더 */}
      <div 
        className="bg-red-100 p-2 font-medium text-red-800 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>디버그 콘솔 {errors.length > 0 ? `(${errors.length})` : ''}</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (window._errors) window._errors = [];
              setErrors([]);
            }}
            className="text-xs bg-red-50 hover:bg-red-200 px-2 py-1 rounded"
          >
            비우기
          </button>
          <span className="text-xs">
            {isOpen ? '▼' : '▲'}
          </span>
        </div>
      </div>
      
      {/* 오류 목록 */}
      {isOpen && (
        <div className="overflow-auto p-2" style={{ maxHeight: '250px' }}>
          {errors.length === 0 ? (
            <div className="text-gray-500 text-sm py-3 text-center">
              기록된 오류가 없습니다.
            </div>
          ) : (
            <ul className="text-xs space-y-2">
              {errors.map((error, index) => (
                <li 
                  key={index} 
                  className={`p-2 rounded ${
                    error.type === 'error' || error.type === 'unhandled-error' || error.type === 'unhandled-promise' || error.type === 'fatal-error'
                      ? 'bg-red-50 border-l-2 border-red-500'
                      : error.type === 'success'
                      ? 'bg-green-50 border-l-2 border-green-500'
                      : error.type === 'warn'
                      ? 'bg-yellow-50 border-l-2 border-yellow-500'
                      : 'bg-blue-50 border-l-2 border-blue-500'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {error.type === 'error' || error.type === 'unhandled-error' || error.type === 'unhandled-promise' || error.type === 'fatal-error'
                        ? '⛔ 오류'
                        : error.type === 'success'
                        ? '✅ 성공'
                        : error.type === 'warn'
                        ? '⚠️ 경고'
                        : 'ℹ️ 정보'}
                    </span>
                    <span className="text-gray-500">
                      {new Date(error.timestamp || error.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1">{error.message}</div>
                  {error.stack && (
                    <div className="mt-1 text-gray-600 whitespace-pre-wrap overflow-auto max-h-20 bg-gray-50 p-1 rounded">
                      {error.stack.split('\n').slice(0, 3).join('\n')}
                    </div>
                  )}
                  {error.context && (
                    <div className="mt-1 text-gray-600">
                      <details>
                        <summary className="cursor-pointer text-blue-500">컨텍스트 정보</summary>
                        <pre className="mt-1 bg-gray-50 p-1 rounded overflow-auto max-h-20">
                          {JSON.stringify(error.context, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay; 