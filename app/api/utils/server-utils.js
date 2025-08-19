// 서버 유틸리티 함수들
export const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
  },
  debug: (message, ...args) => {
    console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args);
  }
};

export const logError = (error, context = '') => {
  logger.error(`${context} ${error.message}`, error);
};

export const measurePerformance = (fn, name = 'Function') => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      logger.info(`${name} 실행 시간: ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      logger.error(`${name} 실행 실패 (${(end - start).toFixed(2)}ms):`, error);
      throw error;
    }
  };
}; 