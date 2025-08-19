import { exec } from 'child_process';
import { promisify } from 'util';
import { chromium } from 'playwright';

const execAsync = promisify(exec);

class AutoBrowserRefresh {
  constructor(port = 3900) {
    this.port = port;
    this.url = `http://localhost:${port}`;
    this.browser = null;
    this.page = null;
    this.isWindows = process.platform === 'win32';
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

  async initBrowser() {
    console.log('🌐 브라우저 초기화 중...');
    
    this.browser = await chromium.launch({ 
      headless: false,
      args: [
        '--no-sandbox', 
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
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
        waitUntil: 'networkidle',
        timeout: 30000 
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
    if (this.browser) {
      await this.browser.close();
    }
  }

  async autoRefresh() {
    const serverRunning = await this.waitForServer();
    if (!serverRunning) {
      console.log('❌ 서버가 실행되지 않았습니다.');
      return false;
    }

    try {
      await this.initBrowser();
      const success = await this.openAndRefresh();
      return success;
    } catch (error) {
      console.error('❌ 자동 새로고침 실패:', error.message);
      return false;
    }
  }
}

// CLI 사용법
if (import.meta.url === `file://${process.argv[1]}`) {
  const refresher = new AutoBrowserRefresh();
  
  refresher.autoRefresh()
    .then(success => {
      if (success) {
        console.log('\n🎉 자동 새로고침 성공!');
      } else {
        console.log('\n⚠️ 자동 새로고침 실패.');
      }
    })
    .catch(error => {
      console.error('❌ 스크립트 실행 실패:', error.message);
    })
    .finally(async () => {
      await refresher.close();
    });
}

export default AutoBrowserRefresh; 