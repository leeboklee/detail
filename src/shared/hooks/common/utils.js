import React from 'react';
'use client';

/**
 * 천 단위 구분 기호(쉼표)가 포함된 가격 형식으로 변환
 * @param {number|string} price - 변환할 가격
 * @returns {string} - 포맷팅된 가격 문자열
 */
export const formatPrice = (price) => {
  if (!price) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * 문자열에서 숫자만 추출
 * @param {string} value - 추출할 대상 문자열
 * @returns {string} - 숫자만 포함된 문자열
 */
export const extractNumbers = (value) => {
  return value.replace(/[^0-9]/g, '');
};

/**
 * 텍스트를 클립보드에 복사
 * @param {string} text - 복사할 텍스트
 * @returns {Promise<boolean>} - 성공 여부
 */
export const copyToClipboard = async (text) => {
  try {
    // 먼저 navigator.clipboard API 시도 (HTTPS 환경에서만 작동)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // fallback: document.execCommand 사용
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-999999px';
    textarea.style.top = '-999999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      return true;
    }
    
    throw new Error('클립보드 복사 실패');
  } catch (error) {
    console.warn('클립보드 복사 오류:', error);
    return false;
  }
};

/**
 * HTML 특수문자 이스케이프 처리
 * @param {string} html - HTML 문자열
 * @returns {string} - 이스케이프된 문자열
 */
export const escapeHtml = (html) => {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * 객체 깊은 복사
 * @param {any} obj - 복사할 객체
 * @returns {any} - 복사된 객체
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// 기본 이미지 URL 상수 정의
export const DEFAULT_IMAGE_URL = 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923_960_720.jpg';

/**
 * 이미지 URL 처리 함수
 */
export function getValidImageUrl(url) {
  try {
    // 빈 URL 또는 유효하지 않은 형식인 경우 기본 이미지 반환
    if (!url || typeof url !== 'string' || url.trim() === '') {
      return DEFAULT_IMAGE_URL;
    }
    
    // URL 트림 처리
    url = url.trim();
    
    // 로컬 URL 검사 (localhost나 127.0.0.1이 포함된 경우만 변경)
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      return DEFAULT_IMAGE_URL;
    }
    
    // 이미 기본 이미지인 경우 그대로 반환
    if (url.includes('NoImage') || url.includes('Error')) {
      return DEFAULT_IMAGE_URL;
    }
    
    // URL 유효성 검사 - 기본적인 형식 확인
    const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    if (!urlPattern.test(url) && !url.startsWith('data:')) {
      return DEFAULT_IMAGE_URL;
    }
    
    // 특수문자나 공백이 있는 URL은 인코딩
    if (url.includes(' ') || /[^\x00-\x7F]/.test(url)) {
      return encodeURI(url);
    }
    
    // 기본 URL 검증 처리
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
      // 상대 경로로 보이는 URL의 경우 http/https 프로토콜 추가
      if (url.startsWith('/')) {
        return `https:${url}`;
      }
      // 프로토콜이 없는 URL의 경우 https:// 추가
      return `https://${url}`;
    }
    
    return url;
  } catch (error) {
    return DEFAULT_IMAGE_URL;
  }
}

/**
 * 깊은 비교로 객체 동등성 확인
 * React.memo 등에서 불필요한 리렌더링 방지를 위해 사용
 */
export const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;
  
  if (
    typeof obj1 !== 'object' ||
    typeof obj2 !== 'object' ||
    obj1 === null ||
    obj2 === null
  ) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

/**
 * 디바운스 함수
 * 짧은 시간에 여러 번 발생하는 이벤트(입력 등)를 제어하기 위해 사용
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
};

/**
 * 쓰로틀 함수
 * 일정 시간 간격으로 함수 실행을 제한하여 성능 개선
 */
export const throttle = (func, limit = 300) => {
  let inThrottle = false;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * 메모이제이션 함수
 * 동일한 입력에 대한 계산 결과를 캐싱하여 성능 개선
 */
export const memoize = (func) => {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
};

/**
 * 코드 중복 제거를 위한 고차 함수 (HOF)
 */
export const withErrorHandling = (func, errorHandler) => {
  return function(...args) {
    try {
      return func.apply(this, args);
    } catch (error) {
      return errorHandler(error);
    }
  };
};

/**
 * 배치 처리 함수
 * 여러 상태 업데이트를 일괄 처리하여 리렌더링 최소화
 */
export const batchUpdates = (updates) => {
  // React의 안정화된 버전에서는 자동으로 배치 처리됨
  // React 18 미만 버전에서는 ReactDOM.unstable_batchedUpdates 사용 가능
  updates.forEach(update => update());
};

/**
 * 날짜를 지정된 형식에 맞게 포맷팅
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  try {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day);
  } catch (error) {
    console.error('formatDate 오류:', error);
    return '';
  }
} 