/**
 * 미리보기 모듈 (PreviewManager) - 개선된 버전 (div 기반)
 * 
 * 기능:
 * - 호텔, 객실, 패키지, 가격, 취소정책 등의 정보 미리보기
 * - div 기반 렌더링 (iframe 대신)
 * - 데이터 수집 및 HTML 렌더링
 * - 버튼 이벤트 처리
 * - 로딩 상태 및 에러 처리
 * - 성능 최적화
 * - 서버 로그 오류 처리
 * 
 * 의존성:
 * - UICore: 전체 UI 모듈 관리
 * - UICommon: 공통 UI 기능
 * - HotelApp: 데이터 관리
 */

'use client'; // 클라이언트 컴포넌트로 지정

import React, { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from './AppContext.Context';
import { applyLayoutStyles, getTemplateClasses } from './layout/LayoutStyles';

const Preview = React.memo(() => {
  const { hotelInfo, selectedTemplate, templates, layoutInfo } = useAppContext();
  const previewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [serverErrors, setServerErrors] = useState([]);

  console.log('[Preview] Preview rendering with props:', {
    hasHtml: !!hotelInfo,
    hasHtmlContent: !!hotelInfo?.name,
    selectedTemplate,
    templates: Object.keys(templates || {}),
    hotelInfo: hotelInfo
  });

  // 서버 로그 오류 처리
  useEffect(() => {
    const handleServerError = (event) => {
      if (event.detail && event.detail.type === 'server_error') {
        setServerErrors(prev => [...prev, {
          id: Date.now(),
          message: event.detail.message,
          timestamp: new Date().toISOString(),
          severity: event.detail.severity || 'medium'
        }]);
      }
    };

    window.addEventListener('server-error', handleServerError);
    return () => window.removeEventListener('server-error', handleServerError);
  }, []);

  const previewContent = useMemo(() => {
    if (!hotelInfo || !hotelInfo.name) {
      return {
        html: '<div style="padding: 20px; color: #333; text-align: center; font-size: 16px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">미리보기 내용이 없습니다.<br><small style="color: #6c757d;">호텔 정보를 입력해주세요.</small></div>',
        hasContent: false
      };
    }
    
    // 선택된 템플릿에 따라 HTML 생성
    const template = templates[selectedTemplate];
    if (template) {
      const processedTemplate = template
        .replace(/{{hotelName}}/g, hotelInfo.name || '')
        .replace(/{{hotelSubtitle}}/g, hotelInfo.subtitle || '')
        .replace(/{{hotelAddress}}/g, hotelInfo.address || '')
        .replace(/{{hotelDescription}}/g, hotelInfo.description || '');
      
      return {
        html: processedTemplate,
        hasContent: true
      };
    }
    
    // 기본 HTML 생성 (개선된 디자인 - 가독성 향상)
    return {
      html: `
        <div style="padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #1f2937; padding: 30px; border-radius: 10px; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h1 style="margin: 0 0 10px 0; font-size: 2.5em; font-weight: 300; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${hotelInfo.name || '호텔명'}</h1>
            ${hotelInfo.subtitle ? `<h2 style="margin: 0; font-size: 1.2em; font-weight: 300; opacity: 0.9; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${hotelInfo.subtitle}</h2>` : ''}
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border: 1px solid #e9ecef;">
            ${hotelInfo.address ? `
              <div style="margin-bottom: 20px;">
                <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 1.1em; font-weight: 600;">📍 주소</h3>
                <p style="color: #34495e; margin: 0; font-size: 1em; line-height: 1.5;">${hotelInfo.address}</p>
              </div>
            ` : ''}
            
            ${hotelInfo.description ? `
              <div>
                <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 1.1em; font-weight: 600;">📝 소개</h3>
                <p style="color: #34495e; margin: 0; line-height: 1.6; font-size: 1em;">${hotelInfo.description}</p>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #7f8c8d; font-size: 0.9em; background: #f8f9fa; padding: 10px; border-radius: 5px; border: 1px solid #e9ecef;">
            마지막 업데이트: ${new Date().toLocaleString('ko-KR')}
          </div>
        </div>
      `,
      hasContent: true
    };
  }, [hotelInfo, selectedTemplate, templates]);

  // 레이아웃 스타일 적용
  useEffect(() => {
    if (layoutInfo) {
      applyLayoutStyles(layoutInfo);
    }
  }, [layoutInfo]);

  // 미리보기 업데이트 (실시간 반영 강화)
  useEffect(() => {
    if (previewRef.current) {
      try {
        setIsLoading(true);
        setError(null);
        
        // div 내용 업데이트
        previewRef.current.innerHTML = previewContent.html;
        setLastUpdateTime(Date.now());
        console.log('[Preview] preview content updated successfully');
        
        // 실시간 반영 확인을 위한 로그
        console.log('[Preview] Real-time update:', {
          hotelName: hotelInfo?.name,
          hotelAddress: hotelInfo?.address,
          hotelDescription: hotelInfo?.description,
          timestamp: new Date().toLocaleTimeString()
        });
        
      } catch (error) {
        console.log('[Preview] preview update failed:', error.message);
        setError('미리보기 업데이트 실패');
      } finally {
        // 로딩 완료 (더 빠른 반영)
        setTimeout(() => {
          setIsLoading(false);
        }, 200);
      }
    }
  }, [previewContent, hotelInfo]);

  // 초기 로딩 완료
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleRefresh = useCallback(() => {
    setError(null);
    setIsLoading(true);
    // 강제 리렌더링
    setLastUpdateTime(Date.now());
  }, []);

  const clearServerErrors = useCallback(() => {
    setServerErrors([]);
  }, []);

  // 로딩 상태 표시
  if (isLoading) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        border: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f9f9f9'
      }}>
        <div style={{ textAlign: 'center', color: '#666' }}>
          <div style={{
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px auto'
          }}></div>
          <div>미리보기 로딩 중...</div>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        border: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff5f5',
        color: '#e53e3e'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div>⚠️ {error}</div>
          <button 
            onClick={handleRefresh}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', border: '1px solid #ddd', position: 'relative' }}>
      {/* 미리보기 컨테이너 */}
      <div 
        ref={previewRef}
        style={{
          width: '100%',
          height: '100%',
          overflow: 'auto',
          background: '#ffffff',
          padding: '10px',
          border: '1px solid #e9ecef'
        }}
      />
      
      {/* 업데이트 시간 표시 */}
      <div style={{
        position: 'absolute',
        bottom: '5px',
        right: '5px',
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '3px',
        fontSize: '10px',
        opacity: 0.7
      }}>
        {new Date(lastUpdateTime).toLocaleTimeString('ko-KR')}
      </div>

      {/* 서버 오류 표시 */}
      {serverErrors.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '5px',
          left: '5px',
          right: '5px',
          background: 'rgba(220, 38, 38, 0.9)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          maxHeight: '100px',
          overflow: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <strong>서버 오류 ({serverErrors.length}개)</strong>
            <button 
              onClick={clearServerErrors}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✕
            </button>
          </div>
          {serverErrors.slice(-3).map(error => (
            <div key={error.id} style={{ marginBottom: '3px', fontSize: '11px' }}>
              {error.message}
            </div>
          ))}
        </div>
      )}

      {/* 미리보기 컨트롤 */}
      <div style={{
        position: 'absolute',
        top: '5px',
        right: '5px',
        display: 'flex',
        gap: '5px'
      }}>
        <button 
          onClick={handleRefresh}
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
          title="새로고침"
        >
          🔄
        </button>
        <button 
          onClick={() => {
            const html = previewRef.current?.innerHTML;
            if (html) {
              const blob = new Blob([`
                <!DOCTYPE html>
                <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <title>${hotelInfo?.name || '호텔 미리보기'}</title>
                    <style>
                      * { box-sizing: border-box; }
                      body { 
                        margin: 0; 
                        padding: 0; 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background: #f5f5f5;
                        color: #333;
                      }
                    </style>
                  </head>
                  <body>
                    ${html}
                  </body>
                </html>
              `], { type: 'text/html' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `hotel-preview-${Date.now()}.html`;
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
          title="HTML 다운로드"
        >
          ��
        </button>
        <button 
          onClick={() => {
            // 테스트용 서버 오류 발생
            const errorEvent = new CustomEvent('server-error', {
              detail: {
                type: 'server_error',
                message: '테스트용 서버 오류입니다.',
                severity: 'high',
                timestamp: new Date().toISOString()
              }
            });
            window.dispatchEvent(errorEvent);
          }}
          style={{
            background: 'rgba(220, 38, 38, 0.8)',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
          title="테스트 오류 발생"
        >
          ⚠️
        </button>
      </div>
    </div>
  );
});

Preview.displayName = 'Preview';

export default Preview;
