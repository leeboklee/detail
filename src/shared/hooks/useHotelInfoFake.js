'use client'

import { useState, useEffect } from 'react';

// 가짜 호텔 데이터 초기값 정의
const initialHotelInfo = {
  hotelName: '그랜드 호텔 서울',
  hotelAddress: '서울특별시 중구 을지로 30',
  hotelDescription: '서울 중심부에 위치한 럭셔리 5성급 호텔로, 아름다운 도시 전망과 최상의 서비스를 제공합니다.',
  
  roomInfo: {
    roomType: '디럭스 킹',
    capacity: 2,
    roomSize: 35,
    bedType: '킹 사이즈 침대 1개',
    roomView: '시티 뷰',
    roomAmenities: '무료 와이파이, 미니바, 에어컨, TV'
  },
  
  facilities: {
    wifi: true,
    parking: true,
    breakfast: true,
    gym: true,
    pool: true,
    spa: true,
    roomService: true,
    restaurant: true,
    bar: true,
    airportShuttle: false,
    concierge: true,
    businessCenter: true,
    laundry: true,
    disability: false
  },
  
  checkInfo: {
    checkIn: '15:00',
    checkOut: '11:00',
    lateCheckOut: '개별 문의 (추가 요금 발생)',
    earlyCheckIn: '개별 문의 (추가 요금 발생)'
  },
  
  priceInfo: {
    pricePerNight: 250000,
    tax: 10,
    serviceFee: 30000,
    discountRate: 15,
    totalPrice: 242500
  },
  
  cancellationPolicy: {
    freeCancellation: '체크인 3일 전까지 무료 취소 가능',
    penaltyCancellation: '체크인 3일 이내 취소 시 1박 요금의 100% 위약금 부과',
    noshowPolicy: '노쇼(No-show)의 경우 전체 숙박 요금의 100% 위약금 부과',
    notes: ''
  },
  
  bookingInfo: {
    bookingNumber: 'BK12345678',
    bookingDate: '2023-12-01',
    bookingStatus: '확정',
    guestName: '홍길동',
    guestEmail: 'hong@example.com',
    guestPhone: '010-1234-5678',
    numberOfGuests: 2,
    specialRequests: '늦은 체크인 예정입니다. 추가 베개를 요청드립니다.'
  },
  
  notices: [],
};

/**
 * 가짜 호텔 정보를 제공하는 커스텀 훅
 * 템플릿 테스트 목적으로 사용됨
 */
export function useHotelInfoFake() {
  const [hotelInfo, setHotelInfo] = useState(initialHotelInfo);
  
  // 전체 호텔 정보 업데이트 함수
  const updateHotelInfo = (newInfo) => {
    setHotelInfo(prev => ({
      ...prev,
      ...newInfo
    }));
  };
  
  // 룸 정보 업데이트
  const updateRoomInfo = (roomInfo) => {
    setHotelInfo(prev => ({
      ...prev,
      roomInfo: {
        ...prev.roomInfo,
        ...roomInfo
      }
    }));
  };
  
  // 시설 정보 업데이트
  const updateFacilities = (facilities) => {
    setHotelInfo(prev => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        ...facilities
      }
    }));
  };
  
  // 체크인/체크아웃 정보 업데이트
  const updateCheckInfo = (checkInfo) => {
    setHotelInfo(prev => ({
      ...prev,
      checkInfo: {
        ...prev.checkInfo,
        ...checkInfo
      }
    }));
  };
  
  // 가격 정보 업데이트
  const updatePriceInfo = (priceInfo) => {
    setHotelInfo(prev => ({
      ...prev,
      priceInfo: {
        ...prev.priceInfo,
        ...priceInfo
      }
    }));
  };
  
  // 취소 정책 업데이트
  const updateCancellationPolicy = (policy) => {
    setHotelInfo(prev => ({
      ...prev,
      cancellationPolicy: {
        ...prev.cancellationPolicy,
        ...policy
      }
    }));
  };
  
  // 예약 정보 업데이트
  const updateBookingInfo = (bookingInfo) => {
    setHotelInfo(prev => ({
      ...prev,
      bookingInfo: {
        ...prev.bookingInfo,
        ...bookingInfo
      }
    }));
  };
  
  // 알림 정보 업데이트
  const updateNotices = (newNotice) => {
    setHotelInfo(prev => {
      const currentNotices = Array.isArray(prev.notices) ? prev.notices : [];
      return {
        ...prev,
        notices: [...currentNotices, { content: newNotice }]
      };
    });
  };
  
  // 처음 훅 로드 시 로컬스토리지에서 이전 데이터 불러오기 시도
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('hotelInfoData');
      if (savedData) {
        setHotelInfo(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('로컬스토리지에서 호텔 정보를 불러오는 중 오류 발생:', error);
    }
  }, []);
  
  // 데이터가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    try {
      localStorage.setItem('hotelInfoData', JSON.stringify(hotelInfo));
    } catch (error) {
      console.error('호텔 정보를 로컬스토리지에 저장하는 중 오류 발생:', error);
    }
  }, [hotelInfo]);
  
  return {
    hotelInfo,
    updateHotelInfo,
    updateRoomInfo,
    updateFacilities,
    updateCheckInfo,
    updatePriceInfo,
    updateCancellationPolicy,
    updateBookingInfo,
    updateNotices
  };
} 