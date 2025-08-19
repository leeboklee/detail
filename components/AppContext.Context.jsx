'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TEMPLATES, SECTIONS } from '../src/shared/constants';

const AppContext = createContext({
  // 기본 상태
  isHydrated: false,
  selectedTemplate: 'default',
  setSelectedTemplate: () => {},
  templates: TEMPLATES,
  
  // 호텔 정보
  hotelInfo: {},
  setHotelInfo: () => {},
  
  // 템플릿 관리
  saveTemplate: () => {},
  deleteTemplate: () => {},
  loadTemplate: () => {},
  
  // 섹션 관리
  sections: SECTIONS,
  handleSaveSectionOrder: () => {},
  handleMoveSection: () => {},
  handleToggleSection: () => {},
  
  // 데이터베이스 관리
  templateList: [],
  loadHotelDetails: () => {},
  loadTemplateList: () => {},
  isContextLoading: false,
  
  // 호텔 데이터
  hotelData: {},
  updateCancel: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
  // 기본 상태
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [templates, setTemplates] = useState(TEMPLATES);
  const [sections, setSections] = useState(SECTIONS);
  
  // 호텔 정보
  const [hotelInfo, setHotelInfo] = useState({});
  const [layoutInfo, setLayoutInfo] = useState({
    template: 'card', // card, list, grid, minimal
    theme: 'light', // light, dark, brand
    fontFamily: 'sans', // sans, serif, mono
    spacing: 'normal', // compact, normal, spacious
    responsive: true, // 반응형 여부
    sectionTemplates: {}, // 섹션별 템플릿 설정
    colors: {
      primary: '#3B82F6',
      secondary: '#6B7280',
      background: '#FFFFFF',
      text: '#1F2937'
    }
  });
  const [hotelData, setHotelData] = useState({});
  
  // 예약안내 정보
  const [bookingInfo, setBookingInfo] = useState({});
  
  // 데이터베이스 타입
  const [databaseType, setDatabaseType] = useState('sqlite');
  
  // 데이터베이스 관련
  const [templateList, setTemplateList] = useState([]);
  const [isContextLoading, setIsContextLoading] = useState(false);

  // 하이드레이션 처리
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Window is available, running in browser environment');
      console.log('localStorage is available');
      
      try {
        // 저장된 템플릿 불러오기
        const savedTemplates = localStorage.getItem('hotelTemplates');
        if (savedTemplates) {
          const parsedTemplates = JSON.parse(savedTemplates);
          setTemplates(currentTemplates => ({ ...currentTemplates, ...parsedTemplates }));
        }
        
        // 저장된 섹션 불러오기
        const savedSections = localStorage.getItem('sections');
        if (savedSections) {
          const parsedSections = JSON.parse(savedSections);
          if (Array.isArray(parsedSections)) {
            setSections(parsedSections);
          }
        }

        // 하이드레이션 완료
        if (!isHydrated) {
          setIsHydrated(true);
          // body에 하이드레이션 완료 클래스 추가
          if (typeof document !== 'undefined') {
            document.body.classList.add('hydration-complete');
          }
        }
      } catch (error) {
        console.error("Failed to parse from localStorage", error);
      }
    }
  }, [isHydrated]);

  // 템플릿 저장
  const saveTemplate = useCallback((name, data) => {
    if (typeof window !== 'undefined') {
      const newTemplates = { ...templates, [name]: data };
      setTemplates(newTemplates);
      localStorage.setItem('hotelTemplates', JSON.stringify(newTemplates));
      return true;
    }
    return false;
  }, [templates]);

  // 템플릿 삭제
  const deleteTemplate = useCallback((name) => {
    if (typeof window !== 'undefined') {
      const newTemplates = { ...templates };
      delete newTemplates[name];
      setTemplates(newTemplates);
      localStorage.setItem('hotelTemplates', JSON.stringify(newTemplates));
      return true;
    }
    return false;
  }, [templates]);

  // 템플릿 로드
  const loadTemplate = useCallback((name) => {
    if (typeof window !== 'undefined') {
      const template = templates[name];
      if (template) {
        setHotelInfo(template);
        return template;
      }
    }
    return null;
  }, [templates]);

  // 호텔 정보 업데이트
  const updateHotelInfo = useCallback((name, value) => {
    if (typeof name === 'object' && name !== null) {
      // 객체 전체 업데이트
      setHotelInfo(prevInfo => ({...prevInfo, ...name}));
    } else {
      // 개별 필드 업데이트 (name, value 형태)
      setHotelInfo(prevInfo => ({...prevInfo, [name]: value}));
    }
  }, []);

  // 레이아웃 정보 업데이트
  const updateLayoutInfo = useCallback((name, value) => {
    if (typeof name === 'object' && name !== null) {
      // 객체 전체 업데이트
      setLayoutInfo(prevInfo => ({...prevInfo, ...name}));
    } else {
      // 개별 필드 업데이트 (name, value 형태)
      setLayoutInfo(prevInfo => ({...prevInfo, [name]: value}));
    }
  }, []);

  // 섹션 순서 저장
  const handleSaveSectionOrder = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sections', JSON.stringify(sections));
      alert('섹션 순서가 저장되었습니다.');
    }
  }, [sections]);

  // 섹션 이동
  const handleMoveSection = useCallback((id, direction) => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      const index = newSections.findIndex(s => s.id === id);
      if (index === -1) return newSections;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newSections.length) return newSections;
      
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      
      return newSections.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  // 섹션 토글
  const handleToggleSection = useCallback((id) => {
    setSections(prevSections =>
      prevSections.map(s =>
        s.id === id ? { ...s, visible: !s.visible } : s
      )
    );
  }, []);

  // 호텔 상세 정보 로드
  const loadHotelDetails = useCallback(async (templateId) => {
    if (!templateId) {
      console.warn('templateId가 제공되지 않았습니다');
      return null;
    }
    
    setIsContextLoading(true);
    try {
      const response = await fetch(`/api/hotels/${templateId}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`호텔 정보 로드 실패 (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      const hotel = result.data || result.hotel || result;
      
      if (!hotel) {
        console.warn('호텔 데이터가 비어있습니다');
        return null;
      }
      
      setHotelData(hotel);
      setHotelInfo(hotel);
      return hotel;
    } catch (error) {
      console.error('호텔 정보 로드 오류:', error);
      // 사용자에게 보여줄 친화적인 메시지
      if (error.message.includes('Failed to fetch')) {
        console.error('네트워크 연결을 확인해주세요');
      }
      return null; // throw 대신 null 반환으로 앱이 멈추지 않도록
    } finally {
      setIsContextLoading(false);
    }
  }, []);

  // 템플릿 목록 로드
  const loadTemplateList = useCallback(async () => {
    setIsContextLoading(true);
    try {
      const response = await fetch('/api/hotels');
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`템플릿 목록 로드 실패 (${response.status}): ${errorText}`);
      }
      
      const result = await response.json();
      const hotels = result.data || result;
      
      if (!Array.isArray(hotels)) {
        console.warn('호텔 목록이 배열이 아닙니다:', hotels);
        setTemplateList([]);
        return [];
      }
      
      const templateList = hotels.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        hotelName: hotel.name,
        packageName: hotel.packages?.[0]?.name || '표준 PKG',
        fullName: `${hotel.name} ${hotel.packages?.[0]?.name || '표준 PKG'}`,
        lastModified: hotel.updatedAt || hotel.createdAt,
        data: hotel
      }));
      
      setTemplateList(templateList);
      return templateList;
    } catch (error) {
      console.error('템플릿 목록 로드 오류:', error);
      // 사용자에게 친화적인 메시지
      if (error.message.includes('Failed to fetch')) {
        console.error('네트워크 연결을 확인해주세요');
      }
      setTemplateList([]); // 빈 배열로 초기화
      return []; // throw 대신 빈 배열 반환
    } finally {
      setIsContextLoading(false);
    }
  }, []);

  // 취소 정책 업데이트
  const updateCancel = useCallback((cancelData) => {
    setHotelData(prev => ({
      ...prev,
      cancelPolicy: cancelData
    }));
  }, []);

  const value = {
    // 기본 상태
    isHydrated,
    selectedTemplate,
    setSelectedTemplate,
    templates,
    
    // 호텔 정보
    hotelInfo,
    setHotelInfo: updateHotelInfo,
    layoutInfo,
    setLayoutInfo: updateLayoutInfo,
    hotelData,
    updateCancel,
    
    // 예약안내 정보
    bookingInfo,
    setBookingInfo,
    
    // 템플릿 관리
    saveTemplate,
    deleteTemplate,
    loadTemplate,
    
    // 섹션 관리
    sections,
    handleSaveSectionOrder,
    handleMoveSection,
    handleToggleSection,
    
    // 데이터베이스 관리
    templateList,
    loadHotelDetails,
    loadTemplateList,
    isContextLoading,
    databaseType,
    setDatabaseType,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// AppContext를 직접 export
export { AppContext };
