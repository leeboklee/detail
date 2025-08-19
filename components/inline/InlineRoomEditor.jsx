'use client';

import React, { useState } from 'react';
import { Button, Input, Textarea, Select, SelectItem, Chip, Divider } from "@heroui/react";
import { FaPlus, FaTrash, FaSave, FaTimes, FaDownload, FaUpload, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const InlineRoomEditor = ({ rooms = [], onRoomsChange }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempRoom, setTempRoom] = useState({});
  const [savedTemplates, setSavedTemplates] = useState([]);
  const [templateName, setTemplateName] = useState('');
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [showLoadPanel, setShowLoadPanel] = useState(false);

  const roomTypes = ['스탠다드', '디럭스', '스위트', '패밀리'];
  const amenityOptions = [
    '무료 Wi-Fi', '에어컨', 'TV', '미니바', '커피메이커', '헤어드라이어',
    '욕실용품', '금고', '옷장', '발코니', '오션뷰', '시티뷰'
  ];

  const startEditing = (index) => {
    setEditingIndex(index);
    setTempRoom(rooms[index] || {
      name: '',
      type: '스탠다드',
      structure: '',
      bedType: '',
      view: '',
      standardCapacity: 2,
      maxCapacity: 2,
      description: '',
      image: '',
      amenities: []
    });
  };

  const saveRoom = () => {
    const updatedRooms = [...rooms];
    if (editingIndex !== null) {
      updatedRooms[editingIndex] = tempRoom;
    } else {
      updatedRooms.push(tempRoom);
    }
    onRoomsChange(updatedRooms);
    setEditingIndex(null);
    setTempRoom({});
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setTempRoom({});
  };

  const deleteRoom = (index) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    onRoomsChange(updatedRooms);
  };

  const addRoom = () => {
    setEditingIndex(rooms.length);
    setTempRoom({
      name: '',
      type: '스탠다드',
      structure: '',
      bedType: '',
      view: '',
      standardCapacity: 2,
      maxCapacity: 2,
      description: '',
      image: '',
      amenities: []
    });
  };

  const toggleAmenity = (amenity) => {
    const currentAmenities = tempRoom.amenities || [];
    const updatedAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    setTempRoom({ ...tempRoom, amenities: updatedAmenities });
  };

  // 객실 템플릿 저장
  const saveRoomTemplate = async () => {
    if (!templateName.trim()) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }

    if (!rooms || rooms.length === 0) {
      alert('저장할 객실 데이터가 없습니다.');
      return;
    }

    try {
      const response = await fetch('/api/rooms/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: templateName,
          rooms: rooms
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`저장 실패 (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        alert('객실 템플릿이 저장되었습니다.');
        setTemplateName('');
        await loadSavedTemplates();
      } else {
        alert('저장 실패: ' + (result.message || '알 수 없는 오류'));
      }
    } catch (error) {
      console.error('객실 저장 오류:', error);
      if (error.message.includes('Failed to fetch')) {
        alert('네트워크 연결을 확인해주세요.');
      } else {
        alert('객실 저장 중 오류가 발생했습니다: ' + error.message);
      }
    }
  };

  // 저장된 템플릿 목록 로드
  const loadSavedTemplates = async () => {
    try {
      const response = await fetch('/api/rooms/save');
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`템플릿 목록 로드 실패 (${response.status}): ${errorText}`);
        return;
      }
      
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setSavedTemplates(result.data);
      } else {
        console.warn('템플릿 목록 데이터가 올바르지 않습니다:', result);
        setSavedTemplates([]);
      }
    } catch (error) {
      console.error('템플릿 목록 로드 오류:', error);
      if (error.message.includes('Failed to fetch')) {
        console.error('네트워크 연결을 확인해주세요');
      }
      setSavedTemplates([]);
    }
  };

  // 템플릿 불러오기
  const loadTemplate = (template) => {
    try {
      if (!template) {
        alert('선택된 템플릿이 없습니다.');
        return;
      }

      if (!template.rooms || !Array.isArray(template.rooms)) {
        alert('템플릿에 유효한 객실 데이터가 없습니다.');
        return;
      }

      if (template.rooms.length === 0) {
        alert('템플릿에 객실 데이터가 비어있습니다.');
        return;
      }

      onRoomsChange(template.rooms);
      alert(`${template.rooms.length}개의 객실 템플릿을 불러왔습니다.`);
    } catch (error) {
      console.error('템플릿 불러오기 오류:', error);
      alert('템플릿을 불러오는 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 저장/불러오기 버튼 */}
      <div className="flex flex-col sm:flex-row gap-2 mb-3 sm:mb-4">
        <Button
          color="primary"
          variant="bordered"
          onPress={() => setShowSavePanel((v) => !v)}
          startContent={<FaDownload />}
          size="sm"
          className="w-full sm:w-auto text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">객실 저장</span>
          <span className="sm:hidden">저장</span>
        </Button>
        <Button
          color="secondary"
          variant="bordered"
          onPress={() => { loadSavedTemplates(); setShowLoadPanel((v) => !v); }}
          startContent={<FaUpload />}
          size="sm"
          className="w-full sm:w-auto text-xs sm:text-sm"
        >
          <span className="hidden sm:inline">객실 불러오기</span>
          <span className="sm:hidden">불러오기</span>
        </Button>
      </div>
      {showSavePanel && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">객실 템플릿 저장</h3>
            <Button isIconOnly size="sm" variant="light" onPress={() => setShowSavePanel(false)} className="text-gray-600 hover:text-gray-800">
              <FaTimes />
            </Button>
          </div>
          <Input
            label="템플릿 이름"
            placeholder="예: 스탠다드 객실, 디럭스 객실"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="mb-3 text-contrast-fix"
            classNames={{
              input: "text-gray-800 bg-white border-gray-300",
              label: "text-gray-700 font-medium"
            }}
          />
          <p className="text-sm text-gray-600 mb-3">현재 {rooms.length}개의 객실이 저장됩니다.</p>
          <div className="flex gap-2">
            <Button color="danger" variant="light" onPress={() => setShowSavePanel(false)}>취소</Button>
            <Button color="primary" onPress={saveRoomTemplate}>저장</Button>
          </div>
        </div>
      )}
      {showLoadPanel && (
        <div className="mt-4 p-4 border rounded-lg bg-white shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">객실 템플릿 불러오기</h3>
            <Button isIconOnly size="sm" variant="light" onPress={() => setShowLoadPanel(false)} className="text-gray-600 hover:text-gray-800">
              <FaTimes />
            </Button>
          </div>
          {savedTemplates.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {savedTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors bg-white"
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{template.name}</h4>
                      <p className="text-sm text-gray-600">객실 {Array.isArray(template.rooms) ? template.rooms.length : 0}개</p>
                      <p className="text-xs text-gray-500">저장일: {new Date(template.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button color="primary" size="sm" onPress={() => loadTemplate(template)}>불러오기</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600 py-8">저장된 객실 템플릿이 없습니다.</p>
          )}
          <div className="flex justify-end mt-3">
            <Button color="danger" variant="light" onPress={() => setShowLoadPanel(false)}>닫기</Button>
          </div>
        </div>
      )}
      {/* 기존 객실 목록 */}
      {rooms.map((room, index) => (
        <div key={index} className="border rounded-lg p-3 sm:p-4 bg-gray-50">
          {editingIndex === index ? (
            // 편집 모드
            (<div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="객실명"
                  value={tempRoom.name}
                  onChange={(e) => setTempRoom({ ...tempRoom, name: e.target.value })}
                  placeholder="예: 스탠다드, 디럭스"
                  size="sm"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                />
                <Select
                  label="객실 유형"
                  selectedKeys={[tempRoom.type]}
                  onSelectionChange={(keys) => setTempRoom({ ...tempRoom, type: Array.from(keys)[0] })}
                  size="sm"
                  classNames={{
                    trigger: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                >
                  {roomTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </Select>
                <Input
                  label="구조"
                  value={tempRoom.structure}
                  onChange={(e) => setTempRoom({ ...tempRoom, structure: e.target.value })}
                  placeholder="예: 원룸, 투룸"
                  size="sm"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                />
                <Input
                  label="베드 타입"
                  value={tempRoom.bedType}
                  onChange={(e) => setTempRoom({ ...tempRoom, bedType: e.target.value })}
                  placeholder="예: 퀸 베드 1개"
                  size="sm"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                />
                <Input
                  label="뷰"
                  value={tempRoom.view}
                  onChange={(e) => setTempRoom({ ...tempRoom, view: e.target.value })}
                  placeholder="예: 시티뷰, 오션뷰"
                  size="sm"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    label="기본 수용인원"
                    value={tempRoom.standardCapacity}
                    onChange={(e) => setTempRoom({ ...tempRoom, standardCapacity: parseInt(e.target.value) || 0 })}
                    classNames={{
                      input: "text-gray-800 bg-white border-gray-300",
                      label: "text-gray-700 font-medium"
                    }}
                  />
                  <Input
                    type="number"
                    label="최대 수용인원"
                    value={tempRoom.maxCapacity}
                    onChange={(e) => setTempRoom({ ...tempRoom, maxCapacity: parseInt(e.target.value) || 0 })}
                    classNames={{
                      input: "text-gray-800 bg-white border-gray-300",
                      label: "text-gray-700 font-medium"
                    }}
                  />
                </div>
              </div>
              <Textarea
                label="객실 설명"
                value={tempRoom.description}
                onChange={(e) => setTempRoom({ ...tempRoom, description: e.target.value })}
                placeholder="객실에 대한 상세한 설명을 입력하세요"
                rows={3}
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              />
              <Input
                label="객실 이미지 URL"
                value={tempRoom.image}
                onChange={(e) => setTempRoom({ ...tempRoom, image: e.target.value })}
                placeholder="https://example.com/room-image.jpg"
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              />
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">편의시설</label>
                <div className="flex flex-wrap gap-2">
                  {amenityOptions.map(amenity => (
                    <Chip
                      key={amenity}
                      variant={tempRoom.amenities?.includes(amenity) ? "solid" : "bordered"}
                      color={tempRoom.amenities?.includes(amenity) ? "primary" : "default"}
                      onClick={() => toggleAmenity(amenity)}
                      className="cursor-pointer text-gray-800"
                    >
                      {amenity}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button color="primary" onPress={saveRoom} startContent={<FaSave />}>
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
                <h3 className="font-semibold text-lg">{room.name || room.type}</h3>
                <p className="text-gray-600 text-sm">
                  {room.structure} • {room.bedType} • {room.view}
                </p>
                <p className="text-gray-600 text-sm">
                  수용인원: {room.standardCapacity}명 (최대 {room.maxCapacity}명)
                </p>
                {room.description && (
                  <p className="text-gray-700 mt-2">{room.description}</p>
                )}
                {room.amenities && room.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {room.amenities.slice(0, 3).map(amenity => (
                      <Chip key={amenity} size="sm" variant="flat">
                        {amenity}
                      </Chip>
                    ))}
                    {room.amenities.length > 3 && (
                      <Chip size="sm" variant="flat">+{room.amenities.length - 3}</Chip>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" color="primary" onPress={() => startEditing(index)} className="text-xs sm:text-sm">
                  편집
                </Button>
                <Button size="sm" color="danger" onPress={() => deleteRoom(index)} startContent={<FaTrash />} className="text-xs sm:text-sm">
                  삭제
                </Button>
              </div>
            </div>)
          )}
        </div>
      ))}
      {/* 새 객실 추가 */}
      {editingIndex === rooms.length && (
        <div className="border rounded-lg p-3 sm:p-4 bg-blue-50">
          <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">새 객실 추가</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="객실명"
                value={tempRoom.name}
                onChange={(e) => setTempRoom({ ...tempRoom, name: e.target.value })}
                placeholder="예: 스탠다드, 디럭스"
                size="sm"
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              />
              <Select
                label="객실 유형"
                selectedKeys={[tempRoom.type]}
                onSelectionChange={(keys) => setTempRoom({ ...tempRoom, type: Array.from(keys)[0] })}
                size="sm"
                classNames={{
                  trigger: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              >
                {roomTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </Select>
              <Input
                label="구조"
                value={tempRoom.structure}
                onChange={(e) => setTempRoom({ ...tempRoom, structure: e.target.value })}
                placeholder="예: 원룸, 투룸"
                size="sm"
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              />
              <Input
                label="베드 타입"
                value={tempRoom.bedType}
                onChange={(e) => setTempRoom({ ...tempRoom, bedType: e.target.value })}
                placeholder="예: 퀸 베드 1개"
                size="sm"
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              />
              <Input
                label="뷰"
                value={tempRoom.view}
                onChange={(e) => setTempRoom({ ...tempRoom, view: e.target.value })}
                placeholder="예: 시티뷰, 오션뷰"
                size="sm"
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300",
                  label: "text-gray-700 font-medium"
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  label="기본 수용인원"
                  value={tempRoom.standardCapacity}
                  onChange={(e) => setTempRoom({ ...tempRoom, standardCapacity: parseInt(e.target.value) || 0 })}
                  size="sm"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                />
                <Input
                  type="number"
                  label="최대 수용인원"
                  value={tempRoom.maxCapacity}
                  onChange={(e) => setTempRoom({ ...tempRoom, maxCapacity: parseInt(e.target.value) || 0 })}
                  size="sm"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                />
              </div>
            </div>
            
            <Textarea
              label="객실 설명"
              value={tempRoom.description}
              onChange={(e) => setTempRoom({ ...tempRoom, description: e.target.value })}
              placeholder="객실에 대한 상세한 설명을 입력하세요"
              rows={3}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            
            <Input
              label="객실 이미지 URL"
              value={tempRoom.image}
              onChange={(e) => setTempRoom({ ...tempRoom, image: e.target.value })}
              placeholder="https://example.com/room-image.jpg"
              size="sm"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300",
                label: "text-gray-700 font-medium"
              }}
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">편의시설</label>
              <div className="flex flex-wrap gap-2">
                {amenityOptions.map(amenity => (
                  <Chip
                    key={amenity}
                    variant={tempRoom.amenities?.includes(amenity) ? "solid" : "bordered"}
                    color={tempRoom.amenities?.includes(amenity) ? "primary" : "default"}
                    onClick={() => toggleAmenity(amenity)}
                    className="cursor-pointer"
                  >
                    {amenity}
                  </Chip>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button color="primary" onPress={saveRoom} startContent={<FaSave />} className="text-xs sm:text-sm">
                저장
              </Button>
              <Button color="default" onPress={cancelEditing} startContent={<FaTimes />} className="text-xs sm:text-sm">
                취소
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 새 객실 추가 버튼 */}
      {editingIndex === null && (
        <Button color="primary" onPress={addRoom} startContent={<FaPlus />} className="w-full sm:w-auto">
          새 객실 추가
        </Button>
      )}
    </div>
  );
};

export default InlineRoomEditor; 