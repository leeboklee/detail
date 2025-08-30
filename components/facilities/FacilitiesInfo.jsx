'use client';

import React, { useState, useEffect } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Input, Textarea } from "@heroui/react";

const FacilitiesInfo = ({ value = {}, onChange }) => {
  const [facilities, setFacilities] = useState({
    general: value.general || ['무료 Wi-Fi', '24시간 프런트 데스크', '엘리베이터'],
    business: value.business || ['비즈니스 센터', '회의실'],
    leisure: value.leisure || ['피트니스 센터', '사우나'],
    dining: value.dining || ['레스토랑', '카페', '룸서비스']
  });

  const [editingCategory, setEditingCategory] = useState(null);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (value.general || value.business || value.leisure || value.dining) {
      setFacilities({
        general: value.general || [],
        business: value.business || [],
        leisure: value.leisure || [],
        dining: value.dining || []
      });
    }
  }, [value]);

  const addFacility = (category) => {
    if (newItem.trim()) {
      const updatedFacilities = {
        ...facilities,
        [category]: [...facilities[category], newItem.trim()]
      };
      setFacilities(updatedFacilities);
      onChange(updatedFacilities);
      setNewItem('');
      setEditingCategory(null);
    }
  };

  const removeFacility = (category, index) => {
    const updatedFacilities = {
      ...facilities,
      [category]: facilities[category].filter((_, i) => i !== index)
    };
    setFacilities(updatedFacilities);
    onChange(updatedFacilities);
  };

  const updateFacility = (category, index, newValue) => {
    const updatedFacilities = {
      ...facilities,
      [category]: facilities[category].map((item, i) => i === index ? newValue : item)
    };
    setFacilities(updatedFacilities);
    onChange(updatedFacilities);
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setNewItem('');
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setNewItem('');
  };

  const categoryLabels = {
    general: '일반 시설',
    business: '비즈니스 시설',
    leisure: '레저 시설',
    dining: '식음료 시설'
  };

  const categoryIcons = {
    general: '🏢',
    business: '💼',
    leisure: '🏃‍♂️',
    dining: '🍽️'
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">시설 정보 관리</h2>
          <p className="text-sm text-gray-600">호텔의 다양한 시설 정보를 관리하세요</p>
        </div>
        
        <Button
          color="success"
          variant="bordered"
          onPress={() => {
            if (onChange) {
              onChange(facilities);
            }
            alert('시설 정보가 미리보기에 생성되었습니다.');
          }}
          startContent="✨"
        >
          생성
        </Button>
      </div>

      {/* 시설 카테고리별 관리 */}
      {Object.entries(facilities).map(([category, items]) => (
        <div key={category} className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <span className="mr-2">{categoryIcons[category]}</span>
              {categoryLabels[category]}
            </h3>
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={() => startEdit(category)}
              startContent="➕"
            >
              시설 추가
            </Button>
          </div>

          {/* 시설 추가 폼 */}
          {editingCategory === category && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-2">
                <Input
                  placeholder={Labels["새로운_시설을_입력하세요_PH"]}
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addFacility(category)}
                />
                <Button
                  color="primary"
                  size="sm"
                  onPress={() => addFacility(category)}
                  disabled={!newItem.trim()}
                >
                  추가
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  onPress={cancelEdit}
                >
                  취소
                </Button>
              </div>
            </div>
          )}

          {/* 시설 목록 */}
          <div className="space-y-2">
            {items.length > 0 ? (
              items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-600">•</span>
                    <span className="text-gray-800">{item}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="light"
                      onPress={() => {
                        const newValue = prompt('시설명을 수정하세요:', item);
                        if (newValue && newValue.trim() && newValue !== item) {
                          updateFacility(category, index, newValue.trim());
                        }
                      }}
                    >
                      ✏️
                    </Button>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => removeFacility(category, index)}
                    >
                      🗑️
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>등록된 시설이 없습니다.</p>
                <p className="text-sm mt-1">시설 추가 버튼을 클릭하여 첫 번째 시설을 등록하세요.</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* 전체 시설 요약 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">시설 요약</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(facilities).map(([category, items]) => (
            <div key={category} className="text-center">
              <div className="text-2xl mb-1">{categoryIcons[category]}</div>
              <div className="text-sm font-medium text-gray-700">{categoryLabels[category]}</div>
              <div className="text-lg font-bold text-blue-600">{items.length}개</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <div className="text-lg font-bold text-gray-900">
            총 시설 수: {Object.values(facilities).flat().length}개
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitiesInfo; 