'use client';

import React, { useState } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Input, Chip, Divider } from "@heroui/react";
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const InlinePricingEditor = ({ pricing = {}, onPricingChange }) => {
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  const [tempPricing, setTempPricing] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  const dayTypes = [
    { id: 'weekday', name: '주중(월~목)', type: 'weekday' },
    { id: 'friday', name: '금요일', type: 'friday' },
    { id: 'saturday', name: '토요일', type: 'saturday' },
    { id: 'sunday', name: '일요일', type: 'sunday' }
  ];

  const startEditing = (roomIndex) => {
    setEditingRoomIndex(roomIndex);
    const currentRoom = pricing.lodges?.[0]?.rooms?.[roomIndex] || {
      roomType: '',
      view: '',
      prices: {
        weekday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      }
    };
    setTempPricing(currentRoom);
  };

  const savePricing = () => {
    if (!tempPricing.roomType || !tempPricing.view) {
      alert('객실 유형과 뷰를 모두 입력해주세요.');
      return;
    }

    const currentLodges = pricing.lodges || [{ name: '샘플 호텔', rooms: [] }];
    const updatedRooms = [...(currentLodges[0].rooms || [])];
    
    if (editingRoomIndex !== null) {
      updatedRooms[editingRoomIndex] = tempPricing;
    } else {
      updatedRooms.push(tempPricing);
    }
    
    const updatedPricing = {
      ...pricing,
      lodges: [{
        ...currentLodges[0],
        rooms: updatedRooms
      }],
      dayTypes
    };
    
    onPricingChange(updatedPricing);
    setEditingRoomIndex(null);
    setTempPricing({});
  };

  const cancelEditing = () => {
    setEditingRoomIndex(null);
    setTempPricing({});
  };

  const deleteRoom = (roomIndex) => {
    if (confirm('정말로 이 요금표를 삭제하시겠습니까?')) {
      const currentLodges = pricing.lodges || [{ name: '샘플 호텔', rooms: [] }];
      const updatedRooms = currentLodges[0].rooms.filter((_, i) => i !== roomIndex);
      const updatedPricing = {
        ...pricing,
        lodges: [{
          ...currentLodges[0],
          rooms: updatedRooms
        }],
        dayTypes
      };
      onPricingChange(updatedPricing);
    }
  };

  const addRoom = () => {
    setEditingRoomIndex((pricing.lodges?.[0]?.rooms?.length || 0));
    setTempPricing({
      roomType: '',
      view: '',
      prices: {
        weekday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      }
    });
  };

  const updatePrice = (dayType, value) => {
    setTempPricing({
      ...tempPricing,
      prices: {
        ...tempPricing.prices,
        [dayType]: parseInt(value) || 0
      }
    });
  };

  const filteredRooms = (pricing.lodges?.[0]?.rooms || []).filter(room =>
    room.roomType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.view?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 min-h-screen">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="mr-2">💰</span>
            리조트 요금표 관리
          </h2>
          <p className="text-sm text-gray-600">객실별 요금을 설정하고 관리할 수 있습니다.</p>
        </div>
        <div className="flex gap-2">
          <Button
            color="primary"
            variant="bordered"
            onPress={addRoom}
            startContent={<FaPlus />}
            size="sm"
          >
            객실 타입 추가
          </Button>
        </div>
      </div>

      {/* 검색 */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">{Labels.검색}</label>
        <Input
          placeholder={Labels["객실_유형이나_뷰로_검색_PH"]}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          classNames={{
            input: "text-gray-800 bg-white border-gray-300",
            inputWrapper: "h-12"
          }}
        />
      </div>

      {/* 기존 요금표 목록 */}
      {filteredRooms.map((room, index) => (
        <div key={index} className="border rounded-lg p-6 bg-gray-50">
          {editingRoomIndex === index ? (
            // 편집 모드
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Input
                    label={Labels.ROOM_TYPE}
                    value={tempPricing.roomType}
                    onChange={(e) => setTempPricing({ ...tempPricing, roomType: e.target.value })}
                    placeholder={Labels.ROOM_NAME_PLACEHOLDER}
                    classNames={{
                      input: "text-gray-800 bg-white border-gray-300",
                      label: "text-gray-700 font-medium text-sm mb-3"
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <Input
                    label={Labels.VIEW}
                    value={tempPricing.view}
                    onChange={(e) => setTempPricing({ ...tempPricing, view: e.target.value })}
                    placeholder={Labels.ROOM_VIEW_PLACEHOLDER}
                    classNames={{
                      input: "text-gray-800 bg-white border-gray-300",
                      label: "text-gray-700 font-medium text-sm mb-3"
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{Labels.요금_설정}</label>
                <div className="grid grid-cols-2 gap-4">
                  {dayTypes.map(dayType => (
                    <div key={dayType.id} className="space-y-2">
                      <Input
                        type="number"
                        label={dayType.name}
                        value={tempPricing.prices?.[dayType.id] || 0}
                        onChange={(e) => updatePrice(dayType.id, e.target.value)}
                        placeholder={Labels["0_PH"]}
                        startContent={
                          <div className="pointer-events-none flex items-center">
                            <span className="text-default-400 text-small">₩</span>
                          </div>
                        }
                        classNames={{
                          input: "text-gray-800 bg-white border-gray-300",
                          label: "text-gray-700 font-medium text-sm mb-3"
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button color="primary" onPress={savePricing} startContent={<FaSave />}>
                  저장
                </Button>
                <Button color="default" onPress={cancelEditing} startContent={<FaTimes />}>
                  취소
                </Button>
              </div>
            </div>
          ) : (
            // 보기 모드
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {room.roomType} {room.view && `(${room.view})`}
                </h3>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  {dayTypes.map(dayType => (
                    <div key={dayType.id} className="text-sm bg-white p-2 rounded border">
                      <span className="text-gray-600">{dayType.name}:</span>
                      <span className="ml-2 font-medium text-blue-600">
                        ₩{(room.prices?.[dayType.id] || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" color="primary" onPress={() => startEditing(index)}>
                  편집
                </Button>
                <Button size="sm" color="danger" onPress={() => deleteRoom(index)} startContent={<FaTrash />}>
                  삭제
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
      
      {/* 새 요금표 추가 */}
      {editingRoomIndex === filteredRooms.length && (
        <div className="border rounded-lg p-6 bg-blue-50">
          <h3 className="font-semibold text-lg mb-6">새 요금표 추가</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Input
                  label={Labels.ROOM_TYPE}
                  value={tempPricing.roomType}
                  onChange={(e) => setTempPricing({ ...tempPricing, roomType: e.target.value })}
                  placeholder={Labels.ROOM_NAME_PLACEHOLDER}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium text-sm mb-3"
                  }}
                />
              </div>
              <div className="space-y-3">
                <Input
                  label={Labels.VIEW}
                  value={tempPricing.view}
                  onChange={(e) => setTempPricing({ ...tempPricing, view: e.target.value })}
                  placeholder={Labels.ROOM_VIEW_PLACEHOLDER}
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium text-sm mb-3"
                  }}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">{Labels.요금_설정_1}</label>
              <div className="grid grid-cols-2 gap-4">
                {dayTypes.map(dayType => (
                  <div key={dayType.id} className="space-y-2">
                    <Input
                      type="number"
                      label={dayType.name}
                      value={tempPricing.prices?.[dayType.id] || 0}
                      onChange={(e) => updatePrice(dayType.id, e.target.value)}
                      placeholder={Labels["0_PH_1"]}
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">₩</span>
                        </div>
                      }
                      classNames={{
                        input: "text-gray-800 bg-white border-gray-300",
                        label: "text-gray-700 font-medium text-sm mb-3"
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button color="primary" onPress={savePricing} startContent={<FaSave />}>
                저장
              </Button>
              <Button color="default" onPress={cancelEditing} startContent={<FaTimes />}>
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* 새 요금표 추가 버튼 */}
      {editingRoomIndex === null && (
        <Button color="primary" onPress={addRoom} startContent={<FaPlus />}>
          새 요금표 추가
        </Button>
      )}

      {/* 요약 정보 */}
      {filteredRooms.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">요금표 요약</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🏨</div>
              <div className="text-sm font-medium text-gray-700">총 객실 타입</div>
              <div className="text-lg font-bold text-blue-600">{filteredRooms.length}개</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">💰</div>
              <div className="text-sm font-medium text-gray-700">평균 요금</div>
              <div className="text-lg font-bold text-green-600">
                ₩{Math.round(filteredRooms.reduce((sum, room) => 
                  sum + Object.values(room.prices || {}).reduce((a, b) => a + b, 0), 0
                ) / (filteredRooms.length * 4))}원
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">📅</div>
              <div className="text-sm font-medium text-gray-700">요일별 구분</div>
              <div className="text-lg font-bold text-purple-600">4일</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-1">⚡</div>
              <div className="text-sm font-medium text-gray-700">최고 요금</div>
              <div className="text-lg font-bold text-red-600">
                ₩{Math.max(...filteredRooms.flatMap(room => 
                  Object.values(room.prices || {})
                )).toLocaleString()}원
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InlinePricingEditor; 