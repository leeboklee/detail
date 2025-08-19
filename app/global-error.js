'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // 오류 로깅
    console.error('Global Error:', error);
    
    // 서버로 오류 전송
    const sendErrorToServer = async () => {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'global_error',
            message: error?.message || '알 수 없는 전역 오류',
            stack: error?.stack || '',
            timestamp: new Date().toISOString(),
            url: typeof window !== 'undefined' ? window.location.href : '',
            severity: 'critical',
            isServerError: true
          }),
        });
      } catch (sendError) {
        console.error('오류 로그 전송 실패:', sendError);
      }
    };

    sendErrorToServer();
  }, [error]);

  const handleReset = () => {
    try {
      reset();
    } catch (resetError) {
      console.error('오류 복구 실패:', resetError);
      // 복구 실패 시 페이지 새로고침
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                심각한 오류가 발생했습니다
              </h2>
              <p className="text-gray-600 mb-6">
                {error?.message || '알 수 없는 오류가 발생했습니다.'}
              </p>
              
              {/* 오류 상세 정보 (개발 모드에서만) */}
              {process.env.NODE_ENV === 'development' && error?.stack && (
                <div className="mb-6 p-4 bg-gray-800 text-white rounded-lg overflow-auto max-h-40 font-mono text-xs">
                  <div className="text-red-300 mb-2">Error Stack:</div>
                  <pre>{error.stack}</pre>
                </div>
              )}
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleReset}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  다시 시도
                </button>
                
                <button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  페이지 새로고침
                </button>
              </div>
              
              {/* 추가 도움말 */}
              <div className="mt-6 text-sm text-gray-500">
                <p>문제가 지속되면 다음을 시도해보세요:</p>
                <ul className="mt-2 text-left list-disc list-inside space-y-1">
                  <li>브라우저 캐시 및 쿠키 삭제</li>
                  <li>다른 브라우저로 접속</li>
                  <li>잠시 후 다시 시도</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
} 