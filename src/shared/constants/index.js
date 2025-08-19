// app/constants/index.js

// 1. templates.js 내용 가져오기 (내용을 직접 복사하거나 export 활용)
// 예시: templates.js 내용을 여기에 직접 넣거나,
// export * from './templates'; // 와 같이 re-export
// --> 여기서는 templates.js 내용을 직접 포함시키는 방식으로 진행

// 기존 templates.js 내용 시작 (실제로는 해당 파일 내용을 복사해야 함)
export const TEMPLATE_LIST = [
  { id: 'default', name: '기본 템플릿' },
  { id: 'modern', name: '모던 템플릿' },
  { id: 'classic', name: '클래식 템플릿' },
  { id: 'minimal', name: '미니멀 템플릿' },
];

export const DEFAULT_TEMPLATE_DATA = {
  html: '<div>{{hotel.name}}</div>',
  // ... 기타 기본 데이터
};
// 기존 templates.js 내용 끝


// 2. app/constants.js 내용 가져오기 (내용 직접 복사)

// 호텔 등급 옵션 (기존 constants.js에서 복사)
export const HOTEL_RATINGS = [
  { value: 5, label: '5성급' },
  { value: 4, label: '4성급' },
  { value: 3, label: '3성급' },
  { value: 2, label: '2성급' },
  { value: 1, label: '1성급' }
];

// 섹션 타입 목록 (기존 constants.js에서 복사)
export const SECTION_TYPES = {
  HOTEL_INFO: 'hotel_info',
  ROOM_INFO: 'room_info',
  PRICE_TABLE: 'price_table',
  FACILITIES: 'facilities',
  CHECKIN: 'checkin',
  BOOKING: 'booking',
  CANCEL_POLICY: 'cancel_policy',
  PERIOD: 'period',
  NOTICE: 'notice'
};

// 기본 색상 테마 (기존 constants.js에서 복사)
export const COLOR_THEMES = {
  PRIMARY: '#3498db',
  SECONDARY: '#2ecc71',
  ACCENT: '#e74c3c',
  BACKGROUND: '#f9f9f9',
  TEXT: '#333333'
};

// 애플리케이션 설정 (기존 constants.js에서 복사)
export const APP_CONFIG = {
  DEFAULT_PORT: process.env.PORT || 3900,
  API_TIMEOUT: 10000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_WIDTH: 1200,
  DEFAULT_TEMPLATE: 'default' // TEMPLATES 상수가 없으므로 기본값 유지 또는 수정
};

// 포트 설정 상수 추가
export const PORT_CONFIG = {
  DEFAULT: process.env.PORT || 3900,
  DEV: process.env.DEV_PORT || 3900,
  TEST: process.env.TEST_PORT || 3900,
  PROD: process.env.PROD_PORT || 3900,
  getBaseUrl: (port = null) => `http://localhost:${port || PORT_CONFIG.DEFAULT}`
};

// 날짜 포맷 옵션 (기존 constants.js에서 복사)
export const DATE_FORMATS = {
  SHORT: 'YYYY-MM-DD',
  LONG: 'YYYY년 MM월 DD일',
  TIME: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm'
};

// TEMPLATES 객체 생성 - HTML 템플릿 포함
export const TEMPLATES = {
  default: `
    <div class="hotel-container">
      <div class="hotel-header">
        <h1>{{hotelName}}</h1>
        <p class="subtitle">{{hotelSubtitle}}</p>
        <p class="address">{{hotelAddress}}</p>
      </div>
      <div class="hotel-description">
        <p>{{hotelDescription}}</p>
      </div>
    </div>
  `,
  
  modern: `
    <div class="hotel-modern">
      <header class="hotel-modern-header">
        <h1 class="hotel-modern-title">{{hotelName}}</h1>
        <p class="hotel-modern-subtitle">{{hotelSubtitle}}</p>
        <address class="hotel-modern-address">{{hotelAddress}}</address>
      </header>
      <section class="hotel-modern-description">
        <p>{{hotelDescription}}</p>
      </section>
    </div>
  `,
  
  classic: `
    <div class="hotel-classic">
      <div class="hotel-classic-banner">
        <div class="hotel-classic-info">
          <h1 class="hotel-classic-name">{{hotelName}}</h1>
          <h3 class="hotel-classic-subtitle">{{hotelSubtitle}}</h3>
          <div class="hotel-classic-address">{{hotelAddress}}</div>
        </div>
      </div>
      <div class="hotel-classic-content">
        <div class="hotel-classic-description">
          <p>{{hotelDescription}}</p>
        </div>
      </div>
    </div>
  `,
  
  minimal: `
    <section class="hotel-minimal">
      <h2 class="hotel-minimal-name">{{hotelName}}</h2>
      <div class="hotel-minimal-meta">
        <p class="hotel-minimal-subtitle">{{hotelSubtitle}}</p>
        <p class="hotel-minimal-address">{{hotelAddress}}</p>
      </div>
      <div class="hotel-minimal-description">
        <p>{{hotelDescription}}</p>
      </div>
    </section>
  `,
};

// 필요시 default export도 가능
const constants = {
  TEMPLATES,
  HOTEL_RATINGS,
  SECTION_TYPES,
  COLOR_THEMES,
  APP_CONFIG,
  DATE_FORMATS
};

export default constants; 

export const SECTIONS = [
  { id: 'hotel', label: '호텔 정보', visible: true, order: 0 },
  { id: 'package', label: '패키지', visible: true, order: 1 },
  { id: 'notice', label: '안내사항', visible: true, order: 2 },
  { id: 'cancel', label: '취소/환불규정', visible: true, order: 3 },
  { id: 'booking', label: '예약안내', visible: true, order: 4 },
  { id: 'checkin', label: '체크인/아웃', visible: true, order: 5 },
  { id: 'period', label: '기간', visible: true, order: 6 },
  { id: 'price', label: '가격', visible: true, order: 7 },
  { id: 'rooms', label: '객실', visible: true, order: 8 },
]; 