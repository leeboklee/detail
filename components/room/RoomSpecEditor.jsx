'use client';

import React from 'react';
import Image from 'next/image';

// URL 유효성 검사 (간단 버전)
const isValidUrl = (string) => {
  try {
    new URL(string);
    return string.startsWith('http://') || string.startsWith('https://');
  } catch (_) {
    return false;
  }
};

const RoomSpecEditor = ({ room, lodgeIndex, roomIndex, onUpdate, onRemove }) => {
  
  const handleSpecChange = (field, value) => {
    const updatedSpecs = { ...(room.specs || {}), [field]: value };
    onUpdate(lodgeIndex, roomIndex, { ...room, specs: updatedSpecs });
  };

  const handleImageChange = (value) => {
    onUpdate(lodgeIndex, roomIndex, { ...room, imageUrl: value });
  };

  return (
    <div className="roomSpecEditorWrapper">
      <h4>{room.type || '새 객실'} (from 숙소: {lodgeIndex + 1})</h4>
      <div className="roomEditorGrid">
        {/* 이미지 섹션 (왼쪽) */}
        <div className="roomImageContainerSpec">
          {room.imageUrl && isValidUrl(room.imageUrl) ? (
            <Image 
              src={room.imageUrl} 
              alt={room.type || '객실 이미지'} 
              width={200}
              height={150}
              className="roomImageSpec" 
            />
          ) : (
            <div className="noImageSpec">이미지 없음</div>
          )}
          <div className="imageUrlInputSpec">
            <label>이미지 URL</label>
            <input
              type="text"
              value={room.imageUrl || ''}
              onChange={(e) => handleImageChange(e.target.value)}
              className="specInputFull"
              placeholder="이미지 URL을 입력하세요"
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                userSelect: 'text',
                cursor: 'text'
              }}
            />
          </div>
        </div>

        {/* 스펙 입력 섹션 (오른쪽 - 2열 Grid) */}
        <div className="roomSpecsGrid">
          <div className="specFieldInline">
            <label>구조</label>
            <input 
              type="text" 
              value={room.specs?.structure || ''} 
              onChange={(e) => handleSpecChange('structure', e.target.value)} 
              className="specInputField"
              placeholder="예: 원룸, 투룸"
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                userSelect: 'text',
                cursor: 'text'
              }}
            />
          </div>
          <div className="specFieldInline">
            <label>베드타입</label>
            <input 
              type="text" 
              value={room.specs?.bedType || ''} 
              onChange={(e) => handleSpecChange('bedType', e.target.value)} 
              className="specInputField"
              placeholder="예: 더블, 트윈"
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                userSelect: 'text',
                cursor: 'text'
              }}
            />
          </div>
          <div className="specFieldInline">
            <label>기준정원</label>
            <input 
              type="text" 
              value={room.specs?.capacity || ''} 
              onChange={(e) => handleSpecChange('capacity', e.target.value)} 
              className="specInputField"
              placeholder="예: 2명"
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                userSelect: 'text',
                cursor: 'text'
              }}
            />
          </div>
          <div className="specFieldInline">
            <label>최대정원</label>
            <input 
              type="text" 
              value={room.specs?.maxCapacity || ''} 
              onChange={(e) => handleSpecChange('maxCapacity', e.target.value)} 
              className="specInputField"
              placeholder="예: 4명"
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                userSelect: 'text',
                cursor: 'text'
              }}
            />
          </div>
          <div className="specFieldInline" style={{ gridColumn: 'span 2' }}>
            <label>전망</label>
            <input 
              type="text" 
              value={room.specs?.view || ''} 
              onChange={(e) => handleSpecChange('view', e.target.value)} 
              className="specInputFieldFullWidth"
              placeholder="예: 오션뷰, 시티뷰"
              autoComplete="off"
              style={{
                pointerEvents: 'auto',
                userSelect: 'text',
                cursor: 'text'
              }}
            />
          </div>
        </div>
      </div>
       {/* 객실 삭제 버튼 주석 해제 */}
       <button onClick={onRemove} className="deleteButton roomDeleteButton"> {/* onRemove 직접 호출, 스타일 클래스 추가 */} 
         이 객실 삭제
       </button>
    </div>
  );
};

export default RoomSpecEditor; 