'use client';

import React, { useState } from 'react';

/**
 * 예약 확정 안내 컴포넌트 - app/page.js의 bookingInfo 상태 직접 사용
 * props:
 *  - data: { content: string, reference: string } (bookingInfo 상태)
 *  - setData: Function to update bookingInfo state
 */
const BookingInfo = ({ data = { content: '', reference: '' }, setData }) => {
  
  // 확장된 예약 정보 상태
  const [bookingData, setBookingData] = useState({
    content: data.content || '',
    reference: data.reference || '',
    reservationMethod: data.reservationMethod || '',
    paymentMethods: data.paymentMethods || [],
    confirmationTime: data.confirmationTime || '',
    specialRequests: data.specialRequests || '',
    contactInfo: data.contactInfo || {
      phone: '',
      email: '',
      website: ''
    },
    policies: data.policies || [],
    notes: data.notes || []
  });

  const handleFieldChange = (field, value) => {
    const updatedData = {
      ...bookingData,
      [field]: value
    };
    setBookingData(updatedData);
    
    if (typeof setData === 'function') {
      setData(updatedData);
    }
  };

  const handleContactInfoChange = (field, value) => {
    const updatedContactInfo = {
      ...bookingData.contactInfo,
      [field]: value
    };
    const updatedData = {
      ...bookingData,
      contactInfo: updatedContactInfo
    };
    setBookingData(updatedData);
    
    if (typeof setData === 'function') {
      setData(updatedData);
    }
  };

  const handleAddPolicy = () => {
    const updatedPolicies = [...bookingData.policies, ''];
    handleFieldChange('policies', updatedPolicies);
  };

  const handleRemovePolicy = (index) => {
    const updatedPolicies = bookingData.policies.filter((_, i) => i !== index);
    handleFieldChange('policies', updatedPolicies);
  };

  const handlePolicyChange = (index, value) => {
    const updatedPolicies = [...bookingData.policies];
    updatedPolicies[index] = value;
    handleFieldChange('policies', updatedPolicies);
  };

  const handleAddNote = () => {
    const updatedNotes = [...bookingData.notes, ''];
    handleFieldChange('notes', updatedNotes);
  };

  const handleRemoveNote = (index) => {
    const updatedNotes = bookingData.notes.filter((_, i) => i !== index);
    handleFieldChange('notes', updatedNotes);
  };

  const handleNoteChange = (index, value) => {
    const updatedNotes = [...bookingData.notes];
    updatedNotes[index] = value;
    handleFieldChange('notes', updatedNotes);
  };
  
  const handleContentChange = (e) => {
    handleFieldChange('content', e.target.value);
  };

  const handleReferenceChange = (e) => {
    handleFieldChange('reference', e.target.value);
  };

  // 입력 필드 공통 스타일
  const textareaStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #cbd5e0',
    borderRadius: '4px',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    resize: 'vertical',
    fontFamily: 'inherit',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    minHeight: '150px',
    marginBottom: '20px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #cbd5e0',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'inherit'
  };

  const sectionHeadingStyle = {
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333'
  };

  return (
    <div className="booking-container space-y-6">
      <h3 className="text-xl font-semibold">📞 예약 안내</h3>
      
      {/* 예약 방법 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-blue-800">📋 예약 방법</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">예약 방법</label>
            <input
              type="text"
              value={bookingData.reservationMethod}
              onChange={(e) => handleFieldChange('reservationMethod', e.target.value)}
              placeholder="예: 온라인 예약 시스템, 전화 예약"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">확인 소요 시간</label>
            <input
              type="text"
              value={bookingData.confirmationTime}
              onChange={(e) => handleFieldChange('confirmationTime', e.target.value)}
              placeholder="예: 예약 후 24시간 이내 확인"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-green-800">📞 연락처 정보</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">전화번호</label>
            <input
              type="text"
              value={bookingData.contactInfo.phone}
              onChange={(e) => handleContactInfoChange('phone', e.target.value)}
              placeholder="예: 02-1234-5678"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              value={bookingData.contactInfo.email}
              onChange={(e) => handleContactInfoChange('email', e.target.value)}
              placeholder="예: info@hotel.com"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">웹사이트</label>
            <input
              type="url"
              value={bookingData.contactInfo.website}
              onChange={(e) => handleContactInfoChange('website', e.target.value)}
              placeholder="예: https://hotel.com"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* 예약 정책 */}
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-yellow-800">📋 예약 정책</h4>
        {bookingData.policies.map((policy, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={policy}
              onChange={(e) => handlePolicyChange(index, e.target.value)}
              placeholder="예: 체크인 시 신분증 지참 필수"
              className="flex-1"
              style={inputStyle}
            />
            <button
              onClick={() => handleRemovePolicy(index)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        ))}
        <button
          onClick={handleAddPolicy}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          + 정책 추가
        </button>
      </div>

      {/* 특별 요청 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">특별 요청 안내</label>
        <textarea
          value={bookingData.specialRequests}
          onChange={(e) => handleFieldChange('specialRequests', e.target.value)}
          placeholder="예: 체크인 시 요청사항 전달 가능, 특별한 요청은 미리 연락 바랍니다."
          style={{...textareaStyle, minHeight: '100px'}}
        />
      </div>

      {/* 기존 필드들 */}
      <div className="mb-4">
        <p style={sectionHeadingStyle}>예약 확정 안내</p>
        <p className="text-muted mb-2">예약 확정 후 고객에게 안내하는 내용을 입력하세요.</p>
        <textarea
          value={bookingData.content}
          onChange={handleContentChange}
          rows={6}
          className="form-control"
          placeholder="예시: 예약 확정 안내 이메일이 발송됩니다. 예약번호를 반드시 확인해주세요."
          style={textareaStyle}
        />
      </div>
      
      <div className="mb-4">
        <p style={sectionHeadingStyle}>참고사항</p>
        <p className="text-muted mb-2">고객이 알아두어야 할 추가 참고사항을 입력하세요.</p>
        <textarea
          value={bookingData.reference}
          onChange={handleReferenceChange}
          rows={6}
          className="form-control"
          placeholder="예시: 해당 상품은 기준 인원 초과 시 추가 요금이 부과됩니다. 현장에서 객실/패키지 변경 불가."
          style={textareaStyle}
        />
      </div>

      {/* 추가 안내사항 */}
      <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
        <h4 className="text-lg font-semibold mb-3 text-purple-800">📝 추가 안내사항</h4>
        {bookingData.notes.map((note, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={note}
              onChange={(e) => handleNoteChange(index, e.target.value)}
              placeholder="예: 주차 공간 제한으로 사전 예약 필요"
              className="flex-1"
              style={inputStyle}
            />
            <button
              onClick={() => handleRemoveNote(index)}
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              삭제
            </button>
          </div>
        ))}
        <button
          onClick={handleAddNote}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          + 안내사항 추가
        </button>
      </div>
    </div>
  );
};

export default BookingInfo; 