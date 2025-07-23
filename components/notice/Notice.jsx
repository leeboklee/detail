'use client';

import React from 'react';
import styles from './Notice.module.css';
import useNoticeManager from '@/hooks/useNoticeManager';

/**
 * 호텔 상세 페이지 생성기 - 공지사항 컴포넌트
 * 공지사항 정보 입력 및 관리
 */
export default function Notice({ data = [], onChange }) {
  const [saveMessage, setSaveMessage] = React.useState('');
  
  // 공통 훅으로 상태/핸들러 관리
  const {
    notices,
    newNotice,
    setNewNotice,
    handleAddNotice,
    handleRemoveNotice,
    handleUpdateNotice,
    handleKeyPress
  } = useNoticeManager(data, onChange);
  
  // 저장 메시지 표시
  React.useEffect(() => {
    if (notices.length > 0) {
      setSaveMessage('✅ 공지사항이 저장되었습니다');
      const timer = setTimeout(() => setSaveMessage(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [notices]);

  // 안전하게 스타일 사용 (CSS 모듈이 로드되지 않았을 경우 대비)
  const s = styles || {};

  return (
    <div className={s.noticeEditor || ''}>
      <h3 className={s.title || ''}>공지사항</h3>
      
      {saveMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded border border-green-300">
          {saveMessage}
        </div>
      )}
      {notices.length === 0 ? (
        <div className={s.emptyState || ''}>등록된 공지사항이 없습니다</div>
      ) : (
        <div className={s.noticesContainer || ''}>
          {notices.map((notice, index) => (
            notice && typeof notice === 'object' ? (
              <div key={index} className={s.noticeItem || ''}>
                <input
                  className={s.noticeInput || ''}
                  type="text"
                  value={notice.content || ''}
                  onChange={e => handleUpdateNotice(index, e.target.value)}
                  placeholder="공지사항 내용"
                />
                <button className={s.removeButton || ''} onClick={() => handleRemoveNotice(index)}>삭제</button>
              </div>
            ) : null
          ))}
        </div>
      )}
      <div className={s.addNoticeContainer || ''}>
        <input
          className={s.addNoticeInput || ''}
          type="text"
          value={newNotice}
          onChange={e => setNewNotice(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="새 공지사항 입력"
        />
        <button 
          className={s.addButton || ''} 
          id="addNoticeBtn"
          onClick={handleAddNotice}
          aria-label="새 공지사항 추가"
          data-testid="add-notice-button"
          style={{ zIndex: 1 }}
        >
          ➕추가
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="flex gap-4 flex-wrap justify-center">
          <div className="px-4 py-3 bg-blue-100 text-blue-800 rounded-lg flex items-center border border-blue-300">
            <span>💡 현재 {notices.length}개 공지사항 등록됨</span>
          </div>
          
          <div className="px-4 py-3 bg-green-100 text-green-800 rounded-lg flex items-center border border-green-300">
            <span>✅ CRUD 관리에서 전체 템플릿을 저장하세요</span>
          </div>
        </div>
      </div>
    </div>
  );
} 