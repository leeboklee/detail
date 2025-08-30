'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense, memo, lazy, useRef } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Input, Card, CardBody, CardHeader, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner } from "@heroui/react";
import { usePerformance } from '@/hooks/usePerformance';
import styles from './PriceTable.module.css';

// 동적 로딩으로 초기 번들 크기 감소
const VirtualizedTable = lazy(() => import('@/components/ui/VirtualizedTable').then(m => ({ default: m.VirtualizedTable })));
const EditableCell = lazy(() => import('@/components/ui/VirtualizedTable').then(m => ({ default: m.EditableCell })));
const NumberCell = lazy(() => import('@/components/ui/VirtualizedTable').then(m => ({ default: m.NumberCell })));
const PerformanceMonitor = lazy(() => import('@/components/ui/PerformanceMonitor').then(m => ({ default: m.PerformanceMonitor })));

// 스켈레톤 UI 컴포넌트 (메모이제이션)
const PriceTableSkeleton = memo(() => (
  <div className="space-y-6 animate-pulse">
    <div className="h-20 bg-gray-200 rounded"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
));

// 최적화된 입력 컴포넌트
const OptimizedInput = memo(({ label, value, onChange, placeholder, ...props }) => {
  return (
    <Input
      label={label}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      size="sm"
      variant="bordered"
      classNames={{
        input: "text-black bg-white",
        label: "text-gray-700 font-medium mb-2 text-sm",
        inputWrapper: "h-10 border border-gray-300 rounded-lg shadow-sm"
      }}
      {...props}
    />
  );
});

// 최적화된 요금 입력 셀
const PriceCell = memo(({ value, onChange, placeholder = "0", suffix = "원" }) => {
  const handleChange = useCallback((e) => {
    // 쉼표 제거 후 숫자만 추출
    const newValue = e.target.value.replace(/[^0-9]/g, '');
    onChange && onChange(newValue);
  }, [onChange]);

  // 천 단위 구분 쉼표 추가
  const formatNumber = (num) => {
    if (!num) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <Input
      value={formatNumber(value)}
      onChange={handleChange}
      placeholder={placeholder}
      endContent={<span className="text-small text-gray-500">{suffix}</span>}
      size="sm"
      variant="bordered"
      classNames={{
        input: "text-right pr-0 text-black bg-white",
        inputWrapper: "h-9 min-h-9 border border-gray-300 rounded-md shadow-sm"
      }}
    />
  );
});

// 최적화된 텍스트 입력 셀
const TextCell = memo(({ value, onChange, placeholder }) => {
  return (
    <Input
      value={value || ''}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      size="sm"
      variant="bordered"
      classNames={{
        input: "text-black bg-white",
        inputWrapper: "h-9 min-h-9 border border-gray-300 rounded-md shadow-sm"
      }}
    />
  );
});

// 기본 데이터를 별도 파일로 분리하여 초기 로딩 최적화
const DEFAULT_PRICING_DATA = {
  title: '소노휴 양평 리조트 룰온리',
  notes: [
    '투숙 시 제공되는 상품 세부 구성에 대한 부분 협의를 불가합니다.',
    '부대시설 이용영업은 인한 부분화폐을 불가합니다.',
    '각 패키지에 제공되는 식사 및 이용권은 패키지 호텔의 물의됩니다.',
    '해당 상품은 프로모션 상품으로, 조기 종료될 수 있습니다.'
  ],
  additionalInfo: {
    paymentInfo: '패밀리 / 주중', // "스탠다드" 제거
    additionalCharges: '추가요금 결제방법 : 구매후 접수 및 결제 페이지 진출',
    availabilityInfo: '현장수량 소진시 사전 공지없이 가격변동될 수 있습니다.'
  },
  priceTable: {
    roomTypes: [
      {
        id: 'family',
        name: '패밀리',
        types: [
          {
            id: 'garden',
            name: '가든뷰',
            prices: {
              weekdays: { weekend: 24000, friday: 54000, saturday: 104000 },
              weekend: { weekend: 40000, friday: 70000, saturday: 120000 }
            }
          }
        ]
      },
      {
        id: 'suite',
        name: '스위트',
        types: [
          {
            id: 'garden',
            name: '가든뷰',
            prices: {
              weekdays: { weekend: 40000, friday: 70000, saturday: 120000 }
            }
          }
        ]
      }
    ]
  }
};

// 기본 템플릿 데이터
const DEFAULT_PRICING_TEMPLATES = [
  {
    id: 'greenpia-resort-pricing',
    name: '그린피아 리조트 요금표',
    data: {
      title: '그린피아 리조트 요금표',
      notes: [
        '추가요금 결제방법: 구매후 접수 및 결제 페이지 전송',
        '한정수량 소진시 사전 공지없이 가격변동될 수 있습니다.'
      ],
      additionalInfo: {
        paymentInfo: '결제 대표요금',
        additionalCharges: '추가요금 결제방법: 구매후 접수 및 결제 페이지 전송',
        availabilityInfo: '한정수량 소진시 사전 공지없이 가격변동될 수 있습니다.'
      },
      priceTable: {
        roomTypes: [
          {
            id: 'greenpia25',
            name: '그린피아25 마운틴뷰',
            types: [
              {
                id: 'mountain-view',
                name: '마운틴뷰',
                days: [
                  { period: '10/3~10/8', name: '전체요일', price: '119,000' },
                  { period: '8/18~9/30', name: '일~목요일', price: '추가요금 없음' },
                  { period: '10/1~10/31', name: '금요일', price: '22,000' },
                  { period: '10/1~10/31', name: '토요일/공휴일', price: '31,000' }
                ]
              }
            ]
          },
          {
            id: 'greenpia38',
            name: '그린피아38 마운틴뷰',
            types: [
              {
                id: 'mountain-view',
                name: '마운틴뷰',
                days: [
                  { period: '10/3~10/8', name: '전체요일', price: '63,000' },
                  { period: '8/18~9/30', name: '일~목요일', price: '107,000' },
                  { period: '10/1~10/31', name: '금요일', price: '141,000' },
                  { period: '10/1~10/31', name: '토요일/공휴일', price: '141,000' }
                ]
              }
            ]
          }
        ]
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'sono-hotel-pricing',
    name: '소노휴 양평 리조트 룰온리',
    data: {
      title: '소노휴 양평 리조트 룰온리',
      notes: [
        '투숙 시 제공되는 상품 세부 구성에 대한 부분 협의를 불가합니다.',
        '부대시설 이용영업은 인한 부분화폐를 불가합니다.',
        '각 패키지에 제공되는 식사 및 이용권은 패키지 호텔의 물의됩니다.',
        '해당 상품은 프로모션 상품으로, 조기 종료될 수 있습니다.'
      ],
      additionalInfo: {
        paymentInfo: '패밀리 / 주중',
        additionalCharges: '추가요금 결제방법 : 구매후 접수 및 결제 페이지 진출',
        availabilityInfo: '현장수량 소진시 사전 공지없이 가격변동될 수 있습니다.'
      },
      priceTable: {
        roomTypes: [
          {
            id: 'family',
            name: '패밀리',
            types: [
              {
                id: 'garden',
                name: '가든뷰',
                prices: {
                  weekdays: { weekend: 24000, friday: 54000, saturday: 104000 },
                  weekend: { weekend: 40000, friday: 70000, saturday: 120000 }
                }
              }
            ]
          },
          {
            id: 'suite',
            name: '스위트',
            types: [
              {
                id: 'garden',
                name: '가든뷰',
                prices: {
                  weekdays: { weekend: 40000, friday: 70000, saturday: 120000 }
                }
              }
            ]
          }
        ]
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 메인 컴포넌트를 메모이제이션으로 최적화
const PriceTable = memo(function PriceTable({ value = {}, onChange, displayMode = true }) {
  const [pricingData, setPricingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);
  // 단일 표 모드로 통일 (가상화 제거)

  // 성능 모니터링
  const performanceMetrics = usePerformance('PriceTable');
  // 부모-자식 양방향 업데이트 루프 방지 플래그
  const syncingRef = useRef(false);

  // pricingData 변경 시 onChange 호출 (무한 루프 방지)
  useEffect(() => {
    if (!pricingData || !onChange) return;
    if (syncingRef.current) { // 부모에서 value로 들어온 동기화 이후 첫 렌더는 스킵
      syncingRef.current = false;
      return;
    }
    onChange(pricingData);
  }, [pricingData, onChange]);

  // 메모이제이션된 데이터 업데이트 함수
  const updateData = useCallback((field, newValue) => {
    setPricingData(prev => {
      const updated = { ...prev, [field]: newValue };
      return updated;
    });
  }, []);

  const updateNestedData = useCallback((path, newValue) => {
    const pathArray = path.split('.');
    setPricingData(prev => {
      const updated = { ...prev };
      let current = updated;
      
      for (let i = 0; i < pathArray.length - 1; i++) {
        current[pathArray[i]] = { ...current[pathArray[i]] };
        current = current[pathArray[i]];
      }
      
      current[pathArray[pathArray.length - 1]] = newValue;
      return updated;
    });
  }, []);

  // 메모이제이션된 객실 타입 추가 함수
  const addRoomType = useCallback(() => {
    const newRoomType = {
      id: Date.now().toString(),
      name: '새 평형',
      types: [
        {
          id: 'standard',
          name: '새 타입',
          days: [
            { period: '', name: '토요일', price: '' },
            { period: '', name: '일요일', price: '' }
          ]
        }
      ]
    };
    
    setPricingData(prev => {
      const updated = {
        ...prev,
        priceTable: {
          ...prev.priceTable,
          roomTypes: [...(prev.priceTable?.roomTypes || []), newRoomType]
        }
      };
      return updated;
    });
  }, []);

  // 메모이제이션된 가격 업데이트 함수
  const updateRoomTypePriceLegacy = useCallback((roomTypeIndex, typeIndex, period, day, price) => {
    setPricingData(prev => {
      const updated = { ...prev };
      if (!updated.priceTable) updated.priceTable = { roomTypes: [] };
      if (!updated.priceTable.roomTypes[roomTypeIndex]) return prev;
      
      const roomType = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const typeObj = { ...roomType.types[typeIndex] };
      
      if (!typeObj.prices) typeObj.prices = {};
      if (!typeObj.prices[period]) typeObj.prices[period] = {};
      
      // 빈문자 그대로 저장 (미리보기 동기화 목적)
      typeObj.prices[period][day] = price;
      roomType.types[typeIndex] = typeObj;
      updated.priceTable.roomTypes[roomTypeIndex] = roomType;
      
      return updated;
    });
  }, []);

  // 새로운 days 배열 업데이트 함수
  const updateRoomTypeDay = useCallback((roomTypeIndex, typeIndex, dayIndex, patch) => {
    setPricingData(prev => {
      const updated = { ...prev };
      if (!updated.priceTable) updated.priceTable = { roomTypes: [] };
      if (!updated.priceTable.roomTypes[roomTypeIndex]) return prev;
      
      const roomType = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const typeObj = { ...roomType.types[typeIndex] };
      const days = Array.isArray(typeObj.days) ? [...typeObj.days] : [];
      days[dayIndex] = { ...days[dayIndex], ...patch };
      typeObj.days = days;
      roomType.types[typeIndex] = typeObj;
      updated.priceTable.roomTypes[roomTypeIndex] = roomType;
      
      return updated;
    });
  }, []);

  const addDay = useCallback((roomTypeIndex, typeIndex) => {
    setPricingData(prev => {
      const updated = { ...prev };
      const rt = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const type = { ...rt.types[typeIndex] };
      type.days = Array.isArray(type.days) ? [...type.days, { period: '', name: '', price: '' }] : [{ period: '', name: '', price: '' }];
      rt.types = [...rt.types];
      rt.types[typeIndex] = type;
      updated.priceTable.roomTypes = [...updated.priceTable.roomTypes];
      updated.priceTable.roomTypes[roomTypeIndex] = rt;
      return updated;
    });
  }, []);

  const removeDay = useCallback((roomTypeIndex, typeIndex, dayIndex) => {
    setPricingData(prev => {
      const updated = { ...prev };
      const rt = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const type = { ...rt.types[typeIndex] };
      type.days = (type.days || []).filter((_, i) => i !== dayIndex);
      rt.types = [...rt.types];
      rt.types[typeIndex] = type;
      updated.priceTable.roomTypes = [...updated.priceTable.roomTypes];
      updated.priceTable.roomTypes[roomTypeIndex] = rt;
      return updated;
    });
  }, []);

  // 기간(group) 일괄 수정/추가/삭제
  const updatePeriodForGroup = useCallback((roomTypeIndex, typeIndex, oldPeriod, newPeriod) => {
    setPricingData(prev => {
      const updated = { ...prev };
      const rt = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const type = { ...rt.types[typeIndex] };
      const nextDays = (type.days || []).map(d => (d.period === oldPeriod ? { ...d, period: newPeriod } : d));
      type.days = nextDays;
      rt.types = [...rt.types];
      rt.types[typeIndex] = type;
      updated.priceTable.roomTypes = [...updated.priceTable.roomTypes];
      updated.priceTable.roomTypes[roomTypeIndex] = rt;
      return updated;
    });
  }, []);

  const addDayToGroup = useCallback((roomTypeIndex, typeIndex, period) => {
    setPricingData(prev => {
      const updated = { ...prev };
      const rt = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const type = { ...rt.types[typeIndex] };
      const next = Array.isArray(type.days) ? [...type.days, { period, name: '', price: '' }] : [{ period, name: '', price: '' }];
      type.days = next;
      rt.types = [...rt.types];
      rt.types[typeIndex] = type;
      updated.priceTable.roomTypes = [...updated.priceTable.roomTypes];
      updated.priceTable.roomTypes[roomTypeIndex] = rt;
      return updated;
    });
  }, []);

  const removeGroup = useCallback((roomTypeIndex, typeIndex, period) => {
    setPricingData(prev => {
      const updated = { ...prev };
      const rt = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const type = { ...rt.types[typeIndex] };
      type.days = (type.days || []).filter(d => d.period !== period);
      rt.types = [...rt.types];
      rt.types[typeIndex] = type;
      updated.priceTable.roomTypes = [...updated.priceTable.roomTypes];
      updated.priceTable.roomTypes[roomTypeIndex] = rt;
      return updated;
    });
  }, []);

  // 메모이제이션된 템플릿 저장 함수
  const savePriceTemplate = useCallback(() => {
    try {
      const templateName = prompt('템플릿 이름을 입력하세요:');
      if (!templateName) return;

      const existingTemplates = JSON.parse(localStorage.getItem('priceTemplates') || '[]');
      const newTemplate = {
        id: Date.now(),
        name: templateName.trim(),
        template: pricingData,
        createdAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('priceTemplates', JSON.stringify(updatedTemplates));
      
      setTemplateList(updatedTemplates);
      alert('템플릿이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장에 실패했습니다: ' + error.message);
    }
  }, [pricingData]);

  // 메모이제이션된 템플릿 목록 가져오기 함수
  const fetchTemplateList = useCallback(() => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('priceTemplates') || '[]');
      setTemplateList(savedTemplates);
      setIsTemplateListOpen(true);
    } catch (error) {
      console.error('템플릿 목록 불러오기 오류:', error);
      alert('템플릿 목록을 불러올 수 없습니다: ' + error.message);
    }
  }, []);

  // 메모이제이션된 템플릿 불러오기 함수
  const loadSelectedTemplate = useCallback((template) => {
    const templateData = template.data || template.template;
    setPricingData(templateData);
    onChange?.(templateData);
    setIsTemplateListOpen(false);
    alert('템플릿을 성공적으로 불러왔습니다.');
  }, [onChange]);

  // 메모이제이션된 주의사항 추가 함수
  const addNote = useCallback(() => {
    setPricingData(prev => {
      const updated = [...(prev.notes || []), ''];
      return { ...prev, notes: updated };
    });
  }, []);

  // 메모이제이션된 주의사항 삭제 함수
  const removeNote = useCallback((index) => {
    setPricingData(prev => {
      const updated = prev.notes.filter((_, i) => i !== index);
      return { ...prev, notes: updated };
    });
  }, []);

  // 메모이제이션된 주의사항 업데이트 함수
  const updateNote = useCallback((index, value) => {
    setPricingData(prev => {
      const updated = [...(prev.notes || [])];
      updated[index] = value;
      return { ...prev, notes: updated };
    });
  }, []);

  // 메모이제이션된 객실 타입명 업데이트 함수
  const updateRoomTypeName = useCallback((roomIndex, newName) => {
    setPricingData(prev => {
      const updated = { ...prev };
      if (!updated.priceTable) updated.priceTable = { roomTypes: [] };
      if (!updated.priceTable.roomTypes[roomIndex]) return prev;
      updated.priceTable.roomTypes[roomIndex] = {
        ...updated.priceTable.roomTypes[roomIndex],
        name: newName
      };
      return updated;
    });
  }, []);

  // 메모이제이션된 타입명 업데이트 함수
  const updateTypeName = useCallback((roomIndex, typeIndex, newName) => {
    setPricingData(prev => {
      const updated = { ...prev };
      if (!updated.priceTable) updated.priceTable = { roomTypes: [] };
      if (!updated.priceTable.roomTypes[roomIndex]) return prev;
      const rt = { ...updated.priceTable.roomTypes[roomIndex] };
      const types = [...(rt.types || [])];
      if (!types[typeIndex]) return prev;
      types[typeIndex] = { ...types[typeIndex], name: newName };
      rt.types = types;
      updated.priceTable.roomTypes[roomIndex] = rt;
      return updated;
    });
  }, []);

  // 가상화된 테이블용 데이터 변환
  const tableData = useMemo(() => {
    if (!pricingData?.priceTable?.roomTypes) return [];
    
    const data = [];
    pricingData.priceTable.roomTypes.forEach((roomType, roomIndex) => {
      roomType.types.forEach((type, typeIndex) => {
        data.push({
          id: `${roomType.id}-${type.id}`,
          roomType: roomType.name,
          type: type.name,
          day1Name: type.dayNames?.day1 || '토요일',
          day1Price: type.prices?.weekdays?.day1 || '',
          day2Name: type.dayNames?.day2 || '10.4',
          day2Price: type.prices?.weekdays?.day2 || '',
          roomIndex,
          typeIndex
        });
      });
    });
    return data;
  }, [pricingData]);

  // 가상화된 테이블 컬럼 정의
  const columns = useMemo(() => [
    {
      key: 'roomType',
      label: '룸타입',
      width: '120px',
      render: (value, row, index, onUpdate) => (
        <EditableCell
          value={value}
          onUpdate={(newValue) => updateRoomTypeName(row.roomIndex, newValue)}
          placeholder={Labels["룸타입명_PH"]}
        />
      )
    },
    {
      key: 'type',
      label: '타입',
      width: '120px',
      render: (value, row, index, onUpdate) => (
        <EditableCell
          value={value}
          onUpdate={(newValue) => updateTypeName(row.roomIndex, row.typeIndex, newValue)}
          placeholder={Labels["타입명_PH"]}
        />
      )
    },
    {
      key: 'day1Name',
      label: '요일1',
      width: '100px',
      render: (value, row, index, onUpdate) => (
        <EditableCell
          value={value}
          onUpdate={(newValue) => updateRoomTypeDay(row.roomIndex, row.typeIndex, 0, { name: newValue })}
          placeholder={Labels["토요일_PH"]}
        />
      )
    },
    {
      key: 'day1Price',
      label: '가격1',
      width: '100px',
      render: (value, row, index, onUpdate) => (
        <NumberCell
          value={value}
          onUpdate={(newValue) => updateRoomTypeDay(row.roomIndex, row.typeIndex, 0, { price: newValue })}
          placeholder={Labels["0_PH"]}
          suffix="원"
        />
      )
    },
    {
      key: 'day2Name',
      label: '요일2',
      width: '100px',
      render: (value, row, index, onUpdate) => (
        <EditableCell
          value={value}
          onUpdate={(newValue) => updateRoomTypeDay(row.roomIndex, row.typeIndex, 1, { name: newValue })}
          placeholder={Labels["104_PH"]}
        />
      )
    },
    {
      key: 'day2Price',
      label: '가격2',
      width: '100px',
      render: (value, row, index, onUpdate) => (
        <NumberCell
          value={value}
          onUpdate={(newValue) => updateRoomTypeDay(row.roomIndex, row.typeIndex, 1, { price: newValue })}
          placeholder={Labels["0_PH_1"]}
          suffix="원"
        />
      )
    }
  ], [updateRoomTypeName, updateTypeName, updateRoomTypeDay]);

  // 데이터 초기화 및 로딩 (부모 value → 내부 상태 동기화, 루프 방지)
  useEffect(() => {
    try {
      if (value && Object.keys(value).length > 0) {
        const current = pricingData;
        const changed = JSON.stringify(current) !== JSON.stringify(value);
        if (changed) {
          syncingRef.current = true;
          setPricingData(value);
        }
      } else {
        // 기본 템플릿 로드
        loadDefaultTemplates();
      }
    } catch (error) {
      console.error('데이터 초기화 실패:', error);
      loadDefaultTemplates();
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // 기본 템플릿 로드
  const loadDefaultTemplates = useCallback(() => {
    try {
      // 로컬 스토리지에서 기본 템플릿 확인
      const savedTemplates = JSON.parse(localStorage.getItem('priceTemplates') || '[]');
      
      if (savedTemplates.length === 0) {
        // 기본 템플릿이 없으면 기본값으로 설정
        localStorage.setItem('priceTemplates', JSON.stringify(DEFAULT_PRICING_TEMPLATES));
        setTemplateList(DEFAULT_PRICING_TEMPLATES);
        
        // 첫 번째 기본 템플릿을 요금표로 로드
        if (DEFAULT_PRICING_TEMPLATES.length > 0) {
          const defaultData = DEFAULT_PRICING_TEMPLATES[0].data;
          setPricingData(defaultData);
          if (onChange) {
            onChange(defaultData);
          }
        }
      } else {
        setTemplateList(savedTemplates);
        // 기본 데이터 로드
        setPricingData(DEFAULT_PRICING_DATA);
      }
    } catch (error) {
      console.error('기본 템플릿 로드 오류:', error);
      setPricingData(DEFAULT_PRICING_DATA);
    }
  }, [onChange]);

  // 로딩 중일 때 스켈레톤 UI 표시
  if (isLoading || !pricingData) {
    return <PriceTableSkeleton />;
  }

  return (
    <div className={`space-y-6 ${styles.priceTableContainer}`}>
      {/* 성능 모니터링 토글 */}
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="flat"
          color="secondary"
          onPress={() => setShowPerformanceMonitor(!showPerformanceMonitor)}
        >
          {showPerformanceMonitor ? '성능 모니터 숨기기' : '성능 모니터 보기'}
        </Button>
      </div>

      {/* 성능 모니터링 */}
      {showPerformanceMonitor && (
        <div className="flex justify-center">
          <PerformanceMonitor componentName="PriceTable" />
        </div>
      )}

      {/* 헤더 정보 */}
      <Card>
        <CardHeader className="flex justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">리조트 요금표 관리</h3>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              color="success" 
              variant="bordered"
              onPress={() => {
                if (onChange) {
                  onChange(pricingData);
                }
                alert('요금표가 미리보기에 생성되었습니다.');
              }}
              startContent="✨"
            >
              생성
            </Button>
            <Button 
              size="sm" 
              color="success" 
              variant="bordered"
              onPress={() => {
                if (DEFAULT_PRICING_TEMPLATES.length > 0) {
                  const defaultTemplate = DEFAULT_PRICING_TEMPLATES[0];
                  setPricingData(defaultTemplate.data);
                  if (onChange) {
                    onChange(defaultTemplate.data);
                  }
                  alert('기본 템플릿을 불러왔습니다.');
                }
              }}
            >
              기본 템플릿 불러오기
            </Button>
            <Button 
              size="sm" 
              color="secondary" 
              variant="bordered"
              onPress={savePriceTemplate}
            >
              템플릿 저장
            </Button>
            <Button 
              size="sm" 
              color="primary" 
              variant="bordered"
              onPress={fetchTemplateList}
            >
              템플릿 목록
          </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label={Labels["리조트_타이틀"]}
            value={pricingData.title}
            onChange={(e) => updateData('title', e.target.value)}
            size="sm"
            classNames={{
              input: "text-black bg-white border-gray-300",
              label: "text-gray-700 font-medium mb-3 block",
              inputWrapper: "h-10"
            }}
          />
        </CardBody>
      </Card>

      {/* 결제 대표요금 - 요금표 위로 이동 */}
      <Card>
        <CardHeader>
          <h4 className="text-lg font-semibold">결제 대표요금</h4>
        </CardHeader>
        <CardBody>
          <Input
            label={Labels["결제_대표요금"]}
            value={pricingData.additionalInfo?.paymentInfo || ''}
            onChange={(e) => updateNestedData('additionalInfo.paymentInfo', e.target.value)}
            placeholder={Labels["예_패밀리_주중_PH"]}
            size="sm"
            classNames={{
              input: "text-black bg-white border-gray-300",
              label: "text-gray-700 font-medium mb-3 block",
              inputWrapper: "h-10"
            }}
          />
        </CardBody>
      </Card>

      {/* 최적화된 요금표 */}
      <Card>
        <CardHeader className="flex justify-between">
          <div className="flex items-center gap-4">
            <OptimizedInput
              label={Labels["요금표_제목"]}
              value={pricingData.priceTable?.title || '추가요금표'}
              onChange={(value) => updateNestedData('priceTable.title', value)}
              placeholder={Labels["추가요금표_PH"]}
              classNames={{
                input: "text-lg font-semibold"
              }}
            />
            {/* 상단 공통 기간 입력 제거 - 각 행의 기간 입력을 사용 */}
          </div>
          <div className="flex gap-2">
            <Button color="primary" size="sm" onPress={addRoomType}>
              객실 타입 추가
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {/* 단일 표 (가상화 제거) */}
          <div className="space-y-4">
              {pricingData.priceTable?.roomTypes?.map((roomType, roomIndex) => (
                <Card key={roomType.id || roomIndex} variant="bordered" className={`shadow-sm ${styles.roomTypeCard}`}>
                  <CardHeader className="pb-2">
                    <TextCell
                      value={roomType.name}
                      onChange={(value) => updateRoomTypeName(roomIndex, value)}
                      placeholder="룸타입명"
                    />
                  </CardHeader>
                  <CardBody className="pt-0 space-y-3">
                    {roomType.types?.map((type, typeIndex) => (
                      <div key={type.id || typeIndex}>
                        <div className="hidden" />
                        {/* 기간별 그룹 편집 UI - 삽입 순서 유지 */}
                        {(() => {
                          const order = [];
                          const map = new Map();
                          for (const d of (type.days || [])) {
                            const key = d.period || '';
                            if (!map.has(key)) {
                              map.set(key, []);
                              order.push(key);
                            }
                            map.get(key).push(d);
                          }
                          return order.map((periodKey, grpIdx) => [periodKey, map.get(periodKey)]);
                        })().map(([periodKey, daysInPeriod], grpIdx) => (
                          <div key={`grp-${grpIdx}`} className="mb-3 p-2 border rounded">
                            <div className="flex gap-2 items-center mb-2">
                              <TextCell
                                value={periodKey}
                                onChange={(value) => updatePeriodForGroup(roomIndex, typeIndex, periodKey, value)}
                                placeholder="입실 적용기간 (예: 10/3~10/8)"
                              />
                              <Button size="sm" variant="flat" onPress={() => addDayToGroup(roomIndex, typeIndex, periodKey)}>요일 추가</Button>
                              <Button size="sm" color="danger" variant="light" onPress={() => removeGroup(roomIndex, typeIndex, periodKey)}>그룹 삭제</Button>
                            </div>
                            {daysInPeriod.map((day, dayIdx) => (
                              <div key={dayIdx} className={styles.optimizedGrid}>
                                <TextCell
                                  value={day?.name}
                                  onChange={(value) => updateRoomTypeDay(roomIndex, typeIndex, (type.days || []).indexOf(day), { name: value })}
                                  placeholder="입실요일"
                                />
                                <PriceCell
                                  value={day?.price}
                                  onChange={(value) => updateRoomTypeDay(roomIndex, typeIndex, (type.days || []).indexOf(day), { price: value })}
                                />
                                <Button size="sm" variant="light" color="danger" onPress={() => removeDay(roomIndex, typeIndex, (type.days || []).indexOf(day))}>삭제</Button>
                              </div>
                            ))}
                          </div>
                        ))}
                        <div className="mt-2">
                          <Button size="sm" variant="flat" onPress={() => addDayToGroup(roomIndex, typeIndex, '')}>기간/요일 추가</Button>
                        </div>
                      </div>
                    ))}
                  </CardBody>
                </Card>
              ))}
              
              {(!pricingData.priceTable?.roomTypes || pricingData.priceTable.roomTypes.length === 0) && (
                <div className={styles.emptyState}>
                  <p>객실 타입을 추가하여 요금표를 작성하세요.</p>
                  <Button
                    className="mt-4"
                    color="primary"
                    variant="flat"
                    onPress={addRoomType}
                  >
                    첫 번째 객실 타입 추가하기
                  </Button>
                </div>
              )}
          </div>
        </CardBody>
      </Card>

      {/* 추가 정보 */}
      <Card>
        <CardHeader>
          <h4 className="text-lg font-semibold">추가 정보</h4>
        </CardHeader>
        <CardBody className="space-y-4">
          <OptimizedInput
            label={Labels["추가요금_결제방법"]}
            value={pricingData.additionalInfo?.additionalCharges || ''}
            onChange={(value) => updateNestedData('additionalInfo.additionalCharges', value)}
            placeholder={Labels["구매후_접수_및_결제_페이지_진출_PH"]}
          />
          
          <OptimizedInput
            label={Labels["현장수량_소진시_안내"]}
            value={pricingData.additionalInfo?.availabilityInfo || ''}
            onChange={(value) => updateNestedData('additionalInfo.availabilityInfo', value)}
            placeholder={Labels["현장수량_소진시_사전_공지없이_가격변동될_수_있습니다_PH"]}
          />
          
          {/* 최적화된 주의사항 섹션 */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-gray-700">{Labels.주의사항}</label>
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={addNote}
              >
                항목 추가
              </Button>
            </div>
            
            <div className="space-y-2">
              {pricingData.notes?.map((note, index) => (
                <div key={index} className={`${styles.noteItem} flex gap-2 items-center`}>
                  <div className="flex-1">
                    <TextCell
                      value={note}
                      onChange={(value) => updateNote(index, value)}
                      placeholder={`주의사항 ${index + 1}`}
                    />
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    isIconOnly
                    className={styles.actionButton}
                    onPress={() => removeNote(index)}
                  >
                    ✕
                  </Button>
                </div>
              ))}
              
              {(!pricingData.notes || pricingData.notes.length === 0) && (
                <div className={styles.emptyState}>
                  <p>주의사항을 추가해보세요.</p>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* 템플릿 목록 모달 */}
      <Modal 
        isOpen={isTemplateListOpen} 
        onClose={() => setIsTemplateListOpen(false)}
        size="lg"
        placement="center"
        classNames={{
          base: "max-w-2xl mx-auto",
          wrapper: "flex items-center justify-center p-4"
        }}
      >
        <ModalContent>
          <ModalHeader>요금표 템플릿 목록</ModalHeader>
          <ModalBody>
            {templateList.length > 0 ? (
              <div className="space-y-4">
                {templateList.map((template, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-gray-500">
                          생성일: {new Date(template.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          제목: {template.data?.title || template.template?.title || '제목 없음'}
                        </p>
                      </div>
                      <Button
                        color="primary"
                        size="sm"
                        onPress={() => loadSelectedTemplate(template)}
                      >
                        불러오기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">저장된 템플릿이 없습니다.</p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsTemplateListOpen(false)}>
              닫기
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
});

PriceTable.displayName = 'PriceTable';

export default PriceTable;