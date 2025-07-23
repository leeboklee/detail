/**
 * 앱 전체에서 사용되는 상수 값들을 정의합니다.
 */

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
}

// API 관련 상수
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.example.com'

// 로그 레벨
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info', 
  WARN: 'warn',
  ERROR: 'error'
}

// 기본 섹션 목록 정의
export const getDefaultSections = () => {
  return [
    { id: 'hotel', name: '호텔 정보', visible: true },
    { id: 'room', name: '객실 정보', visible: true },
    { id: 'facilities', name: '부대시설 안내', visible: true },
    { id: 'checkin', name: '체크인/체크아웃', visible: true },
    { id: 'period', name: '패키지 정보', visible: true },
    { id: 'price', name: '요금 안내', visible: true },
    { id: 'cancel', name: '취소 및 환불 정책', visible: true },
    { id: 'booking', name: '예약 안내', visible: true },
    { id: 'notice', name: '안내사항', visible: true }
  ];
};

// 기본 이미지 URL 상수 정의 