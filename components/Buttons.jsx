'use client';

import React, { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

const Buttons = () => {
  const { 
    data = {},
    updateHtmlPreviewData
  } = useAppContext();
  
  const htmlPreviewData = data.htmlPreviewData || '';
  const isContextLoading = false;
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // 취소환불 정책 생성 (독립적으로 작동)
  const generateCancelPolicy = useCallback(async () => {
    try {
      const cancelData = {
        policies: [
          {
            period: "체크인 7일 전까지",
            charge: "무료 취소",
            description: "취소 수수료 없이 전액 환불"
          },
          {
            period: "체크인 3-6일 전",
            charge: "1박 요금의 50%",
            description: "부분 환불 (50% 차감)"
          },
          {
            period: "체크인 2일 전~당일",
            charge: "1박 요금의 100%",
            description: "환불 불가"
          }
        ],
        notes: [
          "모든 취소는 체크인 시간(15:00) 기준으로 계산됩니다.",
          "성수기 및 특별 이벤트 기간에는 별도의 취소 정책이 적용될 수 있습니다.",
          "단체 예약의 경우 별도 협의가 필요합니다."
        ]
      };

      const response = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cancelData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        showMessage('success', '취소환불 정책이 생성되었습니다.');
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.error || '취소환불 정책 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('취소환불 정책 생성 오류:', error);
      showMessage('error', `취소환불 정책 생성 실패: ${error.message}`);
    }
  }, [onUpdate]);

  // 예약안내 생성
  const generateBookingInfo = useCallback(async () => {
    try {
      const bookingData = {
        checkIn: {
          time: "15:00",
          requirements: [
            "신분증 지참 필수",
            "예약 확인서 제시",
            "신용카드 또는 현금 보증금"
          ]
        },
        checkOut: {
          time: "11:00",
          lateCheckout: "추가 요금으로 최대 14:00까지 연장 가능"
        },
        policies: [
          "미성년자 단독 투숙 불가",
          "반려동물 동반 불가",
          "객실 내 금연",
          "외부 음식 반입 제한"
        ],
        services: [
          "24시간 프런트 데스크",
          "무료 Wi-Fi",
          "발렛파킹 서비스",
          "룸서비스 (24시간)"
        ],
        contact: {
          phone: "02-1234-5678",
          email: "info@hotel.com",
          address: "서울특별시 강남구 테헤란로 123"
        }
      };

      const response = await fetch('/api/bookingInfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        showMessage('success', '예약안내가 생성되었습니다.');
        if (onUpdate) onUpdate();
      } else {
        throw new Error(result.error || '예약안내 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약안내 생성 오류:', error);
      showMessage('error', `예약안내 생성 실패: ${error.message}`);
    }
  }, [onUpdate]);

  // 전체 HTML 생성
  const generateCompleteHtml = async () => {
    if (isGenerating) return;
    
    setIsGenerating(true);
    try {
      console.log('전체 HTML 생성 시작');
      
      // window.htmlPreviewData에서 최신 데이터 가져오기
      const latestHtml = window.htmlPreviewData || htmlPreviewData;
      
      if (!latestHtml || latestHtml.trim() === '') {
        showAlert('생성할 데이터가 없습니다. 왼쪽에서 정보를 입력해주세요.', 'warning');
        return;
      }
      
      // 세션에 저장 (간단화)
      try {
        sessionStorage.setItem('htmlPreviewData', latestHtml);
        console.log('세션에 HTML 데이터 저장 완료');
      } catch (error) {
        console.error('세션 저장 오류:', error);
      }
      
      updateHtmlPreviewData(latestHtml);
      
      console.log('전체 HTML 생성 완료, 길이:', latestHtml.length);
      showAlert('HTML이 생성되었습니다', 'success');
      
    } catch (error) {
      console.error('HTML 생성 오류:', error);
      showAlert('HTML 생성 중 오류가 발생했습니다', 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  // 클립보드 복사
  const copyToClipboard = async () => {
    if (isCopying) return;
    
    setIsCopying(true);
    try {
      const htmlToCopy = window.htmlPreviewData || htmlPreviewData;
      
      if (!htmlToCopy || htmlToCopy.trim() === '') {
        showAlert('복사할 내용이 없습니다', 'warning');
        return;
      }
      
      await navigator.clipboard.writeText(htmlToCopy);
      console.log('HTML이 클립보드에 복사되었습니다.');
      showAlert('HTML이 클립보드에 복사되었습니다', 'success');
      
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
      showAlert('클립보드 복사에 실패했습니다', 'danger');
    } finally {
      setIsCopying(false);
    }
  };

  // 전체화면 토글
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      if (!isFullscreen) {
        previewContainer.style.position = 'fixed';
        previewContainer.style.top = '0';
        previewContainer.style.left = '0';
        previewContainer.style.width = '100vw';
        previewContainer.style.height = '100vh';
        previewContainer.style.zIndex = '9999';
        previewContainer.style.backgroundColor = 'white';
      } else {
        previewContainer.style.position = '';
        previewContainer.style.top = '';
        previewContainer.style.left = '';
        previewContainer.style.width = '';
        previewContainer.style.height = '';
        previewContainer.style.zIndex = '';
        previewContainer.style.backgroundColor = '';
      }
    }
  };

  // 미리보기 토글
  const togglePreview = () => {
    setShowPreview(!showPreview);
    
    const previewContainer = document.querySelector('.preview-container');
    if (previewContainer) {
      previewContainer.style.display = showPreview ? 'none' : 'block';
    }
  };

  // 알림 표시 함수
  const showAlert = (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // 간단한 브라우저 알림
    if (type === 'success') {
      // 성공 시 짧은 알림
    } else if (type === 'danger') {
      alert(`오류: ${message}`);
    } else if (type === 'warning') {
      alert(`주의: ${message}`);
    }
  };

  const showMessage = useCallback((type, message) => {
    // Message display logic here
  }, []);

  return (
    <div className="buttons-container" style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '1rem' }}>
      <div className="button-group" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        
        {/* 미리보기 생성 버튼 */}
        <button
          onClick={generateCompleteHtml}
          disabled={isGenerating || isContextLoading}
          className="btn btn-primary"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.6 : 1
          }}
        >
          {isGenerating ? '생성 중...' : '미리보기 생성'}
        </button>

        {/* 취소환불 정책 생성 */}
        <button
          onClick={generateCancelPolicy}
          disabled={isGenerating}
          className="btn btn-secondary"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.6 : 1
          }}
        >
          취소환불 정책 생성
        </button>

        {/* 예약안내 생성 */}
        <button
          onClick={generateBookingInfo}
          disabled={isGenerating}
          className="btn btn-secondary"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            opacity: isGenerating ? 0.6 : 1
          }}
        >
          예약안내 생성
        </button>

        {/* HTML 복사 */}
        <button
          onClick={copyToClipboard}
          disabled={isCopying || !htmlPreviewData}
          className="btn btn-success"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isCopying || !htmlPreviewData ? 'not-allowed' : 'pointer',
            opacity: isCopying || !htmlPreviewData ? 0.6 : 1
          }}
        >
          {isCopying ? '복사 중...' : 'HTML 복사'}
        </button>

        {/* 전체화면 토글 */}
        <button
          onClick={toggleFullscreen}
          className="btn btn-info"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isFullscreen ? '기본크기' : '전체화면'}
        </button>

        {/* 미리보기 토글 */}
        <button
          onClick={togglePreview}
          className="btn btn-outline-secondary"
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            color: '#6c757d',
            border: '1px solid #6c757d',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
        </button>
      </div>

      {/* 상태 표시 */}
      {isContextLoading && (
        <div style={{ marginTop: '0.5rem', color: '#6c757d', fontSize: '0.875rem' }}>
          컨텍스트 로딩 중...
        </div>
      )}
      
      {htmlPreviewData && (
        <div style={{ marginTop: '0.5rem', color: '#28a745', fontSize: '0.875rem' }}>
          HTML 길이: {htmlPreviewData.length}자
        </div>
      )}
    </div>
  );
};

export default Buttons;
