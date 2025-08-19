'use client'

import { useEffect } from 'react';
import { loadSessionData } from '@/services/sessionService';

/**
 * 세션 데이터를 로드하고 결과를 부모 컴포넌트로 전달하는 클라이언트 컴포넌트
 * @param {object} props
 * @param {function} props.onLoad - 데이터 로드 완료 시 호출될 콜백 함수
 */
const SessionLoader = ({ onLoad }) => {
  useEffect(() => {
    const data = loadSessionData();
    if (onLoad) {
      onLoad(data);
    }
  }, [onLoad]); // onLoad 함수가 변경될 때만 effect 재실행 (일반적으로는 불필요)

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};

export default SessionLoader; 