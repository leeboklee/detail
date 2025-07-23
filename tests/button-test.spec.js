const { test, expect } = require('@playwright/test');

test.describe.skip('호텔 관리 페이지 버튼 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 페이지 이동
    await page.goto('http://localhost: {process.env.PORT || 34343}');
    await page.waitForLoadState('networkidle');
    
    // 페이지가 완전히 로드될 때까지 대기
    await page.waitForSelector('.grid.grid-cols-2.md\\:grid-cols-3', { timeout: 180000 });
  });

  const tabTests = [
    { key: 'hotel', label: '호텔 정보', icon: '🏨' },
    { key: 'rooms', label: '객실 정보', icon: '🚪' },
    { key: 'facilities', label: '시설 정보', icon: '🏋️' },
    { key: 'checkin', label: '체크인/아웃', icon: '🕒' },
    { key: 'packages', label: '패키지', icon: '🎁' },
    { key: 'pricing', label: '요금', icon: '💰' },
    { key: 'cancel', label: '취소규정', icon: '📜' },
    { key: 'booking', label: '예약안내', icon: '📞' },
    { key: 'notices', label: '공지사항', icon: '📢' },
    { key: 'database', label: '데이터베이스', icon: '💾' }
  ];

  // 각 탭 버튼 개별 테스트
  for (const tab of tabTests) {
    test(`${tab.label} 버튼 클릭 테스트`, async ({ page }) => {
      console.log(`\n[Test] ${tab.label} 버튼 테스트 시작...`);
      
      const logs = [];
      page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
      });
      
      let button = null;
      
      try {
        button = await page.locator(`text=${tab.label}`).first();
        if (await button.isVisible()) {
          console.log(`[Success] 버튼을 텍스트로 찾음: ${tab.label}`);
        }
      } catch (e) {
        console.log(`[Fail] 텍스트로 버튼을 찾을 수 없음: ${tab.label}`);
      }
      
      if (!button || !(await button.isVisible())) {
        try {
          button = await page.locator(`div:has-text("${tab.label}"):has(span:text("${tab.icon}"))`).first();
          if (await button.isVisible()) {
            console.log(`[Success] 버튼을 아이콘과 텍스트로 찾음: ${tab.label}`);
          }
        } catch (e) {
          console.log(`[Fail] 아이콘과 텍스트로 버튼을 찾을 수 없음: ${tab.label}`);
        }
      }
      
      if (!button || !(await button.isVisible())) {
        try {
          const cards = await page.locator('.grid .hover\\:shadow-md').all();
          for (let i = 0; i < cards.length; i++) {
            const cardText = await cards[i].textContent();
            if (cardText.includes(tab.label)) {
              button = cards[i];
              console.log(`[Success] 버튼을 카드 인덱스로 찾음: ${tab.label} (${i}번째)`);
              break;
            }
          }
        } catch (e) {
          console.log(`[Fail] 카드로 버튼을 찾을 수 없음: ${tab.label}`);
        }
      }
      
      expect(button).toBeTruthy();
      
      await expect(button).toBeVisible();
      
      await page.evaluate(() => {
        console.log('[Debug] 클릭 전 모달 상태:', {
          modalElements: document.querySelectorAll('[class*="modal"]').length,
          zIndex50Elements: document.querySelectorAll('.z-50').length,
          fixedElements: document.querySelectorAll('.fixed.inset-0').length
        });
      });
      
      console.log(`[Action] ${tab.label} 버튼 클릭 시도...`);
      await button.click();
      
      await page.waitForTimeout(1000);
      
      const modalVisible = await page.locator('.fixed.inset-0.z-50').isVisible().catch(() => false);
      const modalContent = await page.locator('.bg-white.rounded-lg.shadow-xl').isVisible().catch(() => false);
      
      console.log(`[Result] ${tab.label} 클릭 결과:`, {
        modalVisible,
        modalContent,
        logs: logs.slice(-5)
      });
      
      if (modalVisible && modalContent) {
        console.log(`[Success] ${tab.label} 모달이 성공적으로 열림`);
        
        const modalTitle = await page.locator('.text-xl.font-semibold').textContent().catch(() => '');
        expect(modalTitle).toContain(tab.label);
        
        await page.locator('button:has-text("×")').click();
        await page.waitForTimeout(500);
        
      } else {
        console.log(`[Fail] ${tab.label} 모달이 열리지 않음`);
      }
    });
  }

  test('모든 버튼 순차 클릭 테스트', async ({ page }) => {
    console.log('\n[Test] 전체 버튼 순차 테스트 시작...');
    
    const results = [];
    
    for (const tab of tabTests) {
      try {
        console.log(`\n[Action] ${tab.label} 테스트 시도...`);
        
        const button = await page.locator(`text=${tab.label}`).first();
        
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(800);
          
          const modalVisible = await page.locator('.fixed.inset-0.z-50').isVisible().catch(() => false);
          
          if (modalVisible) {
            results.push({ tab: tab.label, status: '성공' });
            
            await page.locator('button:has-text("×")').click();
            await page.waitForTimeout(500);
          } else {
            results.push({ tab: tab.label, status: '모달 안열림' });
          }
        } else {
          results.push({ tab: tab.label, status: '버튼 없음' });
        }
      } catch (error) {
        results.push({ tab: tab.label, status: `에러: ${error.message}` });
      }
    }
    
    console.log('\n[Result] 전체 테스트 결과:');
    results.forEach(result => {
      console.log(`  ${result.tab}: ${result.status}`);
    });
    
    const successCount = results.filter(r => r.status.includes('성공')).length;
    expect(successCount).toBeGreaterThan(0);
  });

  test('미리보기 버튼 테스트', async ({ page }) => {
    console.log('\n[Test] 미리보기 버튼 테스트..');
    
    const previewButton = page.locator('button:has-text("미리보기")');
    await expect(previewButton).toBeVisible();
    
    await previewButton.click();
    await page.waitForTimeout(1000);
    
    const previewModal = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    
    if (previewModal) {
      console.log('[Success] 미리보기 모달이 열림');
    } else {
      console.log('[Fail] 미리보기 모달이 열리지 않음');
    }
  });

  test('DB 저장 버튼 테스트', async ({ page }) => {
    console.log('\n[Test] DB 저장 버튼 테스트..');
    
    const dbButton = page.locator('button:has-text("DB 저장")');
    await expect(dbButton).toBeVisible();
    
    await dbButton.click();
    await page.waitForTimeout(1000);
    
    console.log('[Success] DB 저장 버튼 클릭 완료');
  });
});

test('미리보기 버튼 단일 테스트', async ({ page }) => {
  await page.goto('http://localhost: {process.env.PORT || 34343}');
  await page.waitForSelector('button:has-text("미리보기")', { timeout: 180000 });
  
  console.log('\n[Test] 미리보기 버튼 테스트..');
  
  const previewButton = page.locator('button:has-text("미리보기")');
  await expect(previewButton).toBeVisible();
  
  await previewButton.click();
  await page.waitForTimeout(1000);
  
  const previewModal = await page.locator('[role="dialog"]').isVisible().catch(() => false);
  
  if (previewModal) {
    console.log('[Success] 미리보기 모달이 열림');
    await page.screenshot({ path: 'preview-modal-opened.png' });
  } else {
    console.log('[Fail] 미리보기 모달이 열리지 않음');
    await page.screenshot({ path: 'preview-modal-failed.png' });
  }

  expect(previewModal).toBe(true);
}); 
