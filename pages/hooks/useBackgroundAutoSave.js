import { useEffect, useRef, useCallback } from 'react';

/**
 * Web Worker를 활용한 백그라운드 자동저장 훅
 * 메인 스레드를 차단하지 않고 백그라운드에서 자동저장 처리
 */
export default function useBackgroundAutoSave() {
  const workerRef = useRef(null);
  const isWorkerReady = useRef(false);
  const messageQueue = useRef([]);

  // Web Worker 초기화
  useEffect(() => {
    try {
      // Web Worker 생성
      workerRef.current = new Worker('/workers/autoSaveWorker.js');
      
      // Worker 메시지 리스너
      workerRef.current.onmessage = function(e) {
        const { type, payload } = e.data;
        
        switch (type) {
          case 'WORKER_READY':
            isWorkerReady.current = true;
            console.log('✅ AutoSave Worker 준비됨');
            
            // 대기 중인 메시지 모두 전송
            messageQueue.current.forEach(message => {
              workerRef.current.postMessage(message);
            });
            messageQueue.current = [];
            break;
            
          case 'SAVE_TO_STORAGE':
            try {
              localStorage.setItem(payload.key, payload.value);
            } catch (error) {
              console.warn('로컬스토리지 저장 실패:', error);
            }
            break;
            
          case 'SAVE_COMPLETED':
            if (payload.immediate) {
              console.log(`💾 즉시 저장 완료: ${payload.key}`);
            } else {
              console.log(`💾 백그라운드 저장 완료: ${payload.key}`);
            }
            
            // 커스텀 이벤트 발생 (선택적)
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('autoSaveCompleted', {
                detail: payload
              }));
            }
            break;
            
          case 'SAVE_ERROR':
            console.error(`❌ 저장 실패 (${payload.key}):`, payload.error);
            break;
            
          case 'QUEUE_STATUS':
            console.log('📊 저장 큐 상태:', payload);
            break;
            
          default:
            console.warn('알 수 없는 Worker 메시지:', type, payload);
        }
      };
      
      // Worker 오류 처리
      workerRef.current.onerror = function(error) {
        console.error('❌ AutoSave Worker 오류:', error);
        isWorkerReady.current = false;
      };
      
    } catch (error) {
      console.error('❌ Web Worker 초기화 실패:', error);
      console.warn('🔄 fallback: 일반 setTimeout 사용');
    }
    
    // 컴포넌트 언마운트 시 Worker 정리
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        isWorkerReady.current = false;
      }
    };
  }, []);

  // Worker에 메시지 전송 (안전하게)
  const sendToWorker = useCallback((message) => {
    if (workerRef.current && isWorkerReady.current) {
      workerRef.current.postMessage(message);
    } else {
      // Worker가 준비되지 않았으면 큐에 저장
      messageQueue.current.push(message);
    }
  }, []);

  // 백그라운드 저장 예약
  const scheduleSave = useCallback((key, value, delay = 2000) => {
    if (!workerRef.current) {
      // Worker가 없으면 fallback으로 직접 저장
      setTimeout(() => {
        try {
          localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
          console.log(`💾 fallback 저장 완료: ${key}`);
        } catch (error) {
          console.warn('fallback 저장 실패:', error);
        }
      }, delay);
      return;
    }
    
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    sendToWorker({
      type: 'ADD_TO_QUEUE',
      payload: {
        key,
        value: serializedValue,
        delay
      }
    });
  }, [sendToWorker]);

  // 즉시 저장
  const saveImmediately = useCallback((key, value) => {
    if (!workerRef.current) {
      // Worker가 없으면 fallback으로 직접 저장
      try {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        console.log(`💾 fallback 즉시 저장 완료: ${key}`);
      } catch (error) {
        console.warn('fallback 즉시 저장 실패:', error);
      }
      return;
    }
    
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    sendToWorker({
      type: 'SAVE_IMMEDIATELY',
      payload: {
        key,
        value: serializedValue
      }
    });
  }, [sendToWorker]);

  // 특정 키의 저장 취소
  const cancelSave = useCallback((key) => {
    if (!workerRef.current) return;
    
    sendToWorker({
      type: 'CANCEL_SAVE',
      payload: { key }
    });
  }, [sendToWorker]);

  // 모든 저장 취소
  const cancelAllSaves = useCallback(() => {
    if (!workerRef.current) return;
    
    sendToWorker({
      type: 'CANCEL_ALL',
      payload: {}
    });
  }, [sendToWorker]);

  // 큐 상태 조회
  const getQueueStatus = useCallback(() => {
    if (!workerRef.current) return null;
    
    sendToWorker({
      type: 'GET_QUEUE_STATUS',
      payload: {}
    });
  }, [sendToWorker]);

  return {
    scheduleSave,
    saveImmediately,
    cancelSave,
    cancelAllSaves,
    getQueueStatus,
    isWorkerReady: isWorkerReady.current
  };
} 