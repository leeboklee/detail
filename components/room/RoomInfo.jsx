import styles from './RoomInfoEditor.module.css';

import Labels from '@/src/shared/labels';
import PriceTable from '../price/PriceTable';
import RoomTypeSelect from './RoomTypeSelect';
import RoomAmenities from './RoomAmenities';
import OptimizedInput from './OptimizedInput';
import FixedInput from './FixedInput';
import { Button, Card, CardBody, CardHeader, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Textarea } from '@heroui/react';
import { FaPlus, FaTrash, FaSave, FaFolderOpen, FaEdit, FaImage } from 'react-icons/fa';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

// 기본 객실 템플릿 (이미지 기반)
const DEFAULT_ROOM_TEMPLATES = [
  {
    id: 'greenpia25-cooking',
    name: '그린피아25 취사형',
    data: {
      roomId: '22',
      subId: '2',
      bedType: '22',
      viewType: '22',
      standardOccupancy: 22,
      maxOccupancy: 22,
      description: '22',
      roomImage: '',
      composition: '침실1, 거실1, 욕실1',
      amenities: ['취사가능', '더블침대1', '한실침구2채']
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const RoomInfo = ({ rooms, onRoomDataChange }) => {
  const [isTemplateListOpen, setIsTemplateListOpen] = useState(false);
  const [templateList, setTemplateList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(true);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomId: '',
    subId: '',
    bedType: '',
    viewType: '',
    standardOccupancy: 0,
    maxOccupancy: 0,
    description: '',
    roomImage: '',
    composition: '',
    amenities: []
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (!Array.isArray(rooms) || rooms.length === 0) {
      loadDefaultTemplates();
    }
  }, [rooms]);

  // 기본 템플릿 로드
  const loadDefaultTemplates = useCallback(() => {
    try {
      // 로컬 스토리지에서 기본 템플릿 확인
      const savedTemplates = JSON.parse(localStorage.getItem('roomTemplates') || '[]');
      
      if (savedTemplates.length === 0) {
        // 기본 템플릿이 없으면 기본값으로 설정
        localStorage.setItem('roomTemplates', JSON.stringify(DEFAULT_ROOM_TEMPLATES));
        setTemplateList(DEFAULT_ROOM_TEMPLATES);
        
        // 첫 번째 기본 템플릿을 객실로 로드
        if (DEFAULT_ROOM_TEMPLATES.length > 0) {
          const defaultTemplate = DEFAULT_ROOM_TEMPLATES[0];
          const defaultRoom = {
            ...defaultTemplate.data
          };
          onRoomDataChange([defaultRoom]);
        }
      } else {
        setTemplateList(savedTemplates);
      }
    } catch (error) {
      console.error('기본 템플릿 로드 오류:', error);
    }
  }, [onRoomDataChange]);

  // 템플릿 저장
  const saveTemplate = useCallback(() => {
    try {
      const templateName = prompt('템플릿 이름을 입력하세요:');
      if (!templateName) return;

      const existingTemplates = JSON.parse(localStorage.getItem('roomTemplates') || '[]');
      const newTemplate = {
        id: Date.now().toString(),
        name: templateName.trim(),
        data: {
          rooms: rooms,
          createdAt: new Date().toISOString()
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedTemplates = [...existingTemplates, newTemplate];
      localStorage.setItem('roomTemplates', JSON.stringify(updatedTemplates));
      
      setTemplateList(updatedTemplates);
      alert('템플릿이 성공적으로 저장되었습니다.');
    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      alert('템플릿 저장에 실패했습니다: ' + error.message);
    }
  }, [rooms]);

  // 템플릿 목록 가져오기
  const fetchTemplateList = useCallback(() => {
    try {
      const savedTemplates = JSON.parse(localStorage.getItem('roomTemplates') || '[]');
      setTemplateList(savedTemplates);
      setIsTemplateListOpen(true);
    } catch (error) {
      console.error('템플릿 목록 불러오기 오류:', error);
      alert('템플릿 목록을 불러올 수 없습니다: ' + error.message);
    }
  }, []);

  // 템플릿 불러오기
  const loadSelectedTemplate = useCallback((template) => {
    if (template.data?.rooms) {
      onRoomDataChange(template.data.rooms);
    }
    setIsTemplateListOpen(false);
    alert('템플릿을 성공적으로 불러왔습니다.');
  }, [onRoomDataChange]);

  // 객실 추가
  const addRoom = () => {
    const newRoom = {
      roomId: '',
      subId: '',
      bedType: '',
      viewType: '',
      standardOccupancy: 0,
      maxOccupancy: 0,
      description: '',
      roomImage: '',
      composition: '',
      amenities: []
    };
    onRoomDataChange([...rooms, newRoom]);
  };

  // 객실 편집
  const editRoom = (room, index) => {
    setEditingRoom({ ...room, index });
    setIsEditModalOpen(true);
  };

  // 객실 삭제
  const deleteRoom = (index) => {
    if (confirm('정말로 이 객실을 삭제하시겠습니까?')) {
      onRoomDataChange(rooms.filter((_, i) => i !== index));
    }
  };

  // 객실 저장
  const saveRoom = (roomData) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomData.index] = {
      roomId: roomData.roomId,
      subId: roomData.subId,
      bedType: roomData.bedType,
      viewType: roomData.viewType,
      standardOccupancy: parseInt(roomData.standardOccupancy) || 0,
      maxOccupancy: parseInt(roomData.maxOccupancy) || 0,
      description: roomData.description,
      roomImage: roomData.roomImage,
      composition: roomData.composition,
      amenities: roomData.amenities
    };
    onRoomDataChange(updatedRooms);
    setIsEditModalOpen(false);
    setEditingRoom(null);
  };

  const handleRoomDataChange = (index, field, value) => {
    const updatedRooms = rooms.map((room, i) => 
      i === index ? { ...room, [field]: value } : room
    );
    onRoomDataChange(updatedRooms);
  };

  if (!Array.isArray(rooms)) {
    console.error('RoomInfo: rooms prop is not an array!', rooms);
    return <div>객실 정보 데이터를 불러오는 중 오류가 발생했습니다.</div>;
  }

  return (
    <div className={styles.container}>
      {/* 헤더 및 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className={styles.title}>객실 정보 관리</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            color="success"
            variant="bordered"
            onPress={() => {
              console.log('생성 버튼 클릭됨');
              console.log('현재 rooms 데이터:', rooms);
              if (onRoomDataChange) {
                onRoomDataChange(rooms);
                console.log('onRoomDataChange 호출됨');
              } else {
                console.log('onRoomDataChange가 undefined입니다');
              }
              alert('객실 정보가 미리보기에 생성되었습니다.');
            }}
            startContent="✨"
          >
            생성
          </Button>
          <Button
            color="secondary"
            variant="bordered"
            onPress={saveTemplate}
            startContent={<FaSave />}
          >
            템플릿 관리
          </Button>
          <Button
            color="primary"
            variant="bordered"
            onPress={fetchTemplateList}
            startContent={<FaFolderOpen />}
          >
            템플릿 목록
          </Button>
        </div>
      </div>

      {/* 새 객실 입력 폼 */}
      <Card style={{ border: '2px solid #e5e7eb', borderRadius: '12px', marginBottom: '20px' }}>
        <CardHeader className="bg-blue-50">
          <h3 className="text-lg font-semibold text-blue-900">새 객실 추가</h3>
        </CardHeader>
        <CardBody className="p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">객실 번호</label>
              <Input
                placeholder="예: 222"
                value={newRoom.roomId}
                onChange={(e) => setNewRoom({ ...newRoom, roomId: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">서브 번호</label>
              <Input
                placeholder="예: 2"
                value={newRoom.subId}
                onChange={(e) => setNewRoom({ ...newRoom, subId: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">베드 타입</label>
              <Input
                placeholder="예: 더블, 트윈"
                value={newRoom.bedType}
                onChange={(e) => setNewRoom({ ...newRoom, bedType: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">전망</label>
              <Input
                placeholder="예: 바다, 산, 시티"
                value={newRoom.viewType}
                onChange={(e) => setNewRoom({ ...newRoom, viewType: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">기본 인원</label>
              <Input
                type="number"
                placeholder="0"
                value={newRoom.standardOccupancy}
                onChange={(e) => setNewRoom({ ...newRoom, standardOccupancy: parseInt(e.target.value) || 0 })}
                min="1"
                max="20"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">최대 인원</label>
              <Input
                type="number"
                placeholder="0"
                value={newRoom.maxOccupancy}
                onChange={(e) => setNewRoom({ ...newRoom, maxOccupancy: parseInt(e.target.value) || 0 })}
                min="1"
                max="20"
                className="w-full"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">객실 이미지 URL</label>
            <Input
              placeholder="https://example.com/room-image.jpg"
              value={newRoom.roomImage}
              onChange={(e) => setNewRoom({ ...newRoom, roomImage: e.target.value })}
              startContent={<FaImage />}
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">구성</label>
            <Input
              placeholder="예: 침실1, 거실1, 욕실1"
              value={newRoom.composition}
              onChange={(e) => setNewRoom({ ...newRoom, composition: e.target.value })}
              className="w-full"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
            <Textarea
              placeholder="객실에 대한 상세한 설명을 입력하세요"
              value={newRoom.description}
              onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
              rows="3"
              className="w-full"
            />
          </div>

          {/* 편의시설 입력 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">편의시설</label>
            <div className="space-y-2">
              {newRoom.amenities.map((amenity, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="편의시설을 입력하세요"
                    value={amenity}
                    onChange={(e) => {
                      const updatedAmenities = [...newRoom.amenities];
                      updatedAmenities[index] = e.target.value;
                      setNewRoom({ ...newRoom, amenities: updatedAmenities });
                    }}
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => {
                      const updatedAmenities = newRoom.amenities.filter((_, i) => i !== index);
                      setNewRoom({ ...newRoom, amenities: updatedAmenities });
                    }}
                    startContent="🗑️"
                  >
                    삭제
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                color="primary"
                variant="light"
                onPress={() => {
                  setNewRoom({ ...newRoom, amenities: [...newRoom.amenities, ''] });
                }}
                startContent="➕"
              >
                편의시설 추가
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              color="success"
              variant="bordered"
              onPress={() => {
                if (newRoom.roomId.trim()) {
                  onRoomDataChange([...rooms, newRoom]);
                  setNewRoom({
                    roomId: '',
                    subId: '',
                    bedType: '',
                    viewType: '',
                    standardOccupancy: 0,
                    maxOccupancy: 0,
                    description: '',
                    roomImage: '',
                    composition: '',
                    amenities: []
                  });
                  alert('객실이 추가되었습니다.');
                } else {
                  alert('객실 번호를 입력해주세요.');
                }
              }}
              startContent="💾"
            >
              저장
            </Button>
            <Button
              variant="light"
              onPress={() => {
                setNewRoom({
                  roomId: '',
                  subId: '',
                  bedType: '',
                  viewType: '',
                  standardOccupancy: 0,
                  maxOccupancy: 0,
                  description: '',
                  roomImage: '',
                  composition: '',
                  amenities: []
                });
              }}
            >
              초기화
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* 객실 목록 */}
      <div className="space-y-4">
        {rooms.map((room, index) => (
          <Card key={index} style={{ border: '2px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
            <CardBody className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-blue-600">{room.roomId || '객실번호'}</div>
                  <div className="text-lg text-gray-500">• {room.subId || '0'}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    color="primary"
                    variant="bordered"
                    onPress={() => editRoom(room, index)}
                    startContent={<FaEdit />}
                  >
                    편집
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="bordered"
                    onPress={() => deleteRoom(index)}
                    startContent={<FaTrash />}
                  >
                    삭제
                  </Button>
                </div>
              </div>

              {/* 객실 상세 정보 */}
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm font-semibold text-blue-700 mb-2">베드:</div>
                  <div className="text-lg text-blue-900">{room.bedType || '미입력'}</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-sm font-semibold text-green-700 mb-2">전망:</div>
                  <div className="text-lg text-green-900">{room.viewType || '미입력'}</div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <div className="text-sm font-semibold text-orange-700 mb-2">기본 인원:</div>
                  <div className="text-lg text-orange-900">{room.standardOccupancy || 0}명</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm font-semibold text-purple-700 mb-2">최대 인원:</div>
                  <div className="text-lg text-purple-900">{room.maxOccupancy || 0}명</div>
                </div>
              </div>

              {/* 설명 */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="text-sm font-semibold text-gray-700 mb-2">설명:</div>
                <div className="text-gray-900">{room.description || '설명 없음'}</div>
              </div>

              {/* 편의시설 */}
              {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">편의시설:</div>
                  <div className="flex flex-wrap gap-2">
                    {room.amenities.map((amenity, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 객실 이미지 */}
              {room.roomImage && (
                <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">객실 이미지:</div>
                  <div className="relative w-full h-48">
                    <Image
                      src={room.roomImage}
                      alt="객실 이미지"
                      fill
                      className="object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* 객실이 없을 때 */}
      {rooms.length === 0 && (
        <Card style={{ border: '2px solid #e5e7eb', borderRadius: '12px' }}>
          <CardBody style={{ textAlign: 'center', padding: '40px 20px' }}>
            <p style={{ color: '#6b7280', fontSize: '16px', marginBottom: '8px' }}>
              등록된 객실 정보가 없습니다.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>
              '객실 추가' 버튼을 클릭하여 첫 번째 객실을 등록하세요.
            </p>
          </CardBody>
        </Card>
      )}

      {/* 요금표 */}
      <PriceTable rooms={rooms} />

      {/* 객실 편집 모달 */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="2xl">
        <ModalContent>
          <ModalHeader>객실 정보 편집</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">객실 번호</label>
                  <Input
                    value={editingRoom?.roomId || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, roomId: e.target.value })}
                    placeholder="예: 22"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">서브 번호</label>
                  <Input
                    value={editingRoom?.subId || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, subId: e.target.value })}
                    placeholder="예: 2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">베드 타입</label>
                  <Input
                    value={editingRoom?.bedType || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, bedType: e.target.value })}
                    placeholder="예: 더블, 트윈"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">전망</label>
                  <Input
                    value={editingRoom?.viewType || ''}
                    onChange={(e) => setEditingRoom({ ...editingRoom, viewType: e.target.value })}
                    placeholder="예: 바다, 산, 시티"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">기본 인원</label>
                  <Input
                    type="number"
                    value={editingRoom?.standardOccupancy || 0}
                    onChange={(e) => setEditingRoom({ ...editingRoom, standardOccupancy: e.target.value })}
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">최대 인원</label>
                  <Input
                    type="number"
                    value={editingRoom?.maxOccupancy || 0}
                    onChange={(e) => setEditingRoom({ ...editingRoom, maxOccupancy: e.target.value })}
                    min="1"
                    max="20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">객실 이미지 URL</label>
                <Input
                  value={editingRoom?.roomImage || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, roomImage: e.target.value })}
                  placeholder="https://example.com/room-image.jpg"
                  startContent={<FaImage />}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">구성</label>
                <Input
                  value={editingRoom?.composition || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, composition: e.target.value })}
                  placeholder="예: 침실1, 거실1, 욕실1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설명</label>
                <Textarea
                  value={editingRoom?.description || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                  placeholder="객실에 대한 상세한 설명을 입력하세요"
                  rows="3"
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsEditModalOpen(false)}>
              취소
            </Button>
            <Button color="primary" onPress={() => saveRoom(editingRoom)}>
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
          <ModalHeader>객실 정보 템플릿 목록</ModalHeader>
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
                          객실 수: {template.data?.rooms?.length || 0}개
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          color="primary"
                          size="sm"
                          onPress={() => loadSelectedTemplate(template)}
                        >
                          불러오기
                        </Button>
                        <Button
                          color="danger"
                          size="sm"
                          variant="light"
                          onPress={() => {
                            if (confirm('정말로 이 템플릿을 삭제하시겠습니까?')) {
                              const updatedTemplates = templateList.filter(t => t.id !== template.id);
                              localStorage.setItem('roomTemplates', JSON.stringify(updatedTemplates));
                              setTemplateList(updatedTemplates);
                              alert('템플릿이 삭제되었습니다.');
                            }
                          }}
                        >
                          삭제
                        </Button>
                      </div>
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
};

export default RoomInfo; 