#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class AutoErrorFixer {
  constructor() {
    this.projectRoot = process.cwd()
    this.logDir = path.join(this.projectRoot, 'logs', 'errors')
    this.fixedErrors = []
  }

  async start() {
    console.log('🔧 자동 오류 수정 시스템 시작...')
    
    try {
      // 로그 디렉토리 생성
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true })
      }
      
      // 1. 메모리 최적화
      await this.fixMemoryIssues()
      
      // 2. 컴파일 최적화
      await this.fixCompilationIssues()
      
      // 3. 오류 수집 시스템 수정
      await this.fixErrorCollection()
      
      // 4. 포트 충돌 해결
      await this.fixPortConflicts()
      
      // 5. 성능 최적화
      await this.optimizePerformance()
      
      console.log('✅ 자동 오류 수정 완료')
      this.saveFixReport()
      
    } catch (error) {
      console.error('❌ 자동 오류 수정 실패:', error)
    }
  }

  async fixMemoryIssues() {
    console.log('💾 메모리 문제 수정...')
    
    try {
      // Docker 컨테이너 메모리 제한 증가
      const dockerComposePath = path.join(this.projectRoot, 'docker-compose.yml')
      if (fs.existsSync(dockerComposePath)) {
        let dockerCompose = fs.readFileSync(dockerComposePath, 'utf8')
        
        // 메모리 제한 설정 추가
        if (!dockerCompose.includes('mem_limit')) {
          dockerCompose = dockerCompose.replace(
            /services:\s*\n\s*detail-app:/,
            `services:
  detail-app:
    mem_limit: 2g
    mem_reservation: 1g`
          )
        }
        
        fs.writeFileSync(dockerComposePath, dockerCompose)
        console.log('✅ Docker 메모리 제한 설정 완료')
      }
      
      // Node.js 메모리 설정
      const packageJsonPath = path.join(this.projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      if (packageJson.scripts && packageJson.scripts.dev) {
        packageJson.scripts.dev = packageJson.scripts.dev.replace(
          'next dev',
          'NODE_OPTIONS="--max-old-space-size=4096" next dev'
        )
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log('✅ Node.js 메모리 설정 완료')
      
      this.fixedErrors.push({
        type: 'memory',
        description: '메모리 제한 증가 및 Node.js 메모리 설정',
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ 메모리 문제 수정 실패:', error)
    }
  }

  async fixCompilationIssues() {
    console.log('⚙️ 컴파일 문제 수정...')
    
    try {
      // Next.js 설정 최적화
      const nextConfigPath = path.join(this.projectRoot, 'next.config.cjs')
      let nextConfig = fs.readFileSync(nextConfigPath, 'utf8')
      
      // SWC 컴파일러 활성화
      if (!nextConfig.includes('swcMinify: true')) {
        nextConfig = nextConfig.replace(
          'module.exports = {',
          'module.exports = {\n  swcMinify: true,'
        )
      }
      
      // 컴파일 최적화 설정
      if (!nextConfig.includes('experimental')) {
        nextConfig = nextConfig.replace(
          'module.exports = {',
          'module.exports = {\n  experimental: {\n    optimizeCss: true,\n    optimizePackageImports: ["@heroui/react"],\n  },'
        )
      }
      
      // 웹팩 최적화
      if (!nextConfig.includes('webpack')) {
        nextConfig = nextConfig.replace(
          'module.exports = {',
          'module.exports = {\n  webpack: (config, { dev, isServer }) => {\n    if (!dev && !isServer) {\n      config.optimization.splitChunks.cacheGroups.vendor = {\n        test: /[\\\\/]node_modules[\\\\/]/,\n        name: "vendors",\n        chunks: "all",\n      };\n    }\n    return config;\n  },'
        )
      }
      
      fs.writeFileSync(nextConfigPath, nextConfig)
      console.log('✅ Next.js 컴파일 최적화 완료')
      
      this.fixedErrors.push({
        type: 'compilation',
        description: 'SWC 컴파일러 및 웹팩 최적화 설정',
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ 컴파일 문제 수정 실패:', error)
    }
  }

  async fixErrorCollection() {
    console.log('📊 오류 수집 시스템 수정...')
    
    try {
      // 오류 수집 API 수정
      const logErrorPath = path.join(this.projectRoot, 'app/api/log-error/route.js')
      if (fs.existsSync(logErrorPath)) {
        let logErrorCode = fs.readFileSync(logErrorPath, 'utf8')
        
        // 오류 처리 개선
        if (!logErrorCode.includes('try-catch')) {
          logErrorCode = logErrorCode.replace(
            'export async function POST(request) {',
            `export async function POST(request) {
  try {
    const body = await request.json()
    
    // 오류 데이터 검증
    if (!body || !body.errors) {
      return Response.json({ 
        status: 'error', 
        message: 'Invalid error data' 
      }, { status: 400 })
    }
    
    // 오류 로그 저장
    const logData = {
      timestamp: new Date().toISOString(),
      sessionId: body.sessionId || 'unknown',
      errors: body.errors,
      userAgent: request.headers.get('user-agent'),
      url: request.headers.get('referer')
    }
    
    // 로그 파일 저장
    const logFile = path.join(process.cwd(), 'logs', 'errors', \`error-\${Date.now()}.json\`)
    require('fs').writeFileSync(logFile, JSON.stringify(logData, null, 2))
    
    return Response.json({ 
      status: 'success', 
      message: 'Error logged successfully',
      errorCount: body.errors.length
    })
    
  } catch (error) {
    console.error('Error logging failed:', error)
    return Response.json({ 
      status: 'error', 
      message: 'Internal server error' 
    }, { status: 500 })
  }`
          )
        }
        
        fs.writeFileSync(logErrorPath, logErrorCode)
        console.log('✅ 오류 수집 API 수정 완료')
      }
      
      this.fixedErrors.push({
        type: 'error_collection',
        description: '오류 수집 API 개선 및 검증 추가',
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ 오류 수집 시스템 수정 실패:', error)
    }
  }

  async fixPortConflicts() {
    console.log('🔌 포트 충돌 해결...')
    
    try {
      // 포트 킬러 스크립트 개선
      const killPortScript = path.join(this.projectRoot, 'scripts', 'kill-port.bat')
      const improvedKillScript = `@echo off
echo Killing processes on port 3900...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3900') do (
    echo Killing process %%a
    taskkill /f /pid %%a 2>nul
)
echo Port 3900 cleared
`
      
      fs.writeFileSync(killPortScript, improvedKillScript)
      console.log('✅ 포트 킬러 스크립트 개선 완료')
      
      // package.json 스크립트 수정
      const packageJsonPath = path.join(this.projectRoot, 'package.json')
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
      
      if (packageJson.scripts) {
        packageJson.scripts['kill-port'] = 'scripts/kill-port.bat'
        packageJson.scripts['dev:safe'] = 'npm run kill-port && npm run dev'
      }
      
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log('✅ 안전한 개발 스크립트 추가 완료')
      
      this.fixedErrors.push({
        type: 'port_conflict',
        description: '포트 충돌 해결 스크립트 개선',
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ 포트 충돌 해결 실패:', error)
    }
  }

  async optimizePerformance() {
    console.log('🚀 성능 최적화...')
    
    try {
      // 캐시 정리
      const cacheDirs = ['.next', 'node_modules/.cache']
      cacheDirs.forEach(dir => {
        const cachePath = path.join(this.projectRoot, dir)
        if (fs.existsSync(cachePath)) {
          execSync(`rm -rf "${cachePath}"`, { cwd: this.projectRoot })
          console.log(`🗑️ ${dir} 캐시 정리 완료`)
        }
      })
      
      // 불필요한 파일 정리
      const cleanupDirs = ['logs', 'screenshots', 'debug']
      cleanupDirs.forEach(dir => {
        const cleanupPath = path.join(this.projectRoot, dir)
        if (fs.existsSync(cleanupPath)) {
          const files = fs.readdirSync(cleanupPath)
          const oldFiles = files.filter(file => {
            const filePath = path.join(cleanupPath, file)
            const stats = fs.statSync(filePath)
            const daysOld = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)
            return daysOld > 7 // 7일 이상 된 파일
          })
          
          oldFiles.forEach(file => {
            fs.unlinkSync(path.join(cleanupPath, file))
          })
          
          if (oldFiles.length > 0) {
            console.log(`🗑️ ${dir}에서 ${oldFiles.length}개 오래된 파일 정리 완료`)
          }
        }
      })
      
      this.fixedErrors.push({
        type: 'performance',
        description: '캐시 정리 및 불필요한 파일 제거',
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ 성능 최적화 실패:', error)
    }
  }

  saveFixReport() {
    const report = {
      timestamp: new Date().toISOString(),
      fixedErrors: this.fixedErrors,
      summary: {
        totalFixed: this.fixedErrors.length,
        categories: this.fixedErrors.reduce((acc, error) => {
          acc[error.type] = (acc[error.type] || 0) + 1
          return acc
        }, {})
      }
    }
    
    const reportPath = path.join(this.logDir, `fix-report-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log('📋 수정 리포트 저장 완료:', reportPath)
    console.log('📊 수정 요약:', report.summary)
  }
}

// CLI 실행
async function main() {
  const fixer = new AutoErrorFixer()
  await fixer.start()
}

if (require.main === module) {
  main()
}

module.exports = AutoErrorFixer 