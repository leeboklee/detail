'use client';

import React, { useState, useCallback } from 'react';

import Labels from '@/src/shared/labels';
import { Button, Card, CardBody, CardHeader, Input, Textarea, Select, SelectItem, Chip, Divider } from "@heroui/react";

export const HotelInfoSection = ({ value = {}, onChange }) => {
  const [hotelData, setHotelData] = useState({
    name: value.name || '',
    address: value.address || '',
    phone: value.phone || '',
    email: value.email || '',
    website: value.website || '',
    description: value.description || '',
    category: value.category || 'hotel',
    stars: value.stars || 3,
    amenities: value.amenities || [],
    images: value.images || []
  });

  // 외부 value 변경 시 내부 state 동기화
  React.useEffect(() => {
    setHotelData({
      name: value.name || '',
      address: value.address || '',
      phone: value.phone || '',
      email: value.email || '',
      website: value.website || '',
      description: value.description || '',
      category: value.category || 'hotel',
      stars: value.stars || 3,
      amenities: value.amenities || [],
      images: value.images || []
    });
  }, [value]);

  const handleChange = useCallback((field, newValue) => {
    const updatedData = { ...hotelData, [field]: newValue };
    setHotelData(updatedData);
    onChange?.(updatedData);
  }, [hotelData, onChange]);

  const addAmenity = useCallback(() => {
    const amenity = prompt('편의시설을 입력하세요:');
    if (amenity && !hotelData.amenities.includes(amenity)) {
      handleChange('amenities', [...hotelData.amenities, amenity]);
    }
  }, [hotelData.amenities, handleChange]);

  const removeAmenity = useCallback((index) => {
    const updatedAmenities = hotelData.amenities.filter((_, i) => i !== index);
    handleChange('amenities', updatedAmenities);
  }, [hotelData.amenities, handleChange]);

  const addImage = useCallback(() => {
    const imageUrl = prompt('이미지 URL을 입력하세요:');
    if (imageUrl && !hotelData.images.includes(imageUrl)) {
      handleChange('images', [...hotelData.images, imageUrl]);
    }
  }, [hotelData.images, handleChange]);

  const removeImage = useCallback((index) => {
    const updatedImages = hotelData.images.filter((_, i) => i !== index);
    handleChange('images', updatedImages);
  }, [hotelData.images, handleChange]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">기본 정보</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.호텔명_}</label>
              <Input
                value={hotelData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder={Labels["호텔명을_입력하세요_PH_1"]}
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300 text-overlap-fix",
                  inputWrapper: "h-12",
                  label: "text-gray-700 font-medium mb-2 block"
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.카테고리}</label>
              <Select
                selectedKeys={[hotelData.category]}
                onSelectionChange={(keys) => handleChange('category', Array.from(keys)[0])}
                placeholder={Labels["카테고리를_선택하세요_PH"]}
              >
                <SelectItem key="hotel">호텔</SelectItem>
                <SelectItem key="resort">리조트</SelectItem>
                <SelectItem key="guesthouse">게스트하우스</SelectItem>
                <SelectItem key="motel">모텔</SelectItem>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.별점}</label>
              <Select
                selectedKeys={[hotelData.stars.toString()]}
                onSelectionChange={(keys) => handleChange('stars', parseInt(Array.from(keys)[0]))}
                placeholder={Labels["별점을_선택하세요_PH"]}
              >
                {[1, 2, 3, 4, 5].map(star => (
                  <SelectItem key={star.toString()}>{'⭐'.repeat(star)}</SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.전화번호}</label>
              <Input
                value={hotelData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder={Labels["전화번호를_입력하세요_PH"]}
                classNames={{
                  input: "text-gray-800 bg-white border-gray-300 text-overlap-fix",
                  inputWrapper: "h-12",
                  label: "text-gray-700 font-medium mb-2 block"
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.이메일}</label>
            <Input
              value={hotelData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder={Labels["이메일을_입력하세요_PH"]}
              type="email"
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-overlap-fix",
                inputWrapper: "h-12",
                label: "text-gray-700 font-medium mb-2 block"
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.웹사이트}</label>
            <Input
              value={hotelData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder={Labels["웹사이트_URL을_입력하세요_PH"]}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-overlap-fix",
                inputWrapper: "h-12",
                label: "text-gray-700 font-medium mb-2 block"
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.주소_1}</label>
            <Input
              value={hotelData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder={Labels["주소를_입력하세요_PH_1"]}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-overlap-fix",
                inputWrapper: "h-12",
                label: "text-gray-700 font-medium mb-2 block"
              }}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{Labels.호텔_설명}</label>
            <Textarea
              value={hotelData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={Labels["호텔에_대한_상세한_설명을_입력하세요_PH"]}
              rows={4}
              classNames={{
                input: "text-gray-800 bg-white border-gray-300 text-overlap-fix no-overlap",
                label: "text-gray-700 font-medium mb-2 block",
                inputWrapper: "no-overlap"
              }}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">편의시설</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={addAmenity}
              >
                편의시설 추가
              </Button>
              <span className="text-sm text-gray-600">
                총 {hotelData.amenities.length}개
              </span>
            </div>
            
            {hotelData.amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hotelData.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    color="primary"
                    variant="flat"
                    onClose={() => removeAmenity(index)}
                  >
                    {amenity}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">이미지</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={addImage}
              >
                이미지 추가
              </Button>
              <span className="text-sm text-gray-600">
                총 {hotelData.images.length}개
              </span>
            </div>
            
            {hotelData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotelData.images.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`호텔 이미지 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x200?text=이미지+없음';
                      }}
                    />
                    <Button
                      size="sm"
                      color="danger"
                      variant="flat"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onPress={() => removeImage(index)}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default HotelInfoSection; 