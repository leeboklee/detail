/**
 * 미리보기 모듈 (PreviewManager)
 * 
 * 기능:
 * - 호텔, 객실, 패키지, 가격, 취소정책 등의 정보 미리보기
 * - 동적 컨테이너 생성
 * - 데이터 수집 및 HTML 렌더링
 * - 버튼 이벤트 처리
 * 
 * 의존성:
 * - UICore: 전체 UI 모듈 관리
 * - UICommon: 공통 UI 기능
 * - HotelApp: 데이터 관리
 */

'use client'; // 클라이언트 컴포넌트로 지정

import React, { useRef, useEffect, useState } from 'react';

// 정책 정보 가져오기 (취소/환불 정책, 예약 안내)
async function fetchAndRenderCancelAndBookingInfo() {
  try {
    const response = await fetch('/api/cancel-booking-info');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // 취소 정책 HTML 생성
    const cancelHtml = data.cancelPolicies ? `
      <div class="cancel-info">
        <h2 class="info-title">취소/환불 규정</h2>
        <div class="cancel-policies">
          ${data.cancelPolicies.map(policy => `
            <div class="policy-item">
              <h4>${policy.title}</h4>
              <p>${policy.description}</p>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';
    
    // 예약 안내 HTML 생성
    const bookingHtml = data.bookingInfo ? `
      <div class="booking-info">
        <h2 class="info-title">예약 안내</h2>
        <div class="booking-content">
          <p>${data.bookingInfo.replace(/\n/g, '<br>')}</p>
        </div>
      </div>
    ` : '';
    
    // 결합된 HTML
    const combinedHtml = [cancelHtml, bookingHtml].filter(html => html.trim()).join('\n');
    
    return {
      cancelHtml,
      bookingHtml,
      combinedHtml
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Preview 컴포넌트 - iframe 대신 div 사용으로 외부 스크롤 지원
 */
const Preview = ({ html, htmlContent, isLoading, loading, viewMode, onError }) => {
  // html과 htmlContent 둘 다 지원 (backward compatibility)
  const content = html || htmlContent;
  const previewRef = useRef(null);
  const [internalLoading, setInternalLoading] = useState(isLoading || loading || false);
  const [error, setError] = useState(null);
  const [processedHtml, setProcessedHtml] = useState('');

  // HTML이 변경될 때마다 콘텐츠 업데이트
  useEffect(() => {
    let isMounted = true; // 컴포넌트 마운트 상태 추적
    
    const updatePreview = async () => {
      // 로딩 상태 설정
      if (isMounted) setInternalLoading(isLoading || loading || false);

      try {
        // HTML 콘텐츠가 있는 경우 표시
        if (content && content.trim()) {
          // 취소규정, 예약안내 관련 정보 확인
          const hasCancelInfo = content.includes('취소 규정') || content.includes('취소/환불 규정') || content.includes('cancel');
          const hasBookingInfo = content.includes('예약 안내') || content.includes('reservation');
          
          let finalHtml = content;
          
          // 취소규정 또는 예약안내가 없을 경우 API에서 가져오기
          if (!hasCancelInfo || !hasBookingInfo) {
            try {
              const policyInfo = await fetchAndRenderCancelAndBookingInfo();
              
              // HTML에 정책 정보 추가
              if (!hasCancelInfo && !hasBookingInfo) {
                // 두 정보 모두 없는 경우 마지막에 추가
                finalHtml = content + policyInfo.combinedHtml;
              } else if (!hasCancelInfo) {
                // 취소정책만 없는 경우
                finalHtml = content + policyInfo.cancelHtml;
              } else if (!hasBookingInfo) {
                // 예약안내만 없는 경우
                finalHtml = content + policyInfo.bookingHtml;
              }
            } catch (policyError) {
              setError('정책 정보 로드 오류: ' + policyError.message);
            }
          }
          
          // HTML에서 body 태그 내용만 추출 (전체 HTML 문서가 아닌 경우)
          let bodyContent = finalHtml;
          if (finalHtml.includes('<body>')) {
            const bodyMatch = finalHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
            if (bodyMatch) {
              bodyContent = bodyMatch[1];
            }
          }
          
          if (isMounted) {
            setProcessedHtml(bodyContent);
            setError(null);
          }
        } else {
          if (isMounted) {
            setProcessedHtml(createPlaceholderContent());
          }
        }
      } catch (err) {
        setError('미리보기를 표시할 수 없습니다: ' + err.message);
        setProcessedHtml(createErrorContent(err.message));
        // 오류 콜백 호출
        if (onError && typeof onError === 'function') {
          onError(err);
        }
      } finally {
        // 로딩 상태 해제
        if (isMounted) setInternalLoading(false);
      }
    };
    
    updatePreview();
    
    // 클린업 함수
    return () => {
      isMounted = false; // 컴포넌트 언마운트 시 플래그 변경
    };
  }, [content, isLoading, loading, onError]);

  // 플레이스홀더 HTML 콘텐츠 생성
  const createPlaceholderContent = () => {
    return `
      <div style="
        font-family: 'Noto Sans KR', sans-serif; 
        background: #f8f9fa; 
        margin: 0; 
        padding: 40px 20px; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        min-height: 300px;
      ">
        <div style="
          max-width: 90%; 
          width: 500px; 
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 2px 15px rgba(0,0,0,0.1); 
          padding: 30px; 
          text-align: center; 
        ">
          <h3 style="color: #333; margin-top: 0;">미리보기 영역</h3>
          <p>왼쪽에서 정보를 입력한 후 <strong>미리보기 생성</strong> 버튼을 클릭하면 이 영역에 미리보기가 표시됩니다.</p>
          <div style="margin-top: 20px; color: #666; font-size: 14px; line-height: 1.5;">
            <p>이 미리보기는 실제 페이지의 모양과 다를 수 있습니다.</p>
            <p>더 정확한 미리보기를 위해 모든 필드를 채워주세요.</p>
          </div>
        </div>
      </div>
    `;
  };

  // 오류 메시지 HTML 콘텐츠 생성
  const createErrorContent = (message) => {
    return `
      <div style="
        font-family: 'Noto Sans KR', sans-serif; 
        background: #f8f9fa; 
        margin: 0; 
        padding: 40px 20px; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        min-height: 300px;
      ">
        <div style="
          max-width: 90%; 
          width: 500px; 
          background: white; 
          border-radius: 8px; 
          box-shadow: 0 2px 15px rgba(0,0,0,0.1); 
          padding: 30px; 
          text-align: center; 
        ">
          <h3 style="color: #333; margin-top: 0;">오류 발생</h3>
          <div style="
            margin: 20px 0; 
            color: #e74c3c; 
            padding: 10px; 
            background: #fdf0ed; 
            border-radius: 4px; 
            font-size: 14px; 
          ">
            ${message}
          </div>
          <p style="color: #666; font-size: 12px;">페이지를 새로고침하거나 입력 내용을 확인해주세요.</p>
        </div>
      </div>
    `;
  };

  // 로딩 상태 표시
  if (internalLoading) {
    return (
      <div className={`preview-container ${viewMode === 'mobile' ? 'mobile-view' : ''}`} style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        backgroundColor: '#fff',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid #f3f3f3', 
            borderTop: '3px solid #3498db', 
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }}></div>
          <p>미리보기를 생성하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 오류 상태 표시
  if (error) {
    return (
      <div className={`preview-container ${viewMode === 'mobile' ? 'mobile-view' : ''}`} style={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        backgroundColor: '#fff',
        height: '100%',
        overflow: 'auto',
        padding: '20px'
      }}>
        <div dangerouslySetInnerHTML={{ __html: createErrorContent(error) }} />
      </div>
    );
  }

  // 미리보기 렌더링
  return (
    <div className={`preview-container ${viewMode === 'mobile' ? 'mobile-view' : ''}`}>
      <style jsx>{`
        .preview-container {
          border: 1px solid #ddd;
          border-radius: 8px;
          background-color: #fff;
          height: 100%;
          overflow: auto;
          font-family: 'Noto Sans KR', sans-serif;
        }
        
        .mobile-view {
          max-width: 375px;
          margin: 0 auto;
        }
        
        /* 미리보기 내용 스타일 */
        .preview-container :global(body) {
          font-family: 'Noto Sans KR', sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 20px;
        }
        
        .preview-container :global(h1), 
        .preview-container :global(h2), 
        .preview-container :global(h3), 
        .preview-container :global(h4), 
        .preview-container :global(h5), 
        .preview-container :global(h6) {
          color: #222;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        
        .preview-container :global(h1) { font-size: 2em; }
        .preview-container :global(h2) { 
          font-size: 1.8em; 
          border-bottom: 1px solid #eee; 
          padding-bottom: 0.3em; 
        }
        .preview-container :global(h3) { font-size: 1.5em; }
        .preview-container :global(p) { margin: 0.5em 0 1em; }
        .preview-container :global(img) { max-width: 100%; height: auto; }
        .preview-container :global(table) { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 1em 0; 
        }
        .preview-container :global(th), 
        .preview-container :global(td) { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        .preview-container :global(th) { background-color: #f5f5f5; }
        .preview-container :global(.section) { margin-bottom: 2em; }
        .preview-container :global(ul), 
        .preview-container :global(ol) { padding-left: 1.5em; }
        .preview-container :global(li) { margin-bottom: 0.5em; }
        
        .preview-container :global(.alert) { 
          padding: 15px; 
          border-radius: 4px; 
          margin-bottom: 1em; 
        }
        .preview-container :global(.alert-warning) {
          background-color: #fff3cd;
          border: 1px solid #ffeeba;
          color: #856404;
        }
        .preview-container :global(.alert-danger) {
          background-color: #f8d7da;
          border: 1px solid #f5c6cb;
          color: #721c24;
        }
        
        /* 취소 정책 스타일 */
        .preview-container :global(.cancel-info), 
        .preview-container :global(.booking-info) {
          border: 1px solid #eaeaea;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          background-color: #f9f9f9;
        }
        .preview-container :global(.info-title) {
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-top: 0;
        }
        .preview-container :global(.cancel-policy-table) {
          margin-top: 15px;
        }
        .preview-container :global(.additional-policy) {
          margin-top: 15px;
          background-color: #f0f0f0;
          padding: 10px;
          border-radius: 5px;
        }
        
        /* 호텔 정책 컨테이너 */
        .preview-container :global(.hotel-policies) {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #ccc;
        }
        
        /* 누락된 섹션 스타일 */
        .preview-container :global(.missing-section) {
          border: 2px dashed #ff6b6b !important;
          padding: 10px !important;
          margin: 10px 0 !important;
          background-color: #fff5f5 !important;
        }
        .preview-container :global(.missing-section-label) {
          color: #e03131 !important;
          font-weight: bold !important;
          margin-bottom: 5px !important;
        }
        
        /* 스핀 애니메이션 */
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      <div 
        ref={previewRef}
        style={{ padding: '20px' }}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    </div>
  );
};

export default Preview;

/* 
기존 window.previewManager 및 document.addEventListener 관련 코드는 모두 제거됨.
이 파일은 이제 props를 받아 미리보기를 렌더링하는 React 클라이언트 컴포넌트임.
*/
