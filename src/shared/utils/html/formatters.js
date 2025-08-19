'use client';

/**
 * HTML 생성을 위한 포맷팅 유틸리티
 * htmlGenerator.js에서 분리된 포맷팅 관련 함수들
 */

import { formatPrice } from '../../hooks/common/utils';

/**
 * 텍스트에 있는 줄바꿈을 <br> 태그로 변환
 */
export function formatWithLineBreaks(text) {
  try {
    if (!text) return '';
    
    // 문자열이 아닌 경우 문자열로 변환 시도
    if (typeof text !== 'string') {
      console.warn('[formatWithLineBreaks] 문자열이 아닌 값 변환 시도:', text);
      text = String(text);
    }
    
    // 줄바꿈을 <br> 태그로 변환
    return text.replace(/\n/g, '<br>');
  } catch (error) {
    console.error('[formatWithLineBreaks] 오류:', error);
    return text || '';
  }
}

/**
 * 날짜를 지정된 형식에 맞게 포맷팅
 */
// formatDate는 이제 app/hooks/common/utils.js에 있으므로 여기서는 제거

/**
 * 호텔 별점을 별 아이콘으로 변환
 */
export function hotelRating(rating) {
  try {
    console.log('[hotelRating] 입력값:', rating);
    const ratingNum = parseFloat(rating) || 0;
    const fullStars = Math.floor(ratingNum);
    const hasHalfStar = ratingNum % 1 >= 0.5;
    
    let html = '<div class="hotel-rating">';
    
    // 꽉 찬 별
    for (let i = 0; i < fullStars; i++) {
      html += '<span class="star-full">★</span>';
    }
    
    // 반 별
    if (hasHalfStar) {
      html += '<span class="star-half">★</span>';
    }
    
    // 빈 별
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      html += '<span class="star-empty">☆</span>';
    }
    
    html += '</div>';
    return html;
  } catch (error) {
    console.error('[hotelRating] 오류:', error);
    return '';
  }
}

// 가격 포맷터 재내보내기
export { formatPrice };

/**
 * 안전한 문자열 변환 함수 (HTML 이스케이프)
 * @param {any} str - 안전하게 변환할 값
 * @returns {string} - HTML 이스케이프된 문자열
 */
export function safeString(str) {
  try {
    if (str === null || str === undefined) {
      return '';
    }
    
    // 숫자나 다른 타입을 문자열로 변환
    if (typeof str !== 'string') {
      str = String(str);
    }
    
    // HTML 특수 문자 이스케이프 처리
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  } catch (error) {
    console.error('safeString 오류:', error);
    return '';
  }
}

/**
 * HTML 코드를 안전하게 처리하는 함수
 * @param {string} html - 처리할 HTML 코드
 * @returns {string} - 안전하게 처리된 HTML 코드
 */
export function safeHtml(html) {
  try {
    if (!html) return '';
    
    // HTML이 문자열이 아닌 경우 변환
    if (typeof html !== 'string') {
      html = String(html);
    }
    
    // 위험한 스크립트 태그 및 속성 제거
    return html
      // 스크립트 태그 제거
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // onclick, onload 등의 이벤트 핸들러 속성 제거
      .replace(/\son\w+\s*=\s*["']?[^"']*["']?/gi, '')
      // javascript: URL 제거
      .replace(/href\s*=\s*["']?\s*javascript:[^"']*["']?/gi, 'href="#"')
      // data: URL에서 스크립트 제거
      .replace(/data:text\/html[^"']*["']?/gi, 'data:text/plain')
      // 프레임 제거
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  } catch (error) {
    console.error('safeHtml 오류:', error);
    return '';
  }
}

/**
 * HTML 미리보기 생성
 */
export function getHtmlPreview(html, length = 100) {
  try {
    if (!html) return '(빈 HTML)';
    
    // HTML이 문자열이 아닌 경우 변환 시도
    if (typeof html !== 'string') {
      console.warn('[getHtmlPreview] HTML이 문자열이 아님:', typeof html);
      html = String(html);
    }
    
    // 길이 제한
    const preview = html.length > length 
      ? html.substring(0, length) + '...' 
      : html;
    
    // HTML 태그 이스케이프 처리
    return preview
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  } catch (error) {
    console.error('[getHtmlPreview] 오류:', error);
    return '(미리보기 생성 오류)';
  }
} 