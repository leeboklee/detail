'use client';

import React from 'react';
import Image from 'next/image';
import SimpleInput from '../room/SimpleInput';

const HotelInfo = React.memo(({ hotel, update }) => {
  const hotelInfo = hotel || {
    name: '',
    address: '',
    description: '',
    imageUrl: '',
    phone: '',
    checkin_time: '15:00',
    checkout_time: '11:00',
  };

  const handleSimpleInputChange = (e) => {
    const { name, value: inputValue } = e.target;
    if (update) {
      update(name, inputValue);
    }
  };

  // 이미지 URL 유효성 검사
  const isValidImageUrl = (url) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-4 p-1">
      <SimpleInput
        label="호텔 이름"
        id="name"
        name="name"
        value={hotelInfo.name || ''}
        onChange={handleSimpleInputChange}
        placeholder="호텔의 전체 이름을 입력하세요"
      />
      <SimpleInput
        label="호텔 주소"
        id="address"
        name="address"
        value={hotelInfo.address || ''}
        onChange={handleSimpleInputChange}
        placeholder="호텔의 주소를 입력하세요"
      />
      
      <SimpleInput
        label="호텔 설명"
        type="textarea"
        id="description"
        name="description"
        value={hotelInfo.description || ''}
        onChange={handleSimpleInputChange}
        rows="4"
        placeholder="호텔에 대한 간략한 설명을 입력하세요"
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />

      <SimpleInput
        label="체크인 시간"
        id="checkin_time"
        name="checkin_time"
        type="time"
        value={hotelInfo.checkin_time || '15:00'}
        onChange={handleSimpleInputChange}
      />

      <SimpleInput
        label="체크아웃 시간"
        id="checkout_time"
        name="checkout_time"
        type="time"
        value={hotelInfo.checkout_time || '11:00'}
        onChange={handleSimpleInputChange}
      />
      
      <SimpleInput
        label="이미지 URL"
        type="url"
        id="imageUrl"
        name="imageUrl"
        value={hotelInfo.imageUrl || ''}
        onChange={handleSimpleInputChange}
        placeholder="https://example.com/image.jpg"
        className={`w-full p-2 border rounded-md shadow-sm ${!isValidImageUrl(hotelInfo.imageUrl) ? 'border-red-500' : 'border-gray-300'}`}
      />
      {!isValidImageUrl(hotelInfo.imageUrl) && (
        <p className="text-red-500 text-xs mt-1">유효한 URL을 입력하세요.</p>
      )}
        
      {hotelInfo.imageUrl && isValidImageUrl(hotelInfo.imageUrl) && (
        <div className="mt-2 p-2 border rounded-md">
          <Image
            src={hotelInfo.imageUrl}
            alt="호텔 이미지 미리보기"
            width={300}
            height={200}
            className="max-h-48 w-full object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
});

export default HotelInfo;