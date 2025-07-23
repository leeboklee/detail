'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppContext } from '@/app/context/AppContext';
// import logger from '@/utils/logger'; // 경로 수정

/**
 * 호텔 정보 관리를 위한 커스텀 훅
 * @param {Object} initialData - 초기 호텔 정보 데이터
 * @returns {Object} 호텔 정보 상태와 관련 핸들러
 */
const useHotelInfo = () => {
  const { hotelData, updateHotelData, autoSave, isLoaded } = useAppContext();
  const [localHotelData, setLocalHotelData] = useState(null);
  
  // 최초 로드 시 hotelData를 localHotelData로 설정
  useEffect(() => {
    if (isLoaded && hotelData) {
      setLocalHotelData(hotelData);
    }
  }, [isLoaded, hotelData]);
  
  const handleHotelInfoChange = useCallback((key, value) => {
    // logger.log(`Handling change for key: ${key}, value: ${value}`);
    setLocalHotelData(prev => {
      if (!prev) return null;
      const updated = { ...prev, [key]: value };
      if(autoSave) {
        updateHotelData(updated);
        // logger.log('Autosaving hotel info:', updated);
      }
      return updated;
    });
  }, [autoSave, updateHotelData]);

  // autoSave 상태가 변경될 때 unsaved changes 저장
  useEffect(() => {
    if (autoSave && localHotelData && JSON.stringify(localHotelData) !== JSON.stringify(hotelData)) {
      updateHotelData(localHotelData);
      // logger.log('Saving unsaved changes on autoSave toggle:', localHotelData);
    }
  }, [autoSave, localHotelData, hotelData, updateHotelData]);
  
  const saveHotelInfo = useCallback(() => {
    if (localHotelData) {
      updateHotelData(localHotelData);
      // logger.log('Hotel info saved manually:', localHotelData);
    }
  }, [localHotelData, updateHotelData]);

  return {
    hotelInfo: localHotelData || hotelData,
    handleHotelInfoChange,
    saveHotelInfo,
  };
};

export default useHotelInfo; 