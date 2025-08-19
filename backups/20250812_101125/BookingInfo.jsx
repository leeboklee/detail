'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext.Context';
import { BOOKING_SECTION_STYLES } from '../layout/LayoutStyles';

/**
 * 예약안내 컴포넌트 - 숙박권 구매안내 내용 입력
 */
const BookingInfo = () => {
  const { bookingInfo, setBookingInfo, layoutInfo } = useAppContext();
  const [showPreview, setShowPreview] = useState(false);
  
  // 예약안내 데이터 상태
  const [bookingData, setBookingData] = useState({
    // 통합된 예약안내 텍스트
    bookingText: bookingInfo?.bookingText || `1. 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송
2. 희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송
* 문자(카톡)는 근무시간내 수신자 번호로 전송

⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!

본 숙박권은 대기예약 상품으로 구매즉시 확정 되지않습니다.
구매완료 및 주문번호는 결제번호를 의미합니다 (예약확정X)
결제후에도 희망날짜 마감시 전액환불/날짜변경 안내드립니다.
예약 미확정 관련 문제는 책임질수 없음을 안내드립니다.
1박 숙박권이며 연박 / 객실 추가시 수량에 맞춰 구매
ex) 1박 2실 : 2매 / 2박 1실 : 2매
요일별 추가요금이 있으므로 하단 요금표를 확인 부탁드립니다.`,
    
    // 참고사항 텍스트
    referenceNotes: bookingInfo?.referenceNotes || `해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.
예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.
취소/변경 위약규정은 아래 하단 참고 부탁드립니다.
부분환불 불가
옵션수량은 대기가능 수량을 의미
현장 상황에 따라 부대시설 휴장 및 운영시간이 변동 될 수 있음
상세페이지와 상품명이 다른 경우 상품명 우선적용
추가요금 발생시 추가금 안내후 예약확정
빠른 확정 문의는 카톡상담 부탁드립니다.`,
    
    // 기존 필드들 (호환성을 위해 유지)
    paymentProcess: bookingInfo?.paymentProcess || '1. 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송',
    confirmationProcess: bookingInfo?.confirmationProcess || '2. 희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송',
    messageNote: bookingInfo?.messageNote || '* 문자(카톡)는 근무시간내 수신자 번호로 전송',
    urgentNote: bookingInfo?.urgentNote || '체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!',
    waitingProduct: bookingInfo?.waitingProduct || '본 숙박권은 대기예약 상품으로 구매즉시 확정 되지않습니다.',
    orderNumberNote: bookingInfo?.orderNumberNote || '구매완료 및 주문번호는 결제번호를 의미합니다 (예약확정X)',
    refundPolicy: bookingInfo?.refundPolicy || '결제후에도 희망날짜 마감시 전액환불/날짜변경 안내드립니다.',
    responsibilityNote: bookingInfo?.responsibilityNote || '예약 미확정 관련 문제는 책임질수 없음을 안내드립니다.',
    stayType: bookingInfo?.stayType || '1박 숙박권이며 연박 / 객실 추가시 수량에 맞춰 구매',
    stayExample: bookingInfo?.stayExample || 'ex) 1박 2실 : 2매 / 2박 1실 : 2매',
    additionalCharge: bookingInfo?.additionalCharge || '요일별 추가요금이 있으므로 하단 요금표를 확인 부탁드립니다.',
    contactNote: bookingInfo?.contactNote || '해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.',
    cancellationFee: bookingInfo?.cancellationFee || '예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.',
    penaltyReference: bookingInfo?.penaltyReference || '취소/변경 위약규정은 아래 하단 참고 부탁드립니다.',
    partialRefund: bookingInfo?.partialRefund || '부분환불 불가',
    optionQuantity: bookingInfo?.optionQuantity || '옵션수량은 대기가능 수량을 의미',
    facilityNote: bookingInfo?.facilityNote || '현장 상황에 따라 부대시설 휴장 및 운영시간이 변동 될 수 있음',
    productNamePriority: bookingInfo?.productNamePriority || '상세페이지와 상품명이 다른 경우 상품명 우선적용',
    additionalPayment: bookingInfo?.additionalPayment || '추가요금 발생시 추가금 안내후 예약확정',
    quickConfirmation: bookingInfo?.quickConfirmation || '빠른 확정 문의는 카톡상담 부탁드립니다.',
    kakaoChannel: bookingInfo?.kakaoChannel || '카톡에서 한투어 채널 추가하세요 +'
  });

  // 섹션별 디자인 샘플
  const sectionSamples = {
    card: {
      title: '카드형 디자인',
      description: '카드 형태의 깔끔한 레이아웃',
      preview: `
        <div style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin: 10px;">
          <h3 style="color: #1f2937; margin: 0 0 10px 0;">📞 예약안내</h3>
          <div style="background: #f8fafc; border-radius: 8px; padding: 15px; margin-bottom: 10px;">
            <p style="margin: 0; color: #374151;">• 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송</p>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px;">
            <p style="margin: 0; color: #dc2626; font-weight: 600;">⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!</p>
          </div>
        </div>
      `
    },
    list: {
      title: '리스트형 디자인',
      description: '목록 형태의 간단한 레이아웃',
      preview: `
        <div style="background: white; padding: 20px; border: 1px solid #e5e7eb;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; border-bottom: 2px solid #3b82f6; padding-bottom: 5px;">📞 예약안내</h3>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li style="margin-bottom: 8px;">결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송</li>
            <li style="margin-bottom: 8px;">희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송</li>
            <li style="margin-bottom: 8px; color: #dc2626; font-weight: 600;">⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!</li>
          </ul>
        </div>
      `
    },
    grid: {
      title: '그리드형 디자인',
      description: '격자 형태의 정돈된 레이아웃',
      preview: `
        <div style="background: white; padding: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; text-align: center;">📞 예약안내</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #374151;">🏨 구매안내</h4>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송</p>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 15px;">
              <h4 style="margin: 0 0 10px 0; color: #dc2626;">⚠️ 중요안내</h4>
              <p style="margin: 0; font-size: 14px; color: #dc2626;">체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!</p>
            </div>
          </div>
        </div>
      `
    },
    document: {
      title: '문서형 디자인',
      description: '문서 형태의 정형화된 레이아웃',
      preview: `
        <div style="max-width: 800px; margin: 0 auto; padding: 20px; background: #ffffff; font-family: 'Noto Sans KR', sans-serif; line-height: 1.6; color: #333;">
          <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
            <div style="background: #f8fafc; padding: 16px 20px; border-bottom: 1px solid #e5e7eb; font-size: 18px; font-weight: 700; color: #1f2937;">
              🏨 숙박권 구매안내
            </div>
            <div style="padding: 20px;">
              <div style="margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                <strong>1.</strong> 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송
              </div>
              <div style="margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #f3f4f6;">
                <strong>2.</strong> 희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송
              </div>
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 12px; margin: 12px 0; color: #dc2626; font-weight: 600;">
                ⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!
              </div>
            </div>
          </div>
        </div>
      `
    }
  };

  const handleFieldChange = (field, value) => {
    const updatedData = {
      ...bookingData,
      [field]: value
    };
    setBookingData(updatedData);
    setBookingInfo(updatedData);
  };

  // 현재 선택된 템플릿 가져오기
  const currentTemplate = layoutInfo?.sectionTemplates?.booking || layoutInfo?.template || 'document';
  const currentSample = sectionSamples[currentTemplate] || sectionSamples.document;

  // 입력 필드 공통 스타일
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    outline: 'none'
  };

  const textareaStyle = {
    ...inputStyle,
    
    maxHeight: 'none',
    height: 'auto',
    overflow: 'hidden !important',
    resize: 'none',
    lineHeight: '1.6',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  };

  const sectionStyle = {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  };

  const sectionTitleStyle = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const urgentStyle = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px'
  };

  const urgentTextStyle = {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: '14px'
  };

  return (
    <div className="booking-container space-y-6 p-6" style={{ overflow: 'visible' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">📞 예약안내</h3>
      </div>
      
      {/* 숙박권 구매안내 섹션 */}
      <div style={{
        ...sectionStyle,
        backgroundColor: '#f0f9ff',
        border: '2px solid #0ea5e9'
      }}>
        <h4 style={{
          ...sectionTitleStyle,
          color: '#0c4a6e',
          fontSize: '20px'
        }}>
          🏨 숙박권 구매안내
        </h4>
        
        <textarea
          value={bookingData.bookingText}
          onChange={(e) => handleFieldChange('bookingText', e.target.value)}
          style={{
            ...textareaStyle,
            
            maxHeight: 'none',
            height: 'auto',
            overflow: 'visible !important',
            fontSize: '15px',
            lineHeight: '1.8',
            backgroundColor: '#ffffff',
            border: '2px solid #0ea5e9',
            borderRadius: '12px',
            padding: '20px',
            resize: 'none !important',
            scrollbarWidth: 'none !important',
            msOverflowStyle: 'none !important',
            display: 'block',
            width: '100%',
            WebkitScrollbar: 'none !important'
          }}
          className="no-scrollbar booking-textarea"
          suppressHydrationWarning={true}
          placeholder="1. 결제 → 희망날짜 접수 페이지 링크 문자(카톡)전송
2. 희망날짜 접수 → 대기 → 예약확정 / 마감 안내전송
* 문자(카톡)는 근무시간내 수신자 번호로 전송

⚠️ 체크인 2일전~ 당일 예약은 유선 카톡 상담후 출발!

본 숙박권은 대기예약 상품으로 구매즉시 확정 되지않습니다.
구매완료 및 주문번호는 결제번호를 의미합니다 (예약확정X)
결제후에도 희망날짜 마감시 전액환불/날짜변경 안내드립니다.
예약 미확정 관련 문제는 책임질수 없음을 안내드립니다.
1박 숙박권이며 연박 / 객실 추가시 수량에 맞춰 구매
ex) 1박 2실 : 2매 / 2박 1실 : 2매
요일별 추가요금이 있으므로 하단 요금표를 확인 부탁드립니다."
        />
      </div>

      {/* 참고사항 섹션 */}
      <div style={{
        ...sectionStyle,
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b'
      }}>
        <h4 style={{
          ...sectionTitleStyle,
          color: '#92400e',
          fontSize: '20px'
        }}>
          📋 참고사항
        </h4>
        
        <textarea
          value={bookingData.referenceNotes || `해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.
예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.
취소/변경 위약규정은 아래 하단 참고 부탁드립니다.
부분환불 불가
옵션수량은 대기가능 수량을 의미
현장 상황에 따라 부대시설 휴장 및 운영시간이 변동 될 수 있음
상세페이지와 상품명이 다른 경우 상품명 우선적용
추가요금 발생시 추가금 안내후 예약확정
빠른 확정 문의는 카톡상담 부탁드립니다.`}
          onChange={(e) => handleFieldChange('referenceNotes', e.target.value)}
          style={{
            ...textareaStyle,
            
            maxHeight: 'none',
            height: 'auto',
            overflow: 'visible !important',
            fontSize: '15px',
            lineHeight: '1.8',
            backgroundColor: '#ffffff',
            border: '2px solid #f59e0b',
            borderRadius: '12px',
            padding: '20px',
            resize: 'none !important',
            scrollbarWidth: 'none !important',
            msOverflowStyle: 'none !important',
            display: 'block',
            width: '100%',
            WebkitScrollbar: 'none !important'
          }}
          className="no-scrollbar booking-textarea"
          suppressHydrationWarning={true}
          placeholder="해피콜/문자수신 불가 번호는 예약 및 주문취소 됩니다.
예약확정 후 문자 미수신 사유로 취소시 위약금 적용됩니다.
취소/변경 위약규정은 아래 하단 참고 부탁드립니다.
부분환불 불가
옵션수량은 대기가능 수량을 의미
현장 상황에 따라 부대시설 휴장 및 운영시간이 변동 될 수 있음
상세페이지와 상품명이 다른 경우 상품명 우선적용
추가요금 발생시 추가금 안내후 예약확정
빠른 확정 문의는 카톡상담 부탁드립니다."
        />
      </div>

      {/* 카톡 채널 정보 */}
      <div style={{
        ...sectionStyle,
        backgroundColor: '#fef3c7',
        border: '2px solid #f59e0b'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '20px',
          backgroundColor: '#fbbf24',
          borderRadius: '12px',
          color: '#92400e',
          fontWeight: '600'
        }}>
          <span style={{ fontSize: '24px' }}>💬</span>
          <input
            type="text"
            value={bookingData.kakaoChannel}
            onChange={(e) => handleFieldChange('kakaoChannel', e.target.value)}
            placeholder="카톡에서 한투어 채널 추가하세요 +"
            style={{
              ...inputStyle,
              backgroundColor: 'transparent',
              border: 'none',
              color: '#92400e',
              fontWeight: '600',
              padding: '0',
              fontSize: '16px'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingInfo; 