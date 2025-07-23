'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};

const initialData = {
    hotel: { name: '', address: '', description: '', phone: '', checkin_time: '15:00', checkout_time: '11:00' },
    rooms: [],
    facilities: { general: [], business: [], leisure: [], dining: [] },
    packages: [],
    period: { saleStartDate: '', saleEndDate: '', stayStartDate: '', stayEndDate: '' },
    cancel: { policies: [] },
    pricing: { additionalChargeItems: [], lodges: [], dayTypes: [], headerLabels: [] },
    booking: { policies: [] },
    notices: [],
    charges: { items: [] },
    checkin: { checkInTime: '15:00', checkOutTime: '11:00' },
    sections: { hotel: true, rooms: true, facilities: true, packages: true, period: true, cancel: true, pricing: true, booking: true, notice: true },
};

export const AppContextProvider = ({ children }) => {
  const [hotelData, _setHotelDataState] = useState(initialData);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsHydrated(true);
  }, []);

  const setHotelData = useCallback((newData) => {
    _setHotelDataState(prevData => {
      const updatedData = typeof newData === 'function' ? newData(prevData) : newData;
      if (isClient && typeof window !== 'undefined') {
        localStorage.setItem('hotelData', JSON.stringify(updatedData));
      }
      setLastSaved(new Date());
      return updatedData;
    });
  }, [isClient]);

  const loadDataFromStorage = useCallback(() => {
    if (isClient && isHydrated) {
      try {
        const savedData = localStorage.getItem('hotelData');
        if (savedData) {
          _setHotelDataState(JSON.parse(savedData));
          console.log('성공적으로 localStorage에서 데이터를 로드했습니다.');
        }
      } catch (e) {
        console.error('localStorage에서 데이터를 로드하는 데 실패했습니다.', e);
        setError('데이터를 로드하는 데 실패했습니다.');
      }
    }
  }, [isClient, isHydrated]);

  const loadTemplateList = useCallback(async () => {
    if (!isHydrated) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/hotels?templates=true');
      if (!response.ok) {
        throw new Error('템플릿 목록을 가져오는 데 실패했습니다.');
      }
      const data = await response.json();
      setTemplates(data.data.hotels);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [isHydrated]);

  // 컴포넌트 마운트 시 데이터와 템플릿 목록을 한 번에 로드
  useEffect(() => {
    if (isHydrated) {
      // loadDataFromStorage(); // Temporarily disabled for performance testing
      loadTemplateList();
    }
  }, [isHydrated, loadDataFromStorage, loadTemplateList]);

  const loadTemplate = useCallback(async (templateId) => {
    if (!templateId || !isHydrated) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/hotels/${templateId}`);
      if (!response.ok) {
        throw new Error('템플릿을 불러오는 데 실패했습니다.');
      }
      const data = await response.json();
      setHotelData(data);
      console.log(`${templateId} 템플릿을 성공적으로 불러왔습니다.`);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [setHotelData, isHydrated]);

  const saveHotelData = useCallback(async () => {
    if (!isHydrated) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelData),
      });
      if (!response.ok) {
        throw new Error('데이터 저장에 실패했습니다.');
      }
      const result = await response.json();
      console.log('데이터가 성공적으로 저장되었습니다.', result);
      await loadTemplateList();
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [hotelData, loadTemplateList, isHydrated]);

  const value = {
    hotelData,
    setHotelData,
    templates,
    loadTemplate,
    saveHotelData,
    isLoading,
    error,
    lastSaved,
    isHydrated,
    loadTemplateList,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}; 