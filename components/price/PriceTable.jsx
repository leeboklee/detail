'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Card, CardBody, CardHeader, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";

export default function PriceTable({ value = {}, onChange }) {
  const [pricingData, setPricingData] = useState(() => ({
    title: value.title || '소노휴 양평 리조트 룰온리',
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
    },
    ...value
  }));

  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);
  const [templateList, setTemplateList] = useState([]);

  const updateData = (field, newValue) => {
    const updated = { ...pricingData, [field]: newValue };
    setPricingData(updated);
    onChange?.(updated);
  };

  const updateNestedData = (path, newValue) => {
    const pathArray = path.split('.');
    const updated = { ...pricingData };
    let current = updated;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      current[pathArray[i]] = { ...current[pathArray[i]] };
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = newValue;
    setPricingData(updated);
    onChange?.(updated);
  };

  const addRoomType = () => {
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
    
    const updated = {
      ...pricingData,
      priceTable: {
        ...pricingData.priceTable,
        roomTypes: [...(pricingData.priceTable?.roomTypes || []), newRoomType]
      }
    };
    setPricingData(updated);
    onChange?.(updated);
  };

  const updateRoomTypePrice = (roomTypeIndex, typeIndex, period, day, price) => {
    const updated = { ...pricingData };
    if (!updated.priceTable) updated.priceTable = { roomTypes: [] };
    if (!updated.priceTable.roomTypes[roomTypeIndex]) return;
    
    const roomType = { ...updated.priceTable.roomTypes[roomTypeIndex] };
    const typeObj = { ...roomType.types[typeIndex] };
    
    if (!typeObj.prices) typeObj.prices = {};
    if (!typeObj.prices[period]) typeObj.prices[period] = {};
    
    // 0이 아닌 값만 저장 (빠른 입력을 위해)
    typeObj.prices[period][day] = price === '' ? '' : (parseInt(price) || '');
    roomType.types[typeIndex] = typeObj;
    updated.priceTable.roomTypes[roomTypeIndex] = roomType;
    
    setPricingData(updated);
    onChange?.(updated);
  };

  const updateRoomTypeDayName = (roomTypeIndex, typeIndex, day, dayName) => {
    const updated = { ...pricingData };
    if (!updated.priceTable) updated.priceTable = { roomTypes: [] };
    if (!updated.priceTable.roomTypes[roomTypeIndex]) return;
    
    const roomType = { ...updated.priceTable.roomTypes[roomTypeIndex] };
    const typeObj = { ...roomType.types[typeIndex] };
    
    if (!typeObj.dayNames) typeObj.dayNames = {};
    typeObj.dayNames[day] = dayName;
    roomType.types[typeIndex] = typeObj;
    updated.priceTable.roomTypes[roomTypeIndex] = roomType;
    
    setPricingData(updated);
    onChange?.(updated);
  };

  // 템플릿 저장 함수
  const savePriceTemplate = () => {
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
  };

  // 템플릿 목록 가져오기 함수
  const fetchTemplateList = () => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('priceTemplates') || '[]');
      setTemplateList(savedTemplates);
      setIsTemplateListOpen(true);
    } catch (error) {
      console.error('템플릿 목록 불러오기 오류:', error);
      alert('템플릿 목록을 불러올 수 없습니다: ' + error.message);
    }
  };

  // 선택된 템플릿 불러오기 함수
  const loadSelectedTemplate = (template) => {
    setPricingData(template.template);
    onChange?.(template.template);
    setIsTemplateListOpen(false);
    alert('템플릿을 성공적으로 불러왔습니다.');
  };

  useEffect(() => {
    if (value) {
      setPricingData(value);
    }
    
    // 컴포넌트 마운트 시 템플릿 목록 로드
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('priceTemplates') || '[]');
      setTemplateList(savedTemplates);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      setTemplateList([]);
    }
  }, [value]);

  return (
    <div className="space-y-6">
      {/* 헤더 정보 */}
      <Card>
        <CardHeader className="flex justify-between">
          <h3 className="text-lg font-semibold">리조트 요금표 관리</h3>
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

      {/* 추가요금표 */}
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="border border-gray-300 p-3 text-center">룸타입</th>
                  <th className="border border-gray-300 p-3 text-center">타입</th>
                  <th className="border border-gray-300 p-3 text-center">요일별 추가요금</th>
                </tr>
              </thead>
              <tbody>
                {pricingData.priceTable?.roomTypes?.map((roomType, roomIndex) => (
                  roomType.types.map((type, typeIndex) => (
                    <tr key={`${roomType.id}-${type.id}`} className="hover:bg-gray-50">
                      {typeIndex === 0 && (
                        <td 
                          className="border border-gray-300 p-3 text-center font-medium bg-gray-50"
                          rowSpan={roomType.types.length}
                        >
                          <Input
                            value={roomType.name}
                            onChange={(e) => {
                              const updated = { ...pricingData };
                              updated.priceTable.roomTypes[roomIndex].name = e.target.value;
                              setPricingData(updated);
                              onChange?.(updated);
                            }}
                            className="text-center"
                            placeholder="룸타입명"
                            size="sm"
                            classNames={{
                              input: "text-gray-800 bg-white border-gray-300 text-center"
                            }}
                          />
                        </td>
                      )}
                      <td className="border border-gray-300 p-3 text-center">
                        <Input
                          value={type.name}
                          onChange={(e) => {
                            const updated = { ...pricingData };
                            updated.priceTable.roomTypes[roomIndex].types[typeIndex].name = e.target.value;
                            setPricingData(updated);
                            onChange?.(updated);
                          }}
                          className="text-center"
                          placeholder="타입명"
                          size="sm"
                          classNames={{
                            input: "text-gray-800 bg-white border-gray-300 text-center"
                          }}
                        />
                      </td>
                      <td className="border border-gray-300 p-3">
                        <div className="space-y-3">
                          {/* 요일별 추가요금 입력 - 확장된 구조 */}
                          <div className="grid grid-cols-2 gap-3">
                            {/* 첫 번째 요일 */}
                            <div className="space-y-2">
                              <Input
                                label="요일명"
                                size="sm"
                                value={type.dayNames?.day1 || '토요일'}
                                onChange={(e) => updateRoomTypeDayName(roomIndex, typeIndex, 'day1', e.target.value)}
                                placeholder="예: 토요일, 10.3"
                                classNames={{
                                  input: "text-gray-800 bg-white border-gray-300",
                                  label: "text-xs text-gray-600"
                                }}
                              />
                              <Input
                                label="추가요금"
                                size="sm"
                                type="number"
                                value={type.prices?.weekdays?.day1 || ''}
                                onChange={(e) => updateRoomTypePrice(roomIndex, typeIndex, 'weekdays', 'day1', e.target.value)}
                                placeholder="추가요금 입력"
                                endContent={<span className="text-xs text-gray-600">원</span>}
                                classNames={{
                                  input: "text-gray-800 bg-white border-gray-300"
                                }}
                              />
                            </div>
                            {/* 두 번째 요일 */}
                            <div className="space-y-2">
                              <Input
                                label="요일명"
                                size="sm"
                                value={type.dayNames?.day2 || '10.4'}
                                onChange={(e) => updateRoomTypeDayName(roomIndex, typeIndex, 'day2', e.target.value)}
                                placeholder="예: 10.4, 일요일"
                                classNames={{
                                  input: "text-gray-800 bg-white border-gray-300",
                                  label: "text-xs text-gray-600"
                                }}
                              />
                              <Input
                                label="추가요금"
                                size="sm"
                                type="number"
                                value={type.prices?.weekdays?.day2 || ''}
                                onChange={(e) => updateRoomTypePrice(roomIndex, typeIndex, 'weekdays', 'day2', e.target.value)}
                                placeholder="추가요금 입력"
                                endContent={<span className="text-xs text-gray-600">원</span>}
                                classNames={{
                                  input: "text-gray-800 bg-white border-gray-300"
                                }}
                              />
                            </div>
                          </div>
                          {/* 추가 요일 버튼 */}
                          <Button 
                            size="sm" 
                            variant="flat" 
                            color="secondary"
                            onPress={() => {
                              // 추가 요일 로직 구현
                              console.log('추가 요일 추가');
                            }}
                          >
                            + 요일 추가
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ))}
              </tbody>
            </table>
          </div>
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
                  onChange={(e) => {
                    const updated = [...(pricingData.notes || [])];
                    updated[index] = e.target.value;
                    updateData('notes', updated);
                  }}
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
                  onPress={() => {
                    const updated = pricingData.notes.filter((_, i) => i !== index);
                    updateData('notes', updated);
                  }}
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
              onPress={() => {
                const updated = [...(pricingData.notes || []), ''];
                updateData('notes', updated);
              }}
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