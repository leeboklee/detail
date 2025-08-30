'use client';

import { useEffect, useState } from 'react';

export default function Error({ error, reset }) {
  const [sending, setSending] = useState(false)

  useEffect(() => {
    // 오류 로깅 (간단 전송)
    console.error('Error:', error);
    const sendErrorToServer = async () => {
      try {
        await fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: getOrCreateSessionId(),
            timestamp: new Date().toISOString(),
            errors: [
              {
                type: 'page_error',
                message: error?.message || '알 수 없는 페이지 오류',
                stack: error?.stack || '',
                url: typeof window !== 'undefined' ? window.location.href : '',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
              }
            ]
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
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    }
  };

  const handleSendAI = async () => {
    if (sending) return
    setSending(true)
    try {
      const payload = {
        sessionId: getOrCreateSessionId(),
        timestamp: new Date().toISOString(),
        errors: [
          {
            type: 'page_error',
            message: error?.message || '알 수 없는 페이지 오류',
            stack: error?.stack || '',
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : ''
          }
        ]
      }
      const res = await fetch('/api/log-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      alert(data?.message || 'AI 분석 요청이 전송되었습니다.')
    } catch (e) {
      console.error(e)
      alert('전송 중 오류가 발생했습니다.')
    } finally {
      setSending(false)
    }
  }

  // 오류 로그를 클립보드에 복사
  const copyErrorLog = async () => {
    try {
      const errorLog = `
===== 오류 발생 정보 =====
시간: ${new Date().toLocaleString('ko-KR')}
URL: ${typeof window !== 'undefined' ? window.location.href : '알 수 없음'}
사용자 에이전트: ${typeof navigator !== 'undefined' ? navigator.userAgent : '알 수 없음'}

===== 오류 메시지 =====
${error?.message || '알 수 없는 오류'}

===== 오류 스택 =====
${error?.stack || '스택 정보 없음'}
      `.trim()

      await navigator.clipboard.writeText(errorLog)
      alert('오류 로그가 클립보드에 복사되었습니다.')
    } catch (copyError) {
      console.error('클립보드 복사 실패:', copyError)
      alert('클립보드 복사에 실패했습니다.')
    }
  }

  function getOrCreateSessionId() {
    if (typeof window === 'undefined') return 'server'
    const key = 'detail_session_id'
    let id = localStorage.getItem(key)
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())
      localStorage.setItem(key, id)
    }
    return id
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            오류가 발생했습니다
          </h2>
          <p className="text-gray-600 mb-6">
            {error?.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
          {process.env.NODE_ENV === 'development' && error?.stack && (
            <div className="mb-6 p-4 bg-gray-800 text-white rounded-lg overflow-auto max-h-40 font-mono text-xs">
              <div className="text-red-300 mb-2">Error Stack:</div>
              <pre>{error.stack}</pre>
            </div>
          )}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleReset}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={() => { if (typeof window !== 'undefined') window.location.reload() }}
              className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              페이지 새로고침
            </button>
            <button
              onClick={copyErrorLog}
              className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              로그 복사
            </button>
            <button
              onClick={handleSendAI}
              disabled={sending}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {sending ? '전송 중...' : 'AI 분석 요청'}
            </button>
          </div>
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
  );
} 