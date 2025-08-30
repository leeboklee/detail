'use client';

import React, { useState } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Input, Chip, Divider } from "@heroui/react";
import { FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

const InlineFacilitiesEditor = ({ facilities = {}, onFacilitiesChange }) => {
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempFacilities, setTempFacilities] = useState({});

  const categories = {
    general: '일반 시설',
    business: '비즈니스 시설',
    leisure: '레저 시설',
    dining: '식음료 시설'
  };

  const defaultFacilities = {
    general: ['무료 Wi-Fi', '24시간 프런트 데스크', '엘리베이터'],
    business: ['비즈니스 센터', '회의실'],
    leisure: ['피트니스 센터', '사우나'],
    dining: ['레스토랑', '카페', '룸서비스']
  };

  const startEditing = (category) => {
    setEditingCategory(category);
    setTempFacilities({
      ...facilities,
      [category]: facilities[category] || defaultFacilities[category] || []
    });
  };

  const saveFacilities = () => {
    onFacilitiesChange(tempFacilities);
    setEditingCategory(null);
    setTempFacilities({});
  };

  const cancelEditing = () => {
    setEditingCategory(null);
    setTempFacilities({});
  };

  const addFacility = (category) => {
    const currentFacilities = tempFacilities[category] || [];
    const newFacility = prompt('새로운 시설을 입력하세요:');
    if (newFacility && newFacility.trim()) {
      setTempFacilities({
        ...tempFacilities,
        [category]: [...currentFacilities, newFacility.trim()]
      });
    }
  };

  const removeFacility = (category, index) => {
    const currentFacilities = tempFacilities[category] || [];
    const updatedFacilities = currentFacilities.filter((_, i) => i !== index);
    setTempFacilities({
      ...tempFacilities,
      [category]: updatedFacilities
    });
  };

  const updateFacility = (category, index, value) => {
    const currentFacilities = tempFacilities[category] || [];
    const updatedFacilities = [...currentFacilities];
    updatedFacilities[index] = value;
    setTempFacilities({
      ...tempFacilities,
      [category]: updatedFacilities
    });
  };

  return (
    <div className="space-y-6">
      {Object.entries(categories).map(([category, categoryName]) => (
        <div key={category} className="border rounded-lg p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">{categoryName}</h3>
            {editingCategory !== category && (
              <Button size="sm" color="primary" onPress={() => startEditing(category)}>
                편집
              </Button>
            )}
          </div>

          {editingCategory === category ? (
            // 편집 모드
            (<div className="space-y-4">
              <div className="space-y-2">
                {(tempFacilities[category] || []).map((facility, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={facility}
                      onChange={(e) => updateFacility(category, index, e.target.value)}
                      placeholder={Labels["시설명을_입력하세요_PH"]}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      color="danger"
                      onPress={() => removeFacility(category, index)}
                      startContent={<FaTrash />}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                color="primary"
                variant="bordered"
                onPress={() => addFacility(category)}
                startContent={<FaPlus />}
              >
                시설 추가
              </Button>
              <Divider />
              <div className="flex gap-2">
                <Button color="primary" onPress={saveFacilities} startContent={<FaSave />}>
                  저장
                </Button>
                <Button color="default" onPress={cancelEditing} startContent={<FaTimes />}>
                  취소
                </Button>
              </div>
            </div>)
          ) : (
            // 보기 모드
            (<div>
              {(facilities[category] || defaultFacilities[category] || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {(facilities[category] || defaultFacilities[category] || []).map((facility, index) => (
                    <Chip key={index} variant="flat" color="primary">
                      {facility}
                    </Chip>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">등록된 시설이 없습니다.</p>
              )}
            </div>)
          )}
        </div>
      ))}
    </div>
  );
};

export default InlineFacilitiesEditor; 