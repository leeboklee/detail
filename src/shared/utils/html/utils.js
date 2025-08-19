'use client';

/**
 * HTML 생성에 필요한 다양한 유틸리티 함수들
 */

/**
 * 객체의 속성 값을 설정하는 함수
 * @param {Object} obj - 값을 설정할 객체
 * @param {string} key - 설정할 속성 키
 * @param {any} value - 설정할 값
 * @returns {Object} - 값이 설정된 객체
 */
export function setValue(obj, key, value) {
  try {
    if (!obj || typeof obj !== 'object') return obj;
    obj[key] = value;
    return obj;
  } catch (error) {
    console.error('setValue 오류:', error);
    return obj;
  }
}

/**
 * HTML 요소에서 값을 가져오는 함수
 * @param {Element} element - 값을 가져올 DOM 요소
 * @param {string} defaultValue - 기본값
 * @returns {string} - 요소의 값 또는 기본값
 */
export function getValue(element, defaultValue = '') {
  try {
    if (!element) return defaultValue;
    return element.value || defaultValue;
  } catch (error) {
    console.error('getValue 오류:', error);
    return defaultValue;
  }
}

/**
 * 선택자로 DOM 요소의 데이터를 가져오는 함수
 * @param {string} selector - 데이터를 가져올 요소의 CSS 선택자
 * @param {string} defaultValue - 기본값
 * @returns {string} - 요소의 값 또는 기본값
 */
export function getData(selector, defaultValue = '') {
  try {
    if (typeof document === 'undefined') return defaultValue;
    
    const element = document.querySelector(selector);
    if (!element) {
      return defaultValue;
    }
    
    // 입력 요소인 경우
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
      return element.value || defaultValue;
    }
    
    // 기타 요소인 경우
    return element.textContent || defaultValue;
  } catch (error) {
    console.error('getData 오류:', error);
    return defaultValue;
  }
}

/**
 * 호텔 정보 객체를 공통 형식으로 가져오는 함수
 * @returns {Object} - 호텔 정보 객체
 */
export function getCommonHotelInfo() {
  try {
    // 브라우저 환경이 아닐 경우 빈 객체 반환
    if (typeof window === 'undefined') {
      return {};
    }
    
    // 상태 객체가 없을 경우 기본값 반환
    if (!window.state || !window.state.hotelInfo) {
      // 기본 데이터 반환
      return {
        name: '샘플 호텔',
        address: '서울시 강남구 123-45',
        description: '샘플 호텔 설명입니다.',
        imageUrl: 'https://example.com/hotel.jpg'
      };
    }
    
    // 상태에서 호텔 정보 가져오기
    const hotelInfo = window.state.hotelInfo || {};
    return hotelInfo;
  } catch (error) {
    console.error('getCommonHotelInfo 오류:', error);
    return {
      name: '오류 발생',
      address: '정보를 가져올 수 없습니다.',
      description: '오류가 발생하여 호텔 정보를 표시할 수 없습니다.',
      imageUrl: ''
    };
  }
}

/**
 * 테이블에 가격 행을 추가하는 함수
 * @param {string} tableId - 행을 추가할 테이블 ID
 * @param {Object} data - 행 데이터
 */
export function addRateRow(tableId, data = {}) {
  try {
    // 클라이언트에서만 실행
    if (typeof document === 'undefined') return;
    
    const table = document.getElementById(tableId);
    if (!table) {
      return;
    }
    
    const tbody = table.querySelector('tbody') || table;
    const row = document.createElement('tr');
    
    // 행 데이터 추가
    row.innerHTML = `
      <td>${data.type || '기본'}</td>
      <td>${data.weekday || '-'}</td>
      <td>${data.weekend || '-'}</td>
      <td>${data.peak || '-'}</td>
    `;
    
    tbody.appendChild(row);
  } catch (error) {
    console.error('addRateRow 오류:', error);
  }
} 