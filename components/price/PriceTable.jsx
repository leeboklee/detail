'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Button, Input, Card, CardBody, CardHeader, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Spinner } from "@heroui/react";
import { VirtualizedTable, EditableCell, NumberCell } from '@/components/ui/VirtualizedTable';
import { PerformanceMonitor, PerformanceIndicator } from '@/components/ui/PerformanceMonitor';
import { usePerformance, useDebounce } from '@/hooks/usePerformance';

// 스켈레톤 UI 컴포넌트
const PriceTableSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-20 bg-gray-200 rounded"></div>
    <div className="h-32 bg-gray-200 rounded"></div>
    <div className="h-64 bg-gray-200 rounded"></div>
  </div>
);

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
    paymentInfo: '패밀리 스탠다드 / 주중',
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
            id: 'standard',
            name: '스탠다드',
            prices: {
              weekdays: { weekend: 23000, friday: 69000 },
              weekend: { weekend: 16000, friday: 39000, saturday: 85000 }
          }
          },
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
            id: 'standard',
            name: '스탠다드',
            prices: {
              weekdays: { weekend: 24000, friday: 54000, saturday: 104000 }
            }
          },
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

export default function PriceTable({ value = {}, onChange }) {
  const [pricingData, setPricingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // 성능 모니터링
  const performanceMetrics = usePerformance('PriceTable');

  // 메모이제이션된 데이터 업데이트 함수
  const updateData = useCallback((field, newValue) => {
    setPricingData(prev => {
      const updated = { ...prev, [field]: newValue };
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

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
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  // 메모이제이션된 객실 타입 추가 함수
  const addRoomType = useCallback(() => {
    const newRoomType = {
      id: Date.now().toString(),
      name: '새 평형',
      types: [
        {
          id: 'standard',
          name: '새 타입',
          dayNames: {
            day1: '토요일',
            day2: '10.4'
          },
          prices: {
            weekdays: { day1: '', day2: '' }
          }
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
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  // 메모이제이션된 가격 업데이트 함수
  const updateRoomTypePrice = useCallback((roomTypeIndex, typeIndex, period, day, price) => {
    setPricingData(prev => {
      const updated = { ...prev };
      if (!updated.priceTable) updated.priceTable = { roomTypes: [] };
      if (!updated.priceTable.roomTypes[roomTypeIndex]) return prev;
      
      const roomType = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const typeObj = { ...roomType.types[typeIndex] };
      
      if (!typeObj.prices) typeObj.prices = {};
      if (!typeObj.prices[period]) typeObj.prices[period] = {};
      
      // 0이 아닌 값만 저장 (빠른 입력을 위해)
      typeObj.prices[period][day] = price === '' ? '' : (parseInt(price) || '');
      roomType.types[typeIndex] = typeObj;
      updated.priceTable.roomTypes[roomTypeIndex] = roomType;
      
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

  // 메모이제이션된 요일명 업데이트 함수
  const updateRoomTypeDayName = useCallback((roomTypeIndex, typeIndex, day, dayName) => {
    setPricingData(prev => {
      const updated = { ...prev };
      if (!updated.priceTable) updated.priceTable = { roomTypes: [] };
      if (!updated.priceTable.roomTypes[roomTypeIndex]) return prev;
      
      const roomType = { ...updated.priceTable.roomTypes[roomTypeIndex] };
      const typeObj = { ...roomType.types[typeIndex] };
      
      if (!typeObj.dayNames) typeObj.dayNames = {};
      typeObj.dayNames[day] = dayName;
      roomType.types[typeIndex] = typeObj;
      updated.priceTable.roomTypes[roomTypeIndex] = roomType;
      
      onChange?.(updated);
      return updated;
    });
  }, [onChange]);

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
    setPricingData(template.template);
    onChange?.(template.template);
    setIsTemplateListOpen(false);
    alert('템플릿을 성공적으로 불러왔습니다.');
  }, [onChange]);

  // 메모이제이션된 주의사항 추가 함수
  const addNote = useCallback(() => {
    setPricingData(prev => {
      const updated = [...(prev.notes || []), ''];
      const newData = { ...prev, notes: updated };
      onChange?.(newData);
      return newData;
    });
  }, [onChange]);

  // 메모이제이션된 주의사항 삭제 함수
  const removeNote = useCallback((index) => {
    setPricingData(prev => {
      const updated = prev.notes.filter((_, i) => i !== index);
      const newData = { ...prev, notes: updated };
      onChange?.(newData);
      return newData;
    });
  }, [onChange]);

  // 메모이제이션된 주의사항 업데이트 함수
  const updateNote = useCallback((index, value) => {
    setPricingData(prev => {
      const updated = [...(prev.notes || [])];
      updated[index] = value;
      const newData = { ...prev, notes: updated };
      onChange?.(newData);
      return newData;
    });
  }, [onChange]);

  // 메모이제이션된 객실 타입명 업데이트 함수
  const updateRoomTypeName = useCallback((roomIndex, newName) => {
    setPricingData(prev => {
      const updated = { ...prev };
      if (updated.priceTable?.roomTypes?.[roomIndex]) {
        updated.priceTable.roomTypes[roomIndex].name = newName;
        onChange?.(updated);
      }
      return updated;
    });
  }, [onChange]);

  // 메모이제이션된 타입명 업데이트 함수
  const updateTypeName = useCallback((roomIndex, typeIndex, newName) => {
    setPricingData(prev => {
      const updated = { ...prev };
      if (updated.priceTable?.roomTypes?.[roomIndex]?.types?.[typeIndex]) {
        updated.priceTable.roomTypes[roomIndex].types[typeIndex].name = newName;
        onChange?.(updated);
      }
      return updated;
    });
  }, [onChange]);

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
          placeholder="룸타입명"
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
          placeholder="타입명"
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
          onUpdate={(newValue) => updateRoomTypeDayName(row.roomIndex, row.typeIndex, 'day1', newValue)}
          placeholder="토요일"
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
          onUpdate={(newValue) => updateRoomTypePrice(row.roomIndex, row.typeIndex, 'weekdays', 'day1', newValue)}
          placeholder="0"
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
          onUpdate={(newValue) => updateRoomTypeDayName(row.roomIndex, row.typeIndex, 'day2', newValue)}
          placeholder="10.4"
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
          onUpdate={(newValue) => updateRoomTypePrice(row.roomIndex, row.typeIndex, 'weekdays', 'day2', newValue)}
          placeholder="0"
          suffix="원"
        />
      )
    }
  ], [updateRoomTypeName, updateTypeName, updateRoomTypeDayName, updateRoomTypePrice]);

  // 데이터 초기화 및 로딩
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 실제 데이터가 없을 때만 기본값 사용
        if (!value || Object.keys(value).length === 0) {
          setPricingData(DEFAULT_PRICING_DATA);
        } else {
          setPricingData(value);
        }
        
        // 컴포넌트 마운트 시 템플릿 목록 로드 (비동기)
        setTimeout(() => {
          try {
            const savedTemplates = JSON.parse(localStorage.getItem('priceTemplates') || '[]');
            setTemplateList(savedTemplates);
          } catch (error) {
            console.error('템플릿 로드 실패:', error);
            setTemplateList([]);
          }
        }, 100); // 지연 로딩으로 초기 렌더링 속도 향상
        
      } catch (error) {
        console.error('데이터 초기화 실패:', error);
        setPricingData(DEFAULT_PRICING_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [value]);

  // 로딩 중일 때 스켈레톤 UI 표시
  if (isLoading || !pricingData) {
    return <PriceTableSkeleton />;
  }

  return (
    <div className="space-y-6">
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
            <PerformanceIndicator componentName="PriceTable" />
          </div>
          <div className="flex gap-2">
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
            label="리조트 타이틀"
            value={pricingData.title}
            onChange={(e) => updateData('title', e.target.value)}
            size="sm"
            classNames={{
              input: "text-gray-800 bg-white border-gray-300",
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
            label="결제 대표요금"
            value={pricingData.additionalInfo?.paymentInfo || ''}
            onChange={(e) => updateNestedData('additionalInfo.paymentInfo', e.target.value)}
            placeholder="예: 패밀리 스탠다드 / 주중"
            size="sm"
            classNames={{
              input: "text-gray-800 bg-white border-gray-300",
              label: "text-gray-700 font-medium mb-3 block",
              inputWrapper: "h-10"
            }}
          />
        </CardBody>
      </Card>

      {/* 가상화된 요금표 */}
      <Card>
        <CardHeader className="flex justify-between">
          <div className="flex items-center gap-4">
            <Input
              label="요금표 제목"
              value={pricingData.priceTable?.title || '추가요금표'}
              onChange={(e) => updateNestedData('priceTable.title', e.target.value)}
              placeholder="추가요금표"
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-lg font-semibold",
                label: "text-gray-700 font-medium mb-3 block",
                inputWrapper: "h-10"
              }}
            />
            <Input
              label="기간"
              value={pricingData.priceTable?.period || '08.24~09.30'}
              onChange={(e) => updateNestedData('priceTable.period', e.target.value)}
              placeholder="08.24~09.30"
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium mb-3 block",
                inputWrapper: "h-10"
              }}
            />
          </div>
          <Button color="primary" size="sm" onPress={addRoomType}>
            객실 타입 추가
          </Button>
        </CardHeader>
        <CardBody>
          {/* 가상화된 테이블 사용 */}
          <VirtualizedTable
            data={tableData}
            columns={columns}
            rowHeight={80}
            visibleRows={8}
            onRowAdd={addRoomType}
          />
        </CardBody>
      </Card>

      {/* 추가 정보 */}
      <Card>
        <CardHeader>
          <h4 className="text-lg font-semibold">추가 정보</h4>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="추가요금 결제방법"
            value={pricingData.additionalInfo?.additionalCharges || ''}
            onChange={(e) => updateNestedData('additionalInfo.additionalCharges', e.target.value)}
            placeholder="구매후 접수 및 결제 페이지 진출"
            size="sm"
            classNames={{
              input: "text-gray-800 bg-white border-gray-300",
              label: "text-gray-700 font-medium"
            }}
          />
          
          <Input
            label="현장수량 소진시 안내"
            value={pricingData.additionalInfo?.availabilityInfo || ''}
            onChange={(e) => updateNestedData('additionalInfo.availabilityInfo', e.target.value)}
            placeholder="현장수량 소진시 사전 공지없이 가격변동될 수 있습니다"
            size="sm"
            classNames={{
              input: "text-gray-800 bg-white border-gray-300",
              label: "text-gray-700 font-medium"
            }}
          />
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">주의사항</label>
            {pricingData.notes?.map((note, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={note}
                  onChange={(e) => updateNote(index, e.target.value)}
                  size="sm"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300"
                  }}
                />
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  className="text-gray-800"
                  onPress={() => removeNote(index)}
                >
                  삭제
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              color="primary"
              variant="bordered"
              className="text-gray-800"
              onPress={addNote}
            >
              주의사항 추가
            </Button>
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
                          제목: {template.template?.title || '제목 없음'}
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
}