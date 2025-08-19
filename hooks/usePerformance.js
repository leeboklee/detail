import { useEffect, useRef, useCallback, useState, useMemo } from 'react';

// 성능 모니터링 훅
export const usePerformance = (componentName = 'Component') => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0
  });

  // 렌더링 성능 측정
  useEffect(() => {
    const now = performance.now();
    const renderTime = now - lastRenderTime.current;
    
    renderCount.current += 1;
    lastRenderTime.current = now;

    setPerformanceMetrics(prev => ({
      renderCount: renderCount.current,
      averageRenderTime: (prev.averageRenderTime * (renderCount.current - 1) + renderTime) / renderCount.current,
      lastRenderTime: renderTime
    }));

    // 성능 경고 로깅
    if (renderTime > 16.67) { // 60fps 기준
      console.warn(`🚨 ${componentName} 렌더링이 느림: ${renderTime.toFixed(2)}ms`);
    }

    // 개발 모드에서만 성능 로깅
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 ${componentName} 렌더링 #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }
  });

  return performanceMetrics;
};

// 메모리 사용량 모니터링 훅
export const useMemoryMonitor = () => {
  const [memoryInfo, setMemoryInfo] = useState(null);

  const updateMemoryInfo = useCallback(() => {
    if ('memory' in performance) {
      const memory = performance.memory;
      setMemoryInfo({
        usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2), // MB
        totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2), // MB
        jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2), // MB
        usagePercent: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(1)
      });
    }
  }, []);

  useEffect(() => {
    updateMemoryInfo();
    
    const interval = setInterval(updateMemoryInfo, 5000); // 5초마다 업데이트
    
    return () => clearInterval(interval);
  }, [updateMemoryInfo]);

  return memoryInfo;
};

// 디바운스 훅 (입력 최적화)
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 쓰로틀 훅 (이벤트 최적화)
export const useThrottle = (callback, delay = 100) => {
  const lastCall = useRef(0);
  const lastCallTimer = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();

    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    } else {
      // 마지막 호출을 취소하고 새로운 타이머 설정
      if (lastCallTimer.current) {
        clearTimeout(lastCallTimer.current);
      }
      
      lastCallTimer.current = setTimeout(() => {
        lastCall.current = Date.now();
        callback(...args);
      }, delay - (now - lastCall.current));
    }
  }, [callback, delay]);

  return throttledCallback;
};

// 가상화 최적화 훅
export const useVirtualization = (itemCount, itemHeight, containerHeight, overscan = 5) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    return {
      startIndex,
      endIndex,
      visibleCount: endIndex - startIndex + 1
    };
  }, [scrollTop, itemCount, itemHeight, containerHeight, overscan]);

  const totalHeight = itemCount * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    scrollTop,
    visibleRange,
    totalHeight,
    offsetY,
    handleScroll
  };
};

// 이미지 지연 로딩 훅
export const useLazyImage = (src, placeholder = '/placeholder.jpg') => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setError(null);
    };

    img.onerror = () => {
      setError('이미지 로드 실패');
      setIsLoading(false);
    };

    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { imageSrc, isLoading, error };
};

// 네트워크 상태 모니터링 훅
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connection, setConnection] = useState(null);

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOnline(navigator.onLine);
      
      if ('connection' in navigator) {
        setConnection(navigator.connection);
      }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);

    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', updateNetworkStatus);
    }

    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      
      if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return { isOnline, connection };
};

// 웹 워커 훅 (무거운 계산을 백그라운드로)
export const useWebWorker = (workerScript) => {
  const workerRef = useRef(null);
  const [result, setResult] = useState(null);
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof Window !== 'undefined' && 'Worker' in window) {
      workerRef.current = new Worker(workerScript);
      
      workerRef.current.onmessage = (e) => {
        setResult(e.data);
        setIsWorking(false);
        setError(null);
      };

      workerRef.current.onerror = (e) => {
        setError(e.error);
        setIsWorking(false);
      };
    }

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [workerScript]);

  const postMessage = useCallback((data) => {
    if (workerRef.current) {
      setIsWorking(true);
      setError(null);
      workerRef.current.postMessage(data);
    }
  }, []);

  return { result, isWorking, error, postMessage };
};

// 성능 최적화 유틸리티
export const performanceUtils = {
  // 렌더링 최적화를 위한 배치 업데이트
  batchUpdate: (updates) => {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        updates.forEach(update => update());
        resolve();
      });
    });
  },

  // 무거운 계산을 백그라운드로
  defer: (fn, delay = 0) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result = fn();
        resolve(result);
      }, delay);
    });
  },

  // 메모리 정리
  cleanup: () => {
    if ('gc' in window) {
      window.gc();
    }
  },

  // 성능 마크
  mark: (name) => {
    if ('performance' in window) {
      performance.mark(name);
    }
  },

  // 성능 측정
  measure: (name, startMark, endMark) => {
    if ('performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        return measure.duration;
      } catch (error) {
        console.warn('성능 측정 실패:', error);
        return 0;
      }
    }
    return 0;
  }
};

export default usePerformance;
