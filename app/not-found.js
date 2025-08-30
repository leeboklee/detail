'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    // 404 오류 로깅
    console.error('404 Not Found:', window.location.href);
    
    // 서버로 404 오류 전송
    const send404ErrorToServer = async () => {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: '404_not_found',
            message: `페이지를 찾을 수 없습니다: ${window.location.pathname}`,
            stack: '',
            timestamp: new Date().toISOString(),
            url: window.location.href,
            severity: 'medium',
            isServerError: false,
            statusCode: 404
          }),
        });
      } catch (sendError) {
        console.error('404 오류 로그 전송 실패:', sendError);
      }
    };

    send404ErrorToServer();
  }, []);

  // 404 오류 로그를 클립보드에 복사
  const copyErrorLog = async () => {
    try {
      const errorLog = `
===== 404 오류 발생 정보 =====
시간: ${new Date().toLocaleString('ko-KR')}
URL: ${typeof window !== 'undefined' ? window.location.href : '알 수 없음'}
경로: ${typeof window !== 'undefined' ? window.location.pathname : '알 수 없음'}
사용자 에이전트: ${typeof navigator !== 'undefined' ? navigator.userAgent : '알 수 없음'}

===== 오류 메시지 =====
페이지를 찾을 수 없습니다: ${typeof window !== 'undefined' ? window.location.pathname : '알 수 없음'}

===== 오류 유형 =====
404 Not Found
      `.trim()

      await navigator.clipboard.writeText(errorLog)
      alert('404 오류 로그가 클립보드에 복사되었습니다.')
    } catch (copyError) {
      console.error('클립보드 복사 실패:', copyError)
      alert('클립보드 복사에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="mb-6">
          <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            페이지를 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-6">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-3 justify-center">
            <button
              onClick={copyErrorLog}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              로그 복사
            </button>
            <Link 
              href="/"
              className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              홈으로 돌아가기
            </Link>
          </div>
          
          <div className="text-sm text-gray-500">
            <p>문제가 지속되면 다음을 시도해보세요:</p>
            <ul className="mt-2 text-left list-disc list-inside space-y-1">
              <li>URL을 다시 확인해주세요</li>
              <li>브라우저 새로고침</li>
              <li>이전 페이지로 돌아가기</li>
            </ul>
          </div>
        </div>
        
        {/* 개발 모드에서만 표시되는 디버그 정보 */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-800 text-white rounded-lg overflow-auto max-h-40 font-mono text-xs">
            <div className="text-yellow-300 mb-2">Debug Info:</div>
            <div>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
            <div>Path: {typeof window !== 'undefined' ? window.location.pathname : 'N/A'}</div>
            <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A'}</div>
          </div>
        )}
      </div>
    </div>
  );
} 