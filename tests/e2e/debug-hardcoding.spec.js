import { test, expect } from '@playwright/test';

test.describe('하드코딩된 "스탠다드" 텍스트 위치 확인', () => {
  test('페이지 전체에서 "스탠다드" 텍스트 검색 (드롭다운 포함)', async ({ page }) => {
    await page.goto('/');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    
    // 드롭다운 클릭해서 옵션들 확인
    const dropdown = page.locator('select, [role="combobox"], [data-testid*="select"]').first();
    if (await dropdown.count() > 0) {
      await dropdown.click();
      await page.waitForTimeout(500);
    }
    
    // 페이지 전체에서 "스탠다드" 텍스트 검색 (숨겨진 요소 포함)
    const standardElements = page.locator('text=스탠다드');
    const count = await standardElements.count();
    
    console.log(`"스탠다드" 텍스트가 발견된 요소 수: ${count}`);
    
    if (count > 0) {
      // 각 요소의 상세 정보 출력
      for (let i = 0; i < count; i++) {
        const element = standardElements.nth(i);
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.evaluate(el => el.className);
        const textContent = await element.textContent();
        const isVisible = await element.isVisible();
        const computedStyle = await element.evaluate(el => window.getComputedStyle(el).display);
        
        console.log(`요소 ${i + 1}:`);
        console.log(`  - 태그: ${tagName}`);
        console.log(`  - 클래스: ${className}`);
        console.log(`  - 텍스트: ${textContent}`);
        console.log(`  - 보임: ${isVisible}`);
        console.log(`  - display: ${computedStyle}`);
        console.log('---');
      }
    }
    
    // SelectItem, option 등 드롭다운 관련 요소들도 확인
    const selectItems = page.locator('[role="option"], option, [data-key*="스탠다드"]');
    const selectItemCount = await selectItems.count();
    console.log(`드롭다운 옵션 요소 수: ${selectItemCount}`);
    
    if (selectItemCount > 0) {
      for (let i = 0; i < Math.min(selectItemCount, 10); i++) {
        const item = selectItems.nth(i);
        const text = await item.textContent();
        const key = await item.getAttribute('data-key') || await item.getAttribute('value');
        console.log(`옵션 ${i + 1}: ${text} (key: ${key})`);
      }
    }
    
    // 스크린샷 저장
    await page.screenshot({ path: 'debug-hardcoding.png', fullPage: true });
    
    // "스탠다드" 텍스트가 존재하는지 확인 (테스트 실패로 표시)
    expect(count).toBe(0);
  });
  
  test('특정 영역별 "스탠다드" 텍스트 검색', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 좌측 패널 (객실 정보 관리)
    const leftPanel = page.locator('div').filter({ hasText: '객실 정보 관리' }).first();
    const leftPanelStandard = leftPanel.locator('text=스탠다드');
    const leftCount = await leftPanelStandard.count();
    console.log(`좌측 패널에서 "스탠다드" 발견: ${leftCount}개`);
    
    // 우측 패널 (실시간 미리보기)
    const rightPanel = page.locator('div').filter({ hasText: '실시간 미리보기' }).first();
    const rightPanelStandard = rightPanel.locator('text=스탠다드');
    const rightCount = await rightPanelStandard.count();
    console.log(`우측 패널에서 "스탠다드" 발견: ${rightCount}개`);
    
    // 전체 페이지에서 "스탠다드"가 포함된 모든 div 요소
    const allDivsWithStandard = page.locator('div').filter({ hasText: '스탠다드' });
    const divCount = await allDivsWithStandard.count();
    console.log(`"스탠다드"를 포함한 div 요소 수: ${divCount}`);
    
    if (divCount > 0) {
      for (let i = 0; i < Math.min(divCount, 5); i++) {
        const div = allDivsWithStandard.nth(i);
        const text = await div.textContent();
        const className = await div.className;
        console.log(`Div ${i + 1}: ${text?.substring(0, 100)}...`);
        console.log(`클래스: ${className}`);
        console.log('---');
      }
    }
  });
});
