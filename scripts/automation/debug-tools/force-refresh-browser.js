const { chromium } = require('playwright');

class ForceRefreshBrowser {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    console.log('🔧 강제 새로고침 브라우저 초기화...');
    
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

  async forceRefresh() {
    console.log('🚀 강제 새로고침 시작...\n');

    try {
      // 1단계: 캐시 완전 삭제
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

      // 2단계: 페이지 로드 (캐시 무시)
      console.log('📄 페이지 로드 중 (캐시 무시)...');
      await this.page.goto('http://localhost:3900', { 
        waitUntil: 'networkidle',
        timeout: 30000 
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

      // 5단계: UI 요소 확인
      console.log('🔍 UI 요소 확인 중...');
      const elements = await this.checkUIElements();
      
      if (elements.buttons.length > 0) {
        console.log('✅ UI가 정상적으로 로드됨!');
        await this.page.screenshot({ path: 'force-refresh-success.png' });
        return true;
      } else {
        console.log('❌ UI 로드 실패');
        await this.page.screenshot({ path: 'force-refresh-failed.png' });
        return false;
      }

    } catch (error) {
      console.error('❌ 강제 새로고침 실패:', error.message);
      await this.page.screenshot({ path: 'force-refresh-error.png' });
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

  async checkUIElements() {
    return await this.page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent.trim(),
        className: btn.className,
        visible: btn.offsetParent !== null
      }));
      
      const inputs = Array.from(document.querySelectorAll('input')).map(input => ({
        type: input.type,
        placeholder: input.placeholder,
        className: input.className,
        visible: input.offsetParent !== null
      }));
      
      const containers = Array.from(document.querySelectorAll('.AppContainer, [data-hydrated]')).map(container => ({
        className: container.className,
        hasContent: container.children.length > 0,
        visible: container.offsetParent !== null
      }));

      return { buttons, inputs, containers };
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 스크립트 실행
async function main() {
  const refresher = new ForceRefreshBrowser();
  
  try {
    await refresher.init();
    const success = await refresher.forceRefresh();
    
    if (success) {
      console.log('\n🎉 강제 새로고침 성공!');
    } else {
      console.log('\n⚠️ 강제 새로고침 실패. 수동 확인 필요.');
    }
    
  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error.message);
  } finally {
    await refresher.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = ForceRefreshBrowser; 