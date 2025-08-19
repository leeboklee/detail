#!/usr/bin/env node

const puppeteer = require('puppeteer')
const fs = require('fs')
const path = require('path')

class ErrorCollectionTester {
  constructor() {
    this.browser = null
    this.page = null
    this.logDir = path.join(process.cwd(), 'logs', 'errors')
  }

  async start() {
    console.log('🧪 실시간 오류 수집 테스트 시작...')
    
    try {
      // 브라우저 시작
      this.browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
      
      this.page = await this.browser.newPage()
      
      // 콘솔 로그 수집
      this.page.on('console', (msg) => {
        console.log('브라우저 콘솔:', msg.text())
      })
      
      // 페이지 오류 수집
      this.page.on('pageerror', (error) => {
        console.log('페이지 오류:', error.message)
      })
      
      // 네트워크 오류 수집
      this.page.on('response', (response) => {
        if (!response.ok()) {
          console.log('네트워크 오류:', response.status(), response.url())
        }
      })
      
      console.log('✅ 브라우저 시작 완료')
      
    } catch (error) {
      console.error('❌ 브라우저 시작 실패:', error)
    }
  }

  async testErrorCollection() {
    try {
      console.log('🌐 페이지 접속 시도...')
      
      // 페이지 접속
      await this.page.goto('http://localhost:3900', {
        waitUntil: 'networkidle2',
        timeout: 30000
      })
      
      console.log('✅ 페이지 접속 성공')
      
      // 오류 발생 시뮬레이션
      await this.simulateErrors()
      
      // 오류 로그 확인
      await this.checkErrorLogs()
      
    } catch (error) {
      console.error('❌ 테스트 실패:', error.message)
      
      // 오류 로그 확인
      await this.checkErrorLogs()
    }
  }

  async simulateErrors() {
    console.log('🎭 오류 시뮬레이션 시작...')
    
    try {
      // 콘솔 오류 발생
      await this.page.evaluate(() => {
        console.error('테스트 콘솔 오류')
        console.warn('테스트 콘솔 경고')
      })
      
      // JavaScript 오류 발생
      await this.page.evaluate(() => {
        try {
          throw new Error('테스트 JavaScript 오류')
        } catch (error) {
          console.error('캐치된 오류:', error.message)
        }
      })
      
      // Promise 오류 발생
      await this.page.evaluate(() => {
        Promise.reject(new Error('테스트 Promise 오류'))
      })
      
      console.log('✅ 오류 시뮬레이션 완료')
      
    } catch (error) {
      console.error('❌ 오류 시뮬레이션 실패:', error)
    }
  }

  async checkErrorLogs() {
    console.log('📊 오류 로그 확인...')
    
    try {
      // 오류 로그 디렉토리 확인
      if (!fs.existsSync(this.logDir)) {
        console.log('📁 오류 로그 디렉토리 생성됨')
        return
      }
      
      const files = fs.readdirSync(this.logDir)
        .filter(file => file.endsWith('.json'))
        .sort((a, b) => {
          const statA = fs.statSync(path.join(this.logDir, a))
          const statB = fs.statSync(path.join(this.logDir, b))
          return statB.mtime - statA.mtime
        })
      
      if (files.length === 0) {
        console.log('📝 오류 로그 파일이 없습니다.')
        return
      }
      
      console.log(`📄 발견된 오류 로그: ${files.length}개`)
      
      // 최신 오류 로그 확인
      const latestFile = files[0]
      const logPath = path.join(this.logDir, latestFile)
      const logData = JSON.parse(fs.readFileSync(logPath, 'utf8'))
      
      console.log('📋 최신 오류 로그 내용:')
      console.log('- 세션 ID:', logData.sessionId)
      console.log('- 타임스탬프:', logData.timestamp)
      console.log('- 오류 개수:', logData.errors?.length || 0)
      
      if (logData.errors && logData.errors.length > 0) {
        console.log('🔍 오류 상세:')
        logData.errors.forEach((error, index) => {
          console.log(`  ${index + 1}. ${error.type}: ${error.message?.substring(0, 50)}...`)
        })
      }
      
    } catch (error) {
      console.error('❌ 오류 로그 확인 실패:', error)
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
  const tester = new ErrorCollectionTester()
  
  try {
    await tester.start()
    await tester.testErrorCollection()
  } catch (error) {
    console.error('❌ 테스트 실패:', error)
  } finally {
    await tester.stop()
  }
}

if (require.main === module) {
  main()
}

module.exports = ErrorCollectionTester 