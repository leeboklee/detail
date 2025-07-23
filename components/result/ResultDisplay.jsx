'use client';

import React from 'react';

const ResultDisplay = ({ htmlResult, error, onClose }) => {
  // 클립보드 복사 기능 강화
  const copyToClipboard = () => {
    if (htmlResult) {
      try {
        navigator.clipboard.writeText(htmlResult)
          .then(() => {
            console.log('HTML이 클립보드에 복사되었습니다.');
          })
          .catch(err => {
            console.error('클립보드 복사 실패:', err);
            fallbackCopyToClipboard(htmlResult);
          });
      } catch (err) {
        console.error('클립보드 API 에러:', err);
        fallbackCopyToClipboard(htmlResult);
      }
    }
  };

  // 대체 복사 방법
  const fallbackCopyToClipboard = (text) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      console.log('HTML이 클립보드에 복사되었습니다.');
    } catch (err) {
      console.error('대체 복사 방법 실패:', err);
              console.error('클립보드 복사에 실패했습니다. HTML을 수동으로 선택하여 복사해주세요.');
    }
  };

  return (
    <div className="result-display mt-4">
      {/* 결과 표시 영역 */}
      {htmlResult && (
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h3 className="mb-0">생성된 HTML</h3>
            <div>
              <button
                type="button"
                className="btn btn-primary me-2"
                onClick={copyToClipboard}
              >
                클립보드에 복사
              </button>
              {onClose && (
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                >
                  닫기
                </button>
              )}
            </div>
          </div>
          
          <div className="card-body">
            {/* HTML 코드 */}
            <div className="bg-light p-3 rounded">
              <pre className="mb-0" style={{ maxHeight: '400px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                {htmlResult}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 오류 메시지 표시 */}
      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}
    </div>
  );
};

export default ResultDisplay; 