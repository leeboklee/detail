const { exec } = require('child_process');
const fs = require('fs');

class MemoryMonitor {
  constructor() {
    this.logFile = 'memory-usage.log';
    this.stats = {
      startTime: Date.now(),
      samples: [],
      maxMemory: 0,
      avgMemory: 0
    };
  }

  // 메모리 사용량 측정
  getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      rss: Math.round(usage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      timestamp: Date.now()
    };
  }

  // 가비지 컬렉션 강제 실행
  forceGC() {
    if (global.gc) {
      global.gc();
      console.log('🧹 가비지 컬렉션 실행됨');
    }
  }

  // 메모리 통계 업데이트
  updateStats(memoryUsage) {
    this.stats.samples.push(memoryUsage);
    this.stats.maxMemory = Math.max(this.stats.maxMemory, memoryUsage.heapUsed);
    
    // 평균 계산
    const total = this.stats.samples.reduce((sum, sample) => sum + sample.heapUsed, 0);
    this.stats.avgMemory = Math.round(total / this.stats.samples.length);
    
    // 로그 파일에 기록
    const logEntry = `${new Date().toISOString()} - RSS: ${memoryUsage.rss}MB, Heap: ${memoryUsage.heapUsed}MB/${memoryUsage.heapTotal}MB, External: ${memoryUsage.external}MB\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  // 메모리 사용량 출력
  printMemoryUsage(memoryUsage) {
    const uptime = Math.round((Date.now() - this.stats.startTime) / 1000);
    console.log(`\n📊 메모리 사용량 (${uptime}s 경과):`);
    console.log(`   RSS: ${memoryUsage.rss}MB`);
    console.log(`   Heap Used: ${memoryUsage.heapUsed}MB / ${memoryUsage.heapTotal}MB`);
    console.log(`   External: ${memoryUsage.external}MB`);
    console.log(`   최대 사용량: ${this.stats.maxMemory}MB`);
    console.log(`   평균 사용량: ${this.stats.avgMemory}MB`);
  }

  // 메모리 누수 감지
  detectMemoryLeak() {
    if (this.stats.samples.length < 10) return;
    
    const recent = this.stats.samples.slice(-10);
    const first = recent[0].heapUsed;
    const last = recent[recent.length - 1].heapUsed;
    const increase = last - first;
    
    if (increase > 50) { // 50MB 이상 증가 시 경고
      console.log(`⚠️  메모리 누수 의심: ${increase}MB 증가`);
      this.forceGC();
    }
  }

  // 모니터링 시작
  start(interval = 30000) { // 30초마다 체크
    console.log('🔍 메모리 모니터링 시작...');
    
    setInterval(() => {
      const memoryUsage = this.getMemoryUsage();
      this.updateStats(memoryUsage);
      this.printMemoryUsage(memoryUsage);
      this.detectMemoryLeak();
    }, interval);
  }
}

// 모니터링 시작
const monitor = new MemoryMonitor();
monitor.start();

module.exports = MemoryMonitor; 