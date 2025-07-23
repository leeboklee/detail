'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * 최적화된 자동 저장 기능을 제공하는 커스텀 훅
 * @param {Object} data - 저장할 데이터
 * @param {string} storageKey - localStorage 키
 * @param {number} delay - 저장 지연 시간 (ms)
 * @param {Function} onSave - 저장 완료 콜백
 */
export default function useAutoSave(data, storageKey, delay = 800, onSave) {
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(null);
  const isMountedRef = useRef(true);
  const pendingSaveRef = useRef(false);

  // 데이터 직렬화를 메모이제이션 - 더 효율적인 비교
  const serializedData = useMemo(() => {
    if (!data || typeof data === 'undefined') return null;
    
    try {
      // 복잡한 객체의 경우 키만 비교하여 성능 향상
      if (typeof data === 'object') {
        const keys = Object.keys(data);
        if (keys.length > 50) {
          // 큰 객체의 경우 해시 기반 비교
          return JSON.stringify(Object.keys(data).sort() + JSON.stringify(data).length);
        }
      }
      return JSON.stringify(data);
    } catch (error) {
      console.error('데이터 직렬화 실패:', error);
      return null;
    }
  }, [data]);

  const saveData = useCallback(async () => {
    if (!isMountedRef.current || !serializedData || !storageKey || pendingSaveRef.current) {
      return;
    }

    // 중복 저장 방지
    if (lastSavedRef.current === serializedData) {
      return;
    }

    pendingSaveRef.current = true;

    try {
      // 비동기로 저장하여 UI 블로킹 방지
      await new Promise(resolve => {
        requestIdleCallback(() => {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
            lastSavedRef.current = serializedData;
            resolve();
          } catch (error) {
            console.error('localStorage 저장 실패:', error);
            resolve();
          }
        }, { timeout: 1000 });
      });
      
      if (onSave && typeof onSave === 'function') {
        onSave(data);
      }
    } catch (error) {
      console.error('자동 저장 실패:', error);
    } finally {
      pendingSaveRef.current = false;
    }
  }, [serializedData, storageKey, onSave, data]);

  useEffect(() => {
    if (!serializedData || !storageKey) return;

    // 기존 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새로운 타이머 설정 - 더 긴 지연시간으로 성능 향상
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        saveData();
      }
    }, delay);

    // 컴포넌트 언마운트 시 타이머 클리어
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [serializedData, storageKey, delay, saveData]);

  // 컴포넌트 언마운트 감지
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  // 즉시 저장 함수 반환
  const saveImmediately = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    saveData();
  }, [saveData]);

  return { saveImmediately };
}