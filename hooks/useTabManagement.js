import { useState, useCallback, useEffect } from 'react';

// 탭 설정
const TAB_CONFIG = [
  { key: 'hotel', label: '호텔 정보', icon: '🏠', displayType: 'modal' },
  { key: 'rooms', label: '객실 정보', icon: '👥', displayType: 'modal' },
  { key: 'facilities', label: '시설 정보', icon: '⚙️', displayType: 'inline' },
  { key: 'checkin', label: '체크인/아웃', icon: '📅', displayType: 'inline' },
  { key: 'packages', label: '패키지', icon: '📄', displayType: 'modal' },
  { key: 'pricing', label: '요금표', icon: '💰', displayType: 'modal' },
  { key: 'cancel', label: '취소규정', icon: '🛡️', displayType: 'inline' },
  { key: 'booking', label: '예약안내', icon: '🗄️', displayType: 'inline' },
  { key: 'notices', label: '공지사항', icon: '📄', displayType: 'modal' }
];

export const useTabManagement = () => {
  const [activeTab, setActiveTab] = useState('hotel');
  const [tabOrder, setTabOrder] = useState(TAB_CONFIG.map(tab => tab.key));
  const [isDragMode, setIsDragMode] = useState(false);

  // 마운트 시 로컬 스토리지에서 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // activeTab 복원
      const savedActiveTab = localStorage.getItem('activeTab');
      if (savedActiveTab && TAB_CONFIG.some(tab => tab.key === savedActiveTab)) {
        setActiveTab(savedActiveTab);
      }

      // tabOrder 복원
      const savedOrder = localStorage.getItem('tabOrder');
      if (savedOrder) {
        try {
          const parsed = JSON.parse(savedOrder);
          if (Array.isArray(parsed) && parsed.length === TAB_CONFIG.length) {
            // 모든 탭이 포함되어 있는지 확인
            const isValidOrder = TAB_CONFIG.every(tab => parsed.includes(tab.key));
            if (isValidOrder) {
              setTabOrder(parsed);
            }
          }
        } catch (error) {
          console.warn('탭 순서 복원 실패:', error);
        }
      }
    }
  }, []);

  // activeTab 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTab', activeTab);
    }
  }, [activeTab]);

  // tabOrder 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tabOrder', JSON.stringify(tabOrder));
    }
  }, [tabOrder]);

  // 탭 활성화 함수
  const activateTab = useCallback((tabKey) => {
    if (TAB_CONFIG.some(tab => tab.key === tabKey)) {
      setActiveTab(tabKey);
    }
  }, []);

  // 탭 순서 변경 함수
  const moveTab = useCallback((fromIndex, toIndex) => {
    setTabOrder(prev => {
      const newOrder = [...prev];
      const [movedTab] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedTab);
      return newOrder;
    });
  }, []);

  // 탭 순서 초기화 함수
  const resetTabOrder = useCallback(() => {
    setTabOrder(TAB_CONFIG.map(tab => tab.key));
  }, []);

  // 드래그 모드 토글 함수
  const toggleDragMode = useCallback(() => {
    setIsDragMode(prev => !prev);
  }, []);

  // 현재 활성 탭 정보 가져오기
  const getActiveTabInfo = useCallback(() => {
    return TAB_CONFIG.find(tab => tab.key === activeTab);
  }, [activeTab]);

  // 특정 탭 정보 가져오기
  const getTabInfo = useCallback((tabKey) => {
    return TAB_CONFIG.find(tab => tab.key === tabKey);
  }, []);

  // 정렬된 탭 목록 가져오기
  const getOrderedTabs = useCallback(() => {
    return tabOrder.map(tabKey => TAB_CONFIG.find(tab => tab.key === tabKey));
  }, [tabOrder]);

  // 탭이 모달 타입인지 확인
  const isModalTab = useCallback((tabKey) => {
    const tab = TAB_CONFIG.find(tab => tab.key === tabKey);
    return tab?.displayType === 'modal';
  }, []);

  // 탭이 인라인 타입인지 확인
  const isInlineTab = useCallback((tabKey) => {
    const tab = TAB_CONFIG.find(tab => tab.key === tabKey);
    return tab?.displayType === 'inline';
  }, []);

  // 다음 탭으로 이동
  const goToNextTab = useCallback(() => {
    setTabOrder(prev => {
      const currentIndex = prev.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % prev.length;
      const nextTab = prev[nextIndex];
      setActiveTab(nextTab);
      return prev;
    });
  }, [activeTab]);

  // 이전 탭으로 이동
  const goToPreviousTab = useCallback(() => {
    setTabOrder(prev => {
      const currentIndex = prev.indexOf(activeTab);
      const prevIndex = currentIndex === 0 ? prev.length - 1 : currentIndex - 1;
      const prevTab = prev[prevIndex];
      setActiveTab(prevTab);
      return prev;
    });
  }, [activeTab]);

  // 특정 탭으로 점프 (키보드 단축키용)
  const jumpToTab = useCallback((tabKey) => {
    if (TAB_CONFIG.some(tab => tab.key === tabKey)) {
      setActiveTab(tabKey);
    }
  }, []);

  // 탭 상태 검증
  const validateTabState = useCallback(() => {
    const errors = [];
    
    // 모든 필수 탭이 tabOrder에 포함되어 있는지 확인
    const missingTabs = TAB_CONFIG.filter(tab => !tabOrder.includes(tab.key));
    if (missingTabs.length > 0) {
      errors.push(`누락된 탭: ${missingTabs.map(tab => tab.label).join(', ')}`);
    }

    // 중복된 탭이 없는지 확인
    const duplicates = tabOrder.filter((tab, index) => tabOrder.indexOf(tab) !== index);
    if (duplicates.length > 0) {
      errors.push(`중복된 탭: ${duplicates.join(', ')}`);
    }

    // activeTab이 유효한지 확인
    if (!TAB_CONFIG.some(tab => tab.key === activeTab)) {
      errors.push(`유효하지 않은 활성 탭: ${activeTab}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [activeTab, tabOrder]);

  // 탭 통계 정보
  const getTabStats = useCallback(() => {
    const totalTabs = TAB_CONFIG.length;
    const modalTabs = TAB_CONFIG.filter(tab => tab.displayType === 'modal').length;
    const inlineTabs = TAB_CONFIG.filter(tab => tab.displayType === 'inline').length;
    
    return {
      total: totalTabs,
      modal: modalTabs,
      inline: inlineTabs,
      current: activeTab,
      currentIndex: tabOrder.indexOf(activeTab) + 1
    };
  }, [activeTab, tabOrder]);

  return {
    // 상태
    activeTab,
    tabOrder,
    isDragMode,
    
    // 액션
    activateTab,
    moveTab,
    resetTabOrder,
    toggleDragMode,
    goToNextTab,
    goToPreviousTab,
    jumpToTab,
    
    // 정보 가져오기
    getActiveTabInfo,
    getTabInfo,
    getOrderedTabs,
    getTabStats,
    
    // 유틸리티
    isModalTab,
    isInlineTab,
    validateTabState,
    
    // 상수
    TAB_CONFIG
  };
};
