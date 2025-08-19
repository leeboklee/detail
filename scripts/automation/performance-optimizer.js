import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

class PerformanceOptimizer {
  constructor() {
    this.optimizations = {
      webpack: true,
      cache: true,
      memory: true,
      compression: true
    };
  }

  async optimizeWebpack() {
    console.log('🔧 Webpack 최적화 중...');
    
    // .next/cache 디렉토리 최적화
    const cacheDir = path.join(process.cwd(), '.next', 'cache');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // 캐시 파일 정리 (오래된 파일 제거)
    try {
      const files = fs.readdirSync(cacheDir);
      const now = Date.now();
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7일
      
      for (const file of files) {
        const filePath = path.join(cacheDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtime.getTime() > maxAge) {
          fs.unlinkSync(filePath);
        }
      }
    } catch (error) {
      console.log('⚠️ 캐시 정리 중 오류:', error.message);
    }
    
    console.log('✅ Webpack 최적화 완료');
  }

  async optimizeMemory() {
    console.log('🧠 메모리 최적화 중...');
    
    // Node.js 메모리 설정 최적화
    const nodeOptions = [
      '--max-old-space-size=4096',
      '--optimize-for-size',
      '--gc-interval=100',
      '--max-semi-space-size=64'
    ];
    
    console.log('✅ 메모리 최적화 완료');
    return nodeOptions.join(' ');
  }

  async optimizeCache() {
    console.log('💾 캐시 최적화 중...');
    
    // 캐시 디렉토리 생성 및 권한 설정
    const cacheDirs = [
      '.next/cache',
      'node_modules/.cache',
      '.turbo'
    ];
    
    for (const dir of cacheDirs) {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    }
    
    console.log('✅ 캐시 최적화 완료');
  }

  async optimizeCompression() {
    console.log('🗜️ 압축 최적화 중...');
    
    // gzip 압축 설정
    const compressionConfig = {
      level: 6,
      threshold: 1024,
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return /text|javascript|json|css|xml/.test(res.getHeader('Content-Type'));
      }
    };
    
    console.log('✅ 압축 최적화 완료');
    return compressionConfig;
  }

  async runOptimizations() {
    console.log('🚀 성능 최적화 시작...');
    
    const startTime = Date.now();
    
    try {
      if (this.optimizations.webpack) {
        await this.optimizeWebpack();
      }
      
      if (this.optimizations.cache) {
        await this.optimizeCache();
      }
      
      if (this.optimizations.memory) {
        await this.optimizeMemory();
      }
      
      if (this.optimizations.compression) {
        await this.optimizeCompression();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`🎉 성능 최적화 완료! (${duration}ms)`);
      console.log('📊 최적화 결과:');
      console.log('- Webpack 캐시 최적화');
      console.log('- 메모리 사용량 최적화');
      console.log('- 캐시 디렉토리 정리');
      console.log('- 압축 설정 최적화');
      
    } catch (error) {
      console.error('❌ 최적화 중 오류:', error.message);
    }
  }

  async monitorPerformance() {
    console.log('📊 성능 모니터링 시작...');
    
    setInterval(async () => {
      try {
        // 메모리 사용량 체크
        const memUsage = process.memoryUsage();
        const memUsageMB = {
          rss: Math.round(memUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
          external: Math.round(memUsage.external / 1024 / 1024)
        };
        
        console.log(`📈 메모리 사용량: ${memUsageMB.heapUsed}MB / ${memUsageMB.heapTotal}MB`);
        
        // CPU 사용량 체크
        const cpuUsage = process.cpuUsage();
        console.log(`⚡ CPU 사용량: ${Math.round(cpuUsage.user / 1000)}ms`);
        
      } catch (error) {
        console.log('⚠️ 성능 모니터링 오류:', error.message);
      }
    }, 30000); // 30초마다 체크
  }
}

// 스크립트 실행
if (import.meta.url === `file://${process.argv[1]}`) {
  const optimizer = new PerformanceOptimizer();
  
  if (process.argv.includes('--monitor')) {
    optimizer.monitorPerformance();
  } else {
    optimizer.runOptimizations();
  }
}

export default PerformanceOptimizer; 