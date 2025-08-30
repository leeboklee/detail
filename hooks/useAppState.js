import { useState, useCallback, useEffect } from 'react';

// 초기 데이터 (하드코딩 제거: 전부 비어있는 기본값으로 시작)
const INITIAL_DATA = {
  hotel: {
    name: '',
    address: '',
    description: '',
    phone: '',
    imageUrl: '',
    email: '',
    website: ''
  },
  rooms: [],
  facilities: {
    general: [],
    business: [],
    leisure: [],
    dining: []
  },
  checkin: {
    checkInTime: '',
    checkOutTime: '',
    earlyCheckIn: '',
    lateCheckOut: '',
    checkInLocation: '',
    checkOutLocation: '',
    specialInstructions: '',
    requiredDocuments: '',
    ageRestrictions: '',
    petPolicy: ''
  },
  packages: [],
  pricing: {
    title: '',
    priceTable: {
      title: '추가요금표',
      period: '08.24~09.30',
      roomTypes: []
    },
    additionalInfo: {
      paymentInfo: '',
      additionalCharges: '',
      availabilityInfo: ''
    },
    notes: [],
    lodges: [{
      name: '',
      rooms: []
    }],
    // dayTypes는 시스템 분류 값이므로 유지
    dayTypes: [
      { id: 'weekday', name: '주중(월~목)', type: 'weekday' },
      { id: 'friday', name: '금요일', type: 'friday' },
      { id: 'saturday', name: '토요일', type: 'saturday' }
    ]
  },
  cancel: {
    freeCancellation: '',
    cancellationFee: '',
    noShow: '',
    modificationPolicy: '',
    refundPolicy: '',
    noticePeriod: ''
  },
  booking: {
    reservationMethod: '',
    paymentMethods: [],
    confirmationTime: '',
    specialRequests: '',
    contactInfo: '',
    operatingHours: '',
    cancellationPolicy: ''
  },
  notices: [],
  bookingInfo: {
    title: '',
    purchaseGuide: '',
    referenceNotes: '',
    kakaoChannel: ''
  }
};

export const useAppState = () => {
  const [data, setData] = useState(INITIAL_DATA);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [notices, setNotices] = useState([]);

  // 데이터 업데이트 함수
  const updateData = useCallback((key, newData) => {
    console.log('🔧 === updateData 호출 ===');
    console.log('🔧 key:', key);
    console.log('🔧 newData:', newData);
    console.log('🔧 newData 타입:', typeof newData);
    console.log('🔧 newData 키들:', newData ? Object.keys(newData) : 'undefined');
    
    setData(prev => {
      console.log('🔧 이전 데이터:', prev);
      console.log('🔧 이전 데이터의', key, ':', prev[key]);
      
      let updated;
      if (key === 'hotel') {
        // hotel 데이터의 경우 기존 데이터와 병합
        updated = {
          ...prev,
          hotel: {
            ...prev.hotel,
            ...newData
          }
        };
      } else {
        updated = {
          ...prev,
          [key]: newData
        };
      }
      
      console.log('🔧 업데이트된 데이터:', updated);
      console.log('🔧 업데이트된', key, ':', updated[key]);
      console.log('🔧 데이터 업데이트 완료:', { key, oldValue: prev[key], newValue: updated[key] });
      
      return updated;
    });
  }, []);

  // 데이터 초기화 함수
  const resetData = useCallback(() => {
    setData(INITIAL_DATA);
    setGeneratedHtml('');
    setLastGenerated(null);
    setNotification({
      show: true,
      message: '데이터가 초기화되었습니다.',
      type: 'success'
    });
  }, []);

  // 데이터 내보내기 함수
  const exportData = useCallback(() => {
    try {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hotel-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      setNotification({
        show: true,
        message: '데이터가 성공적으로 내보내졌습니다.',
        type: 'success'
      });
    } catch (error) {
      console.error('데이터 내보내기 실패:', error);
      setNotification({
        show: true,
        message: '데이터 내보내기에 실패했습니다.',
        type: 'error'
      });
    }
  }, [data]);

  // 데이터 가져오기 함수
  const importData = useCallback((file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          
          // 데이터 유효성 검사
          if (importedData && typeof importedData === 'object') {
            setData(importedData);
            setNotification({
              show: true,
              message: '데이터가 성공적으로 가져와졌습니다.',
              type: 'success'
            });
            resolve(importedData);
          } else {
            throw new Error('유효하지 않은 데이터 형식입니다.');
          }
        } catch (error) {
          console.error('데이터 가져오기 실패:', error);
          setNotification({
            show: true,
            message: '데이터 가져오기에 실패했습니다.',
            type: 'error'
          });
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('파일 읽기에 실패했습니다.'));
      };
      
      reader.readAsText(file);
    });
  }, []);

  // 알림 표시 함수
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
  }, []);

  // 알림 숨기기 함수
  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      show: false
    }));
  }, []);

  // 로딩 상태 설정 함수
  const setLoading = useCallback((loading) => {
    setIsLoading(loading);
  }, []);

  // HTML 생성 상태 설정 함수
  const setHtmlGenerationState = useCallback((generating, html = '', timestamp = null) => {
    setIsGenerating(generating);
    if (html) setGeneratedHtml(html);
    if (timestamp) setLastGenerated(timestamp);
  }, []);

  return {
    // 상태
    data,
    generatedHtml,
    isGenerating,
    lastGenerated,
    isLoading,
    notification,
    notices,
    
    // 액션
    updateData,
    resetData,
    exportData,
    importData,
    showNotification,
    hideNotification,
    setLoading,
    setHtmlGenerationState,
    
    // 초기 데이터 (읽기 전용)
    INITIAL_DATA
  };
};
