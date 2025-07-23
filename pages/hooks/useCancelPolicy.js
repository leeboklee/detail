'use client';

import { useState, useEffect } from 'react';

/**
 * 취소 정책 관리를 위한 커스텀 훅
 * @param {Object} initialData 초기 취소 정책 데이터
 * @returns {Object} 취소 정책 관련 상태와 메서드
 */
export default function useCancelPolicy(initialData = null) {
  // 취소 정책 상태
  const [cancelInfo, setCancelInfo] = useState({
    beforeCheckIn: [],
    afterCheckIn: [],
    additionalPolicy: ''
  });
  
  // 취소 정책 설명과 참고사항 상태
  const [cancelDescription, setCancelDescription] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');

  // 초기 데이터가 제공되면 상태 초기화
  useEffect(() => {
    if (initialData) {
      setCancelInfo({
        beforeCheckIn: Array.isArray(initialData.beforeCheckIn) ? initialData.beforeCheckIn : [],
        afterCheckIn: Array.isArray(initialData.afterCheckIn) ? initialData.afterCheckIn : [],
        additionalPolicy: initialData.additionalPolicy || ''
      });
      
      if (initialData.cancelDescription) {
        setCancelDescription(initialData.cancelDescription);
      }
      
      if (initialData.cancelNotes) {
        setCancelNotes(initialData.cancelNotes);
      }
    }
  }, [initialData]);

  /**
   * 취소 규정 업데이트 핸들러
   * @param {string} type 규정 타입 (beforeCheckIn, afterCheckIn)
   * @param {number} index 규정 인덱스
   * @param {string} field 변경할 필드 (days, rate)
   * @param {string} value 새 값
   */
  const updateCancelRule = (type, index, field, value) => {
    setCancelInfo(prev => {
      // 해당 타입의 배열이 없으면 생성
      if (!Array.isArray(prev[type])) {
        return {
          ...prev,
          [type]: []
        };
      }
      
      // 기존 규정 배열 복사
      const rules = [...prev[type]];
      
      // 해당 인덱스의 규정이 없으면 새로 생성
      if (!rules[index]) {
        rules[index] = { days: '', rate: '' };
      }
      
      // 필드 값 업데이트
      rules[index] = {
        ...rules[index],
        [field]: value
      };
      
      return {
        ...prev,
        [type]: rules
      };
    });
  };

  /**
   * 취소 규정 추가 핸들러
   * @param {string} type 규정 타입 (beforeCheckIn, afterCheckIn)
   */
  const addCancelRule = (type) => {
    setCancelInfo(prev => {
      const rules = Array.isArray(prev[type]) ? [...prev[type]] : [];
      rules.push({ days: '', rate: '' });
      
      return {
        ...prev,
        [type]: rules
      };
    });
  };

  /**
   * 취소 규정 삭제 핸들러
   * @param {string} type 규정 타입 (beforeCheckIn, afterCheckIn)
   * @param {number} index 삭제할 규정 인덱스
   */
  const removeCancelRule = (type, index) => {
    setCancelInfo(prev => {
      if (!Array.isArray(prev[type])) {
        return prev;
      }
      
      return {
        ...prev,
        [type]: prev[type].filter((_, i) => i !== index)
      };
    });
  };

  /**
   * 추가 정책 업데이트 핸들러
   * @param {string} value 새 추가 정책 값
   */
  const updateAdditionalPolicy = (value) => {
    setCancelInfo(prev => ({
      ...prev,
      additionalPolicy: value
    }));
  };

  /**
   * 취소 정책 완전 초기화
   * @param {Object} data 새로운 취소 정책 데이터
   */
  const resetCancelInfo = (data) => {
    setCancelInfo({
      beforeCheckIn: Array.isArray(data?.beforeCheckIn) ? data.beforeCheckIn : [],
      afterCheckIn: Array.isArray(data?.afterCheckIn) ? data.afterCheckIn : [],
      additionalPolicy: data?.additionalPolicy || ''
    });
    
    if (data?.cancelDescription) {
      setCancelDescription(data.cancelDescription);
    }
    
    if (data?.cancelNotes) {
      setCancelNotes(data.cancelNotes);
    }
  };

  // 훅에서 반환할 값들
  return {
    cancelInfo,
    setCancelInfo,
    cancelDescription,
    setCancelDescription,
    cancelNotes,
    setCancelNotes,
    updateCancelRule,
    addCancelRule,
    removeCancelRule,
    updateAdditionalPolicy,
    resetCancelInfo
  };
} 