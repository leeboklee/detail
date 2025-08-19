// React import 추가
import React from 'react';
import Image from 'next/image';
import { Button } from "@heroui/react";

// 제어되는 컴포넌트로 리팩토링
export function HotelInfoSection({ value, onChange }) {
  // value가 undefined나 null일 경우를 대비해 기본값 설정
  const hotelInfo = value || {
    name: '',
    address: '',
    description: '',
    imageUrl: '',
    phone: '',
    email: '',
    website: '',
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value: inputValue } = e.target;
    // 변경된 값을 포함하는 새로운 호텔 객체를 생성하여 onChange 호출
    if (onChange) {
      onChange({
        ...hotelInfo,
        [name]: inputValue,
      });
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
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">호텔 정보</h2>
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          호텔 이름
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={hotelInfo.name}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="호텔 이름을 입력하세요"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
          주소
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={hotelInfo.address}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="호텔 주소를 입력하세요"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          id="description"
          name="description"
          value={hotelInfo.description}
          onChange={handleInputChange}
          rows="3"
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="호텔에 대한 설명을 입력하세요"
        ></textarea>
      </div>

      <div className="mb-4">
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          이미지 URL
        </label>
        <input
          type="text"
          id="imageUrl"
          name="imageUrl"
          value={hotelInfo.imageUrl}
          onChange={handleInputChange}
          className={`w-full p-2 border rounded ${!isValidImageUrl(hotelInfo.imageUrl) ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="호텔 이미지 URL을 입력하세요"
        />
        {!isValidImageUrl(hotelInfo.imageUrl) && (
          <p className="text-red-500 text-xs mt-1">유효한 URL을 입력하세요</p>
        )}
        
        {hotelInfo.imageUrl && isValidImageUrl(hotelInfo.imageUrl) && (
          <div className="mt-2 p-2 border rounded">
            <p className="text-sm font-medium mb-1">이미지 미리보기:</p>
            <Image
              src={hotelInfo.imageUrl}
              alt="호텔 이미지 미리보기"
              width={300}
              height={200}
              className="max-h-40 mx-auto object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/300x200?text=이미지+로드+실패';
              }}
            />
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          전화번호
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={hotelInfo.phone}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="호텔 전화번호를 입력하세요"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          이메일
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={hotelInfo.email}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="호텔 이메일을 입력하세요"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
          웹사이트
        </label>
        <input
          type="url"
          id="website"
          name="website"
          value={hotelInfo.website}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded"
          placeholder="호텔 웹사이트 URL을 입력하세요"
        />
      </div>
    </div>
  );
}

// HotelInfoSection을 이름 지정(named) 방식으로 export 해야 합니다.
// export default HotelInfoSection; // 주석 처리 또는 제거 