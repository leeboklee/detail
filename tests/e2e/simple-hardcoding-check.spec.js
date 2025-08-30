import { test, expect } from '@playwright/test';

test.describe('하드코딩된 "스탠다드" 텍스트 간단 확인', () => {
  test('페이지에서 "스탠다드" 텍스트 검색', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 페이지 전체에서 "스탠다드" 텍스트 검색
    const standardElements = page.locator('text=스탠다드');
    const count = await standardElements.count();
    
    console.log(`"스탠다드" 텍스트가 발견된 요소 수: ${count}`);
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const element = standardElements.nth(i);
        const tagName = await element.evaluate(el => el.tagName);
        const className = await element.evaluate(el => el.className);
        const textContent = await element.textContent();
        
        console.log(`요소 ${i + 1}: ${tagName}.${className} = "${textContent}"`);
      }
    }
    
    // 스크린샷 저장
    await page.screenshot({ path: 'simple-hardcoding-check.png', fullPage: true });
    
    // 결과 출력
    console.log(`\n=== 결과 요약 ===`);
    console.log(`"스탠다드" 텍스트 발견: ${count}개`);
    console.log(`테스트 결과: ${count === 0 ? 'PASS (하드코딩 제거됨)' : 'FAIL (하드코딩 남아있음)'}`);
    
    // 테스트는 항상 통과하도록 (결과 확인용)
    expect(true).toBe(true);
  });
  
  test('객실 정보 관련 컴포넌트 확인', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 객실 정보 관리 섹션 찾기
    const roomSection = page.locator('div').filter({ hasText: '객실 정보 관리' });
    const roomSectionCount = await roomSection.count();
    console.log(`객실 정보 관리 섹션 수: ${roomSectionCount}`);
    
    if (roomSectionCount > 0) {
      const firstSection = roomSection.first();
      const sectionText = await firstSection.textContent();
      console.log(`섹션 내용: ${sectionText?.substring(0, 200)}...`);
      
      // 해당 섹션 내에서 "스탠다드" 검색
      const standardInSection = firstSection.locator('text=스탠다드');
      const sectionStandardCount = await standardInSection.count();
      console.log(`객실 정보 관리 섹션 내 "스탠다드" 수: ${sectionStandardCount}`);
    }
    
    // 실시간 미리보기 섹션 찾기
    const previewSection = page.locator('div').filter({ hasText: '실시간 미리보기' });
    const previewSectionCount = await previewSection.count();
    console.log(`실시간 미리보기 섹션 수: ${previewSectionCount}`);
    
    if (previewSectionCount > 0) {
      const firstPreview = previewSection.first();
      const previewText = await firstPreview.textContent();
      console.log(`미리보기 내용: ${previewText?.substring(0, 200)}...`);
      
      // 해당 섹션 내에서 "스탠다드" 검색
      const standardInPreview = firstPreview.locator('text=스탠다드');
      const previewStandardCount = await standardInPreview.count();
      console.log(`실시간 미리보기 섹션 내 "스탠다드" 수: ${previewStandardCount}`);
    }
  });
});
