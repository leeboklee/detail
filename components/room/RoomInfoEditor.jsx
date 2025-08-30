'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import Labels from '@/src/shared/labels';

// DB 샘플 데이터
const SAMPLE_ROOMS = [
  {
    id: 1,
    name: '디럭스 트윈',
    type: '디럭스',
    structure: '2층형',
    bedType: '트윈베드 2개',
    view: '산전망',
    standardCapacity: 4,
    maxCapacity: 6,
    description: '넓은 공간과 아늑한 분위기의 디럭스 트윈룸입니다. 트윈베드 2개와 추가 침구를 제공하여 최대 6명까지 투숙 가능합니다.',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400',
    amenities: ['에어컨', 'TV', 'WiFi', '냉장고', '커피메이커', '욕실용품'],
    price: 150000,
    area: '35㎡'
  },
  {
    id: 2,
    name: '스위트',
    type: '스위트',
    structure: '1층형',
    bedType: '킹베드 1개 + 소파베드',
    view: '바다전망',
    standardCapacity: 2,
    maxCapacity: 4,
    description: '고급스러운 스위트룸으로 킹베드와 소파베드가 있어 커플이나 가족 투숙에 적합합니다.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400',
    amenities: ['에어컨', 'TV', 'WiFi', '미니바', '커피메이커', '욕실용품', '발코니'],
    price: 250000,
    area: '45㎡'
  },
  {
    id: 3,
    name: '패밀리룸',
    type: '패밀리',
    structure: '2층형',
    bedType: '더블베드 1개 + 온돌',
    view: '정원전망',
    standardCapacity: 6,
    maxCapacity: 8,
    description: '가족 여행에 최적화된 패밀리룸입니다. 더블베드와 온돌을 함께 제공하여 한국 전통과 현대적 편의를 모두 경험할 수 있습니다.',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400',
    amenities: ['에어컨', 'TV', 'WiFi', '냉장고', '전자레인지', '욕실용품', '정원'],
    price: 180000,
    area: '50㎡'
  }
];

// 객실 타입 옵션
const ROOM_TYPES = [
  { key: 'standard', label: '스탠다드' },
  { key: 'deluxe', label: '디럭스' },
  { key: 'suite', label: '스위트' },
  { key: 'family', label: '패밀리' },
  { key: 'premium', label: '프리미엄' }
];

// 객실 구조 옵션
const ROOM_STRUCTURES = [
  { key: '1층형', label: '1층형' },
  { key: '2층형', label: '2층형' },
  { key: '복층형', label: '복층형' },
  { key: '로프트형', label: '로프트형' }
];

// 베드 타입 옵션
const BED_TYPES = [
  { key: '싱글', label: '싱글' },
  { key: '더블', label: '더블' },
  { key: '트윈', label: '트윈' },
  { key: '킹', label: '킹' },
  { key: '온돌', label: '온돌' },
  { key: '혼합', label: '혼합' }
];

// 전망 옵션
const VIEW_OPTIONS = [
  { key: '산전망', label: '산전망' },
  { key: '바다전망', label: '바다전망' },
  { key: '도시전망', label: '도시전망' },
  { key: '정원전망', label: '정원전망' },
  { key: '호수전망', label: '호수전망' }
];

// 편의시설 옵션
const AMENITY_OPTIONS = [
  '에어컨', 'TV', 'WiFi', '냉장고', '커피메이커', '욕실용품', '미니바', 
  '전자레인지', '발코니', '정원', '수영장', '헬스장', '레스토랑', '주차장'
];

const RoomInfoEditor = ({ value = { rooms: [] }, onChange, displayMode = false }) => {
  const [rooms, setRooms] = useState(value.rooms || []);
  const [editingIndex, setEditingIndex] = useState(-1);
  // 기본적으로 추가 폼을 펼친 상태로 시작해, 버튼 클릭 없이도 입력할 수 있게 함
  const [showAddForm, setShowAddForm] = useState(true);
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    type: '',
    structure: '',
    bedType: '',
    view: '',
    standardCapacity: 0,
    maxCapacity: 0,
    description: '',
    image: '',
    amenities: []
  });
  const [newAmenitiesText, setNewAmenitiesText] = useState('');
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState([]);

  useEffect(() => {
    if (value.rooms && JSON.stringify(value.rooms) !== JSON.stringify(rooms)) {
      setRooms(value.rooms);
    }
  }, [value.rooms, rooms]);

  // 저장된 템플릿 불러오기
  useEffect(() => {
    loadSavedTemplates();
  }, []);

  const loadSavedTemplates = useCallback(() => {
    try {
      const templates = JSON.parse(localStorage.getItem('roomTemplates') || '[]');
      setSavedTemplates(templates);
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
      setSavedTemplates([]);
    }
  }, []);

  const saveRoomTemplate = useCallback(() => {
    if (!templateName.trim()) {
      alert('템플릿 이름을 입력해주세요.');
      return;
    }

    if (!rooms || rooms.length === 0) {
      alert('저장할 객실 데이터가 없습니다.');
      return;
    }

    try {
      const existingTemplates = JSON.parse(localStorage.getItem('roomTemplates') || '[]');
      const newTemplate = {
        id: Date.now(),
        name: templateName.trim(),
        rooms: rooms,
        createdAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('roomTemplates', JSON.stringify(updatedTemplates));
      
      setSavedTemplates(updatedTemplates);
      setTemplateName('');
      setShowTemplatePanel(false);
      alert('객실 템플릿이 저장되었습니다.');
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장에 실패했습니다.');
    }
  }, [rooms, templateName]);

  const loadRoomTemplate = useCallback((template) => {
    if (confirm(`"${template.name}" 템플릿을 불러오시겠습니까?`)) {
      setRooms(template.rooms);
      if (onChange) {
        onChange({ ...value, rooms: template.rooms });
      }
      setShowTemplatePanel(false);
      alert('템플릿이 불러와졌습니다.');
    }
  }, [onChange, value]);

  const deleteRoomTemplate = useCallback((templateId) => {
    if (confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
      try {
        const updatedTemplates = savedTemplates.filter(t => t.id !== templateId);
        localStorage.setItem('roomTemplates', JSON.stringify(updatedTemplates));
        setSavedTemplates(updatedTemplates);
        alert('템플릿이 삭제되었습니다.');
      } catch (error) {
        console.error('템플릿 삭제 오류:', error);
        alert('템플릿 삭제에 실패했습니다.');
      }
    }
  }, [savedTemplates]);

  // 부모에 안전하게 변경사항 통지 (렌더 중 setState 경고 방지)
  const notifyParentRooms = useCallback((updatedRooms) => {
    if (!onChange) return
    // 이벤트 루프 다음 틱으로 미룸
    setTimeout(() => {
      onChange({
        ...value,
        rooms: updatedRooms
      })
    }, 0)
  }, [onChange, value])

  const addRoom = useCallback(() => {
    const amenities = newAmenitiesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const newRoom = { ...newRoomData, amenities };
    
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    notifyParentRooms(updatedRooms)
    // 계속 입력할 수 있도록 폼은 유지
    setShowAddForm(true);
    setNewRoomData({
      name: '',
      type: '',
      structure: '',
      bedType: '',
      view: '',
      standardCapacity: 0,
      maxCapacity: 0,
      description: '',
      image: '',
      amenities: []
    });
    setNewAmenitiesText('');
  }, [newRoomData, rooms, onChange]);

  const handleNewRoomChange = useCallback((field, value) => {
    setNewRoomData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateRoom = useCallback((index, field, value) => {
    setRooms(prevRooms => {
      const updatedRooms = [...prevRooms];
      updatedRooms[index] = { ...updatedRooms[index], [field]: value };
      notifyParentRooms(updatedRooms)
      return updatedRooms;
    });
  }, [notifyParentRooms]);

  const deleteRoom = useCallback((index) => {
    if (confirm('정말로 이 객실을 삭제하시겠습니까?')) {
      setRooms(prevRooms => {
        const updatedRooms = prevRooms.filter((_, i) => i !== index);
        notifyParentRooms(updatedRooms)
        return updatedRooms;
      });
      if (editingIndex === index) {
        setEditingIndex(-1);
      }
    }
  }, [editingIndex, notifyParentRooms]);

  const startEdit = useCallback((index) => {
    setEditingIndex(index);
  }, []);

  const saveEdit = useCallback((index) => {
    setEditingIndex(-1);
  }, []);

  const addAmenity = useCallback((roomIndex) => {
    const amenity = prompt('편의시설을 입력하세요:');
    if (amenity && amenity.trim()) {
      setRooms(prevRooms => {
        const updatedRooms = [...prevRooms];
        updatedRooms[roomIndex].amenities.push(amenity.trim());
        notifyParentRooms(updatedRooms)
        return updatedRooms;
      });
    }
  }, [notifyParentRooms]);

  const removeAmenity = useCallback((roomIndex, amenityIndex) => {
    setRooms(prevRooms => {
      const updatedRooms = [...prevRooms];
      updatedRooms[roomIndex].amenities.splice(amenityIndex, 1);
      notifyParentRooms(updatedRooms)
      return updatedRooms;
    });
  }, [notifyParentRooms]);

  if (displayMode) {
    return (
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-4">객실 정보</h2>
        {rooms && rooms.length > 0 ? (
          <div className="space-y-4">
            {rooms.map((room, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{room.name || '이름 없음'}</h3>
                    <p className="text-sm text-gray-600">{room.type} • {room.structure}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">베드:</span>
                    <p className="text-gray-600">{room.bedType || '미설정'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">전망:</span>
                    <p className="text-gray-600">{room.view || '미설정'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">기본 인원:</span>
                    <p className="text-gray-600">{room.standardCapacity || 0}명</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">최대 인원:</span>
                    <p className="text-gray-600">{room.maxCapacity || 0}명</p>
                  </div>
                </div>
                
                {room.description && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">설명:</span>
                    <p className="text-gray-600 mt-1">{room.description}</p>
                  </div>
                )}
                
                {room.amenities && room.amenities.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">편의시설:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {room.amenities.map((amenity, amenityIndex) => (
                        <span
                          key={amenityIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>등록된 객실이 없습니다.</p>
            <p className="text-sm mt-1">객실 정보를 입력하면 여기에 미리보기가 표시됩니다.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 및 추가 버튼 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">객실 정보 관리</h2>
        <div className="flex gap-2">
          <Button
            color="secondary"
            variant="bordered"
            onPress={() => setShowTemplatePanel(true)}
            startContent="📁"
          >
            템플릿 관리
          </Button>
          <Button
            color="primary"
            variant="flat"
            onPress={() => setShowAddForm(true)}
            startContent="➕"
          >
            객실 추가
          </Button>
        </div>
      </div>

      {/* 템플릿 관리 패널 */}
      {showTemplatePanel && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">객실 템플릿 관리</h3>
            <Button
              size="sm"
              variant="light"
              onPress={() => setShowTemplatePanel(false)}
            >
              닫기
            </Button>
          </div>
          
          {/* 템플릿 저장 */}
          <div className="mb-4 p-3 bg-white rounded border">
            <h4 className="font-medium text-gray-700 mb-2">새 템플릿 저장</h4>
            <div className="flex gap-2">
              <Input
                placeholder="템플릿 이름을 입력하세요"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                size="sm"
                className="flex-1"
              />
              <Button
                color="primary"
                size="sm"
                onPress={saveRoomTemplate}
                disabled={!templateName.trim() || rooms.length === 0}
              >
                저장
              </Button>
            </div>
          </div>
          
          {/* 저장된 템플릿 목록 */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2">저장된 템플릿</h4>
            {savedTemplates.length > 0 ? (
              <div className="space-y-2">
                {savedTemplates.map((template) => (
                  <div key={template.id} className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium text-gray-900">{template.name}</div>
                      <div className="text-sm text-gray-600">
                        {template.rooms.length}개 객실 • {new Date(template.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="primary"
                        variant="bordered"
                        onPress={() => loadRoomTemplate(template)}
                      >
                        불러오기
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => deleteRoomTemplate(template.id)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                저장된 템플릿이 없습니다.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 객실 추가 폼 */}
      {showAddForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">새 객실 추가</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label={Labels.ROOM_NAME}
              placeholder={Labels.ROOM_NAME_PLACEHOLDER}
              value={newRoomData.name}
              onChange={(e) => handleNewRoomChange('name', e.target.value)}
              labelPlacement="outside"
            />
            <Input
              label={Labels["객실_타입_1"]}
              placeholder={Labels["타입을_입력하세요_PH"] || '타입을 입력하세요'}
              value={newRoomData.type}
              onChange={(e) => handleNewRoomChange('type', e.target.value)}
              labelPlacement="outside"
            />
            <Input
              label={Labels.STRUCTURE}
              placeholder="예: 2층형, 복층형, 로프트형"
              value={newRoomData.structure}
              onChange={(e) => handleNewRoomChange('structure', e.target.value)}
              labelPlacement="outside"
            />
            <Input
              label={Labels.BED_TYPE}
              placeholder="예: 트윈베드 2개, 킹베드 1개 + 소파베드"
              value={newRoomData.bedType}
              onChange={(e) => handleNewRoomChange('bedType', e.target.value)}
              labelPlacement="outside"
            />
            <Input
              label={Labels["전망"]}
              placeholder="예: 산전망, 바다전망, 도시전망, 정원전망"
              value={newRoomData.view}
              onChange={(e) => handleNewRoomChange('view', e.target.value)}
              labelPlacement="outside"
            />
            <Input
              label={Labels["기본_수용_인원"]}
              type="number"
              placeholder="예: 2"
              value={newRoomData.standardCapacity}
              onChange={(e) => handleNewRoomChange('standardCapacity', parseInt(e.target.value || '0'))}
              labelPlacement="outside"
            />
            <Input
              label={Labels["최대_수용_인원"]}
              type="number"
              placeholder="예: 4"
              value={newRoomData.maxCapacity}
              onChange={(e) => handleNewRoomChange('maxCapacity', parseInt(e.target.value || '0'))}
              labelPlacement="outside"
            />
          </div>

          <Textarea
            className="mt-4"
            label={Labels.DESCRIPTION}
            value={newRoomData.description}
            onChange={(e) => handleNewRoomChange('description', e.target.value)}
            placeholder={Labels.DESCRIPTION_PLACEHOLDER}
            labelPlacement="outside"
          />

          <Input
            className="mt-4"
            label={Labels["이미지_URL_1"]}
            value={newRoomData.image}
            onChange={(e) => handleNewRoomChange('image', e.target.value)}
            placeholder={Labels["객실_이미지_URL을_입력하세요_PH"]}
            labelPlacement="outside"
          />

          <Input
            className="mt-4"
            label={Labels.AMENITIES}
            placeholder="쉼표(,)로 구분하여 입력"
            value={newAmenitiesText}
            onChange={(e) => setNewAmenitiesText(e.target.value)}
            labelPlacement="outside"
          />

          <div className="flex gap-2 mt-4">
            <Button color="primary" onPress={addRoom}>
              추가
            </Button>
            <Button variant="light" onPress={() => setShowAddForm(false)}>
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 객실 목록 */}
      <div className="space-y-4">
        {rooms.map((room, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
            {editingIndex === index ? (
              // 편집 모드
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  <Input
                    label={Labels.ROOM_NAME}
                    value={room.name}
                    onChange={(e) => updateRoom(index, 'name', e.target.value)}
                    className="w-full"
                    labelPlacement="outside"
                  />
                  <Select 
                    label={Labels["객실_타입_1"]} 
                    selectedKeys={room.type ? [room.type] : []}
                    onSelectionChange={(keys) => updateRoom(index, 'type', Array.from(keys)[0])}
                    className="w-full"
                    labelPlacement="outside"
                  >
                    {/* 하드코딩된 객실 타입 제거 - 사용자가 직접 입력하도록 변경 */}
                  </Select>
                  <Input
                    label={Labels.STRUCTURE}
                    placeholder="예: 2층형, 복층형, 로프트형"
                    value={room.structure}
                    onChange={(e) => updateRoom(index, 'structure', e.target.value)}
                    className="w-full"
                    labelPlacement="outside"
                  />
                  <Input
                    label={Labels.BED_TYPE}
                    placeholder="예: 트윈베드 2개, 킹베드 1개 + 소파베드"
                    value={room.bedType}
                    onChange={(e) => updateRoom(index, 'bedType', e.target.value)}
                    className="w-full"
                    labelPlacement="outside"
                  />
                  <Input
                    label={Labels["전망"]}
                    placeholder="예: 산전망, 바다전망, 도시전망, 정원전망"
                    value={room.view}
                    onChange={(e) => updateRoom(index, 'view', e.target.value)}
                    className="w-full"
                    labelPlacement="outside"
                  />
                  <Input
                    label={Labels["기본_수용_인원"]}
                    type="number"
                    placeholder="예: 2"
                    value={room.standardCapacity}
                    onChange={(e) => updateRoom(index, 'standardCapacity', parseInt(e.target.value || '0'))}
                    className="w-full"
                    labelPlacement="outside"
                  />
                  <Input
                    label={Labels["최대_수용_인원"]}
                    type="number"
                    placeholder="예: 4"
                    value={room.maxCapacity}
                    onChange={(e) => updateRoom(index, 'maxCapacity', parseInt(e.target.value || '0'))}
                    className="w-full"
                    labelPlacement="outside"
                  />
                </div>
                
                <Textarea
                  label={Labels.DESCRIPTION}
                  value={room.description}
                  onChange={(e) => updateRoom(index, 'description', e.target.value)}
                  placeholder={Labels.DESCRIPTION_PLACEHOLDER}
                  labelPlacement="outside"
                />
                
                <Input
                  label={Labels["이미지_URL_1"]}
                  value={room.image}
                  onChange={(e) => updateRoom(index, 'image', e.target.value)}
                  placeholder={Labels["객실_이미지_URL을_입력하세요_PH"]}
                  labelPlacement="outside"
                />

                {/* 편의시설 관리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.AMENITIES}</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {room.amenities.map((amenity, amenityIndex) => (
                      <span
                        key={amenityIndex}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {amenity}
                        <button
                          type="button"
                          onClick={() => removeAmenity(index, amenityIndex)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    variant="bordered"
                    onPress={() => addAmenity(index)}
                  >
                    편의시설 추가
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button color="primary" onPress={() => saveEdit(index)}>
                    저장
                  </Button>
                  <Button variant="light" onPress={() => setEditingIndex(-1)}>
                    취소
                  </Button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{room.name || '이름 없음'}</h3>
                    <p className="text-sm text-gray-600">{room.type} • {room.structure}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      onPress={() => startEdit(index)}
                    >
                      편집
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => deleteRoom(index)}
                    >
                      삭제
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">베드:</span>
                    <p className="text-gray-600">{room.bedType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">전망:</span>
                    <p className="text-gray-600">{room.view}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">기본 인원:</span>
                    <p className="text-gray-600">{room.standardCapacity}명</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">최대 인원:</span>
                    <p className="text-gray-600">{room.maxCapacity}명</p>
                  </div>
                </div>
                
                {room.description && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">설명:</span>
                    <p className="text-gray-600 mt-1">{room.description}</p>
                  </div>
                )}
                
                {room.amenities.length > 0 && (
                  <div className="mt-3">
                    <span className="font-medium text-gray-700">편의시설:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {room.amenities.map((amenity, amenityIndex) => (
                        <span
                          key={amenityIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        {rooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>등록된 객실이 없습니다.</p>
            <p className="text-sm mt-1">객실 추가 버튼을 클릭하여 첫 번째 객실을 등록하세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomInfoEditor; 
