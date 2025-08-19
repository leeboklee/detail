'use client';

/**
 * 목 데이터 검증 유틸리티
 */

/**
 * 목 데이터 패턴 정의
 */
const MOCK_DATA_PATTERNS = {
  // 호텔 정보 목 데이터 패턴
  hotel: {
    names: ['샘플 호텔', '호텔명'],
    addresses: ['서울특별시 강남구 테헤란로 123'],
    descriptions: [
      '편안하고 아늑한 도심 속 휴식공간입니다.',
      '아름다운 전망과 고급스러운 객실을 갖춘 5성급 호텔입니다.',
      '호텔 설명이 없습니다.',
      '샘플 호텔 설명입니다.'
    ],
    phones: ['02-1234-5678']
  },
  
  // 객실 정보 목 데이터 패턴
  rooms: {
    names: ['스탠다드 룸', '스탠다드', '새 객실'],
    types: ['스탠다드', '스탠다드 룸'],
    bedTypes: ['퀸 베드 1개'],
    descriptions: [
      '편안한 숙면을 위한 퀸 베드가 구비된 스탠다드 룸입니다.',
      '객실 설명이 없습니다.'
    ],
    views: ['시티뷰']
  },
  
  // 패키지 정보 목 데이터 패턴
  packages: {
    names: ['조식패키지', '워터pkg'],
    descriptions: [
      '커플을 위한 특별한 패키지',
      '성인2 + 소인2'
    ],
    dates: ['2023-01-01', '2023-12-31']
  },
  
  // 공지사항 목 데이터 패턴
  notices: {
    contents: [
      '체크인 시 신분증을 지참해 주세요.',
      '중요 안내',
      '안내사항이 없습니다.'
    ]
  }
};

/**
 * 문자열이 목 데이터 패턴과 일치하는지 확인
 * @param {string} value - 확인할 값
 * @param {Array} patterns - 패턴 배열
 * @returns {boolean}
 */
function matchesPattern(value, patterns) {
  if (!value || !patterns) return false;
  
  const normalizedValue = value.toString().trim().toLowerCase();
  return patterns.some(pattern => 
    normalizedValue.includes(pattern.toLowerCase()) ||
    pattern.toLowerCase().includes(normalizedValue)
  );
}

/**
 * 호텔 정보가 목 데이터인지 확인
 * @param {Object} hotel - 호텔 정보 객체
 * @returns {boolean}
 */
export function isHotelMockData(hotel) {
  if (!hotel) return false;
  
  // 호텔명 확인
  if (hotel.name && matchesPattern(hotel.name, MOCK_DATA_PATTERNS.hotel.names)) {
    return true;
  }
  
  // 주소 확인
  if (hotel.address && matchesPattern(hotel.address, MOCK_DATA_PATTERNS.hotel.addresses)) {
    return true;
  }
  
  // 설명 확인
  if (hotel.description && matchesPattern(hotel.description, MOCK_DATA_PATTERNS.hotel.descriptions)) {
    return true;
  }
  
  // 전화번호 확인
  if (hotel.phone && matchesPattern(hotel.phone, MOCK_DATA_PATTERNS.hotel.phones)) {
    return true;
  }
  
  return false;
}

/**
 * 객실 정보가 목 데이터인지 확인
 * @param {Array} rooms - 객실 정보 배열
 * @returns {boolean}
 */
export function isRoomsMockData(rooms) {
  if (!rooms || !Array.isArray(rooms) || rooms.length === 0) return false;
  
  return rooms.some(room => {
    // 객실명 확인
    if (room.name && matchesPattern(room.name, MOCK_DATA_PATTERNS.rooms.names)) {
      return true;
    }
    
    // 객실 타입 확인
    if (room.type && matchesPattern(room.type, MOCK_DATA_PATTERNS.rooms.types)) {
      return true;
    }
    
    // 베드 타입 확인
    if (room.bedType && matchesPattern(room.bedType, MOCK_DATA_PATTERNS.rooms.bedTypes)) {
      return true;
    }
    
    // 객실 설명 확인
    if (room.description && matchesPattern(room.description, MOCK_DATA_PATTERNS.rooms.descriptions)) {
      return true;
    }
    
    // 뷰 확인
    if (room.view && matchesPattern(room.view, MOCK_DATA_PATTERNS.rooms.views)) {
      return true;
    }
    
    return false;
  });
}

/**
 * 패키지 정보가 목 데이터인지 확인
 * @param {Array} packages - 패키지 정보 배열
 * @returns {boolean}
 */
export function isPackagesMockData(packages) {
  if (!packages || !Array.isArray(packages) || packages.length === 0) return false;
  
  return packages.some(_package => {
    // 패키지명 확인
    if (_package.name && matchesPattern(_package.name, MOCK_DATA_PATTERNS.packages.names)) {
      return true;
    }
    
    // 패키지 설명 확인
    if (_package.description && matchesPattern(_package.description, MOCK_DATA_PATTERNS.packages.descriptions)) {
      return true;
    }
    
    // 날짜 정보 확인
    if (_package.date && matchesPattern(_package.date, MOCK_DATA_PATTERNS.packages.dates)) {
      return true;
    }
    
    return false;
  });
}

/**
 * 공지사항 정보가 목 데이터인지 확인
 * @param {Array} notices - 공지사항 정보 배열
 * @returns {boolean}
 */
export function isNoticesMockData(notices) {
  if (!notices || !Array.isArray(notices) || notices.length === 0) return false;
  
  return notices.some(notice => {
    // 공지사항 내용 확인
    if (notice.content && matchesPattern(notice.content, MOCK_DATA_PATTERNS.notices.contents)) {
      return true;
    }
    return false;
  });
}

/**
 * 모든 섹션의 데이터가 목 데이터인지 종합적으로 검증
 * @param {Object} data - 섹션 데이터 (hotel, rooms, packages, notices 등 포함)
 * @returns {{isMock: boolean, mockSections: string[], message: string}}
 */
export function validateMockData(data) {
  const mockSections = [];
  
  if (isHotelMockData(data.hotelInfo)) {
    mockSections.push('호텔 정보');
  }
  if (isRoomsMockData(data.roomInfo)) {
    mockSections.push('객실 정보');
  }
  if (isPackagesMockData(data.packageInfo)) {
    mockSections.push('패키지 정보');
  }
  if (isNoticesMockData(data.noticeInfo)) {
    mockSections.push('공지사항');
  }

  const isMock = mockSections.length > 0;
  const message = isMock 
    ? `다음 섹션에 목 데이터가 감지되었습니다: ${mockSections.join(', ')}. 실제 데이터를 입력해주세요.`
    : '모든 데이터가 유효합니다.';

  return {
    isMock,
    mockSections,
    message,
  };
}

/**
 * HTML 생성이 가능한지 여부 검증
 * @param {Object} data - 모든 섹션 데이터
 * @returns {{canGenerate: boolean, message: string, mockSections: string[]}}
 */
export const canGenerateHtml = (data) => {
  const { isMock, mockSections, message } = validateMockData(data);
  return {
    canGenerate: !isMock, // 목 데이터가 없어야 생성 가능
    message: isMock ? message : 'HTML 생성이 가능합니다.',
    mockSections,
  };
};

/**
 * 미리보기 생성이 가능한지 여부 검증 (canGenerateHtml과 동일한 로직 사용)
 * @param {Object} data - 모든 섹션 데이터
 * @returns {{canPreview: boolean, message: string, mockSections: string[]}}
 */
export const canPreview = (data) => {
  const { isMock, mockSections, message } = validateMockData(data);
  return {
    canPreview: !isMock,
    message: isMock ? message : '미리보기가 가능합니다.',
    mockSections,
  };
};

const validators = {
  isHotelMockData,
  isRoomsMockData,
  isPackagesMockData,
  isNoticesMockData,
  validateMockData,
  canGenerateHtml,
  canPreview,
};

// 기본 내보내기
export default validators; 