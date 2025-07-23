'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppContext } from '@/app/context/AppContext';

// 초기 데이터 구조 개선
const createInitialRoom = (dayTypes) => ({
  name: '객실명',
  roomType: '객실 유형',
  viewTypes: [{
    id: `view_${Date.now()}`,
    name: '기본 전망',
    prices: dayTypes.reduce((acc, dt) => ({ ...acc, [dt.type]: 0 }), {})
  }]
});

const initialLodges = (dayTypes) => [{
  name: '호텔명', 
  rooms: [createInitialRoom(dayTypes)]
}];

const initialDayTypes = [
  { id: 'weekday', name: '주중(월~목)', type: 'weekday' },
  { id: 'friday', name: '금요일', type: 'friday' },
  { id: 'saturday', name: '토요일', type: 'saturday' }
];

function PriceTable() {
  const { hotelData, updatePricing } = useAppContext();

  const normalizedPriceInfo = useMemo(() => {
    const currentPriceInfo = hotelData?.pricing || {};
    const dayTypes = currentPriceInfo.dayTypes || initialDayTypes;

    const lodges = Array.isArray(currentPriceInfo.lodges) && currentPriceInfo.lodges.length > 0
      ? currentPriceInfo.lodges.map(lodge => ({
          ...lodge,
          rooms: Array.isArray(lodge.rooms) && lodge.rooms.length > 0 
            ? lodge.rooms.map(room => ({
                ...room,
                viewTypes: Array.isArray(room.viewTypes) && room.viewTypes.length > 0
                  ? room.viewTypes
                  : room.view || room.prices 
                    ? [{ 
                        id: `view_${Date.now()}`,
                        name: room.view || '기본',
                        prices: room.prices || dayTypes.reduce((acc, dt) => ({ ...acc, [dt.type]: 0 }), {})
                      }]
                    : [createInitialRoom(dayTypes).viewTypes[0]]
              }))
            : [createInitialRoom(dayTypes)]
        }))
      : initialLodges(dayTypes);

    return {
      additionalChargesInfo: currentPriceInfo.additionalChargesInfo || '',
      chargesTitle: currentPriceInfo.chargesTitle || '추가요금',
      weekendSurcharge: currentPriceInfo.weekendSurcharge || '',
      holidaySurcharge: currentPriceInfo.holidaySurcharge || '',
      seasonalRates: currentPriceInfo.seasonalRates || '',
      // 요일별 추가요금 필드들
      mondaySurcharge: currentPriceInfo.mondaySurcharge || '',
      tuesdaySurcharge: currentPriceInfo.tuesdaySurcharge || '',
      wednesdaySurcharge: currentPriceInfo.wednesdaySurcharge || '',
      thursdaySurcharge: currentPriceInfo.thursdaySurcharge || '',
      fridaySurcharge: currentPriceInfo.fridaySurcharge || '',
      saturdaySurcharge: currentPriceInfo.saturdaySurcharge || '',
      sundaySurcharge: currentPriceInfo.sundaySurcharge || '',
      lodges,
      dayTypes,
      headerLabels: currentPriceInfo.headerLabels || { roomCategory: '객실', roomType: '객실 유형', view: '전망' },
      additionalChargeItems: currentPriceInfo.additionalChargeItems || []
    };
  }, [hotelData]);

  const { additionalChargesInfo, chargesTitle, weekendSurcharge, holidaySurcharge, seasonalRates, lodges, dayTypes, headerLabels } = normalizedPriceInfo;

  // 모달 상태 관리
  const [showDayTypeModal, setShowDayTypeModal] = useState(false);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [message, setMessage] = useState('');
  
  // 일괄 수정 상태
  const [bulkEditData, setBulkEditData] = useState({
    operation: 'add',
    value: 0,
  });

  // 계산기 상태
  const [calculatorData, setCalculatorData] = useState({
    basePrice: 100000,
    discountRate: 0,
    taxRate: 10,
    serviceChargeRate: 0
  });

  // 참조 상태
  const prevPriceInfoRef = useRef();
  const isInitialMount = useRef(true);

  // 컴포넌트 마운트 시 초기화 (normalizedPriceInfo 의존성 제거로 무한 루프 방지)
  useEffect(() => {
    // 초기 마운트 시에만 실행
    if (isInitialMount.current) {
      // priceInfo가 비어있거나 잘못된 형태면 초기 데이터로 설정
      if (!hotelData?.pricing || !Array.isArray(hotelData.pricing.lodges) || hotelData.pricing.lodges.length === 0) {
        const initialPriceData = {
          chargesTitle: '추가요금',
          additionalChargesInfo: '',
          weekendSurcharge: '',
          holidaySurcharge: '',
          seasonalRates: '',
          lodges: initialLodges(initialDayTypes),
          dayTypes: initialDayTypes,
          // 요일별 추가요금 필드들
          mondayCharge: '',
          tuesdayCharge: '',
          wednesdayCharge: '',
          thursdayCharge: '',
          fridayCharge: '',
          saturdayCharge: '',
          sundayCharge: ''
        };
        updatePricing(initialPriceData);
      }
      isInitialMount.current = false;
    }
  }, [hotelData?.pricing, updatePricing]);

  // priceInfo가 변경될 때마다 로컬 상태 업데이트
  useEffect(() => {
    const currentPriceInfoString = JSON.stringify(hotelData?.pricing || {});
    const prevPriceInfoString = JSON.stringify(prevPriceInfoRef.current || {});

    if (currentPriceInfoString !== prevPriceInfoString) {
      prevPriceInfoRef.current = JSON.parse(currentPriceInfoString);
    }
  }, [hotelData?.pricing]);

  // 내부 상태 변경 시 updatePricing 호출
  const handleChange = useCallback((field, value) => {
    console.log('🔍 PriceTable handleChange 호출:', field, '=', value);
    console.log('🔍 현재 hotelData.pricing:', hotelData?.pricing);
    const currentPricing = hotelData?.pricing || {};
    const newData = { ...currentPricing, [field]: value };
    console.log('🔍 업데이트할 데이터:', newData);
    updatePricing(newData);
  }, [hotelData?.pricing, updatePricing]);

  // 헤더 라벨 변경 처리
  const handleHeaderLabelChange = useCallback((field, value) => {
    const currentPricing = hotelData?.pricing || {};
    updatePricing({
      ...currentPricing,
      headerLabels: {
        ...currentPricing.headerLabels,
        [field]: value
      }
    });
  }, [hotelData?.pricing, updatePricing]);

  // 추가요금 명칭 변경 핸들러
  const handleChargesTitleChange = useCallback((e) => {
    const value = e.target.value;
    handleChange('chargesTitle', value);
  }, [handleChange]);

  // 추가 요금 정보 변경 핸들러
  const handleAdditionalChargesInfoChange = useCallback((e) => {
    const value = e.target.value;
    handleChange('additionalChargesInfo', value);
  }, [handleChange]);

  // 백업에서 복구한 추가요금 필드 변경 핸들러들
  const handleWeekendSurchargeChange = useCallback((e) => {
    const value = e.target.value;
    console.log('🔍 주말 추가요금 변경:', value);
    handleChange('weekendSurcharge', value);
  }, [handleChange]);

  const handleHolidaySurchargeChange = useCallback((e) => {
    const value = e.target.value;
    console.log('🔍 성수기/공휴일 추가요금 변경:', value);
    handleChange('holidaySurcharge', value);
  }, [handleChange]);

  const handleSeasonalRatesChange = useCallback((e) => {
    const value = e.target.value;
    console.log('🔍 계절별 요금 정보 변경:', value);
    handleChange('seasonalRates', value);
  }, [handleChange]);

  // 객실 정보 변경 핸들러
  const handleRoomInfoChange = useCallback((lodgeIndex, roomIndex, field, value) => {
    const newLodges = [...lodges];
    if (!newLodges[lodgeIndex]) return;
    if (!newLodges[lodgeIndex].rooms) newLodges[lodgeIndex].rooms = [];
    if (!newLodges[lodgeIndex].rooms[roomIndex]) return;
    
    if (field.startsWith('price_')) {
      // 가격 필드 처리
      const priceType = field.replace('price_', '');
      if (!newLodges[lodgeIndex].rooms[roomIndex].prices) {
        newLodges[lodgeIndex].rooms[roomIndex].prices = {};
      }
      // 숫자만 허용
      const numericValue = value.replace(/[^0-9]/g, '');
      newLodges[lodgeIndex].rooms[roomIndex].prices[priceType] = parseInt(numericValue) || 0;
    } else {
      // 일반 필드 처리
      newLodges[lodgeIndex].rooms[roomIndex][field] = value;
    }
    
    handleChange('lodges', newLodges);
  }, [lodges, handleChange]);

  // 전망 타입 가격 변경 핸들러
  const handleViewTypePriceChange = useCallback((lodgeIndex, roomIndex, viewTypeIndex, priceType, value) => {
    const newLodges = [...lodges];
    if (!newLodges[lodgeIndex]?.rooms?.[roomIndex]?.viewTypes?.[viewTypeIndex]) return;
    
    if (!newLodges[lodgeIndex].rooms[roomIndex].viewTypes[viewTypeIndex].prices) {
      newLodges[lodgeIndex].rooms[roomIndex].viewTypes[viewTypeIndex].prices = {};
    }
    
    // 숫자만 허용하고 쉼표 제거
    const numericValue = value.replace(/[^0-9]/g, '');
    newLodges[lodgeIndex].rooms[roomIndex].viewTypes[viewTypeIndex].prices[priceType] = parseInt(numericValue) || 0;
    
    handleChange('lodges', newLodges);
  }, [lodges, handleChange]);

  // 전망 타입 이름 변경 핸들러
  const handleViewTypeNameChange = useCallback((lodgeIndex, roomIndex, viewTypeIndex, value) => {
    const newLodges = [...lodges];
    if (!newLodges[lodgeIndex]?.rooms?.[roomIndex]?.viewTypes?.[viewTypeIndex]) return;
    
    newLodges[lodgeIndex].rooms[roomIndex].viewTypes[viewTypeIndex].name = value;
    handleChange('lodges', newLodges);
  }, [lodges, handleChange]);

  // 객실 추가 핸들러
  const addRoom = useCallback((lodgeIndex) => {
    console.log('🔥 객실 추가 버튼 클릭됨!', { lodgeIndex, lodges, dayTypes });
    
    // 이벤트 전파 중단 방지
    try {
      const newLodges = [...lodges];
      if (!newLodges[lodgeIndex]) {
        console.error('❌ 호텔 인덱스가 잘못됨:', lodgeIndex);
        alert('호텔 정보를 찾을 수 없습니다.');
        return;
      }

      let effectiveDayTypes = dayTypes;
      if (!Array.isArray(effectiveDayTypes) || effectiveDayTypes.length === 0) {
        console.warn('⚠️ dayTypes가 비어있음, 기본값 사용');
        effectiveDayTypes = [
          { type: 'weekday', name: '주중' },
          { type: 'weekend', name: '주말' }
        ];
      }
      
      const newRoom = {
        name: `새 객실 ${(newLodges[lodgeIndex].rooms?.length || 0) + 1}`,
        roomType: '스탠다드',
        viewTypes: [{
          id: `view_${Date.now()}`,
          name: '기본',
          prices: effectiveDayTypes.reduce((acc, dt) => ({ ...acc, [dt.type]: 0 }), {})
        }]
      };
      
      if (!newLodges[lodgeIndex].rooms) {
        newLodges[lodgeIndex].rooms = [];
      }
      
      newLodges[lodgeIndex].rooms.push(newRoom);
      console.log('✅ 새 객실 추가 완료:', newRoom);
      console.log('✅ 업데이트된 lodges:', newLodges);
      
      handleChange('lodges', newLodges);
      alert('객실이 추가되었습니다!');
    } catch (error) {
      console.error('❌ 객실 추가 중 오류:', error);
      alert('객실 추가 중 오류가 발생했습니다: ' + error.message);
    }
  }, [lodges, dayTypes, handleChange]);

  // 전망 추가 핸들러
  const addViewType = useCallback((lodgeIndex, roomIndex) => {
    console.log('🔥 전망 추가 버튼 클릭됨!', { lodgeIndex, roomIndex, lodges, dayTypes });
    
    try {
      const newLodges = [...lodges];
      if (!newLodges[lodgeIndex]?.rooms?.[roomIndex]) {
        console.error('❌ 호텔 또는 객실 인덱스가 잘못됨:', { lodgeIndex, roomIndex });
        alert('객실 정보를 찾을 수 없습니다.');
        return;
      }

      let effectiveDayTypes = dayTypes;
      if (!Array.isArray(effectiveDayTypes) || effectiveDayTypes.length === 0) {
        console.warn('⚠️ dayTypes가 비어있음, 기본값 사용');
        effectiveDayTypes = [
          { type: 'weekday', name: '주중' },
          { type: 'weekend', name: '주말' }
        ];
      }
      
      const currentViewTypes = newLodges[lodgeIndex].rooms[roomIndex].viewTypes || [];
      const newViewType = {
        id: `view_${Date.now()}`,
        name: `새 전망 ${currentViewTypes.length + 1}`,
        prices: effectiveDayTypes.reduce((acc, dt) => ({ ...acc, [dt.type]: 0 }), {})
      };
      
      if (!newLodges[lodgeIndex].rooms[roomIndex].viewTypes) {
        newLodges[lodgeIndex].rooms[roomIndex].viewTypes = [];
      }
      
      newLodges[lodgeIndex].rooms[roomIndex].viewTypes.push(newViewType);
      console.log('✅ 새 전망 추가 완료:', newViewType);
      console.log('✅ 업데이트된 lodges:', newLodges);
      
      handleChange('lodges', newLodges);
      alert('전망이 추가되었습니다!');
    } catch (error) {
      console.error('❌ 전망 추가 중 오류:', error);
      alert('전망 추가 중 오류가 발생했습니다: ' + error.message);
    }
  }, [lodges, dayTypes, handleChange]);

  // 전망 제거 핸들러
  const removeViewType = useCallback((lodgeIndex, roomIndex, viewTypeIndex) => {
    if (!confirm('이 전망을 삭제하시겠습니까?')) return;
    
    const newLodges = [...lodges];
    if (!newLodges[lodgeIndex]?.rooms?.[roomIndex]?.viewTypes) return;
    
    newLodges[lodgeIndex].rooms[roomIndex].viewTypes = 
      newLodges[lodgeIndex].rooms[roomIndex].viewTypes.filter((_, i) => i !== viewTypeIndex);
    
    handleChange('lodges', newLodges);
  }, [lodges, handleChange]);

  // 객실 제거 핸들러
  const removeRoom = useCallback((lodgeIndex, roomIndex) => {
    if (!confirm('이 객실을 삭제하시겠습니까?')) return;
    
    const newLodges = [...lodges];
    if (!newLodges[lodgeIndex]?.rooms) return;
    
    newLodges[lodgeIndex].rooms = newLodges[lodgeIndex].rooms.filter((_, i) => i !== roomIndex);
    handleChange('lodges', newLodges);
  }, [lodges, handleChange]);

  // 숙소 제거 핸들러
  const removeLodge = useCallback((lodgeIndex) => {
    if (!confirm('이 호텔을 삭제하시겠습니까?')) return;
    
    const newLodges = lodges.filter((_, i) => i !== lodgeIndex);
    handleChange('lodges', newLodges);
  }, [lodges, handleChange]);

  // 숙소 추가 핸들러
  const addHotel = useCallback(() => {
    const newLodges = [...lodges, { name: '새 호텔', rooms: [] }];
    handleChange('lodges', newLodges);
  }, [lodges, handleChange]);

  // 일괄 수정 적용
  const applyBulkEdit = useCallback(() => {
    const { operation, value } = bulkEditData;
    const numValue = parseInt(value) || 0;
    
    if (numValue === 0 && operation !== 'set') {
      alert('유효한 값을 입력하세요.');
      return;
    }
    
    const newLodges = lodges.map((lodge) => ({
      ...lodge,
      rooms: lodge.rooms.map((room) => ({
        ...room,
        viewTypes: room.viewTypes.map((viewType) => ({
          ...viewType,
          prices: Object.keys(viewType.prices).reduce((acc, priceType) => {
            let newPrice = viewType.prices[priceType] || 0;
            
            switch (operation) {
              case 'add': newPrice += numValue; break;
              case 'multiply': newPrice = Math.round(newPrice * (1 + numValue / 100)); break;
              case 'set': newPrice = numValue; break;
              default: break;
            }
            
            acc[priceType] = Math.max(0, newPrice);
            return acc;
          }, {})
        }))
      }))
    }));
    
    handleChange('lodges', newLodges);
    setShowBulkEditModal(false);
    setMessage('✅ 가격 일괄 수정이 완료되었습니다.');
    setTimeout(() => setMessage(''), 3000);
  }, [bulkEditData, lodges, handleChange]);

  // 계산기 결과 계산
  const calculatePrice = useCallback(() => {
    const { basePrice, discountRate, taxRate, serviceChargeRate } = calculatorData;
    const base = parseInt(basePrice) || 0;
    const discounted = base * (1 - discountRate / 100);
    const withService = discounted * (1 + serviceChargeRate / 100);
    const final = withService * (1 + taxRate / 100);
    
    return {
      basePrice: base,
      discountAmount: base - discounted,
      serviceAmount: withService - discounted,
      taxAmount: final - withService,
      finalPrice: Math.round(final)
    };
  }, [calculatorData]);

  // 샘플 데이터 로드
  const loadSampleData = useCallback(() => {
    const sampleData = {
      additionalChargesInfo: '조식 20,000원/인, 엑스트라베드 30,000원/박, 주차 10,000원/일',
      lodges: [
        {
          name: '샘플 호텔',
          rooms: [
            {
              name: '스탠다드 룸',
              roomType: '스탠다드',
              viewTypes: [
                {
                  id: 'view-1',
                  name: '시티뷰',
                  prices: {
                    weekday: 100000,
                    friday: 120000,
                    saturday: 150000
                  }
                }
              ]
            },
            {
              name: '디럭스 룸',
              roomType: '디럭스',
              viewTypes: [
                {
                  id: 'view-2',
                  name: '파크뷰',
                  prices: {
                    weekday: 150000,
                    friday: 180000,
                    saturday: 220000
                  }
                }
              ]
            }
          ]
        }
      ],
      dayTypes: [
        { id: 'weekday', name: '주중(월~목)', type: 'weekday' },
        { id: 'friday', name: '금요일', type: 'friday' },
        { id: 'saturday', name: '토요일', type: 'saturday' }
      ],
      headerLabels: {
        roomCategory: '객실',
        roomType: '객실 유형',
        view: '전망'
      }
    };
    updatePricing(sampleData);
    setMessage('✅ 샘플 데이터가 적용되었습니다.');
    setTimeout(() => setMessage(''), 3000);
  }, [updatePricing]);

  // 가격 유형 관리 모달
  const DayTypeModal = () => {
    const [localDayTypes, setLocalDayTypes] = useState([...dayTypes]);

    const handleLocalDayTypeNameChange = (id, newName) => {
      setLocalDayTypes(prev => prev.map(type => 
        type.id === id ? { ...type, name: newName } : type
      ));
    };

    const addLocalDayType = () => {
      const newId = `day-${Date.now()}`;
      setLocalDayTypes(prev => [...prev, { 
        id: newId, 
        name: `새 요일 ${prev.length + 1}`, 
        type: newId 
      }]);
    };

    const removeLocalDayType = (id) => {
      if (localDayTypes.length <= 1) {
        alert('최소 하나의 가격 유형은 필요합니다.');
        return;
      }
      setLocalDayTypes(prev => prev.filter(type => type.id !== id));
    };

    const applyDayTypes = () => {
      // dayTypes를 업데이트하고 모든 객실의 가격 구조도 새로운 dayTypes에 맞춰 업데이트
      const updatedPriceInfo = {
        ...normalizedPriceInfo,
        dayTypes: localDayTypes,
        lodges: normalizedPriceInfo.lodges.map(lodge => ({
          ...lodge,
          rooms: lodge.rooms.map(room => ({
            ...room,
            prices: localDayTypes.reduce((acc, dayType) => {
              acc[dayType.id] = room.prices?.[dayType.id] || 0;
              return acc;
            }, {})
          }))
        }))
      };
      
      updatePricing(updatedPriceInfo);
      setMessage('✅ 가격 유형이 적용되었습니다.');
      setTimeout(() => setMessage(''), 3000);
      setShowDayTypeModal(false);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-800">가격 유형 관리</h3>
            <button 
              onClick={() => setShowDayTypeModal(false)}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            >
              ×
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
            <div className="space-y-3 mb-6">
              {localDayTypes.map((type, index) => (
                <div key={type.id || index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={type.name}
                    onChange={(e) => handleLocalDayTypeNameChange(type.id, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="가격 유형명 (예: 주중, 주말, 성수기)"
                  />
                  <button 
                    onClick={() => removeLocalDayType(type.id)}
                    disabled={localDayTypes.length <= 1}
                    className={`px-4 py-3 text-sm font-medium rounded-md transition-colors min-h-[44px] min-w-[80px] ${
                      localDayTypes.length <= 1 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md'
                    }`}
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={addLocalDayType}
              className="w-full py-4 px-6 bg-blue-50 text-blue-600 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-colors font-medium text-lg min-h-[52px] hover:shadow-md"
            >
              + 새 가격 유형 추가
            </button>
          </div>
          
          {/* 하단 버튼 */}
          <div className="flex gap-4 p-6 border-t bg-gray-50">
            <button 
              onClick={() => setShowDayTypeModal(false)}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-lg min-h-[52px]"
            >
              취소
            </button>
            <button 
              onClick={applyDayTypes}
              className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg min-h-[52px] shadow-lg"
            >
              ✓ 적용하기
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 일괄 수정 모달
  const BulkEditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">💰 가격 일괄 수정</h3>
            <button 
              onClick={() => setShowBulkEditModal(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">수정 방법</label>
              <select
                value={bulkEditData.operation}
                onChange={(e) => setBulkEditData({...bulkEditData, operation: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="add">금액 더하기 (+)</option>
                <option value="multiply">퍼센트 증가 (%)</option>
                <option value="set">고정 금액 설정 (=)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bulkEditData.operation === 'add' ? '추가할 금액' : 
                 bulkEditData.operation === 'multiply' ? '증가율 (%)' : '설정할 금액'}
              </label>
              <input
                type="number"
                value={bulkEditData.value}
                onChange={(e) => setBulkEditData({...bulkEditData, value: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder={bulkEditData.operation === 'multiply' ? '10 (10% 증가)' : '10000'}
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>미리보기:</strong><br/>
                {bulkEditData.operation === 'add' && `모든 가격에 ${parseInt(bulkEditData.value) || 0}원 추가`}
                {bulkEditData.operation === 'multiply' && `모든 가격을 ${parseInt(bulkEditData.value) || 0}% 증가`}
                {bulkEditData.operation === 'set' && `모든 가격을 ${parseInt(bulkEditData.value) || 0}원으로 설정`}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button 
              onClick={applyBulkEdit}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              적용하기
            </button>
            <button 
              onClick={() => setShowBulkEditModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // 가격 계산기 모달
  const CalculatorModal = () => {
    const result = calculatePrice();
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">🧮 가격 계산기</h3>
              <button 
                onClick={() => setShowCalculatorModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기본 가격</label>
                <input
                  type="number"
                  value={calculatorData.basePrice}
                  onChange={(e) => setCalculatorData({...calculatorData, basePrice: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="100000"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">할인율 (%)</label>
                <input
                  type="number"
                  value={calculatorData.discountRate}
                  onChange={(e) => setCalculatorData({...calculatorData, discountRate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">서비스료 (%)</label>
                <input
                  type="number"
                  value={calculatorData.serviceChargeRate}
                  onChange={(e) => setCalculatorData({...calculatorData, serviceChargeRate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">세금 (%)</label>
                <input
                  type="number"
                  value={calculatorData.taxRate}
                  onChange={(e) => setCalculatorData({...calculatorData, taxRate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="10"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold mb-2">계산 결과</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>기본 가격:</span>
                    <span>{result.basePrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>할인 금액:</span>
                    <span>-{result.discountAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>서비스료:</span>
                    <span>+{result.serviceAmount.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between">
                    <span>세금:</span>
                    <span>+{result.taxAmount.toLocaleString()}원</span>
                  </div>
                  <hr className="my-2"/>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>최종 가격:</span>
                    <span className="text-blue-600">{result.finalPrice.toLocaleString()}원</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button 
                onClick={() => {
                  setBulkEditData({...bulkEditData, operation: 'set', value: result.finalPrice});
                  setShowCalculatorModal(false);
                  setShowBulkEditModal(true);
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                이 가격으로 일괄 설정
              </button>
              <button 
                onClick={() => setShowCalculatorModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 호텔 이름 변경 (복원)
  const handleLodgeNameChange = useCallback((index, newName) => {
    const updatedLodges = [...lodges];
    updatedLodges[index] = { ...updatedLodges[index], name: newName };
    handleChange('lodges', updatedLodges);
  }, [lodges, handleChange]);

  return (
    <div className="space-y-6">
      {/* 헤더와 안내 메시지 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">💰 추가요금</h2>
        <div className="flex gap-2">
          <div className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded border border-blue-300">
            💡 CRUD 관리 버튼을 사용해 전체 템플릿을 저장하세요
          </div>
        </div>
      </div>

      {/* 저장/불러오기 메시지 */}
      {message && (
        <div className={`p-3 rounded-md text-sm ${
          message.includes('✅') ? 'bg-green-100 text-green-800 border border-green-200' :
          message.includes('❌') ? 'bg-red-100 text-red-800 border border-red-200' :
          message.includes('💡') ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
          'bg-blue-100 text-blue-800 border border-blue-200'
        }`}>
          {message}
        </div>
      )}

      {/* 사용 가이드 */}
      <div className="card">
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-semibold mb-2">💡 추가요금 입력 가이드</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>호텔 추가</strong>: 여러 호텔의 요금을 한 번에 관리할 수 있습니다</li>
                <li>• <strong>객실 추가</strong>: 각 호텔에 다양한 객실 타입을 추가할 수 있습니다</li>
                <li>• <strong>전망 추가</strong>: 같은 객실에서도 전망별로 다른 가격을 설정할 수 있습니다</li>
                <li>• <strong>가격 유형 관리</strong>: 평일/주말/성수기 외에 다른 가격 유형을 추가할 수 있습니다</li>
                <li>• <strong>쉬운 입력</strong>: 각 칸을 클릭하면 바로 수정할 수 있으며, Tab 키로 이동 가능합니다</li>
                <li>• <strong>개별 저장</strong>: &quot;💾 DB 저장&quot; 버튼으로 추가요금만 별도 저장할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 추가요금 명칭 설정 */}
      <div className="card">
        <div className="card-header">
          <h4 className="font-semibold m-0">섹션 명칭 설정</h4>
          <p className="text-sm text-secondary m-0 mt-1">미리보기에 표시될 섹션 제목을 설정하세요</p>
        </div>
        <div className="card-body">
          <input
            type="text"
            value={chargesTitle || ''}
            onChange={handleChargesTitleChange}
            placeholder="예: 추가요금, 객실료, 이용료 등"
            className="w-full"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '600'
            }}
          />
        </div>
      </div>

      {/* 추가 요금 정보 */}
      <div className="card">
        <div className="card-header">
          <h4 className="font-semibold m-0">추가 요금 안내</h4>
          <p className="text-sm text-secondary m-0 mt-1">부대비용이나 추가 서비스 요금을 안내하세요</p>
        </div>
        <div className="card-body">
          <textarea
            id="additional-charges-info"
            value={additionalChargesInfo || ''}
            onChange={handleAdditionalChargesInfoChange}
            placeholder="예: 조식 20,000원/인, 주차비 10,000원/일, 엑스트라베드 30,000원/박..."
            rows={4}
            className="w-full resize-none"
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              lineHeight: '1.5',
              fontFamily: 'inherit',
              resize: 'vertical',
              minHeight: '100px'
            }}
          />
        </div>
      </div>

      {/* 고급 추가요금 관리 기능들 */}
      <div className="card">
        <div className="card-header">
          <h4 className="font-semibold m-0">🏷️ 동적 추가요금 관리</h4>
          <p className="text-sm text-secondary m-0 mt-1">추가요금 항목을 동적으로 관리하고 템플릿으로 저장하세요</p>
        </div>
        <div className="card-body">
          
          {/* 동적 추가요금 항목들 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium">추가요금 항목</label>
              <button
                onClick={() => {
                  const newItems = [...(normalizedPriceInfo.additionalChargeItems || []), {
                    id: Date.now(),
                    name: '',
                    price: '',
                    description: '',
                    unit: '박'
                  }];
                  handleChange('additionalChargeItems', newItems);
                }}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                + 항목 추가
              </button>
            </div>
            
            {(normalizedPriceInfo.additionalChargeItems || []).map((item, index) => (
              <div key={item.id || index} className="flex gap-2 mb-2 p-3 bg-gray-50 rounded border">
                <input
                  type="text"
                  value={item.name || ''}
                  onChange={(e) => {
                    const newItems = [...(normalizedPriceInfo.additionalChargeItems || [])];
                    newItems[index] = { ...newItems[index], name: e.target.value };
                    handleChange('additionalChargeItems', newItems);
                  }}
                  placeholder="항목명 (예: 주차비)"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <input
                  type="text"
                  value={item.price || ''}
                  onChange={(e) => {
                    const newItems = [...(normalizedPriceInfo.additionalChargeItems || [])];
                    newItems[index] = { ...newItems[index], price: e.target.value };
                    handleChange('additionalChargeItems', newItems);
                  }}
                  placeholder="가격 (예: 10,000)"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <select
                  value={item.unit || '박'}
                  onChange={(e) => {
                    const newItems = [...(normalizedPriceInfo.additionalChargeItems || [])];
                    newItems[index] = { ...newItems[index], unit: e.target.value };
                    handleChange('additionalChargeItems', newItems);
                  }}
                  className="px-2 py-1 border rounded text-sm"
                >
                  <option value="박">박</option>
                  <option value="일">일</option>
                  <option value="인">인</option>
                  <option value="회">회</option>
                  <option value="대">대</option>
                </select>
                <input
                  type="text"
                  value={item.description || ''}
                  onChange={(e) => {
                    const newItems = [...(normalizedPriceInfo.additionalChargeItems || [])];
                    newItems[index] = { ...newItems[index], description: e.target.value };
                    handleChange('additionalChargeItems', newItems);
                  }}
                  placeholder="설명 (선택사항)"
                  className="flex-1 px-2 py-1 border rounded text-sm"
                />
                <button
                  onClick={() => {
                    const newItems = (normalizedPriceInfo.additionalChargeItems || []).filter((_, i) => i !== index);
                    handleChange('additionalChargeItems', newItems);
                  }}
                  className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  삭제
                </button>
              </div>
            ))}
            
            {(!normalizedPriceInfo.additionalChargeItems || normalizedPriceInfo.additionalChargeItems.length === 0) && (
              <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-200 rounded">
                추가요금 항목이 없습니다. '+ 항목 추가' 버튼을 클릭하세요.
              </div>
            )}
          </div>

          {/* 템플릿 관리 */}
          <div className="border-t pt-4">
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => {
                  const template = {
                    weekendSurcharge,
                    holidaySurcharge,
                    seasonalRates,
                    additionalChargeItems: normalizedPriceInfo.additionalChargeItems || []
                  };
                  localStorage.setItem('additionalChargesTemplate', JSON.stringify(template));
                  setMessage('✅ 추가요금 템플릿이 저장되었습니다.');
                  setTimeout(() => setMessage(''), 3000);
                }}
                className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                💾 템플릿 저장
              </button>
              <button
                onClick={() => {
                  try {
                    const template = JSON.parse(localStorage.getItem('additionalChargesTemplate') || '{}');
                    if (template.weekendSurcharge !== undefined) {
                      handleChange('weekendSurcharge', template.weekendSurcharge);
                      handleChange('holidaySurcharge', template.holidaySurcharge);
                      handleChange('seasonalRates', template.seasonalRates);
                      handleChange('additionalChargeItems', template.additionalChargeItems || []);
                      setMessage('✅ 추가요금 템플릿을 불러왔습니다.');
                      setTimeout(() => setMessage(''), 3000);
                    } else {
                      setMessage('❌ 저장된 템플릿이 없습니다.');
                      setTimeout(() => setMessage(''), 3000);
                    }
                  } catch (error) {
                    setMessage('❌ 템플릿 불러오기 실패');
                    setTimeout(() => setMessage(''), 3000);
                  }
                }}
                className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                📂 템플릿 불러오기
              </button>
              <button
                onClick={() => {
                  handleChange('weekendSurcharge', '');
                  handleChange('holidaySurcharge', '');
                  handleChange('seasonalRates', '');
                  handleChange('additionalChargeItems', []);
                  setMessage('✅ 추가요금 정보가 초기화되었습니다.');
                  setTimeout(() => setMessage(''), 3000);
                }}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                🗑️ 초기화
              </button>
            </div>
            
            {/* 종합 테스트 버튼 */}
            <div className="border-t pt-4 mt-4">
              <h5 className="text-sm font-medium mb-2">🧪 기능 테스트</h5>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => {
                    // 테스트 데이터 자동 입력 (기존 필드들)
                    handleChange('weekendSurcharge', '금토일 20% 할증');
                    handleChange('holidaySurcharge', '연휴 30% 할증');
                    handleChange('seasonalRates', '성수기(7-8월): 기본요금 + 30%\n비수기(11-2월): 기본요금 - 20%');
                    
                    // 요일별 추가요금 테스트 데이터
                    handleChange('mondaySurcharge', '0원');
                    handleChange('tuesdaySurcharge', '0원');
                    handleChange('wednesdaySurcharge', '0원');
                    handleChange('thursdaySurcharge', '0원');
                    handleChange('fridaySurcharge', '10,000원');
                    handleChange('saturdaySurcharge', '20,000원');
                    handleChange('sundaySurcharge', '15,000원');
                    
                    const testItems = [
                      { id: Date.now(), name: '주차비', price: '10,000', unit: '일', description: '지하주차장 이용' },
                      { id: Date.now() + 1, name: '조식', price: '20,000', unit: '인', description: '뷔페식 조식' },
                      { id: Date.now() + 2, name: '엑스트라베드', price: '30,000', unit: '박', description: '추가 침구' }
                    ];
                    handleChange('additionalChargeItems', testItems);
                    setMessage('✅ 테스트 데이터가 입력되었습니다. (요일별 추가요금 포함)');
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  className="px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                >
                  🧪 테스트 데이터 입력
                </button>
                <button
                  onClick={() => {
                    // 현재 데이터 콘솔 출력
                    console.log('=== 추가요금 데이터 확인 ===');
                    console.log('주말 추가요금:', weekendSurcharge);
                    console.log('성수기/공휴일 추가요금:', holidaySurcharge);
                    console.log('계절별 요금 정보:', seasonalRates);
                    console.log('동적 추가요금 항목들:', normalizedPriceInfo.additionalChargeItems);
                    console.log('전체 pricing 데이터:', normalizedPriceInfo);
                    setMessage('✅ 데이터가 콘솔에 출력되었습니다.');
                    setTimeout(() => setMessage(''), 3000);
                  }}
                  className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                >
                  🔍 데이터 확인
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 가격표 목록 */}
      <div className="card">
        <div className="card-header">
          <h4 className="font-semibold m-0">추가요금 목록</h4>
          <p className="text-sm text-secondary m-0 mt-1">각 객실별 요일별 추가요금을 설정하세요</p>
        </div>
        <div className="card-body">
          {Array.isArray(lodges) && lodges.length > 0 ? (
            lodges.map((lodge, lodgeIndex) => (
              <div key={lodgeIndex} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={lodge.name || ''}
                        onChange={(e) => handleLodgeNameChange(lodgeIndex, e.target.value)}
                        placeholder="호텔명을 입력하세요"
                        className="font-semibold text-lg bg-transparent border-b border-dashed border-gray-300 focus:border-blue-500 focus:outline-none"
                        autoComplete="off"
                        tabIndex={100 + lodgeIndex}
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          padding: '4px 8px',
                          minWidth: '200px',
                          pointerEvents: 'auto',
                          userSelect: 'text',
                          cursor: 'text'
                        }}
                      />
                      <div className="text-sm text-gray-500">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs">
                          💰 추가요금도 여기서 관리 가능
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log('🔥 객실 추가 버튼 DOM 클릭됨!', lodgeIndex);
                          addRoom(lodgeIndex);
                        }}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 cursor-pointer"
                        style={{ pointerEvents: 'auto', zIndex: 1000 }}
                      >
                        + 객실 추가
                      </button>
                      {lodges.length > 1 && (
                        <button 
                          onClick={() => removeLodge(lodgeIndex)}
                          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          호텔 삭제
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body">
                {Array.isArray(lodge.rooms) && lodge.rooms.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 p-2">
                            <input 
                              type="text" 
                              value={headerLabels.roomCategory || ''} 
                              onChange={(e) => handleHeaderLabelChange('roomCategory', e.target.value)} 
                              className="w-full text-center font-semibold bg-transparent"
                              placeholder="객실"
                              style={{ minWidth: '80px' }}
                            />
                          </th>
                          <th className="border border-gray-300 p-2">
                            <input 
                              type="text" 
                              value={headerLabels.roomType || ''} 
                              onChange={(e) => handleHeaderLabelChange('roomType', e.target.value)} 
                              className="w-full text-center font-semibold bg-transparent"
                              placeholder="객실 유형"
                              style={{ minWidth: '100px' }}
                            />
                          </th>
                          <th className="border border-gray-300 p-2">
                            <input 
                              type="text" 
                              value={headerLabels.view || ''} 
                              onChange={(e) => handleHeaderLabelChange('view', e.target.value)} 
                              className="w-full text-center font-semibold bg-transparent"
                              placeholder="전망"
                              style={{ minWidth: '80px' }}
                            />
                          </th>
                          {Array.isArray(dayTypes) && dayTypes.map(type => (
                            <th key={type.id || type.type || type.name || Math.random()} className="border border-gray-300 p-2">
                              <div className="text-center font-semibold" style={{ minWidth: '100px' }}>
                                {type.name || ''}
                              </div>
                            </th>
                          ))}
                          <th className="border border-gray-300 p-2" style={{ minWidth: '120px' }}>관리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lodge.rooms.map((room, roomIndex) => (
                          Array.isArray(room.viewTypes) && room.viewTypes.length > 0 ? (
                            room.viewTypes.map((viewType, viewTypeIndex) => (
                              <tr key={`${roomIndex}-${viewTypeIndex}`} className="hover:bg-gray-50">
                                {viewTypeIndex === 0 && ( // 첫 번째 전망 유형에만 병합된 셀 표시
                                  <td rowSpan={room.viewTypes.length} className="border border-gray-300 p-2">
                                    <input
                                      type="text"
                                      value={room.name || ''}
                                      onChange={(e) => handleRoomInfoChange(lodgeIndex, roomIndex, 'name', e.target.value)}
                                      placeholder="객실명"
                                      className="w-full p-1 border rounded text-sm"
                                      style={{ minWidth: '70px' }}
                                    />
                                  </td>
                                )}
                                {viewTypeIndex === 0 && ( // 첫 번째 전망 유형에만 병합된 셀 표시
                                  <td rowSpan={room.viewTypes.length} className="border border-gray-300 p-2">
                                    <input
                                      type="text"
                                      value={room.roomType || ''}
                                      onChange={(e) => handleRoomInfoChange(lodgeIndex, roomIndex, 'roomType', e.target.value)}
                                      placeholder="객실 유형"
                                      className="w-full p-1 border rounded text-sm"
                                      style={{ minWidth: '90px' }}
                                    />
                                  </td>
                                )}
                                <td className="border border-gray-300 p-2">
                                  <input
                                    type="text"
                                    value={viewType.name || ''}
                                    onChange={(e) => handleViewTypeNameChange(lodgeIndex, roomIndex, viewTypeIndex, e.target.value)}
                                    placeholder="전망"
                                    className="w-full p-1 border rounded text-sm"
                                    style={{ minWidth: '70px' }}
                                  />
                                </td>
                                {Array.isArray(dayTypes) && dayTypes.map(type => (
                                  <td key={type.id || type.type || type.name || Math.random()} className="border border-gray-300 p-2">
                                    <input
                                      type="text"
                                      value={viewType.prices?.[type.type] !== undefined ? 
                                        (viewType.prices[type.type] || '').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                      onChange={(e) => handleViewTypePriceChange(lodgeIndex, roomIndex, viewTypeIndex, type.type, e.target.value)}
                                      placeholder="0"
                                      className="w-full p-1 border rounded text-sm text-right"
                                      style={{ minWidth: '90px' }}
                                    />
                                  </td>
                                ))}
                                <td className="border border-gray-300 p-2">
                                  <div className="flex flex-col gap-1">
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🔥 전망 추가 버튼 DOM 클릭됨!', lodgeIndex, roomIndex);
                                        addViewType(lodgeIndex, roomIndex);
                                      }}
                                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 cursor-pointer"
                                      style={{ pointerEvents: 'auto', zIndex: 1000 }}
                                    >
                                      전망 추가
                                    </button>
                                    {room.viewTypes.length > 1 && (
                                      <button 
                                        onClick={() => removeViewType(lodgeIndex, roomIndex, viewTypeIndex)}
                                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                      >
                                        삭제
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : ( // viewTypes가 없는 경우 기본 행 렌더링
                            <tr key={roomIndex} className="hover:bg-gray-50">
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="text"
                                  value={room.name || ''}
                                  onChange={(e) => handleRoomInfoChange(lodgeIndex, roomIndex, 'name', e.target.value)}
                                  placeholder="객실명"
                                  className="w-full p-1 border rounded text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="text"
                                  value={room.roomType || ''}
                                  onChange={(e) => handleRoomInfoChange(lodgeIndex, roomIndex, 'roomType', e.target.value)}
                                  placeholder="객실 유형"
                                  className="w-full p-1 border rounded text-sm"
                                />
                              </td>
                              <td className="border border-gray-300 p-2">
                                <input
                                  type="text"
                                  value={room.view || ''}
                                  onChange={(e) => handleRoomInfoChange(lodgeIndex, roomIndex, 'view', e.target.value)}
                                  placeholder="전망"
                                  className="w-full p-1 border rounded text-sm"
                                />
                              </td>
                              {Array.isArray(dayTypes) && dayTypes.map(type => (
                                <td key={type.id || type.type || type.name || Math.random()} className="border border-gray-300 p-2">
                                  <input
                                    type="text"
                                    value={room.prices?.[type.type] !== undefined ? 
                                      (room.prices[type.type] || '').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                    onChange={(e) => handleRoomInfoChange(lodgeIndex, roomIndex, `price_${type.type}`, e.target.value)}
                                    placeholder="0"
                                    className="w-full p-1 border rounded text-sm text-right"
                                  />
                                </td>
                              ))}
                              <td className="border border-gray-300 p-2">
                                                                  <div className="flex flex-col gap-1">
                                    <button 
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        console.log('🔥 전망 추가 버튼 DOM 클릭됨!', lodgeIndex, roomIndex);
                                        addViewType(lodgeIndex, roomIndex);
                                      }}
                                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 cursor-pointer"
                                      style={{ pointerEvents: 'auto', zIndex: 1000 }}
                                    >
                                      + 전망 추가
                                    </button>
                                  {lodge.rooms.length > 1 && (
                                    <button 
                                      onClick={() => removeRoom(lodgeIndex, roomIndex)}
                                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                                    >
                                      🗑️ 객실 삭제
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-4xl mb-2">🏨</div>
                    <p>등록된 객실이 없습니다. 객실을 추가하세요.</p>
                  </div>
                )}
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <div className="card-body text-center text-gray-500">
                <div className="text-4xl mb-4">🏨</div>
                <p>등록된 호텔이 없습니다. 호텔을 추가하세요.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 액션 버튼들 */}
      <div style={{ 
        margin: '2rem 0',
        padding: '1.5rem',
        border: '2px dashed #d1d5db',
        borderRadius: '0.75rem',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '1rem',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <button 
            onClick={addHotel}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2563eb';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#3b82f6';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🏨 호텔 추가
          </button>
          <button 
            onClick={() => setShowDayTypeModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              minWidth: '120px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#4b5563';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#6b7280';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ⚙️ 가격 유형 관리
          </button>
          <button 
            onClick={() => setShowBulkEditModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              minWidth: '140px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#047857';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#059669';
              e.target.style.transform = 'scale(1)';
            }}
          >
            💰 가격 일괄 수정
          </button>
          <button 
            onClick={() => setShowCalculatorModal(true)}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              minWidth: '140px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#6d28d9';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#7c3aed';
              e.target.style.transform = 'scale(1)';
            }}
          >
            🧮 가격 계산기
          </button>
          <button 
            onClick={loadSampleData}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              minWidth: '140px'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#4b5563';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#6b7280';
              e.target.style.transform = 'scale(1)';
            }}
          >
            📋 샘플 데이터
          </button>
        </div>
        <p style={{ 
          textAlign: 'center', 
          fontSize: '0.8rem', 
          color: '#64748b', 
          margin: 0 
        }}>
          💡 추가요금 설정 후 CRUD 관리에서 전체 템플릿을 저장하세요
        </p>
      </div>

      {showDayTypeModal && <DayTypeModal />}
      {showBulkEditModal && <BulkEditModal />}
      {showCalculatorModal && <CalculatorModal />}
    </div>
  );
}

export default PriceTable;