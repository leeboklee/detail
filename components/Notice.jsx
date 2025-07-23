'use client'; // 클라이언트 컴포넌트로 지정

import React from 'react'; // useState, useEffect 제거

/**
 * 호텔 상세 페이지 생성기 - 공지사항 컴포넌트
 * 공지사항 정보 입력 및 관리
 * props:
 *  - data: { title: string, content: string }
 *  - setData: Function to update noticeInfo state
 */
export default function Notice({ data = { title: '', content: '' }, setData }) { // props 이름 변경
  const handleNoticeChange = (field, value) => {
    const updatedNotice = {
      ...data, // data prop 직접 사용
      [field]: value
    };
    
    // 상위 컴포넌트에 변경 알림 (setData 호출)
    if (typeof setData === 'function') {
      setData(updatedNotice);
    } else {
      console.warn('[Notice] setData prop is not a function!');
    }
  };

  // CSS 모듈 로드 실패 시 사용할 기본 스타일
  const fallbackStyles = {
    noticeEditor: {
      marginBottom: '2rem',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      padding: '1.5rem'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: 600,
      marginBottom: '1rem',
      color: '#2c5282',
      borderBottom: '2px solid #edf2f7',
      paddingBottom: '0.5rem'
    },
    formGroup: {
      marginBottom: '1.5rem'
    },
    formLabel: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 500,
      color: '#4a5568'
    },
    formInput: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #cbd5e0',
      borderRadius: '0.375rem',
      fontSize: '0.95rem',
      lineHeight: '1.5',
      transition: 'border-color 0.15s ease-in-out',
      fontFamily: 'inherit'
    },
    formTextarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #cbd5e0',
      borderRadius: '0.375rem',
      fontSize: '0.95rem',
      lineHeight: '1.6',
      resize: 'vertical',
      minHeight: '200px',
      fontFamily: 'inherit',
      transition: 'border-color 0.15s ease-in-out'
    }
  };

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
    minHeight: '200px'
  };

  return (
    <div className="noticeEditor" style={fallbackStyles.noticeEditor}>
      <h3 className="title" style={fallbackStyles.title}>공지사항</h3>
      
      <div className="form-group" style={fallbackStyles.formGroup}>
        <label 
          htmlFor="noticeTitle" 
          style={fallbackStyles.formLabel}
        >
          공지사항 제목
        </label>
        <input
          type="text"
          id="noticeTitle"
          value={data.title || ''} 
          onChange={(e) => handleNoticeChange('title', e.target.value)}
          placeholder="공지사항 제목"
          className="formInput"
          style={fallbackStyles.formInput}
        />
      </div>
      
      <div className="form-group" style={fallbackStyles.formGroup}>
        <label 
          htmlFor="noticeContent"
          style={fallbackStyles.formLabel}
        >
          공지사항 내용
        </label>
        <textarea
          id="noticeContent"
          value={data.content || ''} 
          onChange={(e) => handleNoticeChange('content', e.target.value)}
          placeholder="공지사항 내용을 입력하세요. 각 항목은 줄바꿈으로 구분됩니다."
          className="formTextarea"
          rows="10"
          style={textareaStyle}
        />
        <div style={{ marginTop: '8px', fontSize: '14px', color: '#718096' }}>
          엔터키로 줄바꿈하면 각 줄마다 볼릿 포인트가 적용됩니다.
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="flex gap-4 flex-wrap justify-center">
          <div className="px-4 py-3 bg-blue-100 text-blue-800 rounded-lg flex items-center border border-blue-300">
            <span>💡 입력한 내용은 자동으로 저장됩니다</span>
          </div>
          
          <div className="px-4 py-3 bg-green-100 text-green-800 rounded-lg flex items-center border border-green-300">
            <span>✅ CRUD 관리에서 전체 템플릿을 저장하세요</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
// 기존 UINotice = { ... } 와 window.UINotice = UINotice; 코드는 삭제 또는 주석 처리.
*/
