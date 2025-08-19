import React from 'react';
const { chromium } = require('playwright');
const fs = require('fs');

class AutoHydrationFixer {
  constructor() {
    this.browser = null;
    this.page = null;
    this.maxWaitTime = 30000; // 30초
  }

  async init() {
    console.log('🔧 하이드레이션 자동 수정기 초기화...');
    
    this.browser = await chromium.launch({ 
      headless: false, // 시각적 확인을 위해 헤드리스 비활성화
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    
    // 콘솔 로그 수집
    this.page.on('console', msg => {
      console.log(`🖥️ 콘솔: ${msg.type()}: ${msg.text()}`);
    });
  }

  async fixHydration() {
    console.log('🚀 하이드레이션 문제 자동 수정 시작...\n');

    try {
      // 페이지 로드
      await this.page.goto('http://localhost:3900', { 
        waitUntil: 'networkidle',
        timeout: this.maxWaitTime 
      });

      console.log('📄 페이지 로드 완료');

      // 하이드레이션 상태 확인
      const hydrationStatus = await this.checkHydrationStatus();
      console.log('🔍 초기 하이드레이션 상태:', hydrationStatus);

      if (hydrationStatus.isHydrated) {
        console.log('✅ 이미 하이드레이션 완료됨');
        return true;
      }

      // 하이드레이션 대기
      console.log('⏳ 하이드레이션 대기 중...');
      const hydrated = await this.waitForHydration();
      
      if (hydrated) {
        console.log('✅ 하이드레이션 완료!');
        
        // UI 요소 확인
        await this.checkUIElements();
        
        // 스크린샷 저장
        await this.page.screenshot({ path: 'hydration-fixed.png' });
        console.log('📸 수정 후 스크린샷 저장: hydration-fixed.png');
        
        return true;
      } else {
        console.log('❌ 하이드레이션 시간 초과');
        await this.forceHydration();
        return false;
      }

    } catch (error) {
      console.error('❌ 하이드레이션 수정 실패:', error.message);
      return false;
    }
  }

  async checkHydrationStatus() {
    return await this.page.evaluate(() => {
      const appContainer = document.querySelector('[data-hydrated]');
      const reactRoot = document.querySelector('[data-reactroot]');
      const loadingElements = document.querySelectorAll('.spinner, .loading, .animate-spin');
      const buttons = document.querySelectorAll('button');
      const inputs = document.querySelectorAll('input');

      return {
        isHydrated: appContainer?.getAttribute('data-hydrated') === 'true',
        hasReactRoot: !!reactRoot,
        loadingCount: loadingElements.length,
        buttonCount: buttons.length,
        inputCount: inputs.length,
        bodyText: document.body.textContent.trim().substring(0, 100)
      };
    });
  }

  async waitForHydration() {
    try {
      // 하이드레이션 완료 대기
      await this.page.waitForFunction(
        () => {
          const appContainer = document.querySelector('[data-hydrated]');
          const buttons = document.querySelectorAll('button');
          const loadingElements = document.querySelectorAll('.spinner, .loading, .animate-spin');
          
          return appContainer?.getAttribute('data-hydrated') === 'true' && 
                 buttons.length > 0 && 
                 loadingElements.length === 0;
        },
        { timeout: this.maxWaitTime }
      );
      
      return true;
    } catch (error) {
      console.log('⏰ 하이드레이션 대기 시간 초과');
      return false;
    }
  }

  async forceHydration() {
    console.log('🔧 강제 하이드레이션 시도...');
    
    try {
      // 페이지 새로고침
      await this.page.reload({ waitUntil: 'networkidle' });
      console.log('🔄 페이지 새로고침 완료');
      
      // 추가 대기
      await this.page.waitForTimeout(5000);
      
      // 하이드레이션 상태 재확인
      const status = await this.checkHydrationStatus();
      console.log('🔍 강제 수정 후 상태:', status);
      
      if (status.isHydrated && status.buttonCount > 0) {
        console.log('✅ 강제 하이드레이션 성공!');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ 강제 하이드레이션 실패:', error.message);
      return false;
    }
  }

  async checkUIElements() {
    console.log('🔍 UI 요소 확인 중...');
    
    const elements = await this.page.evaluate(() => {
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

    console.log('📊 UI 요소 현황:');
    console.log(`   버튼: ${elements.buttons.length}개`);
    console.log(`   입력필드: ${elements.inputs.length}개`);
    console.log(`   컨테이너: ${elements.containers.length}개`);

    if (elements.buttons.length > 0) {
      console.log('   ✅ 버튼들이 정상적으로 렌더링됨');
    } else {
      console.log('   ❌ 버튼이 렌더링되지 않음');
    }

    return elements;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 스크립트 실행
async function main() {
  const fixer = new AutoHydrationFixer();
  
  try {
    await fixer.init();
    const success = await fixer.fixHydration();
    
    if (success) {
      console.log('\n🎉 하이드레이션 문제 해결 완료!');
    } else {
      console.log('\n⚠️ 하이드레이션 문제가 지속됨. 수동 확인 필요.');
    }
    
  } catch (error) {
    console.error('❌ 스크립트 실행 실패:', error.message);
  } finally {
    await fixer.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoHydrationFixer; 