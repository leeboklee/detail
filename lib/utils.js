// URL 유효성 검사
export function validateUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 에러 메시지 포맷팅
export function formatError(error) {
  return {
    message: error.message || '알 수 없는 오류가 발생했습니다.',
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  };
}

// 날짜 포맷팅
export function formatDate(date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
} 