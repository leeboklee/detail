import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // 초기 상태 설정
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // localStorage에서 값 가져오기
      const item = window.localStorage.getItem(key);
      // 값이 있으면 JSON 파싱, 없으면 초기값 사용
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('localStorage에서 값을 가져오는 중 오류 발생:', error);
      return initialValue;
    }
  });
  
  // 값이 변경될 때마다 localStorage 업데이트
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error('localStorage에 값을 저장하는 중 오류 발생:', error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setStoredValue];
};

export default useLocalStorage; 