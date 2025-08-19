'use client';

import React, { useState } from 'react';
import { Button, Input, Chip, Divider } from "@heroui/react";
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const InlinePricingEditor = ({ pricing = {}, onPricingChange }) => {
  const [editingRoomIndex, setEditingRoomIndex] = useState(null);
  const [tempPricing, setTempPricing] = useState({});

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

  const currentRooms = pricing.lodges?.[0]?.rooms || [];

  return (
    <div className="space-y-6">
      {/* 기존 요금표 목록 */}
      {currentRooms.map((room, index) => (
        <div key={index} className="border rounded-lg p-4 bg-gray-50">
          {editingRoomIndex === index ? (
            // 편집 모드
            (<div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="객실 유형"
                  value={tempPricing.roomType}
                  onChange={(e) => setTempPricing({ ...tempPricing, roomType: e.target.value })}
                  placeholder="예: 스탠다드, 디럭스"
                />
                <Input
                  label="뷰"
                  value={tempPricing.view}
                  onChange={(e) => setTempPricing({ ...tempPricing, view: e.target.value })}
                  placeholder="예: 시티뷰, 오션뷰"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">요금 설정</label>
                <div className="grid grid-cols-2 gap-4">
                  {dayTypes.map(dayType => (
                    <Input
                      key={dayType.id}
                      type="number"
                      label={dayType.name}
                      value={tempPricing.prices?.[dayType.id] || 0}
                      onChange={(e) => updatePrice(dayType.id, e.target.value)}
                      placeholder="0"
                      startContent={
                        <div className="pointer-events-none flex items-center">
                          <span className="text-default-400 text-small">₩</span>
                        </div>
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button color="primary" onPress={savePricing} startContent={<FaSave />}>
                  저장
                </Button>
                <Button color="default" onPress={cancelEditing} startContent={<FaTimes />}>
                  취소
                </Button>
              </div>
            </div>)
          ) : (
            // 보기 모드
            (<div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">
                  {room.roomType} {room.view && `(${room.view})`}
                </h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {dayTypes.map(dayType => (
                    <div key={dayType.id} className="text-sm">
                      <span className="text-gray-600">{dayType.name}:</span>
                      <span className="ml-2 font-medium">
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
            </div>)
          )}
        </div>
      ))}
      {/* 새 요금표 추가 */}
      {editingRoomIndex === currentRooms.length && (
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="font-semibold text-lg mb-4">새 요금표 추가</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="객실 유형"
                value={tempPricing.roomType}
                onChange={(e) => setTempPricing({ ...tempPricing, roomType: e.target.value })}
                placeholder="예: 스탠다드, 디럭스"
              />
              <Input
                label="뷰"
                value={tempPricing.view}
                onChange={(e) => setTempPricing({ ...tempPricing, view: e.target.value })}
                placeholder="예: 시티뷰, 오션뷰"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">요금 설정</label>
              <div className="grid grid-cols-2 gap-4">
                {dayTypes.map(dayType => (
                  <Input
                    key={dayType.id}
                    type="number"
                    label={dayType.name}
                    value={tempPricing.prices?.[dayType.id] || 0}
                    onChange={(e) => updatePrice(dayType.id, e.target.value)}
                    placeholder="0"
                    startContent={
                      <div className="pointer-events-none flex items-center">
                        <span className="text-default-400 text-small">₩</span>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
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
    </div>
  );
};

export default InlinePricingEditor; 