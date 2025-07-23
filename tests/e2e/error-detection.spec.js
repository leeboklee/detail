import { test, expect } from '@playwright/test';

test.describe('오류 감지 테스트', () => {
  test('브라우저 콘솔 오류 감지', async ({ page }) => {
    const errors = [];
    
    // 콘솔 오류 수집
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console_error',
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 페이지 오류 수집
    page.on('pageerror', error => {
      errors.push({
        type: 'page_error',
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    });

    // 네트워크 오류 수집
    page.on('response', response => {
      if (response.status() >= 400) {
        errors.push({
          type: 'network_error',
          url: response.url(),
          status: response.status(),
          statusText: response.statusText(),
          timestamp: new Date().toISOString()
        });
      }
    });

    // 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 34343}/admin');
    
    // 잠시 대기해서 오류 수집
    await page.waitForTimeout(5000);

    // 오류가 있으면 상세 정보 출력
    if (errors.length > 0) {
      console.log('🚨 감지된 오류들:');
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type}:`);
        console.log('   메시지:', error.message || error.text);
        console.log('   URL:', error.url || error.location?.url);
        console.log('   시간:', error.timestamp);
        if (error.stack) {
          console.log('   스택:', error.stack);
        }
      });
    }

    // 오류가 없으면 성공
    expect(errors.length).toBe(0);
  });

  test('admin 페이지 기능별 오류 감지', async ({ page }) => {
    const errors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({
          type: 'console_error',
          text: msg.text(),
          timestamp: new Date().toISOString()
        });
      }
    });

    page.on('pageerror', error => {
      errors.push({
        type: 'page_error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });

    // admin 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 34343}/admin');
    await page.waitForLoadState('networkidle');

    // 각 탭 클릭하면서 오류 감지
    const tabs = ['호텔 정보', '객실 정보', '시설 정보', '체크인/아웃', '패키지', '요금표', '취소규정', '예약안내', '공지사항'];
    
    for (const tabName of tabs) {
      try {
        await page.click(`text=${tabName}`);
        await page.waitForTimeout(1000);
        
        // 카드 클릭 시도
        const card = page.locator('.card').first();
        if (await card.isVisible()) {
          await card.click();
          await page.waitForTimeout(1000);
          
          // 모달이 열렸는지 확인
          const modal = page.locator('[role="dialog"]');
          if (await modal.isVisible()) {
            await modal.locator('button:has-text("취소")').click();
          }
        }
      } catch (error) {
        errors.push({
          type: 'interaction_error',
          tab: tabName,
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    // 오류 리포트 생성
    if (errors.length > 0) {
      console.log('\n🚨 Admin 페이지 오류 리포트:');
      errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.type}:`);
        console.log('   탭:', error.tab || 'N/A');
        console.log('   메시지:', error.message || error.text);
        console.log('   시간:', error.timestamp);
      });
    }

    expect(errors.length).toBe(0);
  });
}); 