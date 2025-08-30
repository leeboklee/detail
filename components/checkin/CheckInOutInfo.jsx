'use client';

import React, { useState, useEffect } from 'react';
import { Input, Textarea, Button, Switch } from "@heroui/react";

const CheckInOutInfo = ({ value = {}, onChange }) => {
  const [checkinData, setCheckinData] = useState({
    checkInTime: value.checkInTime || '',
    checkOutTime: value.checkOutTime || '',
    earlyCheckIn: value.earlyCheckIn || '',
    lateCheckOut: value.lateCheckOut || '',
    checkInLocation: value.checkInLocation || '',
    checkOutLocation: value.checkOutLocation || '',
    specialInstructions: value.specialInstructions || '',
    requiredDocuments: value.requiredDocuments || '',
    ageRestrictions: value.ageRestrictions || '',
    petPolicy: value.petPolicy || ''
  });

  const [allowEarlyCheckIn, setAllowEarlyCheckIn] = useState(!!value.earlyCheckIn);
  const [allowLateCheckOut, setAllowLateCheckOut] = useState(!!value.lateCheckOut);

  useEffect(() => {
    if (onChange) {
      onChange(checkinData);
    }
  }, [checkinData, onChange]);

  const handleInputChange = (field, value) => {
    setCheckinData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEarlyCheckInToggle = (checked) => {
    setAllowEarlyCheckIn(checked);
    if (!checked) {
      handleInputChange('earlyCheckIn', '');
    }
  };

  const handleLateCheckOutToggle = (checked) => {
    setAllowLateCheckOut(checked);
    if (!checked) {
      handleInputChange('lateCheckOut', '');
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">체크인/아웃 정보</h2>
        <Button
          color="success"
          variant="bordered"
          onPress={() => {
            if (onChange) {
              onChange(checkinData);
            }
            alert('체크인/아웃 정보가 미리보기에 생성되었습니다.');
          }}
          startContent="✨"
        >
          생성
        </Button>
      </div>
      
      <div className="space-y-6">
        {/* 체크인 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🕐 체크인 시간
          </label>
          <Input
            placeholder="예: 오후 3:00"
            value={checkinData.checkInTime}
            onChange={(e) => handleInputChange('checkInTime', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 체크아웃 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🕐 체크아웃 시간
          </label>
          <Input
            placeholder="예: 오전 11:00"
            value={checkinData.checkOutTime}
            onChange={(e) => handleInputChange('checkOutTime', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 얼리 체크인 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              🌅 얼리 체크인
            </label>
            <Switch
              isSelected={allowEarlyCheckIn}
              onValueChange={handleEarlyCheckInToggle}
            />
          </div>
          {allowEarlyCheckIn && (
            <Input
              placeholder="예: 오전 10:00 (추가 요금 20,000원)"
              value={checkinData.earlyCheckIn}
              onChange={(e) => handleInputChange('earlyCheckIn', e.target.value)}
              className="w-full"
            />
          )}
        </div>

        {/* 레이트 체크아웃 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              🌇 레이트 체크아웃
            </label>
            <Switch
              isSelected={allowLateCheckOut}
              onValueChange={handleLateCheckOutToggle}
            />
          </div>
          {allowLateCheckOut && (
            <Input
              placeholder="예: 오후 2:00 (추가 요금 30,000원)"
              value={checkinData.lateCheckOut}
              onChange={(e) => handleInputChange('lateCheckOut', e.target.value)}
              className="w-full"
            />
          )}
        </div>

        {/* 체크인 장소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📍 체크인 장소
          </label>
          <Input
            placeholder="예: 1층 로비, 프론트 데스크"
            value={checkinData.checkInLocation}
            onChange={(e) => handleInputChange('checkInLocation', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 체크아웃 장소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📍 체크아웃 장소
          </label>
          <Input
            placeholder="예: 1층 로비, 프론트 데스크"
            value={checkinData.checkOutLocation}
            onChange={(e) => handleInputChange('checkOutLocation', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 특별 안내사항 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📝 특별 안내사항
          </label>
          <Textarea
            placeholder="체크인/아웃 시 주의사항이나 특별 안내를 입력하세요"
            value={checkinData.specialInstructions}
            onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
            className="w-full"
            minRows={2}
          />
        </div>

        {/* 필요 서류 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📋 필요 서류
          </label>
          <Input
            placeholder="예: 신분증, 신용카드, 예약 확인서"
            value={checkinData.requiredDocuments}
            onChange={(e) => handleInputChange('requiredDocuments', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 연령 제한 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👶 연령 제한
          </label>
          <Input
            placeholder="예: 만 18세 이상, 미성년자 동반 필수"
            value={checkinData.ageRestrictions}
            onChange={(e) => handleInputChange('ageRestrictions', e.target.value)}
            className="w-full"
          />
        </div>

        {/* 반려동물 정책 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🐕 반려동물 정책
          </label>
          <Input
            placeholder="예: 반려동물 동반 불가, 또는 추가 요금 20,000원"
            value={checkinData.petPolicy}
            onChange={(e) => handleInputChange('petPolicy', e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default CheckInOutInfo; 