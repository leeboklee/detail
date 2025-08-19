import { test, expect } from '@playwright/test';

test.describe.skip('?명뀛 愿由??섏씠吏 踰꾪듉 ?뚯뒪??, () => {
  test.beforeEach(async ({ page }) => {
    // ?섏씠吏 ?대룞
    await page.goto(`http://localhost:${process.env.PORT || 3900}`);
    await page.waitForLoadState('networkidle');
    
    // ?섏씠吏媛 ?꾩쟾??濡쒕뱶???뚭퉴吏 ?湲?    await page.waitForSelector('.grid.grid-cols-2.md\\:grid-cols-3', { timeout: 180000 });
  });

  const tabTests = [
    { key: 'hotel', label: '?명뀛 ?뺣낫', icon: '?룳' },
    { key: 'rooms', label: '媛앹떎 ?뺣낫', icon: '?슞' },
    { key: 'facilities', label: '?쒖꽕 ?뺣낫', icon: '?룍截? },
    { key: 'checkin', label: '泥댄겕???꾩썐', icon: '?븩' },
    { key: 'packages', label: '?⑦궎吏', icon: '?럞' },
    { key: 'pricing', label: '?붽툑', icon: '?뮥' },
    { key: 'cancel', label: '痍⑥냼洹쒖젙', icon: '?뱶' },
    { key: 'booking', label: '?덉빟?덈궡', icon: '?뱸' },
    { key: 'notices', label: '怨듭??ы빆', icon: '?뱼' },
    { key: 'database', label: '?곗씠?곕쿋?댁뒪', icon: '?뮶' }
  ];

  // 媛???踰꾪듉 媛쒕퀎 ?뚯뒪??  for (const tab of tabTests) {
    test(`${tab.label} 踰꾪듉 ?대┃ ?뚯뒪??, async ({ page }) => {
      console.log(`\n[Test] ${tab.label} 踰꾪듉 ?뚯뒪???쒖옉...`);
      
      const logs = [];
      page.on('console', msg => {
        logs.push(`${msg.type()}: ${msg.text()}`);
      });
      
      let button = null;
      
      try {
        button = await page.locator(`text=${tab.label}`).first();
        if (await button.isVisible()) {
          console.log(`[Success] 踰꾪듉???띿뒪?몃줈 李얠쓬: ${tab.label}`);
        }
      } catch (e) {
        console.log(`[Fail] ?띿뒪?몃줈 踰꾪듉??李얠쓣 ???놁쓬: ${tab.label}`);
      }
      
      if (!button || !(await button.isVisible())) {
        try {
          button = await page.locator(`div:has-text("${tab.label}"):has(span:text("${tab.icon}"))`).first();
          if (await button.isVisible()) {
            console.log(`[Success] 踰꾪듉???꾩씠肄섍낵 ?띿뒪?몃줈 李얠쓬: ${tab.label}`);
          }
        } catch (e) {
          console.log(`[Fail] ?꾩씠肄섍낵 ?띿뒪?몃줈 踰꾪듉??李얠쓣 ???놁쓬: ${tab.label}`);
        }
      }
      
      if (!button || !(await button.isVisible())) {
        try {
          const cards = await page.locator('.grid .hover\\:shadow-md').all();
          for (let i = 0; i < cards.length; i++) {
            const cardText = await cards[i].textContent();
            if (cardText.includes(tab.label)) {
              button = cards[i];
              console.log(`[Success] 踰꾪듉??移대뱶 ?몃뜳?ㅻ줈 李얠쓬: ${tab.label} (${i}踰덉㎏)`);
              break;
            }
          }
        } catch (e) {
          console.log(`[Fail] 移대뱶濡?踰꾪듉??李얠쓣 ???놁쓬: ${tab.label}`);
        }
      }
      
      expect(button).toBeTruthy();
      
      await expect(button).toBeVisible();
      
      await page.evaluate(() => {
        console.log('[Debug] ?대┃ ??紐⑤떖 ?곹깭:', {
          modalElements: document.querySelectorAll('[class*="modal"]').length,
          zIndex50Elements: document.querySelectorAll('.z-50').length,
          fixedElements: document.querySelectorAll('.fixed.inset-0').length
        });
      });
      
      console.log(`[Action] ${tab.label} 踰꾪듉 ?대┃ ?쒕룄...`);
      await button.click();
      
      await page.waitForTimeout(1000);
      
      const modalVisible = await page.locator('.fixed.inset-0.z-50').isVisible().catch(() => false);
      const modalContent = await page.locator('.bg-white.rounded-lg.shadow-xl').isVisible().catch(() => false);
      
      console.log(`[Result] ${tab.label} ?대┃ 寃곌낵:`, {
        modalVisible,
        modalContent,
        logs: logs.slice(-5)
      });
      
      if (modalVisible && modalContent) {
        console.log(`[Success] ${tab.label} 紐⑤떖???깃났?곸쑝濡??대┝`);
        
        const modalTitle = await page.locator('.text-xl.font-semibold').textContent().catch(() => '');
        expect(modalTitle).toContain(tab.label);
        
        await page.locator('button:has-text("횞")').click();
        await page.waitForTimeout(500);
        
      } else {
        console.log(`[Fail] ${tab.label} 紐⑤떖???대━吏 ?딆쓬`);
      }
    });
  }

  test('紐⑤뱺 踰꾪듉 ?쒖감 ?대┃ ?뚯뒪??, async ({ page }) => {
    console.log('\n[Test] ?꾩껜 踰꾪듉 ?쒖감 ?뚯뒪???쒖옉...');
    
    const results = [];
    
    for (const tab of tabTests) {
      try {
        console.log(`\n[Action] ${tab.label} ?뚯뒪???쒕룄...`);
        
        const button = await page.locator(`text=${tab.label}`).first();
        
        if (await button.isVisible()) {
          await button.click();
          await page.waitForTimeout(800);
          
          const modalVisible = await page.locator('.fixed.inset-0.z-50').isVisible().catch(() => false);
          
          if (modalVisible) {
            results.push({ tab: tab.label, status: '?깃났' });
            
            await page.locator('button:has-text("횞")').click();
            await page.waitForTimeout(500);
          } else {
            results.push({ tab: tab.label, status: '紐⑤떖 ?덉뿴由? });
          }
        } else {
          results.push({ tab: tab.label, status: '踰꾪듉 ?놁쓬' });
        }
      } catch (error) {
        results.push({ tab: tab.label, status: `?먮윭: ${error.message}` });
      }
    }
    
    console.log('\n[Result] ?꾩껜 ?뚯뒪??寃곌낵:');
    results.forEach(result => {
      console.log(`  ${result.tab}: ${result.status}`);
    });
    
    const successCount = results.filter(r => r.status.includes('?깃났')).length;
    expect(successCount).toBeGreaterThan(0);
  });

  test('誘몃━蹂닿린 踰꾪듉 ?뚯뒪??, async ({ page }) => {
    console.log('\n[Test] 誘몃━蹂닿린 踰꾪듉 ?뚯뒪??.');
    
    const previewButton = page.locator('button:has-text("誘몃━蹂닿린")');
    await expect(previewButton).toBeVisible();
    
    await previewButton.click();
    await page.waitForTimeout(1000);
    
    const previewModal = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    
    if (previewModal) {
      console.log('[Success] 誘몃━蹂닿린 紐⑤떖???대┝');
    } else {
      console.log('[Fail] 誘몃━蹂닿린 紐⑤떖???대━吏 ?딆쓬');
    }
  });

  test('DB ???踰꾪듉 ?뚯뒪??, async ({ page }) => {
    console.log('\n[Test] DB ???踰꾪듉 ?뚯뒪??.');
    
    const dbButton = page.locator('button:has-text("DB ???)');
    await expect(dbButton).toBeVisible();
    
    await dbButton.click();
    await page.waitForTimeout(1000);
    
    console.log('[Success] DB ???踰꾪듉 ?대┃ ?꾨즺');
  });
});

test('誘몃━蹂닿린 踰꾪듉 ?⑥씪 ?뚯뒪??, async ({ page }) => {
  await page.goto(`http://localhost:${process.env.PORT || 3900}`);
  await page.waitForSelector('button:has-text("誘몃━蹂닿린")', { timeout: 180000 });
  
  console.log('\n[Test] 誘몃━蹂닿린 踰꾪듉 ?뚯뒪??.');
  
  const previewButton = page.locator('button:has-text("誘몃━蹂닿린")');
  await expect(previewButton).toBeVisible();
  await expect(previewButton).toHaveCSS('cursor', 'pointer');
  
  await previewButton.click();
  await page.waitForTimeout(1000);
  
  const previewModal = await page.locator('[role="dialog"]').isVisible().catch(() => false);
  
  if (previewModal) {
    console.log('[Success] 誘몃━蹂닿린 紐⑤떖???대┝');
    await page.screenshot({ path: 'preview-modal-opened.png' });
  } else {
    console.log('[Fail] 誘몃━蹂닿린 紐⑤떖???대━吏 ?딆쓬');
    await page.screenshot({ path: 'preview-modal-failed.png' });
  }

  expect(previewModal).toBe(true);
}); 
