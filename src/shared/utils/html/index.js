'use client';

/**
 * HTML 관련 유틸리티 통합 모듈
 */

// 포맷터 함수들 불러오기 및 재내보내기
import {
  formatPrice,
  safeString,
  formatWithLineBreaks,
  safeHtml
} from './formatters';

// 유틸리티 함수들 불러오기 및 재내보내기
import {
  setValue,
  getValue,
  getData,
  addRateRow,
  getCommonHotelInfo
} from './utils';

// 생성기 함수들 불러오기 및 재내보내기
import {
  generateTableContent,
  generateDefaultSection,
  generateHeader,
  generateFooter,
  generateHotelInfoHtml,
  getValidImageUrl,
  DEFAULT_IMAGE_URL
} from './generators';

// 외부에서 사용할 함수들 통합 내보내기
export {
  // 포맷터 함수들
  formatPrice,
  safeString,
  formatWithLineBreaks,
  safeHtml,
  
  // 유틸리티 함수들
  setValue,
  getValue,
  getData,
  addRateRow,
  getCommonHotelInfo,
  
  // 생성기 함수들
  generateTableContent,
  generateDefaultSection,
  generateHeader,
  generateFooter,
  generateHotelInfoHtml,
  getValidImageUrl,
  DEFAULT_IMAGE_URL
};

const htmlUtils = {
  formatters: {
    formatPrice,
    safeString,
    formatWithLineBreaks,
    safeHtml
  },
  utils: {
    setValue,
    getValue,
    getData,
    addRateRow,
    getCommonHotelInfo
  },
  generators: {
    generateTableContent,
    generateDefaultSection,
    generateHeader,
    generateFooter,
    generateHotelInfoHtml,
    getValidImageUrl,
    DEFAULT_IMAGE_URL
  },
};

// 기본 내보내기
export default htmlUtils; 