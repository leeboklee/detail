#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const chokidar = require('chokidar')

class AutoErrorMonitor {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs', 'errors')
    this.autoFixDir = path.join(process.cwd(), 'logs', 'auto-fixes')
    this.isRunning = false
    this.processedFiles = new Set()
  }

  start() {
    if (this.isRunning) {
      console.log('⚠️ 모니터가 이미 실행 중입니다.')
      return
    }

    this.isRunning = true
    console.log('🔍 실시간 오류 모니터 시작됨')
    console.log('📁 모니터링 디렉토리:', this.logDir)

    // 디렉토리 생성
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
    if (!fs.existsSync(this.autoFixDir)) {
      fs.mkdirSync(this.autoFixDir, { recursive: true })
    }

    // 파일 변경 감지
    const watcher = chokidar.watch(this.logDir, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true
    })

    watcher
      .on('add', (filePath) => this.handleNewErrorFile(filePath))
      .on('change', (filePath) => this.handleErrorFileChange(filePath))
      .on('error', (error) => console.error('❌ 파일 감시 오류:', error))

    // 주기적 분석 실행
    setInterval(() => {
      this.analyzeAllErrors()
    }, 30000) // 30초마다

    console.log('✅ 실시간 오류 모니터링 활성화됨')
  }

  async handleNewErrorFile(filePath) {
    if (this.processedFiles.has(filePath)) return

    console.log('📄 새로운 오류 파일 감지:', path.basename(filePath))
    this.processedFiles.add(filePath)

    try {
      const errorData = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      await this.processErrors(errorData)
    } catch (error) {
      console.error('❌ 오류 파일 처리 실패:', error)
    }
  }

  async handleErrorFileChange(filePath) {
    console.log('📝 오류 파일 변경 감지:', path.basename(filePath))
    await this.handleNewErrorFile(filePath)
  }

  async processErrors(errorData) {
    const { errors, sessionId, timestamp } = errorData

    console.log(`🔍 ${errors.length}개 오류 분석 시작...`)

    for (const error of errors) {
      await this.analyzeAndFixError(error, sessionId)
    }

    // 분석 결과 저장
    const analysisResult = {
      timestamp: new Date().toISOString(),
      sessionId,
      totalErrors: errors.length,
      processedAt: new Date().toISOString()
    }

    const analysisFile = path.join(this.autoFixDir, `analysis-${Date.now()}.json`)
    fs.writeFileSync(analysisFile, JSON.stringify(analysisResult, null, 2))

    console.log('✅ 오류 분석 완료')
  }

  async analyzeAndFixError(error, sessionId) {
    console.log(`🔧 오류 분석: ${error.type} - ${error.message?.substring(0, 50)}...`)

    // Hydration 오류 자동 수정
    if (error.message?.includes('Text content does not match server-rendered HTML')) {
      await this.fixHydrationError(error)
    }

    // React 오류 자동 수정
    if (error.type === 'react-error') {
      await this.fixReactError(error)
    }

    // 콘솔 오류 자동 수정
    if (error.type === 'console-error') {
      await this.fixConsoleError(error)
    }
  }

  async fixHydrationError(error) {
    console.log('🔧 Hydration 오류 자동 수정 시도...')

    // 이모지 불일치 문제 해결
    if (error.message.includes('🏠') || error.message.includes('🗄️')) {
      console.log('🎯 이모지 불일치 문제 감지')
      
      // DBStatusIndicator 컴포넌트 수정
      await this.fixDBStatusIndicator()
      
      // 메인 페이지 아이콘 수정
      await this.fixMainPageIcons()
    }
  }

  async fixDBStatusIndicator() {
    const filePath = path.join(process.cwd(), 'components', 'DBStatusIndicator.jsx')
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8')
      
      // 이모지를 일관되게 변경
      content = content.replace(/['🏠']/g, "'🏠'")
      content = content.replace(/['🗄️']/g, "'🗄️'")
      
      fs.writeFileSync(filePath, content)
      console.log('✅ DBStatusIndicator 이모지 수정 완료')
    }
  }

  async fixMainPageIcons() {
    const filePath = path.join(process.cwd(), 'app', 'page.js')
    
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8')
      
      // 아이콘 객체를 일관되게 설정
      const iconFix = `
// 아이콘 대신 이모지 사용 (일관성 유지)
const Icons = {
  settings: '⚙️',
  eye: '👁️',
  copy: '📋',
  refresh: '🔄',
  database: '🗄️',
  home: '🏠',
  users: '👥',
  dollar: '💰',
  file: '📄',
  calendar: '📅',
  shield: '🛡️',
  plus: '➕',
  edit: '✏️',
  delete: '🗑️',
  save: '💾',
  download: '📥',
  upload: '📤',
  check: '✅',
  warning: '⚠️',
  info: 'ℹ️'
}`
      
      // 기존 아이콘 객체 교체
      content = content.replace(/const Icons = \{[\s\S]*?\}/, iconFix)
      
      fs.writeFileSync(filePath, content)
      console.log('✅ 메인 페이지 아이콘 수정 완료')
    }
  }

  async fixReactError(error) {
    console.log('🔧 React 오류 자동 수정 시도...')
    
    // Error Boundary 추가
    await this.addErrorBoundary()
  }

  async fixConsoleError(error) {
    console.log('🔧 콘솔 오류 자동 수정 시도...')
    
    if (error.message.includes('Cannot read property')) {
      console.log('🎯 null/undefined 체크 문제 감지')
      // 옵셔널 체이닝 추가 로직
    }
  }

  async addErrorBoundary() {
    const errorBoundaryPath = path.join(process.cwd(), 'components', 'ErrorBoundary.jsx')
    
    if (!fs.existsSync(errorBoundaryPath)) {
      const errorBoundaryContent = `
'use client'

import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // 오류를 전역 이벤트로 전달
    window.dispatchEvent(new CustomEvent('react-error', {
      detail: {
        error,
        componentStack: errorInfo.componentStack
      }
    }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-4 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-red-800 font-semibold mb-2">문제가 발생했습니다</h2>
          <p className="text-red-600 text-sm mb-4">
            {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            다시 시도
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
`
      
      fs.writeFileSync(errorBoundaryPath, errorBoundaryContent)
      console.log('✅ ErrorBoundary 컴포넌트 생성 완료')
    }
  }

  async analyzeAllErrors() {
    console.log('📊 전체 오류 분석 실행...')
    
    const errorFiles = fs.readdirSync(this.logDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(this.logDir, file))

    for (const file of errorFiles) {
      if (!this.processedFiles.has(file)) {
        await this.handleNewErrorFile(file)
      }
    }
  }

  stop() {
    this.isRunning = false
    console.log('🛑 실시간 오류 모니터 중지됨')
  }
}

// CLI 실행
if (require.main === module) {
  const monitor = new AutoErrorMonitor()
  
  process.on('SIGINT', () => {
    console.log('\\n🛑 모니터 종료 중...')
    monitor.stop()
    process.exit(0)
  })

  monitor.start()
}

module.exports = AutoErrorMonitor 