'use client'

// import logger from '@/utils/logger';

// 세션 스토리지 키 정의
const SESSION_KEY = 'hotel_booking_session';

/**
 * 세션 데이터를 저장하는 함수
 * @param {Object} data 저장할 세션 데이터
 * @returns {Promise<Object>} 저장 결과
 */
export async function saveSessionData(data) {
  // logger.log(`[sessionService] 세션 데이터 저장 시작, 데이터 키: ${Object.keys(data).join(', ')}`);
  
  try {
    // 데이터 검증 완화 - HTML이 있으면 무조건 저장
    if (!data || typeof data !== 'object') {
      // logger.warn('[sessionService] 저장 스킵: 데이터 없음');
      return { success: false, error: '데이터 없음' };
    }
    
    // 저장 진행 - HTML 데이터가 있거나 다른 유효한 데이터가 있으면 저장
    // logger.log('[sessionService] 저장 진행: 객체 데이터 저장');
    
    // logger.log('[sessionService] 저장 진행: 키 수', Object.keys(data).length);
    // 서버에 미리보기 HTML만 저장
    const payload = { htmlPreviewData: data.htmlPreviewData };
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('hotelDetailData', JSON.stringify(payload));
      const now = new Date().toISOString();
      window.sessionStorage.setItem('hotelDetailLastSaved', now);
      // logger.log('[sessionService] 세션 스토리지에 미리보기 HTML만 저장됨, 최근 저장 시각:', now);
    }
    const result = await saveToServer(payload);
    // 팝업 대신 조용히 로그만 기록
    // logger.log('[sessionService] 미리보기 HTML 저장 완료');
    return result;
  } catch (error) {
    // logger.error('[sessionService] 세션 데이터 저장 오류:', error);
    if (typeof window !== 'undefined') {
      // 팝업 대신 이벤트만 발생
      const sessionEvent = new CustomEvent('session-saved', { 
        detail: { success: false, error: error.message } 
      });
      document.dispatchEvent(sessionEvent);
    }
    return { success: false, error: error.message };
  }
}

/**
 * 서버에 데이터 저장하는 함수
 * @param {Object} data 저장할 데이터
 * @returns {Promise<Object>} 저장 결과
 */
async function saveToServer(data) {
  // logger.log('[sessionService] 서버 저장 시작');
  
  try {
    // 데이터 사전 검증 및 변환
    const cleanedData = {};
    
    // 데이터 정제 (유효한 값만 저장)
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && value !== null) {
        cleanedData[key] = value;
      }
    }
    
    // 순환 참조 제거 (JSON.stringify 오류 방지)
    const safeData = JSON.parse(JSON.stringify(cleanedData));
    
    // API 호출하여 서버에 저장
    const response = await fetch('/api/saveSession', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(safeData)
    });
    
    // 응답 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API 응답 오류: ${response.status} ${response.statusText} - ${errorData.message || ''}`);
    }
    
    const result = await response.json();
    // logger.log('[sessionService] 서버에 세션 데이터 저장 성공:', result);
    
    // 이벤트 발생 - 세션 저장 성공
    if (typeof window !== 'undefined') {
      const sessionEvent = new CustomEvent('session-saved', { 
        detail: { success: true, message: 'Session data saved successfully.' } 
      });
      document.dispatchEvent(sessionEvent);
    }
    
    return { success: true, data: result };
  } catch (error) {
    // logger.error('[sessionService] 서버 저장 오류:', error);
    
    // 오류 이벤트 발생 (서버 저장 실패)
    if (typeof window !== 'undefined') {
      const sessionEvent = new CustomEvent('session-error', { 
        detail: { 
          success: false, 
          error: error.message,
          isFatal: false // 치명적 오류는 아님 (로컬 저장은 성공)
        }
      });
      document.dispatchEvent(sessionEvent);
    }
    
    // 서버 저장 실패는 경고만 표시하고 성공으로 처리 (로컬 저장이 되었으므로)
    return { 
      success: true,  // 클라이언트 관점에서는 성공으로 처리
      warning: '로컬에 저장되었으나 서버 저장에 실패했습니다. 필요시 데이터를 백업하세요.' 
    };
  }
}

/**
 * 세션 스토리지에서 데이터를 불러옵니다.
 * @returns {object | null} 불러온 데이터 객체 또는 null
 */
export const loadSessionData = () => {
  if (typeof window !== 'undefined') {
    try {
      const serializedData = sessionStorage.getItem(SESSION_KEY);
      if (serializedData === null) {
        // logger.log("[sessionService] 세션 데이터가 없습니다.");
        return null;
      }
      
      const parsedData = JSON.parse(serializedData);
      // logger.log("[sessionService] 세션 데이터 로드 성공. 키:", Object.keys(parsedData).join(', '));
      return parsedData;
    } catch (error) {
      // logger.error("[sessionService] 세션 데이터 로드 오류:", error);
      
      if (typeof window !== 'undefined') {
        // 오류 이벤트 발생
        const sessionEvent = new CustomEvent('session-error', { 
          detail: { 
            success: false, 
            error: error.message,
            phase: 'load' 
          }
        });
        document.dispatchEvent(sessionEvent);
      }
      
      // 저장된 데이터가 유효하지 않은 JSON 형식일 경우 초기화 또는 오류 처리
      try {
        sessionStorage.removeItem(SESSION_KEY); // 손상된 데이터 제거
        // logger.log("[sessionService] 손상된 데이터 제거됨");
      } catch (e) {
        // logger.error("[sessionService] 손상된 데이터 제거 실패:", e);
      }
      return null;
    }
  } else {
    // logger.warn("[sessionService] 서버 측에서는 세션 스토리지를 사용할 수 없습니다.");
    return null;
  }
}; 