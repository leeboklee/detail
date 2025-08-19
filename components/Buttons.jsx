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
      } else {
        showMessage('error', result.message || '취소환불 정책 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('취소환불 정책 생성 오류:', error);
      showMessage('error', '취소환불 정책 생성 중 오류가 발생했습니다.');
    }
  }, []);

  // 예약안내 생성
  const generateBookingInfo = useCallback(async () => {
    try {
      const bookingData = {
        checkIn: "15:00",
        checkOut: "11:00",
        policies: [
          "체크인: 오후 3시부터",
          "체크아웃: 오전 11시까지",
          "무료 Wi-Fi 제공",
          "주차장 이용 가능",
          "반려동물 동반 불가"
        ],
        contact: {
          phone: "02-1234-5678",
          email: "reservation@hotel.com"
        }
      };

      const response = await fetch('/api/booking', {
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
      } else {
        showMessage('error', result.message || '예약안내 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('예약안내 생성 오류:', error);
      showMessage('error', '예약안내 생성 중 오류가 발생했습니다.');
    }
  }, []);

  // 완전한 HTML 미리보기 생성
  const generateCompleteHtml = useCallback(async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        updateHtmlPreviewData(result.html);
        showMessage('success', '미리보기가 성공적으로 생성되었습니다.');
      } else {
        showMessage('error', result.message || '미리보기 생성에 실패했습니다.');
      }
    } catch (error) {
      console.error('미리보기 생성 오류:', error);
      showMessage('error', '미리보기 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  }, [data, isGenerating, updateHtmlPreviewData]);

  // 클립보드 복사
  const copyToClipboard = useCallback(async () => {
    if (!htmlPreviewData || isCopying) return;

    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(htmlPreviewData);
      showMessage('success', 'HTML이 클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('클립보드 복사 오류:', error);
      showMessage('error', '클립보드 복사에 실패했습니다.');
    } finally {
      setIsCopying(false);
    }
  }, [htmlPreviewData, isCopying]);

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
    showMessage('info', isFullscreen ? '기본 크기로 변경되었습니다.' : '전체화면으로 변경되었습니다.');
  }, [isFullscreen]);

  // 미리보기 토글
  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
    showMessage('info', showPreview ? '미리보기가 숨겨졌습니다.' : '미리보기가 표시되었습니다.');
  }, [showPreview]);

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
    <div className="card p-6 mb-6">
      <div className="flex flex-wrap gap-3">
        
        {/* 미리보기 생성 버튼 */}
        <button
          onClick={generateCompleteHtml}
          disabled={isGenerating || isContextLoading}
          className="btn btn-primary btn-lg"
        >
          {isGenerating ? (
            <>
              <span className="spinner mr-2"></span>
              생성 중...
            </>
          ) : (
            <>
              <span className="mr-2">✨</span>
              미리보기 생성
            </>
          )}
        </button>

        {/* 취소환불 정책 생성 */}
        <button
          onClick={generateCancelPolicy}
          disabled={isGenerating}
          className="btn btn-secondary btn-lg"
        >
          <span className="mr-2">📋</span>
          취소환불 정책 생성
        </button>

        {/* 예약안내 생성 */}
        <button
          onClick={generateBookingInfo}
          disabled={isGenerating}
          className="btn btn-secondary btn-lg"
        >
          <span className="mr-2">📞</span>
          예약안내 생성
        </button>

        {/* HTML 복사 */}
        <button
          onClick={copyToClipboard}
          disabled={isCopying || !htmlPreviewData}
          className="btn btn-success btn-lg"
        >
          {isCopying ? (
            <>
              <span className="spinner mr-2"></span>
              복사 중...
            </>
          ) : (
            <>
              <span className="mr-2">📋</span>
              HTML 복사
            </>
          )}
        </button>

        {/* 전체화면 토글 */}
        <button
          onClick={toggleFullscreen}
          className="btn btn-ghost btn-lg"
        >
          <span className="mr-2">
            {isFullscreen ? '📱' : '🖥️'}
          </span>
          {isFullscreen ? '기본크기' : '전체화면'}
        </button>

        {/* 미리보기 토글 */}
        <button
          onClick={togglePreview}
          className="btn btn-ghost btn-lg"
        >
          <span className="mr-2">
            {showPreview ? '👁️' : '👁️‍🗨️'}
          </span>
          {showPreview ? '미리보기 숨기기' : '미리보기 보기'}
        </button>
      </div>

      {/* 상태 표시 */}
      <div className="mt-4 p-4 bg-tertiary rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isGenerating ? 'bg-warning-100 text-warning-800' : 'bg-success-100 text-success-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                isGenerating ? 'bg-warning-500 animate-pulse' : 'bg-success-500'
              }`}></span>
              {isGenerating ? '생성 중' : '준비됨'}
            </span>
            
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              htmlPreviewData ? 'bg-success-100 text-success-800' : 'bg-gray-100 text-gray-800'
            }`}>
              <span className={`w-2 h-2 rounded-full mr-2 ${
                htmlPreviewData ? 'bg-success-500' : 'bg-gray-400'
              }`}></span>
              {htmlPreviewData ? '미리보기 준비됨' : '미리보기 없음'}
            </span>
          </div>
          
          <div className="text-tertiary">
            {isGenerating ? '처리 중...' : '모든 기능 준비됨'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Buttons;
