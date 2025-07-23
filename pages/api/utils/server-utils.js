import fs from 'fs';
import { promises as fsPromises } from 'fs'; // fs.promises 추가
import path from 'path';
import sharp from 'sharp';
import { NextResponse } from 'next/server';

// 로그 파일 설정
const LOG_CONFIG = {
  MAX_LOG_FILES: 50,
  LOG_DIR: path.join(process.cwd(), 'logs'),
  ERROR_LOG_FILE: 'error.log',
  INFO_LOG_FILE: 'info.log',
  DEBUG_LOG_FILE: 'debug.log',
  MAX_LOG_SIZE: 10 * 1024 * 1024, // 10MB
};

// 로그 파일 관리 함수 (비동기)
export async function manageLogFiles() {
  try {
    if (!fs.existsSync(LOG_CONFIG.LOG_DIR)) {
      await fsPromises.mkdir(LOG_CONFIG.LOG_DIR, { recursive: true });
      return;
    }

    const logFiles = [LOG_CONFIG.ERROR_LOG_FILE, LOG_CONFIG.INFO_LOG_FILE, LOG_CONFIG.DEBUG_LOG_FILE];
    
    await Promise.all(logFiles.map(async (logFile) => {
      const logPath = path.join(LOG_CONFIG.LOG_DIR, logFile);
      
      try {
        const stats = await fsPromises.stat(logPath);
        
        if (stats.size > LOG_CONFIG.MAX_LOG_SIZE) {
          const timestamp = new Date().toISOString().replace(/:/g, '-');
          const backupPath = path.join(LOG_CONFIG.LOG_DIR, `${logFile}.${timestamp}`);
          await fsPromises.rename(logPath, backupPath);
          
          await cleanupOldLogs(LOG_CONFIG.LOG_DIR, logFile);
        }
      } catch (err) {
        if (err.code !== 'ENOENT') { // 파일이 없는 경우는 무시
          console.error(`Error managing log file ${logFile}:`, err);
        }
      }
    }));
  } catch (error) {
    console.error('Failed to manage log files:', error);
  }
}

// 오래된 로그 파일 정리 함수 (비동기)
async function cleanupOldLogs(logDir, baseFileName) {
  try {
    const allFiles = await fsPromises.readdir(logDir);
    const logBackupFiles = allFiles.filter(file => file.startsWith(baseFileName + '.'));

    const filesWithStats = await Promise.all(
      logBackupFiles.map(async (file) => {
        const filePath = path.join(logDir, file);
        try {
          const stats = await fsPromises.stat(filePath);
          return {
            name: file,
            path: filePath,
            time: stats.mtime.getTime()
          };
        } catch (err) {
          if (err.code !== 'ENOENT') console.error(`Failed to stat file ${filePath}:`, err);
          return null;
        }
      })
    );

    const sortedFiles = filesWithStats
      .filter(Boolean) // stat 실패한 파일 제외
      .sort((a, b) => b.time - a.time); // 최신 파일 순으로 정렬

    if (sortedFiles.length > LOG_CONFIG.MAX_LOG_FILES) {
      const filesToDelete = sortedFiles.slice(LOG_CONFIG.MAX_LOG_FILES);
      await Promise.all(filesToDelete.map(async (file) => {
        try {
          await fsPromises.unlink(file.path);
          console.log(`Deleted old log file: ${file.name}`);
        } catch (err) {
          if (err.code !== 'ENOENT') console.error(`Failed to delete log file ${file.name}:`, err);
        }
      }));
    }
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
  }
}

// 로그를 파일에 저장하는 함수 (비동기 처리)
async function saveLogToFile(logEntry, logFile) {
  try {
    const logPath = path.join(LOG_CONFIG.LOG_DIR, logFile);
    
    // 비동기로 디렉토리 확인 및 생성
    if (!fs.existsSync(LOG_CONFIG.LOG_DIR)) { // 초기 확인은 동기 유지 가능
      await fsPromises.mkdir(LOG_CONFIG.LOG_DIR, { recursive: true });
    }
    
    // 비동기로 파일에 로그 추가
    await fsPromises.appendFile(logPath, JSON.stringify(logEntry) + '\n');
    
    // 로그 파일 관리는 fire-and-forget으로 호출 (성능 영향 최소화)
    manageLogFiles().catch(console.error);

  } catch (error) {
    console.error('Failed to write log to file:', error);
  }
}

// 이미지 처리 함수
export async function processImage(imageBuffer, options = {}) {
  const {
    width = 800,
    quality = 80,
    format = 'webp'
  } = options;

  try {
    const processedImage = await sharp(imageBuffer)
      .resize(width, null, { fit: 'inside' })
      .toFormat(format, { quality });

    return processedImage;
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}

// 이미지 주요 특징 분석 함수 (색상, 밝기, 흰화면 여부 등)
export async function analyzeImageFeatures(imageBuffer) {
  try {
    const image = sharp(imageBuffer);
    const { width, height } = await image.metadata();
    const { data } = await image.raw().toBuffer({ resolveWithObject: true });

    // RGB 평균값 계산
    let rSum = 0, gSum = 0, bSum = 0;
    for (let i = 0; i < data.length; i += 3) {
      rSum += data[i];
      gSum += data[i + 1];
      bSum += data[i + 2];
    }
    const pixelCount = data.length / 3;
    const avgR = Math.round(rSum / pixelCount);
    const avgG = Math.round(gSum / pixelCount);
    const avgB = Math.round(bSum / pixelCount);
    const avgHex = `#${avgR.toString(16).padStart(2, '0')}${avgG.toString(16).padStart(2, '0')}${avgB.toString(16).padStart(2, '0')}`;
    const avgBrightness = Math.round((avgR + avgG + avgB) / 3);

    // 흰화면 여부(밝기 245 이상, RGB 편차 10 이하)
    const isWhiteScreen = avgBrightness > 245 &&
      Math.abs(avgR - avgG) < 10 && Math.abs(avgG - avgB) < 10 && Math.abs(avgR - avgB) < 10;

    return {
      width,
      height,
      avgColor: avgHex,
      avgBrightness,
      isWhiteScreen,
      pixelCount
    };
  } catch (error) {
    console.error('analyzeImageFeatures error:', error);
    throw error;
  }
}

// 파일 저장 함수
export function saveFile(content, fileName, directory) {
  const filePath = path.join(process.cwd(), directory, fileName);
  const dirPath = path.dirname(filePath);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  fs.writeFileSync(filePath, content);
  return filePath;
}

// 에러 로깅
export function logError(error, context = {}) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    error: error.message,
    stack: error.stack,
    ...context
  };

  // 로그 파일에 저장
  saveLogToFile(logEntry, LOG_CONFIG.ERROR_LOG_FILE);

  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  const logFile = path.join(logDir, 'error.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
}

// 캐시 관리
export function manageCache(directory, maxAge = 24 * 60 * 60 * 1000) {
  const cacheDir = path.join(process.cwd(), directory);
  if (!fs.existsSync(cacheDir)) return;

  const files = fs.readdirSync(cacheDir);
  const now = Date.now();

  files.forEach(file => {
    const filePath = path.join(cacheDir, file);
    const stats = fs.statSync(filePath);
    
    if (now - stats.mtimeMs > maxAge) {
      fs.unlinkSync(filePath);
    }
  });
}

/**
 * 서버 사이드 유틸리티 함수들
 * API 라우트에서 공통으로 사용되는 기능들
 */

// 환경 변수 상태 확인
export const ENV_STATUS = {
  DATABASE_URL: !!process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DEBUG_MODE: process.env.DEBUG_MODE === 'true'
};

// 로깅 유틸리티 (비동기 로깅 호출)
export const logger = {
  info: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'INFO',
      timestamp,
      message,
      data
    };
    
    if (ENV_STATUS.DEBUG_MODE) {
      console.log(`[INFO] ${timestamp} - ${message}`, data || '');
      saveLogToFile(logEntry, LOG_CONFIG.INFO_LOG_FILE).catch(console.error);
    }
  },
  warn: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'WARN',
      timestamp,
      message,
      data
    };
    
    console.warn(`[WARN] ${timestamp} - ${message}`, data || '');
    saveLogToFile(logEntry, LOG_CONFIG.INFO_LOG_FILE).catch(console.error);
  },
  error: (message, error = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'ERROR',
      timestamp,
      message,
      error: error ? {
        message: error.message,
        stack: error.stack
      } : null
    };
    
    console.error(`[ERROR] ${timestamp} - ${message}`, error || '');
    saveLogToFile(logEntry, LOG_CONFIG.ERROR_LOG_FILE).catch(console.error);
  },
  debug: (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      level: 'DEBUG',
      timestamp,
      message,
      data
    };
    
    if (ENV_STATUS.DEBUG_MODE) {
      console.debug(`[DEBUG] ${timestamp} - ${message}`, data || '');
      saveLogToFile(logEntry, LOG_CONFIG.DEBUG_LOG_FILE).catch(console.error);
    }
  }
};

// 응답 래퍼 함수들
export const responses = {
  success: (data, message = 'Success') => {
    return NextResponse.json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  },

  error: (message = 'Internal Server Error', statusCode = 500, details = null) => {
    logger.error(message, details);
    
    return NextResponse.json({
      success: false,
      error: message,
      details: ENV_STATUS.DEBUG_MODE ? details : null,
      timestamp: new Date().toISOString()
    }, { status: statusCode });
  },

  notFound: (resource = 'Resource') => {
    return NextResponse.json({
      success: false,
      error: `${resource} not found`,
      timestamp: new Date().toISOString()
    }, { status: 404 });
  },

  badRequest: (message = 'Bad Request', details = null) => {
    return NextResponse.json({
      success: false,
      error: message,
      details: details,
      timestamp: new Date().toISOString()
    }, { status: 400 });
  },

  unauthorized: (message = 'Unauthorized') => {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 401 });
  },

  methodNotAllowed: (allowedMethods = []) => {
    const response = NextResponse.json({
      success: false,
      error: 'Method Not Allowed',
      allowedMethods,
      timestamp: new Date().toISOString()
    }, { status: 405 });

    if (allowedMethods.length > 0) {
      response.headers.set('Allow', allowedMethods.join(', '));
    }

    return response;
  }
};

// 요청 검증 유틸리티
export const validation = {
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isPositiveNumber: (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  },

  isNonEmptyString: (value) => {
    return typeof value === 'string' && value.trim().length > 0;
  },

  sanitizeHtml: (html) => {
    if (!html) return '';
    
    // 기본 정리 (실제 운영에서는 DOMPurify 같은 라이브러리 사용 권장)
    const cleaned = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/on\w+='[^']*'/gi, '');
    
    return cleaned;
  }
};

// 오류 처리 래퍼
export const asyncHandler = (fn) => {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      logger.error('API Handler Error', {
        message: error.message,
        stack: error.stack,
        url: request.url,
        method: request.method
      });

      // 데이터베이스 연결 오류
      if (error.message?.includes('database') || error.code === 'P1001') {
        return responses.error(
          'Database connection error. Please check your DATABASE_URL configuration.',
          503,
          ENV_STATUS.DEBUG_MODE ? error.message : null
        );
      }

      // Prisma 오류
      if (error.code?.startsWith('P')) {
        return responses.error(
          'Database operation failed',
          500,
          ENV_STATUS.DEBUG_MODE ? error.message : null
        );
      }

      // 일반 오류
      return responses.error(
        error.message || 'Internal Server Error',
        500,
        ENV_STATUS.DEBUG_MODE ? error.stack : null
      );
    }
  };
};

// 요청 메서드 검증
export const methodGuard = (allowedMethods) => {
  return (request) => {
    if (!allowedMethods.includes(request.method)) {
      throw new MethodNotAllowedError(allowedMethods);
    }
  };
};

// 커스텀 에러 클래스들
export class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

export class NotFoundError extends Error {
  constructor(resource = 'Resource') {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class MethodNotAllowedError extends Error {
  constructor(allowedMethods = []) {
    super('Method Not Allowed');
    this.name = 'MethodNotAllowedError';
    this.allowedMethods = allowedMethods;
    this.statusCode = 405;
  }
}

export class DatabaseError extends Error {
  constructor(message = 'Database operation failed') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 503;
  }
}

// 환경 상태 확인 API
export const getEnvironmentStatus = () => {
  return {
    status: 'ok',
    environment: ENV_STATUS.NODE_ENV,
    database: ENV_STATUS.DATABASE_URL ? 'configured' : 'not_configured',
    debug: ENV_STATUS.DEBUG_MODE,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: {
      node: process.version,
      platform: process.platform,
      arch: process.arch
    }
  };
};

// 요청 로깅 미들웨어
export const requestLogger = (request) => {
  if (ENV_STATUS.DEBUG_MODE) {
    logger.debug('API Request', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    });
  }
};

// CORS 헤더 설정
export const setCorsHeaders = (response) => {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
};

// 성능 측정 유틸리티
export const performanceTimer = {
  start: (label) => {
    if (ENV_STATUS.DEBUG_MODE) {
      console.time(label);
    }
    return Date.now();
  },

  end: (label, startTime) => {
    const duration = Date.now() - startTime;
    if (ENV_STATUS.DEBUG_MODE) {
      console.timeEnd(label);
      logger.debug(`Performance: ${label}`, { duration: `${duration}ms` });
    }
    return duration;
  }
};

/**
 * 퍼포먼스 측정 유틸리티
 * @param {string} label - 측정 레이블
 * @param {number} startTime - `performance.now()`로 기록된 시작 시간
 */
export const measurePerformance = (label, startTime) => {
  const endTime = performance.now();
  console.log(`${label} took ${(endTime - startTime).toFixed(2)} ms`);
};

const serverUtils = {
  ENV_STATUS,
  logger,
  responses,
  validation,
  asyncHandler,
  methodGuard,
  getEnvironmentStatus,
  requestLogger,
  setCorsHeaders,
  performanceTimer,
  ValidationError,
  NotFoundError,
  MethodNotAllowedError,
  DatabaseError
};

// 기본 내보내기
export default serverUtils; 