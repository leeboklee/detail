import { useState, useCallback, useEffect } from 'react';

// 초기 데이터
const INITIAL_DATA = {
  hotel: {
    name: '샘플 호텔',
    address: '서울시 강남구 테헤란로 123',
    description: '편안하고 아늑한 도심 속 휴식공간입니다.',
    phone: '02-1234-5678',
    imageUrl: '',
    email: '',
    website: ''
  },
  rooms: [
    {
      name: '스탠다드',
      type: '스탠다드',
      structure: '원룸',
      bedType: '퀸 베드 1개',
      view: '시티뷰',
      standardCapacity: 2,
      maxCapacity: 2,
      description: '편안한 숙면을 위한 퀸 베드가 구비된 스탠다드 룸입니다.',
      image: '',
      amenities: ['무료 Wi-Fi', '에어컨', 'TV', '미니바']
    }
  ],
  facilities: {
    general: ['무료 Wi-Fi', '24시간 프런트 데스크', '엘리베이터'],
    business: ['비즈니스 센터', '회의실'],
    leisure: ['피트니스 센터', '사우나'],
    dining: ['레스토랑', '카페', '룸서비스']
  },
  checkin: {
    checkInTime: '15:00',
    checkOutTime: '11:00',
    earlyCheckIn: '추가 요금 발생',
    lateCheckOut: '추가 요금 발생'
  },
  packages: [{
    name: '로맨틱 패키지',
    description: '커플을 위한 특별한 패키지',
    price: 150000,
    includes: ['샴페인', '꽃다발', '늦은 체크아웃'],
    salesPeriod: {
      start: '2025.08.04',
      end: '08.31'
    },
    stayPeriod: {
      start: '2025.08.24',
      end: '09.30'
    },
    productComposition: '객실 1박',
    notes: ['투숙 시 제공되는 상품 세부 구성에 대한 부분 협의를 불가합니다.'],
    constraints: ['성인 2명 기준', '추가 인원 시 별도 요금']
  }],
  pricing: {
    lodges: [{
      name: '샘플 호텔',
      rooms: [{
        roomType: '스탠다드',
        view: '시티뷰',
        prices: {
          weekday: 100000,
          friday: 120000,
          saturday: 150000
        }
      }]
    }],
    dayTypes: [
      { id: 'weekday', name: '주중(월~목)', type: 'weekday' },
      { id: 'friday', name: '금요일', type: 'friday' },
      { id: 'saturday', name: '토요일', type: 'saturday' }
    ]
  },
  cancel: {
    freeCancellation: '체크인 7일 전까지 무료 취소',
    cancellationFee: '체크인 3일 전~당일: 첫날 요금의 100%',
    noShow: '노쇼 시 전액 청구',
    modificationPolicy: '날짜 변경은 체크인 3일 전까지 가능'
  },
  booking: {
    reservationMethod: '온라인 예약 시스템',
    paymentMethods: ['신용카드', '계좌이체', '현금'],
    confirmationTime: '예약 후 24시간 이내 확인',
    specialRequests: '체크인 시 요청사항 전달 가능'
  },
  notices: [{
    title: '중요 안내',
    content: '체크인 시 신분증을 지참해 주세요.',
    type: 'important'
  }]
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
    console.log('🔧 updateData 호출:', { key, newData });
    setData(prev => {
      const updated = {
        ...prev,
        [key]: newData
      };
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
