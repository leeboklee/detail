'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import Image from 'next/image';

import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea, Select, SelectItem, Chip } from "@heroui/react";
import { RoomTable } from '../ui/EnhancedTable';

// URL 유효성 검사 함수
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// 객실 편집 모달 컴포넌트
function RoomEditModal({ isOpen, onClose, room, onSave, isNew = false }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '스탠다드',
    structure: '원룸',
    bedType: '퀸 베드 1개',
    view: '시티뷰',
    standardCapacity: 2,
    maxCapacity: 2,
    description: '',
    image: '',
    amenities: []
  });

  useEffect(() => {
    if (room) {
      setFormData(room);
    }
  }, [room]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleAmenityChange = (amenity, checked) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

  const commonAmenities = [
    '무료 Wi-Fi', '에어컨', 'TV', '미니바', '커피/차', '욕실용품',
    '드라이어', '안전금고', '옷장', '발코니', '전용욕실'
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="3xl" 
      scrollBehavior="inside"
      placement="center"
      backdrop="opaque"
      classNames={{
        wrapper: "z-[9999]",
        backdrop: "bg-black/30 backdrop-blur-sm",
        base: "bg-white",
        body: "bg-white",
        header: "bg-white border-b border-gray-200",
        footer: "bg-gray-50 border-t border-gray-200"
      }}
    >
      <ModalContent>
        <ModalHeader>
          {isNew ? '새 객실 추가' : '객실 정보 편집'}
        </ModalHeader>
        <ModalBody>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="객실명"
              value={formData.name}
              onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              placeholder="예: 스탠다드, 디럭스"
            />
            <Select
              label="객실 유형"
              selectedKeys={[formData.type]}
              onSelectionChange={(keys) => setFormData(prev => ({ ...prev, type: Array.from(keys)[0] }))}
            >
              <SelectItem key="스탠다드">스탠다드</SelectItem>
              <SelectItem key="디럭스">디럭스</SelectItem>
              <SelectItem key="스위트">스위트</SelectItem>
              <SelectItem key="패밀리">패밀리</SelectItem>
            </Select>
            <Input
              label="구조"
              value={formData.structure}
              onValueChange={(value) => setFormData(prev => ({ ...prev, structure: value }))}
              placeholder="예: 원룸, 투룸"
            />
            <Input
              label="베드 타입"
              value={formData.bedType}
              onValueChange={(value) => setFormData(prev => ({ ...prev, bedType: value }))}
              placeholder="예: 퀸 베드 1개"
            />
            <Input
              label="뷰"
              value={formData.view}
              onValueChange={(value) => setFormData(prev => ({ ...prev, view: value }))}
              placeholder="예: 시티뷰, 오션뷰"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label="기본 수용인원"
                value={formData.standardCapacity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, standardCapacity: parseInt(value) || 0 }))}
              />
              <Input
                type="number"
                label="최대 수용인원"
                value={formData.maxCapacity}
                onValueChange={(value) => setFormData(prev => ({ ...prev, maxCapacity: parseInt(value) || 0 }))}
              />
            </div>
            <div className="col-span-2">
              <Textarea
                label="객실 설명"
                value={formData.description}
                onValueChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="객실에 대한 상세한 설명을 입력하세요"
                rows={3}
              />
            </div>
            <div className="col-span-2">
              <Input
                label="객실 이미지 URL"
                value={formData.image}
                onValueChange={(value) => setFormData(prev => ({ ...prev, image: value }))}
                placeholder="https://example.com/room-image.jpg"
              />
              {isValidUrl(formData.image) && (
                <div className="mt-2">
                  <Image
                    src={formData.image}
                    alt="객실 이미지"
                    width={200}
                    height={150}
                    className="rounded-md object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                편의시설
              </label>
              <div className="grid grid-cols-3 gap-2">
                {commonAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities.includes(amenity)}
                      onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onClose}>
            취소
          </Button>
          <Button color="primary" onPress={handleSave}>
            저장
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function RoomInfoEditor({ value = [], onChange }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isNewRoom, setIsNewRoom] = useState(false);

  const rooms = value || [];

  const handleAddRoom = () => {
    setEditingRoom(null);
    setIsNewRoom(true);
    setIsModalOpen(true);
  };

  const handleEditRoom = (room, index) => {
    setEditingRoom({ ...room, index });
    setIsNewRoom(false);
    setIsModalOpen(true);
  };

  const handleDeleteRoom = (room, index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    onChange(updatedRooms);
  };

  const handleSaveRoom = (roomData) => {
    let updatedRooms;
    
    if (isNewRoom) {
      updatedRooms = [...rooms, { ...roomData, id: Date.now().toString() }];
    } else {
      updatedRooms = rooms.map((room, index) => 
        index === editingRoom.index ? { ...roomData, id: room.id } : room
      );
    }
    
    onChange(updatedRooms);
  };

  return (
    <div className="room-info-editor">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">객실 정보 관리</h3>
        <p className="text-sm text-gray-600">
          호텔의 객실 정보를 관리하고 편집할 수 있습니다.
        </p>
      </div>

      <RoomTable
        rooms={rooms}
        onEdit={handleEditRoom}
        onDelete={handleDeleteRoom}
        onAdd={handleAddRoom}
      />

      <RoomEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        room={editingRoom}
        onSave={handleSaveRoom}
        isNew={isNewRoom}
      />
    </div>
  );
} 
