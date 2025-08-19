const { exec } = require('child_process');
const { promisify } = require('util');
const { chromium } = require('playwright');

const execAsync = promisify(exec);

class AutoBrowserRefresh {
  constructor(port = 3900, keepOpen = false, safeMode = true) {
    this.port = port;
    this.url = `http://localhost:${port}`;
    this.browser = null;
    this.page = null;
    this.isWindows = process.platform === 'win32';
    this.keepOpen = keepOpen; // 브라우저를 열어둘지 여부
    this.safeMode = safeMode; // 안전 모드 (기존 브라우저 정리 안함)
  }

  async checkServerStatus() {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      return stdout.includes(`:${this.port}`);
    } catch (error) {
      return false;
    }
  }

  async waitForServer(maxAttempts = 30, interval = 2000) {
    console.log(`⏳ 서버 시작 대기 중... (포트: ${this.port})`);
    
    for (let i = 0; i < maxAttempts; i++) {
      const isRunning = await this.checkServerStatus();
      if (isRunning) {
        console.log('✅ 서버가 실행 중입니다.');
        return true;
      }
      
      console.log(`⏳ 대기 중... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    console.log('❌ 서버 시작 시간 초과');
    return false;
  }

  async killExistingBrowsers() {
    try {
      console.log('🗑️ Playwright 브라우저 프로세스만 정리 중...');
      
      if (this.isWindows) {
        // Playwright 관련 Chrome 프로세스만 종료 (더 안전한 방법)
        await execAsync('tasklist /FI "IMAGENAME eq chrome.exe" /FO CSV | findstr /i "playwright" > nul && taskkill /f /im chrome.exe /FI "WINDOWTITLE eq *playwright*" 2>nul || echo "No Playwright Chrome processes found"');
      } else {
        // macOS/Linux에서 Playwright 프로세스만 종료
        await execAsync('ps aux | grep -i "playwright.*chrome" | grep -v grep | awk "{print $2}" | xargs kill -9 2>/dev/null || echo "No Playwright Chrome processes found"');
      }
      
      // 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Playwright 브라우저 정리 완료');
    } catch (error) {
      console.log('⚠️ 브라우저 정리 중 오류 (무시):', error.message);
    }
  }

  async initBrowser() {
    console.log('🌐 브라우저 초기화 중...');
    
    // 안전 모드가 아닐 때만 기존 브라우저 정리
    if (!this.safeMode) {
      await this.killExistingBrowsers();
    } else {
      console.log('🛡️ 안전 모드: 기존 브라우저 정리 건너뜀');
    }
    
    this.browser = await chromium.launch({ 
      headless: false,
      channel: 'chrome', // Chrome 브라우저 강제 사용
      args: [
        '--no-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // 캐시 비활성화
    await this.page.setExtraHTTPHeaders({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }

  async openAndRefresh() {
    try {
      console.log(`🚀 브라우저 열기 및 새로고침: ${this.url}`);
      
      // 1단계: 페이지 로드
      await this.page.goto(this.url, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });

      // 2단계: 캐시 삭제
      console.log('🗑️ 브라우저 캐시 삭제 중...');
      await this.page.evaluate(() => {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }
        if ('localStorage' in window) {
          localStorage.clear();
        }
        if ('sessionStorage' in window) {
          sessionStorage.clear();
        }
      });

      // 3단계: 강제 새로고침
      console.log('🔄 강제 새로고침 실행...');
      await this.page.reload({ 
        waitUntil: 'networkidle',
        timeout: 30000 
      });

      // 4단계: 하이드레이션 대기
      console.log('⏳ 하이드레이션 대기 중...');
      await this.waitForHydration();

      console.log('✅ 브라우저 열기 및 새로고침 완료!');
      return true;

    } catch (error) {
      console.error('❌ 브라우저 열기 실패:', error.message);
      return false;
    }
  }

  async waitForHydration() {
    try {
      await this.page.waitForFunction(
        () => {
          const appContainer = document.querySelector('[data-hydrated]');
          const buttons = document.querySelectorAll('button');
          const loadingElements = document.querySelectorAll('.spinner, .loading, .animate-spin');
          
          return appContainer?.getAttribute('data-hydrated') === 'true' && 
                 buttons.length > 0 && 
                 loadingElements.length === 0;
        },
        { timeout: 15000 }
      );
      console.log('✅ 하이드레이션 완료');
    } catch (error) {
      console.log('⏰ 하이드레이션 대기 시간 초과, 계속 진행');
    }
  }

  async close() {
    try {
      if (this.browser) {
        console.log('🔒 브라우저 종료 중...');
        await this.browser.close();
        console.log('✅ 브라우저 종료 완료');
      }
    } catch (error) {
      console.log('⚠️ 브라우저 종료 중 오류 (무시):', error.message);
    }
  }

  async startServer() {
    console.log('🚀 서버 시작 중...');
    
    try {
      // 서버 시작
      const serverProcess = require('child_process').spawn('npm', ['run', 'dev:basic'], {
        stdio: 'pipe',
        shell: true,
        cwd: process.cwd()
      });

      // 서버 출력 처리
      serverProcess.stdout.on('data', (data) => {
        const output = data.toString();
        if (output.includes('Local:') || output.includes('Ready')) {
          console.log('✅ 서버 시작됨:', output.trim());
        }
      });

      serverProcess.stderr.on('data', (data) => {
        const error = data.toString();
        if (!error.includes('warn')) {
          console.log('⚠️ 서버 오류:', error.trim());
        }
      });

      return serverProcess;
    } catch (error) {
      console.error('❌ 서버 시작 실패:', error.message);
      return null;
    }
  }

  async autoRefresh() {
    let serverProcess = null;
    
    try {
      // 1단계: 서버 시작
      serverProcess = await this.startServer();
      if (!serverProcess) {
        return false;
      }

      // 2단계: 서버 대기
      const serverRunning = await this.waitForServer();
      if (!serverRunning) {
        console.log('❌ 서버가 실행되지 않았습니다.');
        if (serverProcess) serverProcess.kill();
        return false;
      }

      // 3단계: 브라우저 열기
      await this.initBrowser();
      const success = await this.openAndRefresh();
      
      return success;
    } catch (error) {
      console.error('❌ 자동 새로고침 실패:', error.message);
      return false;
    } finally {
      // 서버 프로세스 정리 (keepOpen이 false인 경우)
      if (serverProcess && !this.keepOpen) {
        setTimeout(() => {
          serverProcess.kill();
        }, 5000); // 5초 후 서버 종료
      }
    }
  }
}

// CLI 사용법
async function main() {
  const keepOpen = process.argv.includes('--keep-open');
  const forceKill = process.argv.includes('--force-kill');
  const safeMode = !forceKill; // --force-kill이 없으면 안전 모드
  
  const refresher = new AutoBrowserRefresh(3900, keepOpen, safeMode);
  
  try {
    const success = await refresher.autoRefresh();
    
    if (success) {
      console.log('\n🎉 자동 새로고침 성공!');
      if (keepOpen) {
        console.log('🔓 브라우저와 서버를 열어둡니다. (Ctrl+C로 종료)');
        // 브라우저와 서버를 열어둠
        await new Promise(() => {}); // 무한 대기
      }
    } else {
      console.log('\n⚠️ 자동 새로고침 실패.');
    }
    
  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error.message);
  } finally {
    if (!keepOpen) {
      await refresher.close();
    }
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoBrowserRefresh; 