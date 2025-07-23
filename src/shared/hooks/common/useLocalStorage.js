'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * 로컬 스토리지를 관리하는 커스텀 훅
 * @param {string} key - 로컬 스토리지 키
 * @param {any} initialValue - 기본값
 * @returns {[any, function]} - [저장된 값, 값 업데이트 함수]
 */
export default function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [key, storedValue]
  );

  useEffect(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  }, [key]);

  return [storedValue, setValue];
} 