const { test, expect } = require('@playwright/test');

test.describe('자동화된 UI 상호작용 디버깅', () => {
  test('모든 탭 클릭 및 모달 동작 자동 테스트', async ({ page }) => {
    console.log('🚀 자동화된 UI 디버깅 시작...');
    
    await page.goto('http://localhost: {process.env.PORT || 34343}/admin');
    console.log('✅ 페이지 로딩 완료');
    
    // 모든 탭을 순차적으로 클릭하고 상태 확인
    const tabs = [
      { key: 'hotel', label: '호텔 정보' },
      { key: 'rooms', label: '객실 정보' },
      { key: 'notices', label: '공지사항' }
    ];
    
    for (const tab of tabs) {
      console.log(`🖱️ ${tab.label} 탭 테스트 시작...`);
      
      // 탭 클릭
      await page.click(`text=${tab.label}`);
      await page.waitForTimeout(2000);
      
      // 모달 상태 확인
      const modal = page.locator('[role="dialog"]');
      const isModalVisible = await modal.isVisible();
      
      if (isModalVisible) {
        console.log(`✅ ${tab.label} 모달 열림`);
        
        // 모달 내부 요소들 자동 스크린샷
        await page.screenshot({ 
          path: `auto-debug-${tab.key}-modal.png`, 
          fullPage: true 
        });
        
        // 모달 닫기
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
      } else {
        console.log(`❌ ${tab.label} 모달 열리지 않음`);
        
        // 인라인 폼 확인
        const inputs = await page.locator('input').count();
        console.log(`📝 인라인 입력 필드 개수: ${inputs}`);
        
        await page.screenshot({ 
          path: `auto-debug-${tab.key}-inline.png`, 
          fullPage: true 
        });
      }
      
      console.log(`🏁 ${tab.label} 테스트 완료`);
    }
    
    console.log('🎯 모든 탭 자동 테스트 완료');
  });
  
  test('애니메이션/전환 효과 자동 감지', async ({ page }) => {
    console.log('🎬 애니메이션 효과 자동 감지 시작...');
    
    await page.goto('http://localhost: {process.env.PORT || 34343}/admin');
    
    // 탭 클릭 시 애니메이션 감지
    await page.click('text=호텔 정보');
    
    // 애니메이션 완료까지 대기 (CSS transition 감지)
    await page.waitForFunction(() => {
      const elements = document.querySelectorAll('*');
      return Array.from(elements).every(el => {
        const style = window.getComputedStyle(el);
        return style.transition === 'none' || !style.transition;
      });
    }, { timeout: 5000 });
    
    console.log('✅ 애니메이션 효과 감지 완료');
    await page.screenshot({ path: 'auto-debug-animation.png', fullPage: true });
  });
  
  test('실시간 브라우저 동작 자동 분석', async ({ page }) => {
    console.log('🔍 실시간 브라우저 동작 분석 시작...');
    
    // 콘솔 로그 수집
    const logs = [];
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // 네트워크 요청 모니터링
    const requests = [];
    page.on('request', request => {
      requests.push(`${request.method()} ${request.url()}`);
    });
    
    await page.goto('http://localhost: {process.env.PORT || 34343}/admin');
    await page.click('text=호텔 정보');
    await page.waitForTimeout(3000);
    
    // 분석 결과 저장
    console.log('📊 콘솔 로그 개수:', logs.length);
    console.log('🌐 네트워크 요청 개수:', requests.length);
    
    // 결과를 파일로 저장
    const fs = require('fs');
    fs.writeFileSync('auto-debug-logs.json', JSON.stringify({ logs, requests }, null, 2));
    
    console.log('✅ 실시간 분석 완료 - auto-debug-logs.json 저장됨');
  });
}); 