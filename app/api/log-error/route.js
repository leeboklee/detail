import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 오류 로그 저장 디렉토리
const LOG_DIR = path.join(process.cwd(), 'logs', 'errors')
const AUTO_FIX_DIR = path.join(process.cwd(), 'logs', 'auto-fixes')

// 디렉토리 생성
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}
if (!fs.existsSync(AUTO_FIX_DIR)) {
  fs.mkdirSync(AUTO_FIX_DIR, { recursive: true })
}

export async function POST(req) {
  try {
    const { errors, sessionId, timestamp } = await req.json()
    
    console.log('🔍 오류 수신:', errors.length, '개')
    
    // 오류 로그 저장
    const logFile = path.join(LOG_DIR, `errors-${Date.now()}.json`)
    fs.writeFileSync(logFile, JSON.stringify({
      sessionId,
      timestamp,
      errors,
      userAgent: req.headers.get('user-agent'),
      url: req.headers.get('referer')
    }, null, 2))
    
    // AI 분석 및 자동 수정
    const analysisResult = await analyzeAndFixErrors(errors)
    
    // 분석 결과 저장
    const analysisFile = path.join(AUTO_FIX_DIR, `analysis-${Date.now()}.json`)
    fs.writeFileSync(analysisFile, JSON.stringify(analysisResult, null, 2))
    
    return NextResponse.json({
      success: true,
      message: '오류가 수집되고 분석되었습니다.',
      analysis: analysisResult
    })
    
  } catch (error) {
    console.error('❌ 오류 수집 API 오류:', error)
    return NextResponse.json({
      success: false,
      message: '오류 수집 중 문제가 발생했습니다.',
      error: error.message
    }, { status: 500 })
  }
}

async function analyzeAndFixErrors(errors) {
  const analysis = {
    timestamp: new Date().toISOString(),
    totalErrors: errors.length,
    errorTypes: {},
    criticalErrors: [],
    autoFixes: [],
    recommendations: []
  }
  
  for (const error of errors) {
    // 오류 타입별 분류
    analysis.errorTypes[error.type] = (analysis.errorTypes[error.type] || 0) + 1
    
    // React Hydration 오류 특별 처리
    if (error.message?.includes('Text content does not match server-rendered HTML')) {
      analysis.criticalErrors.push({
        type: 'hydration-error',
        error,
        priority: 'high',
        autoFix: await handleHydrationError(error)
      })
    }
    
    // 일반적인 React 오류 처리
    if (error.type === 'react-error') {
      analysis.criticalErrors.push({
        type: 'react-error',
        error,
        priority: 'high',
        autoFix: await handleReactError(error)
      })
    }
    
    // 콘솔 오류 처리
    if (error.type === 'console-error') {
      const fix = await handleConsoleError(error)
      if (fix) {
        analysis.autoFixes.push(fix)
      }
    }
  }
  
  // 전체적인 권장사항 생성
  analysis.recommendations = generateRecommendations(analysis)
  
  return analysis
}

async function handleHydrationError(error) {
  console.log('🔧 Hydration 오류 자동 수정 시도:', error.message)
  
  // 이모지 불일치 문제 해결
  if (error.message.includes('🏠') || error.message.includes('🗄️')) {
    return {
      type: 'hydration-fix',
      description: '이모지 아이콘 불일치 문제',
      solution: '아이콘을 텍스트로 변경하거나 일관된 이모지 사용',
      code: `
// 수정 방법 1: 아이콘을 텍스트로 변경
const Icons = {
  home: '🏠',
  database: '🗄️',
  // 모든 아이콘을 일관되게 설정
}

// 수정 방법 2: 클라이언트 전용 렌더링
import dynamic from 'next/dynamic'
const IconComponent = dynamic(() => import('./IconComponent'), { ssr: false })
      `,
      files: ['app/page.js', 'components/DBStatusIndicator.jsx'],
      priority: 'high'
    }
  }
  
  return null
}

async function handleReactError(error) {
  console.log('🔧 React 오류 자동 수정 시도:', error.message)
  
  return {
    type: 'react-error-fix',
    description: 'React 컴포넌트 오류',
    solution: '컴포넌트 오류 경계 추가 및 상태 관리 개선',
    code: `
// Error Boundary 추가
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({error, resetErrorBoundary}) {
  return (
    <div role="alert">
      <p>문제가 발생했습니다:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>다시 시도</button>
    </div>
  )
}

// 컴포넌트 래핑
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>
      `,
    priority: 'medium'
  }
}

async function handleConsoleError(error) {
  console.log('🔧 콘솔 오류 자동 수정 시도:', error.message)
  
  // 일반적인 오류 패턴 매칭
  if (error.message.includes('Cannot read property')) {
    return {
      type: 'null-check-fix',
      description: 'null/undefined 체크 누락',
      solution: '옵셔널 체이닝 또는 기본값 설정',
      code: `
// 수정 전
const value = obj.property.subProperty

// 수정 후
const value = obj?.property?.subProperty || defaultValue
      `,
      priority: 'medium'
    }
  }
  
  return null
}

function generateRecommendations(analysis) {
  const recommendations = []
  
  if (analysis.errorTypes['hydration-error'] > 0) {
    recommendations.push({
      type: 'hydration',
      priority: 'high',
      message: '서버-클라이언트 렌더링 불일치 문제가 있습니다. SSR을 비활성화하거나 일관된 데이터 사용을 권장합니다.',
      action: 'next.config.js에서 SSR 설정 검토'
    })
  }
  
  if (analysis.errorTypes['react-error'] > 0) {
    recommendations.push({
      type: 'react',
      priority: 'high',
      message: 'React 컴포넌트 오류가 발생했습니다. Error Boundary 추가를 권장합니다.',
      action: 'ErrorBoundary 컴포넌트 추가'
    })
  }
  
  if (analysis.errorTypes['console-error'] > 5) {
    recommendations.push({
      type: 'console',
      priority: 'medium',
      message: '콘솔 오류가 많이 발생합니다. 코드 품질 개선이 필요합니다.',
      action: 'ESLint 규칙 강화 및 코드 리뷰'
    })
  }
  
  return recommendations
} 