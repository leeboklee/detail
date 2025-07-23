'use client';

import { formatWithLineBreaks, safeString } from './formatters';
import { formatPrice, getValidImageUrl, DEFAULT_IMAGE_URL } from '../../hooks/common/utils';
import { canGenerateHtml } from '../validators/validators';

/**
 * 테이블 콘텐츠 생성 함수
 * @param {Array} hotels - 호텔 정보 배열
 * @param {Array} dayTypes - 요일 정보 배열
 * @returns {string} - 생성된 HTML 테이블
 */
export const generateTableContent = (hotels, dayTypes) => {
  // 호텔 데이터가 없는 경우
  if (!hotels || hotels.length === 0) {
    return "";
  }

  let html = '';

  // 각 호텔별로 처리
  hotels.forEach(hotel => {
    if (!hotel.rooms || hotel.rooms.length === 0) return;

    html += `<div class="price-hotel-section">`;
    html += `<h4 class="hotel-name">${hotel.name || '호텔'}</h4>`;
    html += `<table class="price-table">`;
    html += `<thead><tr>`;
    html += `<th>객실 유형</th>`;

    // 요일 타입 헤더
    dayTypes.forEach(dayType => {
      html += `<th>${dayType.name || '요일'}</th>`;
    });

    html += `</tr></thead><tbody>`;

    // 각 객실 행 생성
    hotel.rooms.forEach(room => {
      html += `<tr>`;
      // 객실 유형
      html += `<td>${room.roomType || '객실'}</td>`;

      // 각 요일별 가격
      dayTypes.forEach(dayType => {
        const price = room.price?.[dayType.type] || 0;
        if (price > 0) {
          html += `<td>${formatPrice(price)}원</td>`;
        } else {
          html += `<td class="zero-price">추가요금 없음</td>`;
        }
      });

      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
  });

  return html;
};

/**
 * 기본 섹션 HTML을 생성하는 함수
 * @param {string} sectionId - 섹션 ID
 * @returns {string} - 생성된 HTML
 */
export const generateDefaultSection = (sectionId) => {
  let title = '';
  let message = '';
  
  switch (sectionId) {
    case 'hotel':
      title = '호텔 정보';
      message = '호텔 정보가 없습니다. 왼쪽 입력 필드에 호텔 정보를 입력해주세요.';
      break;
    case 'room':
      title = '객실 정보';
      message = '객실 정보가 없습니다. 왼쪽 입력 필드에 객실 정보를 입력해주세요.';
      break;
    case 'facilities':
      title = '부대시설 안내';
      message = '부대시설 정보가 없습니다. 왼쪽 입력 필드에 부대시설 정보를 입력해주세요.';
      break;

    case 'period':
      title = '패키지 정보';
      message = '패키지 정보가 없습니다. 왼쪽 입력 필드에 패키지 정보를 입력해주세요.';
      break;
    case 'price':
      title = '요금 안내';
      message = '요금 정보가 없습니다. 왼쪽 입력 필드에 요금 정보를 입력해주세요.';
      break;
    case 'cancel':
      title = '취소 및 환불 정책';
      message = '취소 정책 정보가 없습니다. 왼쪽 입력 필드에 취소 정책 정보를 입력해주세요.';
      break;
    case 'booking':
      title = '예약 안내';
      message = '예약 안내 정보가 없습니다. 왼쪽 입력 필드에 예약 안내 정보를 입력해주세요.';
      break;
    case 'notice':
      title = '안내사항';
      message = '안내사항이 없습니다. 왼쪽 입력 필드에 안내사항을 입력해주세요.';
      break;
    default:
      title = '정보 없음';
      message = '해당 섹션의 정보가 없습니다. 왼쪽 입력 필드에 정보를 입력해주세요.';
  }
  
  return `
    <div class="section" id="${sectionId}-section">
      <h2 class="section-title">${title}</h2>
      <div class="section-content">
        <p class="empty-message">${message}</p>
      </div>
    </div>
  `;
};

/**
 * 헤더 HTML을 생성하는 함수
 * @param {Object} hotelInfo - 호텔 정보 객체
 * @returns {string} - 생성된 HTML
 */
export const generateHeader = (hotelInfo) => {
  if (!hotelInfo) return '';
  
  return `
    <header class="hotel-header">
      <h1 class="hotel-title">${hotelInfo.name || '호텔명'}</h1>
      ${hotelInfo.address ? `<p class="hotel-address">${hotelInfo.address}</p>` : ''}
    </header>
  `;
};

/**
 * 푸터 HTML을 생성하는 함수
 * @returns {string} - 생성된 HTML
 */
export const generateFooter = () => {
  return `
    <footer class="hotel-footer">
      <p>© ${new Date().getFullYear()} 모든 정보는 예약 시점에 따라 변경될 수 있습니다.</p>
    </footer>
  `;
};

/**
 * 호텔 정보 HTML을 생성하는 함수 (목 데이터 검증 포함)
 * @param {Object} hotelInfo - 호텔 정보 객체
 * @returns {string} - 생성된 HTML 또는 오류 메시지
 */
export const generateHotelInfoHtml = (hotelInfo) => {
  // 목 데이터 검증
  const validation = canGenerateHtml({ hotel: hotelInfo });
  
  if (!validation.canGenerate) {
    return `
      <div class="mock-data-warning">
        <h3>⚠️ HTML 생성 차단</h3>
        <p>${validation.message}</p>
        <p><strong>감지된 목 데이터 섹션:</strong> ${validation.mockSections?.join(', ')}</p>
        <p>실제 데이터를 입력한 후 다시 시도해주세요.</p>
      </div>
    `;
  }
  
  if (!hotelInfo) return '';
  
  return `
    <div class="hotel-info">
      <h1 class="hotel-name">${hotelInfo.name ? safeString(hotelInfo.name) : ''}</h1>
      <p class="hotel-address">${hotelInfo.address ? safeString(hotelInfo.address) : ''}</p>
      ${hotelInfo.image ? `<img src="${getValidImageUrl(hotelInfo.image)}" alt="${hotelInfo.name ? safeString(hotelInfo.name) : '호텔'}" class="hotel-image" />` : ''}
      <p class="hotel-description">${hotelInfo.description ? formatWithLineBreaks(hotelInfo.description) : ''}</p>
    </div>
  `;
};

// 나머지 생성기 함수들 export
export {
  getValidImageUrl,
  DEFAULT_IMAGE_URL
}; 