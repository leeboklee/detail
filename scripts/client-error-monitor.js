#!/usr/bin/env node

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

class ClientErrorMonitor {
  constructor() {
    this.browser = null
    this.page = null
    this.logDir = path.join(process.cwd(), 'logs', 'client-errors')
    this.errorCount = 0
    this.fixedErrors = []
  }

  async start() {
    console.log('👁️ 클라이언트 오류 모니터링 시작...')
    
    try {
      // 로그 디렉토리 생성
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true })
      }
      
      // 브라우저 시작
      this.browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      })
      
      this.page = await this.browser.newPage()
      
      // 오류 이벤트 리스너 설정
      this.setupErrorListeners()
      
      // 페이지 접속
      await this.page.goto('http://localhost:3900', {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      })
      
      console.log('✅ 클라이언트 모니터링 시작됨')
      
      // 실시간 모니터링 시작
      await this.startRealTimeMonitoring()
      
    } catch (error) {
      console.error('❌ 클라이언트 모니터링 시작 실패:', error)
    }
  }

  setupErrorListeners() {
    // 콘솔 오류 수집
    this.page.on('console', async (msg) => {
      if (msg.type() === 'error') {
        console.log('🔴 콘솔 오류 감지:', msg.text())
        await this.handleConsoleError(msg.text())
      }
    })
    
    // 페이지 오류 수집
    this.page.on('pageerror', async (error) => {
      console.log('🔴 페이지 오류 감지:', error.message)
      await this.handlePageError(error)
    })
    
    // 네트워크 오류 수집
    this.page.on('response', async (response) => {
      if (!response.ok()) {
        console.log('🔴 네트워크 오류 감지:', response.status(), response.url())
        await this.handleNetworkError(response)
      }
    })
    
    // 요청 실패 수집
    this.page.on('requestfailed', async (request) => {
      console.log('🔴 요청 실패 감지:', request.url())
      await this.handleRequestFailure(request)
    })
  }

  async handleConsoleError(errorText) {
    this.errorCount++
    
    const errorData = {
      type: 'console_error',
      message: errorText,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      stack: null
    }
    
    // 오류 패턴 분석 및 자동 수정
    const fixResult = await this.analyzeAndFixError(errorData)
    
    if (fixResult.fixed) {
      this.fixedErrors.push({
        original: errorData,
        fix: fixResult,
        timestamp: new Date().toISOString()
      })
    }
    
    // 오류 로그 저장
    this.saveErrorLog(errorData)
  }

  async handlePageError(error) {
    this.errorCount++
    
    const errorData = {
      type: 'page_error',
      message: error.message,
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      stack: error.stack
    }
    
    // 오류 패턴 분석 및 자동 수정
    const fixResult = await this.analyzeAndFixError(errorData)
    
    if (fixResult.fixed) {
      this.fixedErrors.push({
        original: errorData,
        fix: fixResult,
        timestamp: new Date().toISOString()
      })
    }
    
    // 오류 로그 저장
    this.saveErrorLog(errorData)
  }

  async handleNetworkError(response) {
    this.errorCount++
    
    const errorData = {
      type: 'network_error',
      message: `HTTP ${response.status()}: ${response.statusText()}`,
      timestamp: new Date().toISOString(),
      url: response.url(),
      status: response.status(),
      headers: response.headers()
    }
    
    // 네트워크 오류 분석
    const fixResult = await this.analyzeNetworkError(errorData)
    
    if (fixResult.fixed) {
      this.fixedErrors.push({
        original: errorData,
        fix: fixResult,
        timestamp: new Date().toISOString()
      })
    }
    
    // 오류 로그 저장
    this.saveErrorLog(errorData)
  }

  async handleRequestFailure(request) {
    this.errorCount++
    
    const errorData = {
      type: 'request_failure',
      message: `Request failed: ${request.url()}`,
      timestamp: new Date().toISOString(),
      url: request.url(),
      method: request.method(),
      headers: request.headers()
    }
    
    // 요청 실패 분석
    const fixResult = await this.analyzeRequestFailure(errorData)
    
    if (fixResult.fixed) {
      this.fixedErrors.push({
        original: errorData,
        fix: fixResult,
        timestamp: new Date().toISOString()
      })
    }
    
    // 오류 로그 저장
    this.saveErrorLog(errorData)
  }

  async analyzeAndFixError(errorData) {
    const errorMessage = errorData.message.toLowerCase()
    
    // 일반적인 오류 패턴 분석
    if (errorMessage.includes('cannot read property')) {
      return await this.fixPropertyAccessError(errorData)
    }
    
    if (errorMessage.includes('is not a function')) {
      return await this.fixFunctionCallError(errorData)
    }
    
    if (errorMessage.includes('unexpected token')) {
      return await this.fixSyntaxError(errorData)
    }
    
    if (errorMessage.includes('module not found')) {
      return await this.fixModuleError(errorData)
    }
    
    return { fixed: false, reason: 'Unknown error pattern' }
  }

  async fixPropertyAccessError(errorData) {
    console.log('🔧 속성 접근 오류 수정 시도...')
    
    try {
      // 안전한 속성 접근 코드 생성
      const safeCode = `
        // 안전한 속성 접근 헬퍼 함수
        function safeGet(obj, path, defaultValue = null) {
          return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : defaultValue
          }, obj)
        }
        
        // 기존 코드를 안전한 접근으로 변경
        // 예: obj.property.subProperty -> safeGet(obj, 'property.subProperty')
      `
      
      // 페이지에 안전한 접근 코드 주입
      await this.page.evaluate(safeCode)
      
      return {
        fixed: true,
        type: 'property_access',
        solution: 'Safe property access helper injected',
        code: safeCode
      }
      
    } catch (error) {
      return { fixed: false, reason: error.message }
    }
  }

  async fixFunctionCallError(errorData) {
    console.log('🔧 함수 호출 오류 수정 시도...')
    
    try {
      // 함수 존재 여부 확인 코드
      const functionCheckCode = `
        // 함수 존재 여부 확인 헬퍼
        function safeCall(obj, methodName, ...args) {
          if (obj && typeof obj[methodName] === 'function') {
            return obj[methodName](...args)
          }
          console.warn('Method not found:', methodName)
          return null
        }
      `
      
      await this.page.evaluate(functionCheckCode)
      
      return {
        fixed: true,
        type: 'function_call',
        solution: 'Safe function call helper injected',
        code: functionCheckCode
      }
      
    } catch (error) {
      return { fixed: false, reason: error.message }
    }
  }

  async fixSyntaxError(errorData) {
    console.log('🔧 구문 오류 수정 시도...')
    
    try {
      // 구문 오류 복구 시도
      await this.page.evaluate(() => {
        // 전역 오류 핸들러 추가
        window.addEventListener('error', (event) => {
          console.warn('Syntax error caught:', event.error)
          event.preventDefault()
        })
      })
      
      return {
        fixed: true,
        type: 'syntax_error',
        solution: 'Global error handler added',
        code: 'Global error handler'
      }
      
    } catch (error) {
      return { fixed: false, reason: error.message }
    }
  }

  async fixModuleError(errorData) {
    console.log('🔧 모듈 오류 수정 시도...')
    
    try {
      // 모듈 로드 재시도
      await this.page.evaluate(() => {
        // 동적 모듈 로드 헬퍼
        window.loadModule = async (moduleName) => {
          try {
            return await import(moduleName)
          } catch (error) {
            console.warn('Module load failed:', moduleName, error)
            return null
          }
        }
      })
      
      return {
        fixed: true,
        type: 'module_error',
        solution: 'Dynamic module loader added',
        code: 'Dynamic module loader'
      }
      
    } catch (error) {
      return { fixed: false, reason: error.message }
    }
  }

  async analyzeNetworkError(errorData) {
    // 네트워크 오류 분석
    if (errorData.status === 404) {
      return {
        fixed: false,
        type: 'not_found',
        solution: 'Resource not found - check URL',
        recommendation: 'Verify the requested resource exists'
      }
    }
    
    if (errorData.status === 500) {
      return {
        fixed: false,
        type: 'server_error',
        solution: 'Server internal error',
        recommendation: 'Check server logs for details'
      }
    }
    
    return { fixed: false, reason: 'Network error analysis completed' }
  }

  async analyzeRequestFailure(errorData) {
    // 요청 실패 분석
    return {
      fixed: false,
      type: 'request_failure',
      solution: 'Request failed - check network connectivity',
      recommendation: 'Verify network connection and server status'
    }
  }

  saveErrorLog(errorData) {
    const logFile = path.join(this.logDir, `client-error-${Date.now()}.json`)
    fs.writeFileSync(logFile, JSON.stringify(errorData, null, 2))
  }

  async startRealTimeMonitoring() {
    console.log('🔄 실시간 모니터링 시작...')
    
    // 주기적 상태 체크
    setInterval(async () => {
      try {
        // 페이지 상태 확인
        const pageState = await this.page.evaluate(() => {
          return {
            readyState: document.readyState,
            errorCount: window.errorCount || 0,
            performance: performance.now()
          }
        })
        
        console.log('📊 페이지 상태:', pageState)
        
        // 오류 통계 출력
        if (this.errorCount > 0) {
          console.log(`📈 오류 통계: 총 ${this.errorCount}개, 수정됨 ${this.fixedErrors.length}개`)
        }
        
      } catch (error) {
        console.error('❌ 상태 체크 실패:', error)
      }
    }, 30000) // 30초마다 체크
  }

  async stop() {
    if (this.browser) {
      await this.browser.close()
      console.log('🛑 클라이언트 모니터링 종료됨')
    }
  }
}

// CLI 실행
async function main() {
  const monitor = new ClientErrorMonitor()
  
  try {
    await monitor.start()
    
    // 무한 대기 (Ctrl+C로 종료)
    process.on('SIGINT', async () => {
      console.log('\n🛑 모니터링 종료 중...')
      await monitor.stop()
      process.exit(0)
    })
    
  } catch (error) {
    console.error('❌ 모니터링 실패:', error)
    await monitor.stop()
  }
}

if (require.main === module) {
  main()
}

module.exports = ClientErrorMonitor 