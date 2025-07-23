/**
 * 통합 디버그 유틸리티
 * 모든 디버깅 기능을 하나로 통합하여 관리
 */

// 디버그 레벨 정의
export const DEBUG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// 설정 객체
const DEBUG_CONFIG = {
  enabled: typeof window !== 'undefined' && (
    process.env.NODE_ENV === 'development' || 
    localStorage.getItem('debug_enabled') === 'true'
  ),
  level: DEBUG_LEVELS.INFO,
  maxLogs: 1000,
  maxErrors: 100,
  autoSave: true,
  saveInterval: 5000,
  enableConsoleOverride: process.env.NODE_ENV === 'development'
};

class DebugManager {
  constructor() {
    this.logs = [];
    this.errors = [];
    this.performance = [];
    this.network = [];
    this.subscribers = new Set();
    
    this.logCounter = 0;
    this.saveTimeout = null;
    this.initialized = false;

    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  init() {
    if (this.initialized) return;
    
    this.loadFromStorage();
    this.setupErrorHandling();
    this.setupPerformanceMonitoring();
    this.setupNetworkMonitoring();
    
    if (DEBUG_CONFIG.enableConsoleOverride) {
      this.setupConsoleOverride();
    }

    this.initialized = true;
    this.log('DebugManager initialized', DEBUG_LEVELS.INFO);
  }

  // 로그 추가
  log(message, level = DEBUG_LEVELS.INFO, data = null) {
    if (!DEBUG_CONFIG.enabled || level > DEBUG_CONFIG.level) return;

    const logEntry = {
      id: ++this.logCounter,
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack: level <= DEBUG_LEVELS.WARN ? new Error().stack : null
    };

    this.logs.unshift(logEntry);
    if (this.logs.length > DEBUG_CONFIG.maxLogs) {
      this.logs = this.logs.slice(0, DEBUG_CONFIG.maxLogs);
    }

    this.notifySubscribers('log', logEntry);
    this.scheduleAutoSave();

    return logEntry;
  }

  // 에러 추가
  addError(error, context = {}) {
    if (!DEBUG_CONFIG.enabled) return;

    const errorEntry = {
      id: ++this.logCounter,
      timestamp: new Date().toISOString(),
      message: error.message || String(error),
      stack: error.stack || 'No stack trace',
      context,
      type: error.name || 'Error'
    };

    this.errors.unshift(errorEntry);
    if (this.errors.length > DEBUG_CONFIG.maxErrors) {
      this.errors = this.errors.slice(0, DEBUG_CONFIG.maxErrors);
    }

    this.notifySubscribers('error', errorEntry);
    this.scheduleAutoSave();

    return errorEntry;
  }

  // 성능 측정
  startPerformanceMeasure(name) {
    if (!DEBUG_CONFIG.enabled) return null;

    const measureId = `${name}_${Date.now()}`;
    performance.mark(`${measureId}_start`);
    
    return {
      id: measureId,
      end: () => {
        performance.mark(`${measureId}_end`);
        performance.measure(measureId, `${measureId}_start`, `${measureId}_end`);
        
        const measure = performance.getEntriesByName(measureId)[0];
        const perfEntry = {
          id: ++this.logCounter,
          timestamp: new Date().toISOString(),
          name,
          duration: measure.duration,
          type: 'performance'
        };

        this.performance.unshift(perfEntry);
        this.notifySubscribers('performance', perfEntry);
        
        // 정리
        performance.clearMarks(`${measureId}_start`);
        performance.clearMarks(`${measureId}_end`);
        performance.clearMeasures(measureId);

        return perfEntry;
      }
    };
  }

  // 전역 에러 핸들링 설정
  setupErrorHandling() {
    if (typeof window === 'undefined') return;

    const originalOnError = window.onerror;
    const originalOnUnhandledRejection = window.onunhandledrejection;

    window.onerror = (message, source, lineno, colno, error) => {
      this.addError(error || new Error(message), {
        source, lineno, colno, type: 'global'
      });

      if (typeof originalOnError === 'function') {
        return originalOnError.apply(this, arguments);
      }
      return false;
    };

    window.onunhandledrejection = (event) => {
      const error = event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason));

      this.addError(error, { type: 'unhandledRejection' });

      if (typeof originalOnUnhandledRejection === 'function') {
        return originalOnUnhandledRejection.apply(this, arguments);
      }
    };
  }

  // 콘솔 오버라이드 설정
  setupConsoleOverride() {
    if (typeof console === 'undefined') return;

    const originalMethods = {
      error: console.error,
      warn: console.warn,
      log: console.log,
      info: console.info
    };

    console.error = (...args) => {
      originalMethods.error.apply(console, args);
      const message = this.formatConsoleArgs(args);
      if (!message.includes('[Debug]')) {
        this.addError(new Error(message), { type: 'console' });
      }
    };

    console.warn = (...args) => {
      originalMethods.warn.apply(console, args);
      const message = this.formatConsoleArgs(args);
      if (!message.includes('[Debug]')) {
        this.log(message, DEBUG_LEVELS.WARN);
      }
    };

    // 원본 메서드 복원 함수
    this.restoreConsole = () => {
      Object.assign(console, originalMethods);
    };
  }

  // 성능 모니터링 설정
  setupPerformanceMonitoring() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation' || entry.entryType === 'measure') {
            this.performance.unshift({
              id: ++this.logCounter,
              timestamp: new Date().toISOString(),
              name: entry.name,
              duration: entry.duration,
              type: entry.entryType
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation', 'measure'] });
    } catch (e) {
      this.log('Performance monitoring setup failed', DEBUG_LEVELS.WARN, e);
    }
  }

  // 네트워크 모니터링 설정
  setupNetworkMonitoring() {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];

      try {
        const response = await originalFetch.apply(window, args);
        const duration = performance.now() - startTime;

        this.network.unshift({
          id: ++this.logCounter,
          timestamp: new Date().toISOString(),
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration,
          success: response.ok
        });

        return response;
      } catch (error) {
        const duration = performance.now() - startTime;
        
        this.network.unshift({
          id: ++this.logCounter,
          timestamp: new Date().toISOString(),
          url,
          method: args[1]?.method || 'GET',
          status: 0,
          duration,
          success: false,
          error: error.message
        });

        throw error;
      }
    };
  }

  // 콘솔 인자 포맷팅
  formatConsoleArgs(args) {
    return args.map(arg => 
      typeof arg === 'object' ? 
        (arg instanceof Error ? 
          `${arg.name}: ${arg.message}` : 
          JSON.stringify(arg)) : 
        String(arg)
    ).join(' ');
  }

  // 구독자 관리
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers(type, data) {
    this.subscribers.forEach(callback => {
      try {
        callback(type, data);
      } catch (e) {
        console.error('[Debug] Subscriber callback error:', e);
      }
    });
  }

  // 자동 저장 스케줄링
  scheduleAutoSave() {
    if (!DEBUG_CONFIG.autoSave) return;

    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveToStorage();
    }, DEBUG_CONFIG.saveInterval);
  }

  // 로컬 스토리지에 저장
  saveToStorage() {
    if (typeof localStorage === 'undefined') return;

    try {
      const data = {
        logs: this.logs.slice(0, 100), // 최근 100개만 저장
        errors: this.errors.slice(0, 50), // 최근 50개만 저장
        performance: this.performance.slice(0, 30), // 최근 30개만 저장
        network: this.network.slice(0, 50), // 최근 50개만 저장
        timestamp: new Date().toISOString(),
        config: DEBUG_CONFIG
      };

      localStorage.setItem('debug_data', JSON.stringify(data));
    } catch (e) {
      console.warn('[Debug] Save to storage failed:', e);
    }
  }

  // 로컬 스토리지에서 로드
  loadFromStorage() {
    if (typeof localStorage === 'undefined') return;

    try {
      const stored = localStorage.getItem('debug_data');
      if (stored) {
        const data = JSON.parse(stored);
        this.logs = data.logs || [];
        this.errors = data.errors || [];
        this.performance = data.performance || [];
        this.network = data.network || [];
        
        // logCounter 복원
        this.logCounter = Math.max(
          ...this.logs.map(l => l.id || 0),
          ...this.errors.map(e => e.id || 0),
          0
        );
      }
    } catch (e) {
      console.warn('[Debug] Load from storage failed:', e);
    }
  }

  // 데이터 내보내기
  exportData() {
    return {
      logs: this.logs,
      errors: this.errors,
      performance: this.performance,
      network: this.network,
      config: DEBUG_CONFIG,
      exportedAt: new Date().toISOString()
    };
  }

  // 데이터 지우기
  clear() {
    this.logs = [];
    this.errors = [];
    this.performance = [];
    this.network = [];
    this.logCounter = 0;
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('debug_data');
    }
  }

  // 설정 업데이트
  updateConfig(newConfig) {
    Object.assign(DEBUG_CONFIG, newConfig);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debug_config', JSON.stringify(DEBUG_CONFIG));
    }
  }

  // 상태 정보
  getStats() {
    return {
      logs: this.logs.length,
      errors: this.errors.length,
      performance: this.performance.length,
      network: this.network.length,
      config: DEBUG_CONFIG,
      enabled: DEBUG_CONFIG.enabled
    };
  }

  // 정리
  destroy() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    if (this.restoreConsole) {
      this.restoreConsole();
    }

    this.subscribers.clear();
    this.saveToStorage();
  }
}

// 싱글톤 인스턴스
const debugManager = new DebugManager();

// 편의 함수들
export const debug = {
  log: (message, data) => debugManager.log(message, DEBUG_LEVELS.DEBUG, data),
  info: (message, data) => debugManager.log(message, DEBUG_LEVELS.INFO, data),
  warn: (message, data) => debugManager.log(message, DEBUG_LEVELS.WARN, data),
  error: (error, context) => debugManager.addError(error, context),
  measure: (name) => debugManager.startPerformanceMeasure(name),
  subscribe: (callback) => debugManager.subscribe(callback),
  clear: () => debugManager.clear(),
  export: () => debugManager.exportData(),
  stats: () => debugManager.getStats(),
  config: (newConfig) => debugManager.updateConfig(newConfig)
};

export default debugManager; 