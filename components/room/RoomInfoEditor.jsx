'use client';

import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import useRoomStore from '@shared/stores/roomStore.js';
import useAutoSave from '@/hooks/useAutoSave';
import SimpleInput from './SimpleInput';

// URL 유효성 검사 함수
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const RoomInfoEditor = memo(({ value, onChange, className }) => {
  console.log('🏨 RoomInfoEditor 렌더링');

  const { hotelData, updateRooms, updateCheckin } = useAppContext();
  const [rooms, setRooms] = useState([]);
  const [checkinInfo, setCheckinInfo] = useState({
    checkInTime: '15:00',
    checkOutTime: '11:00',
    additionalInfo: ''
  });
  const [saveMessage, setSaveMessage] = useState('');

  // 컴포넌트 마운트 시 저장된 데이터 자동 로드
  useEffect(() => {
    handleLoad();
  }, []);

  // 체크인 정보 초기화
  useEffect(() => {
    if (hotelData?.checkin) {
      setCheckinInfo(hotelData.checkin);
    }
  }, [hotelData?.checkin]);

  // 객실 데이터 초기화 (1개만)
  useEffect(() => {
    if (value && Array.isArray(value) && value.length > 0) {
      setRooms(value);
    } else if (hotelData?.rooms && Array.isArray(hotelData.rooms) && hotelData.rooms.length > 0) {
      // AppContext에서 가져오되 1개로 제한
      setRooms([hotelData.rooms[0]]);
    } else {
      // 기본 객실 1개만 생성
      const defaultRoom = {
        name: '',
        type: '',
        structure: '',
        bedType: '',
        view: '',
        standardCapacity: 2,
        maxCapacity: 2,
        description: '',
        image: '',
        amenities: []
      };
      setRooms([defaultRoom]);
    }
  }, [value, hotelData?.rooms]);

  // rooms가 비어 있으면 항상 1개 기본 입력폼을 강제로 추가
  useEffect(() => {
    if (!rooms || rooms.length === 0) {
      setRooms([{
        name: '',
        type: '',
        structure: '',
        bedType: '',
        view: '',
        standardCapacity: 2,
        maxCapacity: 2,
        description: '',
        image: '',
        amenities: []
      }]);
    }
  }, [rooms]);

  // 객실 필드 변경 핸들러 (debounce 제거 - SimpleInput에서 처리)
  const handleRoomChange = useCallback((index, field, value) => {
    console.log(`🏨 RoomInfoEditor.handleRoomChange: 객실 ${index}, 필드 ${field}, 값 "${value}"`);
    
    if (!Array.isArray(rooms) || index < 0 || index >= rooms.length) {
      console.log(`❌ RoomInfoEditor: 잘못된 인덱스 또는 rooms 배열`);
      return;
    }
    
    const updatedRooms = rooms.map((room, i) => {
      if (i === index) {
        return { ...room, [field]: value };
      }
      return room;
    });
    
    console.log(`📦 RoomInfoEditor: 업데이트된 객실 배열`, updatedRooms);
    
    // 즉시 로컬 상태 업데이트
    setRooms(updatedRooms);
    
    // 상위 컴포넌트에 즉시 알림
    if (typeof onChange === 'function') {
      console.log(`⬆️ RoomInfoEditor: 상위 컴포넌트 onChange 호출`);
      onChange(updatedRooms);
    }
    
    // AppContext 업데이트도 즉시 수행 (SimpleInput이 debounce 처리)
    if (updateRooms && typeof updateRooms === 'function') {
      console.log(`🌐 RoomInfoEditor: AppContext updateRooms 호출`);
      updateRooms(updatedRooms);
    }
  }, [rooms, onChange, updateRooms]);

  // 입력 변경 핸들러
  const handleInputChange = useCallback((index, e) => {
    if (!e || !e.target) {
      console.log(`❌ RoomInfoEditor.handleInputChange: 잘못된 이벤트`);
      return;
    }
    const fieldName = e.target.name;
    const value = e.target.value;
    console.log(`📝 RoomInfoEditor.handleInputChange: 인덱스 ${index}, 필드 ${fieldName}, 값 "${value}"`);
    handleRoomChange(index, fieldName, value);
  }, [handleRoomChange]);

  // 객실 추가 핸들러
  const handleAddRoom = () => {
    if (rooms.length >= 5) {
      setSaveMessage('⚠️ 최대 5개 객실까지만 추가할 수 있습니다.');
      setTimeout(() => setSaveMessage(''), 2000);
      return;
    }
    
    const newRoom = {
      name: '',
      type: '',
      structure: '',
      bedType: '',
      view: '',
      standardCapacity: 2,
      maxCapacity: 2,
      description: '',
      image: '',
      amenities: []
    };
    
    const newRooms = [...rooms, newRoom];
    setRooms(newRooms);
    if (typeof onChange === 'function') onChange(newRooms);
    if (updateRooms && typeof updateRooms === 'function') updateRooms(newRooms);
    
    setSaveMessage(`✅ 새 객실이 추가되었습니다. (총 ${newRooms.length}개)`);
    setTimeout(() => setSaveMessage(''), 2000);
  };

  // 객실 삭제 핸들러
  const handleRemoveRoom = (index) => {
    if (rooms.length <= 1) {
      setSaveMessage('⚠️ 최소 하나의 객실이 필요합니다.');
      setTimeout(() => setSaveMessage(''), 2000);
      return;
    }
    
    const roomName = rooms[index]?.name || `객실 ${index + 1}`;
    const removedRooms = rooms.filter((_, i) => i !== index);
    setRooms(removedRooms);
    if (typeof onChange === 'function') onChange(removedRooms);
    if (updateRooms && typeof updateRooms === 'function') updateRooms(removedRooms);
    
    setSaveMessage(`✅ "${roomName}"이(가) 삭제되었습니다. (총 ${removedRooms.length}개)`);
    setTimeout(() => setSaveMessage(''), 2000);
  };

  // 체크인/아웃 정보 변경 핸들러
  const handleCheckinChange = useCallback((field, value) => {
    const newCheckinInfo = { ...checkinInfo, [field]: value };
    setCheckinInfo(newCheckinInfo);
    if (updateCheckin && typeof updateCheckin === 'function') {
      updateCheckin(newCheckinInfo);
    }
  }, [checkinInfo, updateCheckin]);

  // 시간 형식 변환 함수
  const parseTimeValue = (timeString) => {
    if (!timeString) return '';
    return timeString.split(':')[0] || '';
  };

  const formatTimeValue = (hourValue) => {
    if (!hourValue || hourValue === '') return '';
    const hour = parseInt(hourValue);
    if (isNaN(hour) || hour < 0 || hour > 24) return '';
    return `${String(hour).padStart(2, '0')}:00`;
  };

  const handleTimeChange = useCallback((field, value) => {
    if (value === '') {
      handleCheckinChange(field, '');
      return;
    }
    
    if (!/^\d+$/.test(value)) return;
    
    const numericValue = parseInt(value);
    if (numericValue < 0 || numericValue > 24) return;
    
    const formattedTime = formatTimeValue(value);
    handleCheckinChange(field, formattedTime);
  }, [handleCheckinChange]);

  // 개별 DB 저장 함수 추가
  const handleSave = async () => {
    try {
      console.log('객실 정보 저장 시작...', { rooms, checkinInfo });
      setSaveMessage('저장 중...');
      
      // 현재 객실 데이터를 API로 전송
      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: '객실 정보 템플릿',
          rooms: rooms || [],
          checkin: checkinInfo || {},
          isTemplate: true
        })
      });
      
      console.log('API 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류 응답:', errorText);
        throw new Error(`저장 실패: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('객실 정보 저장 성공:', result);
      
      setSaveMessage('✅ 객실 정보가 성공적으로 저장되었습니다!');
      
      // 성공 시 alert도 표시
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.alert('✅ 객실 정보가 성공적으로 저장되었습니다!');
        }, 100);
      }
      
      setTimeout(() => setSaveMessage(''), 8000);
      
    } catch (error) {
      console.error('객실 정보 저장 오류:', error);
      setSaveMessage(`❌ 저장 실패: ${error.message}`);
      
      // 에러 시 alert도 표시
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          window.alert(`❌ 저장 실패: ${error.message}`);
        }, 100);
      }
      
      setTimeout(() => setSaveMessage(''), 8000);
    }
  };

  // 개별 DB 불러오기 함수 추가
  const handleLoad = async () => {
    try {
      setSaveMessage('불러오는 중...');
      
      const response = await fetch('/api/hotels?templates=true');
      
      if (!response.ok) {
        throw new Error(`불러오기 실패: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.hotels && result.hotels.length > 0) {
        const latestHotel = result.hotels[0];
        
        if (latestHotel.rooms && Array.isArray(latestHotel.rooms)) {
          setRooms(latestHotel.rooms);
          
          if (onChange) {
            onChange(latestHotel.rooms);
          }
        }
        
        if (latestHotel.checkin) {
          setCheckinInfo(latestHotel.checkin);
          
          if (updateCheckin) {
            updateCheckin(latestHotel.checkin);
          }
        }
        
        setSaveMessage('✅ 객실 정보를 불러왔습니다');
      } else {
        setSaveMessage('❌ 불러올 템플릿이 없습니다');
      }
      
      setTimeout(() => setSaveMessage(''), 3000);
      
    } catch (error) {
      console.error('객실 정보 불러오기 오류:', error);
      setSaveMessage('❌ 불러오기 중 오류가 발생했습니다');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">객실 정보</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            💾 객실정보 저장
          </button>
          <button 
            onClick={handleLoad}
            className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            📂 객실정보 불러오기
          </button>
          <div className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded border border-blue-300">
            총 {rooms.length}개 객실
          </div>
        </div>
      </div>

      {saveMessage && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
          saveMessage.includes('✅') ? 'bg-green-100 text-green-800' :
          saveMessage.includes('❌') ? 'bg-red-100 text-red-800' :
          saveMessage.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {saveMessage}
        </div>
      )}

      {/* 체크인/아웃 정보 섹션 */}
      <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-xl font-semibold mb-4 text-blue-800 flex items-center gap-2">
          <span>🕐</span>
          체크인/체크아웃 정보
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              체크인 시간 (시)
            </label>
            <SimpleInput
              type="number"
              min="0"
              max="24"
              step="1"
              placeholder="예: 14 (14시)"
              value={parseTimeValue(checkinInfo.checkInTime)}
              onChange={(e) => handleTimeChange('checkInTime', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <small className="text-gray-500 text-xs mt-1 block">
              0~24 사이의 숫자로 입력해주세요 (24시간 형식)
            </small>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              체크아웃 시간 (시)
            </label>
            <SimpleInput
              type="number"
              min="0"
              max="24"
              step="1"
              placeholder="예: 11 (11시)"
              value={parseTimeValue(checkinInfo.checkOutTime)}
              onChange={(e) => handleTimeChange('checkOutTime', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <small className="text-gray-500 text-xs mt-1 block">
              0~24 사이의 숫자로 입력해주세요 (24시간 형식)
            </small>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            추가 안내사항
          </label>
          <SimpleInput
            type="textarea"
            value={checkinInfo.additionalInfo || ''}
            onChange={(e) => handleCheckinChange('additionalInfo', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="체크인/아웃 관련 추가 안내사항을 입력해주세요."
          />
        </div>
      </div>

      {/* 객실 목록 */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            객실 목록 ({rooms.length}개)
          </h3>
        </div>

        {rooms.map((room, index) => (
          <div key={index} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {room.name ? `객실 ${index + 1}: ${room.name}` : `객실 ${index + 1}`}
              </h3>
              {rooms.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveRoom(index)}
                  className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded border border-red-300 text-sm flex items-center gap-1"
                  title="이 객실을 삭제합니다"
                >
                  <span>🗑️</span>
                  삭제
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  객실 이름
                </label>
                <SimpleInput
                  type="text"
                  name="name"
                  value={room.name || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="객실 이름을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  객실 타입
                </label>
                <SimpleInput
                  type="text"
                  name="type"
                  value={room.type || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="객실 타입을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  구조
                </label>
                <SimpleInput
                  type="text"
                  name="structure"
                  value={room.structure || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="객실 구조를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  침대 타입
                </label>
                <SimpleInput
                  type="text"
                  name="bedType"
                  value={room.bedType || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="침대 타입을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전망
                </label>
                <SimpleInput
                  type="text"
                  name="view"
                  value={room.view || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="객실 전망을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  기준 인원
                </label>
                <SimpleInput
                  type="number"
                  name="standardCapacity"
                  value={room.standardCapacity || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="기준 인원을 입력하세요"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  최대 인원
                </label>
                <SimpleInput
                  type="number"
                  name="maxCapacity"
                  value={room.maxCapacity || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="최대 인원을 입력하세요"
                  min="1"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  객실 설명
                </label>
                <SimpleInput
                  type="textarea"
                  name="description"
                  value={room.description || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="객실에 대한 설명을 입력하세요"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  객실 이미지 URL
                </label>
                <SimpleInput
                  type="url"
                  name="image"
                  value={room.image || ''}
                  onChange={(e) => handleInputChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="https://example.com/image.jpg"
                />
                {room.image && isValidUrl(room.image) && (
                  <div className="mt-2">
                    <Image
                      src={room.image}
                      alt={room.name || '객실 이미지'}
                      className="rounded-lg object-cover"
                      width={200}
                      height={150}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="flex gap-4 flex-wrap justify-center">
          <button
            onClick={handleAddRoom}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium shadow-md"
          >
            <span>➕</span>
            객실 추가
          </button>
          
          <div className="px-4 py-3 bg-blue-100 text-blue-800 rounded-lg flex items-center border border-blue-300">
            <span>💡 현재 {rooms.length}개 객실 등록됨</span>
          </div>
        </div>
      </div>

      {/* 저장 메시지 */}
      {saveMessage && (
        <div className="mt-4 p-3 text-sm text-center bg-green-100 text-green-700 rounded-md border border-green-300">
          {saveMessage}
        </div>
      )}

      {/* DB 저장/불러오기 버튼 */}
      <div className="flex gap-3 justify-center pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          💾 객실정보 저장
        </button>
        <button
          onClick={handleLoad}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          📂 객실정보 불러오기
        </button>
      </div>
    </div>
  );
});

RoomInfoEditor.displayName = 'RoomInfoEditor';

export default RoomInfoEditor; 
