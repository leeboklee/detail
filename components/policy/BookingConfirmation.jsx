'use client';

import React, { useState, useEffect } from 'react';
import styles from './BookingConfirmation.module.css';

// 기본 데이터 구조
const getDefaultData = () => ({
  notes: [],
  bookingProcess: [],
  specialNotices: [],
  inquiryInfo: []
});

// 데이터 정규화 함수 (컴포넌트 외부로 이동)
const normalizeData = (inputData) => {
  const defaultData = getDefaultData();
  
  if (!inputData || typeof inputData !== 'object') {
    return defaultData;
  }

  return {
    notes: Array.isArray(inputData.notes) ? inputData.notes : defaultData.notes,
    bookingProcess: Array.isArray(inputData.bookingProcess) ? inputData.bookingProcess : defaultData.bookingProcess,
    specialNotices: Array.isArray(inputData.specialNotices) ? inputData.specialNotices : defaultData.specialNotices,
    inquiryInfo: Array.isArray(inputData.inquiryInfo) ? inputData.inquiryInfo : defaultData.inquiryInfo
  };
};

export default function BookingConfirmation({ data, onChange }) {
  // 예약확정 안내 상태 관리
  const [confirmationData, setConfirmationData] = useState(() => normalizeData(data));

  // props 변경 시 상태 업데이트
  useEffect(() => {
    setConfirmationData(normalizeData(data));
  }, [data]);

  // 안내사항 변경 핸들러
  const handleNoteChange = (index, value) => {
    const currentNotes = Array.isArray(confirmationData.notes) ? confirmationData.notes : [];
    const updatedNotes = [...currentNotes];
    updatedNotes[index] = value;
    
    handleChange('notes', updatedNotes);
  };

  // 예약 프로세스 변경 핸들러
  const handleProcessChange = (index, value) => {
    const currentProcess = Array.isArray(confirmationData.bookingProcess) ? confirmationData.bookingProcess : [];
    const updatedProcess = [...currentProcess];
    updatedProcess[index] = value;
    
    handleChange('bookingProcess', updatedProcess);
  };

  // 특별 안내사항 변경 핸들러
  const handleSpecialNoticeChange = (index, value) => {
    const currentNotices = Array.isArray(confirmationData.specialNotices) ? confirmationData.specialNotices : [];
    const updatedNotices = [...currentNotices];
    updatedNotices[index] = value;
    
    handleChange('specialNotices', updatedNotices);
  };

  // 문의 정보 변경 핸들러
  const handleInquiryInfoChange = (index, value) => {
    const currentInfo = Array.isArray(confirmationData.inquiryInfo) ? confirmationData.inquiryInfo : [];
    const updatedInfo = [...currentInfo];
    updatedInfo[index] = value;
    
    handleChange('inquiryInfo', updatedInfo);
  };

  // 변경 핸들러
  const handleChange = (field, value) => {
    const updatedData = { ...confirmationData, [field]: value };
    setConfirmationData(updatedData);
    
    if (typeof onChange === 'function') {
      onChange(updatedData);
    }
  };

  // 항목 추가 핸들러
  const handleAddItem = (field) => {
    const currentArray = Array.isArray(confirmationData[field]) ? confirmationData[field] : [];
    const updatedItems = [...currentArray, ''];
    handleChange(field, updatedItems);
  };

  // 항목 삭제 핸들러
  const handleRemoveItem = (field, index) => {
    const currentArray = Array.isArray(confirmationData[field]) ? confirmationData[field] : [];
    const updatedItems = currentArray.filter((_, i) => i !== index);
    handleChange(field, updatedItems);
  };

  // CSS 모듈 로드 실패 시 사용할 기본 스타일
  const fallbackStyles = {
    confirmationEditor: {
      marginBottom: '2rem',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
      padding: '1.5rem'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: '#1e40af',
      borderBottom: '2px solid #3b82f6',
      paddingBottom: '0.5rem'
    },
    section: {
      marginBottom: '1.5rem',
      backgroundColor: '#f0f9ff',
      padding: '1rem',
      borderRadius: '6px',
      border: '1px solid #bfdbfe'
    },
    sectionTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      marginBottom: '0.75rem',
      color: '#1e40af'
    },
    itemsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    itemRow: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginBottom: '1rem'
    },
    itemInput: {
      width: '100%',
      padding: '12px',
      border: '1px solid #a3bffa',
      borderRadius: '4px',
      fontSize: '0.875rem',
      backgroundColor: 'white',
      minHeight: '80px',
      resize: 'vertical',
      fontFamily: 'inherit',
      lineHeight: '1.5'
    },
    removeButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      cursor: 'pointer'
    },
    addButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '0.5rem 1rem',
      fontSize: '0.875rem',
      cursor: 'pointer',
      marginTop: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  };

  // 안전하게 스타일 사용 (CSS 모듈이 로드되지 않았을 경우 대비)
  const s = styles || {};

  return (
    <div className={s.confirmationEditor || ''} style={!styles ? fallbackStyles.confirmationEditor : null}>
      <h3 className={s.title || ''} style={!styles ? fallbackStyles.title : null}>숙박권 구매안내</h3>
      
      {/* 안내사항 섹션 */}
      <div className={s.section || ''} style={!styles ? fallbackStyles.section : null}>
        <h4 className={s.sectionTitle || ''} style={!styles ? fallbackStyles.sectionTitle : null}>안내사항</h4>
        
        <div className={s.itemsList || ''} style={!styles ? fallbackStyles.itemsList : null}>
          {(confirmationData.notes || []).map((note, index) => (
            <div key={index} className={s.itemRow || ''} style={!styles ? fallbackStyles.itemRow : null}>
              <input
                type="text"
                className={s.itemInput || ''}
                style={!styles ? fallbackStyles.itemInput : null}
                value={note}
                onChange={(e) => handleNoteChange(index, e.target.value)}
              />
              <button
                type="button"
                className={s.removeButton || ''}
                style={!styles ? fallbackStyles.removeButton : null}
                onClick={() => handleRemoveItem('notes', index)}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          className={s.addButton || ''}
          style={!styles ? fallbackStyles.addButton : null}
          onClick={() => handleAddItem('notes')}
        >
          <span>+</span> 항목 추가
        </button>
      </div>
      
      {/* 예약 프로세스 섹션 */}
      <div className={s.section || ''} style={!styles ? fallbackStyles.section : null}>
        <h4 className={s.sectionTitle || ''} style={!styles ? fallbackStyles.sectionTitle : null}>예약 프로세스</h4>
        
        <div className={s.itemsList || ''} style={!styles ? fallbackStyles.itemsList : null}>
          {(confirmationData.bookingProcess || []).map((process, index) => (
            <div key={index} className={s.itemRow || ''} style={!styles ? fallbackStyles.itemRow : null}>
              <input
                type="text"
                className={s.itemInput || ''}
                style={!styles ? fallbackStyles.itemInput : null}
                value={process}
                onChange={(e) => handleProcessChange(index, e.target.value)}
              />
              <button
                type="button"
                className={s.removeButton || ''}
                style={!styles ? fallbackStyles.removeButton : null}
                onClick={() => handleRemoveItem('bookingProcess', index)}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          className={s.addButton || ''}
          style={!styles ? fallbackStyles.addButton : null}
          onClick={() => handleAddItem('bookingProcess')}
        >
          <span>+</span> 항목 추가
        </button>
      </div>
      
      {/* 특별 안내사항 섹션 */}
      <div className={s.section || ''} style={!styles ? fallbackStyles.section : null}>
        <h4 className={s.sectionTitle || ''} style={!styles ? fallbackStyles.sectionTitle : null}>특별 안내사항</h4>
        
        <div className={s.itemsList || ''} style={!styles ? fallbackStyles.itemsList : null}>
          {(confirmationData.specialNotices || []).map((notice, index) => (
            <div key={index} className={s.itemRow || ''} style={!styles ? fallbackStyles.itemRow : null}>
              <input
                type="text"
                className={s.itemInput || ''}
                style={!styles ? fallbackStyles.itemInput : null}
                value={notice}
                onChange={(e) => handleSpecialNoticeChange(index, e.target.value)}
              />
              <button
                type="button"
                className={s.removeButton || ''}
                style={!styles ? fallbackStyles.removeButton : null}
                onClick={() => handleRemoveItem('specialNotices', index)}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          className={s.addButton || ''}
          style={!styles ? fallbackStyles.addButton : null}
          onClick={() => handleAddItem('specialNotices')}
        >
          <span>+</span> 항목 추가
        </button>
      </div>
      
      {/* 문의 정보 섹션 */}
      <div className={s.section || ''} style={!styles ? fallbackStyles.section : null}>
        <h4 className={s.sectionTitle || ''} style={!styles ? fallbackStyles.sectionTitle : null}>참고사항</h4>
        
        <div className={s.itemsList || ''} style={!styles ? fallbackStyles.itemsList : null}>
          {(confirmationData.inquiryInfo || []).map((info, index) => (
            <div key={index} className={s.itemRow || ''} style={!styles ? fallbackStyles.itemRow : null}>
              <input
                type="text"
                className={s.itemInput || ''}
                style={!styles ? fallbackStyles.itemInput : null}
                value={info}
                onChange={(e) => handleInquiryInfoChange(index, e.target.value)}
              />
              <button
                type="button"
                className={s.removeButton || ''}
                style={!styles ? fallbackStyles.removeButton : null}
                onClick={() => handleRemoveItem('inquiryInfo', index)}
              >
                삭제
              </button>
            </div>
          ))}
        </div>
        
        <button
          type="button"
          className={s.addButton || ''}
          style={!styles ? fallbackStyles.addButton : null}
          onClick={() => handleAddItem('inquiryInfo')}
        >
          <span>+</span> 항목 추가
        </button>
      </div>
    </div>
  );
} 