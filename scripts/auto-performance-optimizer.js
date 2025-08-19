#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

class PerformanceOptimizer {
  constructor() {
    this.projectRoot = process.cwd()
    this.nextConfigPath = path.join(this.projectRoot, 'next.config.cjs')
    this.packageJsonPath = path.join(this.projectRoot, 'package.json')
  }

  async optimize() {
    console.log('🚀 성능 최적화 시작...')
    
    try {
      // 1. Next.js 설정 최적화
      await this.optimizeNextConfig()
      
      // 2. 메모리 사용량 최적화
      await this.optimizeMemoryUsage()
      
      // 3. 번들 크기 최적화
      await this.optimizeBundleSize()
      
      // 4. 캐시 최적화
      await this.optimizeCache()
      
      console.log('✅ 성능 최적화 완료')
      
    } catch (error) {
      console.error('❌ 성능 최적화 실패:', error)
    }
  }

  async optimizeNextConfig() {
    console.log('⚙️ Next.js 설정 최적화...')
    
    try {
      let config = fs.readFileSync(this.nextConfigPath, 'utf8')
      
      // 컴파일 속도 최적화
      if (!config.includes('swcMinify: true')) {
        config = config.replace(
          'module.exports = {',
          'module.exports = {\n  swcMinify: true,'
        )
      }
      
      // 메모리 제한 설정
      if (!config.includes('experimental')) {
        config = config.replace(
          'module.exports = {',
          'module.exports = {\n  experimental: {\n    memoryBasedWorkers: true,\n    workerThreads: true,\n  },'
        )
      }
      
      // 번들 분석 비활성화
      if (!config.includes('bundleAnalyzer')) {
        config = config.replace(
          'module.exports = {',
          'module.exports = {\n  bundleAnalyzer: false,'
        )
      }
      
      fs.writeFileSync(this.nextConfigPath, config)
      console.log('✅ Next.js 설정 최적화 완료')
      
    } catch (error) {
      console.error('❌ Next.js 설정 최적화 실패:', error)
    }
  }

  async optimizeMemoryUsage() {
    console.log('💾 메모리 사용량 최적화...')
    
    try {
      // Node.js 메모리 제한 설정
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'))
      
      if (packageJson.scripts && packageJson.scripts.dev) {
        packageJson.scripts.dev = packageJson.scripts.dev.replace(
          'next dev',
          'NODE_OPTIONS="--max-old-space-size=2048" next dev'
        )
      }
      
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log('✅ 메모리 사용량 최적화 완료')
      
    } catch (error) {
      console.error('❌ 메모리 사용량 최적화 실패:', error)
    }
  }

  async optimizeBundleSize() {
    console.log('📦 번들 크기 최적화...')
    
    try {
      // 불필요한 의존성 제거
      const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'))
      
      // 개발 의존성 최적화
      if (packageJson.devDependencies) {
        const devDeps = packageJson.devDependencies
        const unnecessaryDeps = ['@types/node', 'typescript']
        
        unnecessaryDeps.forEach(dep => {
          if (devDeps[dep]) {
            delete devDeps[dep]
            console.log(`🗑️ 제거된 개발 의존성: ${dep}`)
          }
        })
      }
      
      fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log('✅ 번들 크기 최적화 완료')
      
    } catch (error) {
      console.error('❌ 번들 크기 최적화 실패:', error)
    }
  }

  async optimizeCache() {
    console.log('🗂️ 캐시 최적화...')
    
    try {
      // Next.js 캐시 정리
      const cacheDir = path.join(this.projectRoot, '.next')
      if (fs.existsSync(cacheDir)) {
        execSync('rm -rf .next', { cwd: this.projectRoot })
        console.log('🗑️ Next.js 캐시 정리됨')
      }
      
      // node_modules 캐시 정리
      const nodeModulesDir = path.join(this.projectRoot, 'node_modules')
      if (fs.existsSync(nodeModulesDir)) {
        execSync('npm cache clean --force', { cwd: this.projectRoot })
        console.log('🗑️ npm 캐시 정리됨')
      }
      
      console.log('✅ 캐시 최적화 완료')
      
    } catch (error) {
      console.error('❌ 캐시 최적화 실패:', error)
    }
  }
}

// CLI 실행
async function main() {
  const optimizer = new PerformanceOptimizer()
  await optimizer.optimize()
}

if (require.main === module) {
  main()
}

module.exports = PerformanceOptimizer 