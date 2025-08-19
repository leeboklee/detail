'use client';

import React, { useMemo } from 'react';
import Image from 'next/image';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip, Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { FaTrash, FaPlus, FaRunning, FaUtensils, FaWifi, FaParking, FaSwimmer } from 'react-icons/fa';

// URL 유효성 검사 함수
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

const facilityCategories = [
  { key: 'general', label: '일반' },
  { key: 'business', label: '비즈니스' },
  { key: 'leisure', label: '레저' },
  { key: 'dining', label: '다이닝' },
];

const recommendedFacilities = [
  { name: '무료 Wi-Fi', category: 'general', icon: <FaWifi /> },
  { name: '주차 가능', category: 'general', icon: <FaParking /> },
  { name: '수영장', category: 'leisure', icon: <FaSwimmer /> },
  { name: '피트니스 센터', category: 'leisure', icon: <FaRunning /> },
  { name: '레스토랑', category: 'dining', icon: <FaUtensils /> },
];

/**
 * 부대시설 정보 컴포넌트 - value/onChange props를 사용하는 제어 컴포넌트
 * props:
 *  - value: 시설 데이터 (객체 또는 배열)
 *  - onChange: 시설 데이터 업데이트 함수
 */
export default function FacilitiesInfo({ value = {}, onChange }) {
  const facilities = useMemo(() => {
    const allFacilities = [];
    if (value && typeof value === 'object') {
      Object.entries(value).forEach(([category, items]) => {
        if (Array.isArray(items)) {
          items.forEach(item => {
            if (typeof item === 'string') {
              allFacilities.push({ name: item, description: '', image: '', category });
            } else if (typeof item === 'object' && item !== null) {
              allFacilities.push({ ...item, category });
            }
          });
        }
      });
    }
    return allFacilities;
  }, [value]);

  const reconstructFacilitiesObject = (facilitiesArray) => {
    const newFacilitiesObject = {
      general: [],
      business: [],
      leisure: [],
      dining: []
    };
    facilitiesArray.forEach(facility => {
      const category = facility.category || 'general';
      if (newFacilitiesObject.hasOwnProperty(category)) {
        newFacilitiesObject[category].push({
          name: facility.name || '',
          description: facility.description || '',
          image: facility.image || ''
        });
      }
    });
    return newFacilitiesObject;
  };

  const handleAddFacility = (facility) => {
    const newFacility = facility || { name: '', description: '', image: '', category: 'general' };
    const updatedFacilities = [...facilities, newFacility];
    if (typeof onChange === 'function') {
      onChange(reconstructFacilitiesObject(updatedFacilities));
    }
  };

  const handleRemoveFacility = (indexToRemove) => {
    const updatedFacilities = facilities.filter((_, index) => index !== indexToRemove);
    if (typeof onChange === 'function') {
      onChange(reconstructFacilitiesObject(updatedFacilities));
    }
  };

  const handleFacilityChange = (index, field, newValue) => {
    const updatedFacilities = facilities.map((facility, i) => {
      if (i === index) {
        return { ...facility, [field]: newValue };
      }
      return facility;
    });
    if (typeof onChange === 'function') {
      onChange(reconstructFacilitiesObject(updatedFacilities));
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">시설 정보 관리</h2>
      </div>
      <div className="mb-6 bg-gray-50 p-4 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">추천 시설 바로 추가</h3>
        <div className="flex flex-wrap gap-2">
          {recommendedFacilities.map((rec, index) => (
            <Button 
              key={index}
              size="sm"
              variant="ghost"
              startContent={rec.icon}
              onPress={() => handleAddFacility({ name: rec.name, category: rec.category, description: '', image: '' })}
            >
              {rec.name}
            </Button>
          ))}
          <Button 
            size="sm"
            variant="flat"
            color="primary"
            startContent={<FaPlus />}
            onPress={() => handleAddFacility()}
          >
            직접 추가
          </Button>
        </div>
      </div>
      <Table aria-label="시설 정보 테이블" className="min-w-full">
        <TableHeader>
          <TableColumn>카테고리</TableColumn>
          <TableColumn>시설명</TableColumn>
          <TableColumn>설명</TableColumn>
          <TableColumn>이미지</TableColumn>
          <TableColumn>관리</TableColumn>
        </TableHeader>
        <TableBody items={facilities} emptyContent={"추가된 시설 정보가 없습니다."}>
          {(item, index) => (
            // key 에러 방지: name+category+index 조합으로 고유 key 생성
            (<TableRow key={`${item.name || 'facility'}-${item.category || 'general'}-${index}`}>
              <TableCell>
                <Select
                  size="sm"
                  selectedKeys={[item.category || 'general']}
                  onChange={(e) => handleFacilityChange(index, 'category', e.target.value)}
                  aria-label="카테고리 선택"
                  classNames={{
                    trigger: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                >
                  {facilityCategories.map((cat) => (
                    <SelectItem key={cat.key} value={cat.key}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <Input
                  size="sm"
                  value={item.name}
                  onValueChange={(value) => handleFacilityChange(index, 'name', value)}
                  placeholder="시설명 (예: 수영장)"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                />
              </TableCell>
              <TableCell>
                <Textarea
                   size="sm"
                  value={item.description}
                  onValueChange={(value) => handleFacilityChange(index, 'description', value)}
                  placeholder="운영 시간 등"
                  classNames={{
                    input: "text-gray-800 bg-white border-gray-300",
                    label: "text-gray-700 font-medium"
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {isValidUrl(item.image) && (
                    <Tooltip content={<Image src={item.image} alt={item.name} width={150} height={150} className="rounded-md" />}>
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover cursor-pointer"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </Tooltip>
                  )}
                  <Input
                    size="sm"
                    value={item.image}
                    onValueChange={(value) => handleFacilityChange(index, 'image', value)}
                    placeholder="이미지 URL"
                    classNames={{
                      input: "text-gray-800 bg-white border-gray-300",
                      label: "text-gray-700 font-medium"
                    }}
                  />
                </div>
              </TableCell>
              <TableCell>
                <Tooltip content="삭제" color="danger">
                  <Button isIconOnly color="danger" variant="light" onPress={() => handleRemoveFacility(index)}>
                    <FaTrash />
                  </Button>
                </Tooltip>
              </TableCell>
            </TableRow>)
          )}
        </TableBody>
      </Table>
    </div>
  );
} 