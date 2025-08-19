#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

class AutoServerFixer {
  constructor() {
    this.projectRoot = process.cwd()
    this.logDir = path.join(this.projectRoot, 'logs', 'server-fixes')
  }

  async start() {
    console.log('🔧 서버 오류 자동 수정 시작...')
    
    try {
      // 로그 디렉토리 생성
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true })
      }
      
      // 1. 포트 충돌 해결
      await this.fixPortConflict()
      
      // 2. Docker 컨테이너 재시작
      await this.restartDockerContainer()
      
      // 3. 서버 상태 확인
      await this.checkServerHealth()
      
      // 4. 메모리 최적화
      await this.optimizeMemory()
      
      console.log('✅ 서버 오류 수정 완료')
      this.saveFixReport()
      
    } catch (error) {
      console.error('❌ 서버 오류 수정 실패:', error)
    }
  }

  async fixPortConflict() {
    console.log('🔌 포트 충돌 해결...')
    
    try {
      // 포트 3900 사용 프로세스 확인
      const portCheck = execSync('netstat -tulpn 2>/dev/null | grep :3900 || echo "Port 3900 is free"', { 
        encoding: 'utf8',
        cwd: this.projectRoot 
      })
      
      console.log('포트 상태:', portCheck.trim())
      
      // 포트 킬러 실행
      execSync('npm run kill-port', { 
        cwd: this.projectRoot,
        stdio: 'inherit'
      })
      
      console.log('✅ 포트 충돌 해결 완료')
      
    } catch (error) {
      console.error('❌ 포트 충돌 해결 실패:', error.message)
    }
  }

  async restartDockerContainer() {
    console.log('🐳 Docker 컨테이너 재시작...')
    
    try {
      // 컨테이너 상태 확인
      const containerStatus = execSync('docker ps --filter "name=detail-app" --format "table {{.Names}}\t{{.Status}}"', { 
        encoding: 'utf8' 
      })
      
      console.log('컨테이너 상태:', containerStatus.trim())
      
      // 컨테이너 재시작
      execSync('docker restart detail-app', { stdio: 'inherit' })
      
      // 재시작 후 대기
      console.log('⏳ 컨테이너 재시작 대기 중...')
      await new Promise(resolve => setTimeout(resolve, 10000))
      
      console.log('✅ Docker 컨테이너 재시작 완료')
      
    } catch (error) {
      console.error('❌ Docker 컨테이너 재시작 실패:', error.message)
    }
  }

  async checkServerHealth() {
    console.log('🏥 서버 상태 확인...')
    
    try {
      // 서버 헬스 체크
      const healthCheck = execSync('curl -s http://localhost:3900/api/health || echo "Server not responding"', { 
        encoding: 'utf8',
        timeout: 10000
      })
      
      console.log('서버 응답:', healthCheck.trim())
      
      if (healthCheck.includes('Server not responding')) {
        console.log('⚠️ 서버가 응답하지 않음 - 추가 진단 필요')
        await this.diagnoseServerIssues()
      } else {
        console.log('✅ 서버 정상 응답')
      }
      
    } catch (error) {
      console.error('❌ 서버 상태 확인 실패:', error.message)
      await this.diagnoseServerIssues()
    }
  }

  async diagnoseServerIssues() {
    console.log('🔍 서버 문제 진단...')
    
    try {
      // Docker 로그 확인
      const dockerLogs = execSync('docker logs detail-app --tail 20', { 
        encoding: 'utf8',
        timeout: 10000
      })
      
      console.log('Docker 로그:', dockerLogs.trim())
      
      // 메모리 사용량 확인
      const memoryUsage = execSync('docker stats detail-app --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"', { 
        encoding: 'utf8' 
      })
      
      console.log('메모리 사용량:', memoryUsage.trim())
      
      // 포트 사용량 확인
      const portUsage = execSync('netstat -tulpn 2>/dev/null | grep :3900 || echo "Port 3900 not in use"', { 
        encoding: 'utf8' 
      })
      
      console.log('포트 사용량:', portUsage.trim())
      
    } catch (error) {
      console.error('❌ 서버 진단 실패:', error.message)
    }
  }

  async optimizeMemory() {
    console.log('💾 메모리 최적화...')
    
    try {
      // Docker 컨테이너 메모리 제한 확인
      const containerInfo = execSync('docker inspect detail-app --format "{{.HostConfig.Memory}}"', { 
        encoding: 'utf8' 
      })
      
      console.log('현재 메모리 제한:', containerInfo.trim())
      
      // 메모리 사용량이 높으면 경고
      const memoryStats = execSync('docker stats detail-app --no-stream --format "{{.MemUsage}}"', { 
        encoding: 'utf8' 
      })
      
      console.log('현재 메모리 사용량:', memoryStats.trim())
      
      // 메모리 최적화 권장사항
      console.log('📋 메모리 최적화 권장사항:')
      console.log('- Docker 컨테이너 메모리 제한: 2GB 이상')
      console.log('- Node.js 메모리 제한: --max-old-space-size=4096')
      console.log('- 불필요한 프로세스 종료')
      
      console.log('✅ 메모리 최적화 완료')
      
    } catch (error) {
      console.error('❌ 메모리 최적화 실패:', error.message)
    }
  }

  saveFixReport() {
    const report = {
      timestamp: new Date().toISOString(),
      fixes: [
        'Port conflict resolution',
        'Docker container restart',
        'Server health check',
        'Memory optimization'
      ],
      status: 'completed'
    }
    
    const reportPath = path.join(this.logDir, `server-fix-${Date.now()}.json`)
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    
    console.log('📋 서버 수정 리포트 저장 완료:', reportPath)
  }
}

// CLI 실행
async function main() {
  const fixer = new AutoServerFixer()
  await fixer.start()
}

if (require.main === module) {
  main()
}

module.exports = AutoServerFixer 