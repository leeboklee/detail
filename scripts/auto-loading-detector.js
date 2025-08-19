#!/usr/bin/env node

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

class LoadingDetector {
  constructor() {
    this.browser = null
    this.page = null
    this.logDir = path.join(process.cwd(), 'logs', 'performance')
    this.loadingTimes = []
  }

  async start() {
    console.log('🔍 로딩 시간 모니터링 시작...')
    
    try {
      // 로그 디렉토리 생성
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true })
      }
      
      // 브라우저 시작
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
      
      this.page = await this.browser.newPage()
      
      // 성능 메트릭 수집
      this.page.on('metrics', (data) => {
        console.log('📊 성능 메트릭:', {
          Timestamp: data.metrics.Timestamp,
          Documents: data.metrics.Documents,
          Frames: data.metrics.Frames,
          JSEventListeners: data.metrics.JSEventListeners,
          Nodes: data.metrics.Nodes,
          LayoutCount: data.metrics.LayoutCount,
          RecalcStyleCount: data.metrics.RecalcStyleCount,
          LayoutDuration: data.metrics.LayoutDuration,
          RecalcStyleDuration: data.metrics.RecalcStyleDuration,
          ScriptDuration: data.metrics.ScriptDuration,
          TaskDuration: data.metrics.TaskDuration,
          JSHeapUsedSize: data.metrics.JSHeapUsedSize,
          JSHeapTotalSize: data.metrics.JSHeapTotalSize
        })
      })
      
      console.log('✅ 브라우저 시작 완료')
      
    } catch (error) {
      console.error('❌ 브라우저 시작 실패:', error)
    }
  }

  async measureLoadingTime() {
    try {
      console.log('⏱️ 로딩 시간 측정 시작...')
      
      const startTime = Date.now()
      
      // 페이지 접속 (더 유연한 대기 조건)
      await this.page.goto('http://localhost:3900', {
        waitUntil: 'domcontentloaded',
        timeout: 120000
      })
      
      // 추가 대기 시간
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      const endTime = Date.now()
      const loadingTime = endTime - startTime
      
      this.loadingTimes.push({
        timestamp: new Date().toISOString(),
        loadingTime,
        url: 'http://localhost:3900'
      })
      
      console.log(`⏱️ 로딩 시간: ${loadingTime}ms`)
      
      // 성능 분석
      await this.analyzePerformance()
      
      return loadingTime
      
    } catch (error) {
      console.error('❌ 로딩 시간 측정 실패:', error)
      return null
    }
  }

  async analyzePerformance() {
    try {
      console.log('📊 성능 분석 시작...')
      
      // 페이지 성능 메트릭 수집
      const metrics = await this.page.metrics()
      const performance = await this.page.evaluate(() => {
        const perfData = performance.getEntriesByType('navigation')[0]
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
          domInteractive: perfData.domInteractive,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
        }
      })
      
      const analysis = {
        timestamp: new Date().toISOString(),
        metrics,
        performance,
        loadingTimes: this.loadingTimes
      }
      
      // 로그 저장
      const logFile = path.join(this.logDir, `performance-${Date.now()}.json`)
      fs.writeFileSync(logFile, JSON.stringify(analysis, null, 2))
      
      console.log('📋 성능 분석 결과:')
      console.log('- DOM Content Loaded:', performance.domContentLoaded, 'ms')
      console.log('- Load Complete:', performance.loadComplete, 'ms')
      console.log('- DOM Interactive:', performance.domInteractive, 'ms')
      console.log('- First Paint:', performance.firstPaint, 'ms')
      console.log('- First Contentful Paint:', performance.firstContentfulPaint, 'ms')
      
      // 성능 경고
      if (performance.domContentLoaded > 3000) {
        console.log('⚠️ 경고: DOM Content Loaded가 3초를 초과했습니다')
      }
      
      if (performance.loadComplete > 5000) {
        console.log('⚠️ 경고: 페이지 로드가 5초를 초과했습니다')
      }
      
    } catch (error) {
      console.error('❌ 성능 분석 실패:', error)
    }
  }

  async monitorContinuously(interval = 30000) {
    console.log(`🔄 연속 모니터링 시작 (${interval/1000}초 간격)...`)
    
    while (true) {
      await this.measureLoadingTime()
      await new Promise(resolve => setTimeout(resolve, interval))
    }
  }

  async stop() {
    if (this.browser) {
      await this.browser.close()
      console.log('🛑 브라우저 종료됨')
    }
  }
}

// CLI 실행
async function main() {
  const detector = new LoadingDetector()
  
  try {
    await detector.start()
    
    // 단일 측정 또는 연속 모니터링
    const args = process.argv.slice(2)
    if (args.includes('--continuous')) {
      await detector.monitorContinuously()
    } else {
      await detector.measureLoadingTime()
    }
    
  } catch (error) {
    console.error('❌ 모니터링 실패:', error)
  } finally {
    await detector.stop()
  }
}

if (require.main === module) {
  main()
}

module.exports = LoadingDetector 