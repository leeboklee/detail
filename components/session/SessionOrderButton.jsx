import React from 'react';
import { useCallback } from 'react';
import { useAppContext } from '../../context/AppContext';

/**
 * 섹션 순서 버튼 컴포넌트
 * @param {Object} section - 현재 섹션 정보
 */
const SessionOrderButton = ({ section, sectionId }) => {
  const { 
    updateSectionVisibility, 
    moveSectionUp, 
    moveSectionDown,
    sections = []
  } = useAppContext();

  // 현재 섹션 정보 가져오기
  const currentSection = section || sections.find(s => s.id === sectionId);
  const currentSectionId = currentSection?.id || sectionId;

  // 섹션 가시성 토글
  const toggleVisibility = useCallback(() => {
    if (!currentSectionId) return;
    updateSectionVisibility(currentSectionId, !currentSection?.visible);
  }, [currentSection, currentSectionId, updateSectionVisibility]);

  // 섹션 위로 이동
  const handleMoveUp = useCallback(() => {
    if (!currentSectionId) return;
    moveSectionUp(currentSectionId);
  }, [currentSectionId, moveSectionUp]);

  // 섹션 아래로 이동  
  const handleMoveDown = useCallback(() => {
    if (!currentSectionId) return;
    moveSectionDown(currentSectionId);
  }, [currentSectionId, moveSectionDown]);

  // 현재 섹션의 위치 확인
  const visibleSections = sections.filter(s => s.visible).sort((a, b) => a.order - b.order);
  const currentIndex = visibleSections.findIndex(s => s.id === currentSectionId);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === visibleSections.length - 1;

  return (
    <div className="flex gap-1 items-center">
      {/* 순서 변경 버튼들 */}
      <button 
        className={`px-2 py-1 text-xs rounded ${
          isFirst 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        onClick={handleMoveUp}
        disabled={isFirst || !currentSectionId}
        title="위로 이동"
      >
        ↑
      </button>
      
      <button 
        className={`px-2 py-1 text-xs rounded ${
          isLast 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        onClick={handleMoveDown}
        disabled={isLast || !currentSectionId}
        title="아래로 이동"
      >
        ↓
      </button>
      
      {/* 가시성 토글 버튼 */}
      <button 
        className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
        onClick={toggleVisibility}
        disabled={!currentSectionId}
        title={currentSection?.visible ? '섹션 숨기기' : '섹션 보이기'}
      >
        {currentSection?.visible ? '숨기기' : '보이기'}
      </button>
    </div>
  );
};

export default SessionOrderButton; 