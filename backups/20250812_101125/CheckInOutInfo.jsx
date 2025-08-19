'use client';

import React from 'react';

/**
 * 체크인/아웃 정보 컴포넌트 - app/page.js의 checkinInfo 상태 직접 사용
 * props:
 *  - data: { checkInTime: string, checkOutTime: string, additionalInfo: string }
 *  - setData: Function to update checkinInfo state
 */
const CheckInOutInfo = ({ data = { checkInTime: '', checkOutTime: '', additionalInfo: '' }, setData }) => { // props 이름 변경
  
  const handleChange = (field, value) => {
    console.log(`체크인/아웃 정보 변경: ${field} = ${value}`);
    const newData = { ...data, [field]: value }; // data prop 직접 사용
    
    if (typeof setData === 'function') {
      setData(newData);
    } else {
      console.warn('[CheckInOutInfo] setData prop is not a function!');
    }
  };

  // 시간 형식 변환 함수
  const parseTimeValue = (timeString) => {
    if (!timeString) return '';
    // "14:00" 형식에서 시간만 추출
    return timeString.split(':')[0] || '';
  };

  // 시간 형식으로 변환하는 함수
  const formatTimeValue = (hourValue) => {
    if (!hourValue || hourValue === '') return '';
    const hour = parseInt(hourValue);
    if (isNaN(hour) || hour < 0 || hour > 24) return '';
    return `${String(hour).padStart(2, '0')}:00`;
  };

  // 숫자 입력 처리
  const handleTimeChange = (field, value) => {
    console.log(`시간 입력 변경: ${field} = ${value}`);
    
    // 빈 값 허용
    if (value === '') {
      handleChange(field, '');
      return;
    }
    
    // 숫자만 허용하는 검증
    if (!/^\d+$/.test(value)) {
      console.warn(`숫자만 입력 가능합니다: ${value}`);
      return;
    }
    
    const numericValue = parseInt(value);
    
    // 0-24 범위 검증
    if (numericValue < 0 || numericValue > 24) {
      console.warn(`0-24 사이의 숫자만 입력 가능합니다: ${numericValue}`);
      return;
    }
    
    // 시간 형식으로 변환하여 저장
    const formattedTime = formatTimeValue(value);
    handleChange(field, formattedTime);
  };

  return (
    <div className="checkin-container">
      <h3>체크인/체크아웃 정보</h3>
      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">체크인 시간 (시)</label>
          <input
            type="number"
            min="0"
            max="24"
            step="1"
            placeholder="예: 14 (14시)"
            value={parseTimeValue(data.checkInTime)}
            onChange={(e) => handleTimeChange('checkInTime', e.target.value)}
            className="form-control"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <small className="text-muted">0~24 사이의 숫자로 입력해주세요 (24시간 형식)</small>
        </div>
        <div className="col-md-6">
          <label className="form-label">체크아웃 시간 (시)</label>
          <input
            type="number"
            min="0"
            max="24"
            step="1"
            placeholder="예: 11 (11시)"
            value={parseTimeValue(data.checkOutTime)}
            onChange={(e) => handleTimeChange('checkOutTime', e.target.value)}
            className="form-control"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #cbd5e0',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
          <small className="text-muted">0~24 사이의 숫자로 입력해주세요 (24시간 형식)</small>
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">추가 안내사항</label>
        <textarea
          value={data.additionalInfo || ''} // data prop 직접 사용
          onChange={(e) => handleChange('additionalInfo', e.target.value)}
          rows={4}
          className="form-control"
          placeholder="체크인/아웃 관련 추가 안내사항을 입력하세요."
          style={{
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
            
          }}
        />
      </div>
    </div>
  );
};

export default CheckInOutInfo; 