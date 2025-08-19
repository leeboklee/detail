'use client'

import { useEffect, useRef } from 'react'

class ErrorCollector {
  constructor() {
    this.errors = []
    this.maxErrors = 50
    this.isCollecting = false
    this.retryCount = 0
    this.maxRetries = 3
  }

  start() {
    if (this.isCollecting) return
    this.isCollecting = true

    // 전역 오류 이벤트 리스너
    window.addEventListener('error', this.handleError.bind(this))
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    
    // React 오류 경계
    window.addEventListener('react-error', this.handleReactError.bind(this))
    
    // 콘솔 오류 감지
    this.interceptConsole()
    
    // 주기적 오류 전송
    this.startPeriodicSend()
    
    console.log('🔍 실시간 오류 수집기 시작됨')
  }

  stop() {
    this.isCollecting = false
    window.removeEventListener('error', this.handleError.bind(this))
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this))
    window.removeEventListener('react-error', this.handleReactError.bind(this))
    console.log('🛑 실시간 오류 수집기 중지됨')
  }

  handleError(event) {
    const error = {
      type: 'error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    this.addError(error)
  }

  handleUnhandledRejection(event) {
    const error = {
      type: 'unhandledrejection',
      message: event.reason?.message || 'Unhandled Promise Rejection',
      reason: event.reason,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    this.addError(error)
  }

  handleReactError(event) {
    const error = {
      type: 'react-error',
      message: event.detail?.message || 'React Error',
      componentStack: event.detail?.componentStack,
      error: event.detail?.error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }
    this.addError(error)
  }

  interceptConsole() {
    const originalError = console.error
    const originalWarn = console.warn

    console.error = (...args) => {
      const error = {
        type: 'console-error',
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      this.addError(error)
      originalError.apply(console, args)
    }

    console.warn = (...args) => {
      const error = {
        type: 'console-warn',
        message: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '),
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
      this.addError(error)
      originalWarn.apply(console, args)
    }
  }

  addError(error) {
    this.errors.push(error)
    
    // 최대 오류 개수 제한
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // 즉시 전송 (중요한 오류)
    if (error.type === 'error' || error.type === 'react-error') {
      this.sendErrors([error])
    }
  }

  async sendErrors(errors) {
    if (this.retryCount >= this.maxRetries) {
      console.warn('🔄 최대 재시도 횟수 초과')
      return
    }

    try {
      const response = await fetch('/api/log-error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors,
          sessionId: this.getSessionId(),
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        this.retryCount = 0
        console.log('✅ 오류 전송 성공:', errors.length, '개')
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('❌ 오류 전송 실패:', error)
      this.retryCount++
      
      // 재시도
      setTimeout(() => {
        this.sendErrors(errors)
      }, 1000 * this.retryCount)
    }
  }

  startPeriodicSend() {
    setInterval(() => {
      if (this.errors.length > 0) {
        const errorsToSend = [...this.errors]
        this.errors = []
        this.sendErrors(errorsToSend)
      }
    }, 5000) // 5초마다 전송
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('errorSessionId')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('errorSessionId', sessionId)
    }
    return sessionId
  }

  getErrors() {
    return [...this.errors]
  }

  clearErrors() {
    this.errors = []
  }
}

// 전역 인스턴스
const errorCollector = new ErrorCollector()

export default function ErrorCollectorComponent() {
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!isInitialized.current) {
      errorCollector.start()
      isInitialized.current = true
    }

    return () => {
      errorCollector.stop()
    }
  }, [])

  return null // UI 렌더링 없음
}

// 전역으로 export
export { errorCollector } 