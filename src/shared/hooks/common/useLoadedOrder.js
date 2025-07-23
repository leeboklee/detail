'use client';

import { useEffect, useState } from 'react';

/**
 * 로드된 섹션 순서를 관리하는 커스텀 훅
 * @param {Array} sections - 현재 섹션 배열
 * @param {Array} defaultOrder - 기본 섹션 순서 배열
 * @returns {Array} - 로드되거나 기본 순서로 정렬된 섹션 배열
 */
export function useLoadedOrder(sections, defaultOrder) {
  const [loadedSections, setLoadedSections] = useState(defaultOrder || []);

  useEffect(() => {
    console.log('[useLoadedOrder] 입력값:', sections);
    
    if (sections && Array.isArray(sections) && sections.length > 0) {
      setLoadedSections(sections);
    } else if (defaultOrder && Array.isArray(defaultOrder) && defaultOrder.length > 0) {
      setLoadedSections(defaultOrder);
    } else {
      setLoadedSections([]);
    }
  }, [sections, defaultOrder]);

  return loadedSections;
} 