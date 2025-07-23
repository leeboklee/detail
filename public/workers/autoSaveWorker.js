// Web Worker for background auto-save operations
// 메인 스레드를 차단하지 않고 백그라운드에서 자동저장 처리

let saveQueue = [];
let isProcessing = false;
let saveTimer = null;

// 저장 큐에 작업 추가
function addToSaveQueue(data) {
  const { key, value, delay = 2000 } = data;
  
  // 동일한 key의 기존 작업이 있으면 제거 (중복 방지)
  saveQueue = saveQueue.filter(item => item.key !== key);
  
  // 새 작업 추가
  saveQueue.push({
    key,
    value,
    timestamp: Date.now(),
    delay
  });
  
  processSaveQueue();
}

// 저장 큐 처리
function processSaveQueue() {
  if (isProcessing || saveQueue.length === 0) return;
  
  isProcessing = true;
  
  // 가장 오래된 작업부터 처리
  const oldestItem = saveQueue.shift();
  const currentTime = Date.now();
  const timeSinceAdded = currentTime - oldestItem.timestamp;
  
  // 지정된 지연시간이 지났으면 즉시 저장, 아니면 남은 시간만큼 대기
  const remainingDelay = Math.max(0, oldestItem.delay - timeSinceAdded);
  
  saveTimer = setTimeout(() => {
    try {
      // localStorage에 저장 (Web Worker에서 직접 접근 불가하므로 메인 스레드로 전송)
      self.postMessage({
        type: 'SAVE_TO_STORAGE',
        payload: {
          key: oldestItem.key,
          value: oldestItem.value
        }
      });
      
      // 저장 완료 알림
      self.postMessage({
        type: 'SAVE_COMPLETED',
        payload: {
          key: oldestItem.key,
          timestamp: Date.now()
        }
      });
      
    } catch (error) {
      // 저장 실패 알림
      self.postMessage({
        type: 'SAVE_ERROR',
        payload: {
          key: oldestItem.key,
          error: error.message
        }
      });
    }
    
    isProcessing = false;
    
    // 큐에 남은 작업이 있으면 계속 처리
    if (saveQueue.length > 0) {
      processSaveQueue();
    }
    
  }, remainingDelay);
}

// 특정 키의 저장 작업 취소
function cancelSave(key) {
  saveQueue = saveQueue.filter(item => item.key !== key);
  
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    isProcessing = false;
    
    // 큐에 남은 작업이 있으면 다시 시작
    if (saveQueue.length > 0) {
      processSaveQueue();
    }
  }
}

// 모든 저장 작업 취소
function cancelAllSaves() {
  saveQueue = [];
  
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
    isProcessing = false;
  }
}

// 즉시 저장 (우선순위 높음)
function saveImmediately(data) {
  const { key, value } = data;
  
  // 기존 저장 작업 취소
  cancelSave(key);
  
  try {
    self.postMessage({
      type: 'SAVE_TO_STORAGE',
      payload: { key, value }
    });
    
    self.postMessage({
      type: 'SAVE_COMPLETED',
      payload: {
        key,
        timestamp: Date.now(),
        immediate: true
      }
    });
    
  } catch (error) {
    self.postMessage({
      type: 'SAVE_ERROR',
      payload: {
        key,
        error: error.message
      }
    });
  }
}

// self.postMessage, self.addEventListener 등 사용 전 아래와 같이 체크
if (typeof self !== 'undefined') {
  // 메인 스레드로부터 메시지 수신
  self.addEventListener('message', function(e) {
    const { type, payload } = e.data;
    
    switch (type) {
      case 'ADD_TO_QUEUE':
        addToSaveQueue(payload);
        break;
      
      case 'SAVE_IMMEDIATELY':
        saveImmediately(payload);
        break;
      
      case 'CANCEL_SAVE':
        cancelSave(payload.key);
        break;
      
      case 'CANCEL_ALL':
        cancelAllSaves();
        break;
      
      case 'GET_QUEUE_STATUS':
        self.postMessage({
          type: 'QUEUE_STATUS',
          payload: {
            queueLength: saveQueue.length,
            isProcessing,
            nextSave: saveQueue.length > 0 ? saveQueue[0] : null
          }
        });
        break;
      
      default:
        console.warn('AutoSaveWorker: 알 수 없는 메시지 타입:', type);
    }
  });
  // Worker 초기화 완료 알림
  self.postMessage({
    type: 'WORKER_READY',
    payload: {
      timestamp: Date.now()
    }
  });
} 