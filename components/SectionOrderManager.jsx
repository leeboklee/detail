'use client';

import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import styles from './SectionOrderManager.module.css';

// 공통 섹션 컨트롤러 컴포넌트
export default function SectionOrderManager() {
  const { 
    sections, 
    handleSaveSectionOrder, 
    handleMoveSection, 
    handleToggleSection 
  } = useAppContext();
  
  const [sectionItems, setSectionItems] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false); // 아코디언 상태 추가

  // sections 변경시 상태 업데이트
  useEffect(() => {
    if (Array.isArray(sections) && sections.length > 0) {
      // order 속성 기준으로 정렬하여 상태 설정
      const sortedSections = [...sections].sort((a, b) => (a.order || 0) - (b.order || 0));
      setSectionItems(sortedSections);
    }
  }, [sections]);

  // 접기/펼치기 토글 핸들러
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={styles.container || 'container'} style={{ marginBottom: '1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
      <div 
        className={styles.headerBar || 'header-bar'} 
        onClick={toggleExpand}
        style={{ 
          padding: '0.75rem 1rem',
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          backgroundColor: '#f1f5f9',
          borderRadius: '0.5rem 0.5rem 0 0'
        }}
      >
        <h3 className={styles.title || 'title'} style={{ margin: 0, fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🔄 섹션 순서 및 표시 관리
      </h3>
        <span style={{ fontSize: '1.2rem' }}>
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      
      {isExpanded && (
        <div style={{ padding: '1rem' }}>
          <div style={{ margin: '0 0 0.75rem 0', padding: '0.75rem', backgroundColor: '#e0f2fe', borderRadius: '0.375rem', border: '1px solid #0891b2' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', color: '#0c4a6e', fontWeight: '600' }}>
              📝 미리보기 섹션 순서 관리
            </p>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#0e7490' }}>
              ✅ 체크박스로 표시/숨김 전환 • ⬆️⬇️ 위/아래 버튼으로 순서 조정 • 💾 변경사항 저장 필수
            </p>
          </div>
          
          <div className={styles.sectionsList || 'sections-list'} style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {sectionItems.map((section, index) => (
          <div 
            key={section.id} 
                className={`${styles.sectionItem || 'section-item'} ${index === sectionItems.length - 1 ? (styles.sectionItemLast || 'section-item-last') : ''}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.5rem',
                  margin: '0.25rem 0',
                  backgroundColor: section.visible ? '#f0f9ff' : '#f1f1f1',
                  borderRadius: '0.25rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div className={styles.sectionInfo || 'section-info'} style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id={`toggle-${section.id}`}
                    checked={section.visible}
                    onChange={() => handleToggleSection(section.id)}
                    className={styles.checkbox || 'checkbox'}
                    style={{ marginRight: '0.5rem' }}
              />
              <label 
                htmlFor={`toggle-${section.id}`}
                    className={styles.sectionName || 'section-name'}
                    style={{ fontSize: '0.875rem', color: section.visible ? '#2c5282' : '#777', marginLeft: '0.25rem' }}
              >
                    {section.visible ? '✅ ' : '❌ '}
                    {section.title || section.name} {!section.visible && '(숨김)'}
              </label>
            </div>
                <div className={styles.sectionControls || 'section-controls'}>
              <button
                type="button"
                disabled={index === 0}
                    onClick={() => handleMoveSection(section.id, 'up')}
                    className={styles.moveButton || 'move-button'}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: index === 0 ? '#eee' : '#e2e8f0',
                      border: 'none',
                      borderRadius: '0.25rem',
                      marginRight: '0.25rem',
                      cursor: index === 0 ? 'default' : 'pointer',
                      color: index === 0 ? '#aaa' : '#333'
                    }}
              >
                ↑
              </button>
              <button
                type="button"
                disabled={index === sectionItems.length - 1}
                    onClick={() => handleMoveSection(section.id, 'down')}
                    className={styles.moveButton || 'move-button'}
                    style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: index === sectionItems.length - 1 ? '#eee' : '#e2e8f0',
                      border: 'none',
                      borderRadius: '0.25rem',
                      cursor: index === sectionItems.length - 1 ? 'default' : 'pointer',
                      color: index === sectionItems.length - 1 ? '#aaa' : '#333'
                    }}
              >
                ↓
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <button
        type="button"
            className={styles.saveButton || 'save-button'}
            onClick={handleSaveSectionOrder}
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#047857';
              e.target.style.transform = 'translateY(-1px)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#059669';
              e.target.style.transform = 'translateY(0)';
            }}
      >
        💾 섹션 순서 저장하기
      </button>
        </div>
      )}
    </div>
  );
}