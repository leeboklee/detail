import React from 'react';
import { useTransition, useDeferredValue, startTransition, useCallback, useMemo, useState, useEffect } from 'react';

/**
 * React 18 Concurrent Features를 활용한 성능 최적화 훅
 * useTransition과 useDeferredValue를 조합하여 사용자 경험 향상
 */
export function useConcurrentFeatures() {
  const [isPending, startTransition] = useTransition();

  // 우선순위가 낮은 업데이트를 처리하는 함수
  const deferredUpdate = useCallback((updateFn) => {
    startTransition(() => {
      updateFn();
    });
  }, []);

  // 즉시 업데이트가 필요한 경우
  const immediateUpdate = useCallback((updateFn) => {
    updateFn();
  }, []);

  return {
    isPending,
    deferredUpdate,
    immediateUpdate
  };
}

/**
 * 검색/필터링에 특화된 Concurrent Features 훅
 */
export function useSearchWithConcurrency(searchTerm, data, searchFunction) {
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [isPending, startTransition] = useTransition();

  // 지연된 검색 결과 계산
  const deferredResults = useMemo(() => {
    if (!deferredSearchTerm || !data) return data;
    return searchFunction(data, deferredSearchTerm);
  }, [deferredSearchTerm, data, searchFunction]);

  // 검색 업데이트 함수
  const updateSearch = useCallback((newTerm, setSearchTerm) => {
    // 즉시 입력 값 업데이트 (사용자 피드백)
    setSearchTerm(newTerm);
    
    // 검색 로직은 지연 처리 (성능 최적화)
    startTransition(() => {
      // 실제 검색은 deferredSearchTerm이 업데이트되면서 자동으로 처리됨
    });
  }, []);

  return {
    deferredResults,
    isPending,
    updateSearch,
    isStale: searchTerm !== deferredSearchTerm
  };
}

/**
 * 대용량 리스트 렌더링에 특화된 Concurrent Features 훅
 */
export function useLargeListConcurrency(items, pageSize = 50) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isPending, startTransition] = useTransition();
  
  const deferredCurrentPage = useDeferredValue(currentPage);
  
  // 현재 페이지의 아이템들
  const currentItems = useMemo(() => {
    const startIndex = deferredCurrentPage * pageSize;
    const endIndex = startIndex + pageSize;
    return items.slice(startIndex, endIndex);
  }, [items, deferredCurrentPage, pageSize]);

  // 페이지 변경 함수
  const changePage = useCallback((newPage) => {
    startTransition(() => {
      setCurrentPage(newPage);
    });
  }, []);

  // 다음/이전 페이지
  const nextPage = useCallback(() => {
    const maxPage = Math.ceil(items.length / pageSize) - 1;
    if (currentPage < maxPage) {
      changePage(currentPage + 1);
    }
  }, [currentPage, items.length, pageSize, changePage]);

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      changePage(currentPage - 1);
    }
  }, [currentPage, changePage]);

  return {
    currentItems,
    currentPage,
    isPending,
    changePage,
    nextPage,
    prevPage,
    totalPages: Math.ceil(items.length / pageSize),
    isStale: currentPage !== deferredCurrentPage
  };
}

/**
 * 폼 입력에 특화된 Concurrent Features 훅
 * 입력 응답성을 높이면서 유효성 검사는 지연 처리
 */
export function useFormWithConcurrency(initialValues, validationFunction) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isPending, startTransition] = useTransition();
  
  const deferredValues = useDeferredValue(values);

  // 지연된 유효성 검사
  const deferredErrors = useMemo(() => {
    if (validationFunction) {
      return validationFunction(deferredValues);
    }
    return {};
  }, [deferredValues, validationFunction]);

  // 입력 값 업데이트
  const updateValue = useCallback((field, value) => {
    // 즉시 입력 값 업데이트 (사용자 피드백)
    setValues(prev => ({ ...prev, [field]: value }));
    
    // 유효성 검사는 지연 처리
    startTransition(() => {
      setErrors(deferredErrors);
    });
  }, [deferredErrors]);

  // 전체 폼 업데이트
  const updateForm = useCallback((newValues) => {
    setValues(newValues);
    
    startTransition(() => {
      setErrors(deferredErrors);
    });
  }, [deferredErrors]);

  return {
    values,
    errors: deferredErrors,
    isPending,
    updateValue,
    updateForm,
    isStale: values !== deferredValues
  };
}

/**
 * 자동저장에 특화된 Concurrent Features 훅
 */
export function useAutoSaveWithConcurrency(data, saveFunction, delay = 2000) {
  const [lastSaved, setLastSaved] = useState(null);
  const [isPending, startTransition] = useTransition();
  const deferredData = useDeferredValue(data);

  // 자동저장 로직
  useEffect(() => {
    if (!deferredData) return;

    const timeoutId = setTimeout(() => {
      startTransition(() => {
        saveFunction(deferredData).then(() => {
          setLastSaved(Date.now());
        });
      });
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [deferredData, saveFunction, delay]);

  return {
    isPending,
    lastSaved,
    isStale: data !== deferredData
  };
}

export default {
  useConcurrentFeatures,
  useSearchWithConcurrency,
  useLargeListConcurrency,
  useFormWithConcurrency,
  useAutoSaveWithConcurrency
}; 