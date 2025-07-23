import { test, expect } from '@playwright/test';

const SECTIONS = [
  { key: 'hotel', label: '호텔 정보' },
  { key: 'rooms', label: '객실 정보' },
  { key: 'facilities', label: '시설 정보' },
  { key: 'checkin', label: '체크인/아웃' },
  { key: 'packages', label: '패키지' },
  { key: 'pricing', label: '요금표' },
  { key: 'cancel', label: '취소규정' },
  { key: 'booking', label: '예약안내' },
  { key: 'notices', label: '공지사항' },
];

test.describe('Admin 섹션 E2E', () => {
  test('각 섹션 카드 클릭 → 팝업/입력/저장 동작', async ({ page }, testInfo) => {
    await page.goto('http://localhost: {process.env.PORT || 34343}/admin');
    
    // 페이지 로드 대기
    await page.waitForLoadState('networkidle');
    
    for (const section of SECTIONS) {
      // 탭 클릭으로 해당 섹션 활성화
      const tab = page.locator(`button:has-text("${section.label}")`).first();
      await expect(tab).toBeVisible();
      await tab.click();
      await page.waitForTimeout(1000);
      
      // Card 컴포넌트 클릭 (실제 구조에 맞게 수정)
      const card = page.locator('div[role="button"], button, [data-pressable="true"]').filter({ hasText: section.label }).first();
      await expect(card).toBeVisible();
      await card.click();
      
      // Modal 대기 및 확인 (HeroUI Modal 구조)
      const modal = page.locator('[role="dialog"], [data-slot="base"], .modal, [aria-modal="true"]').first();
      await modal.waitFor({ state: 'visible', timeout: 15000 });
      await expect(modal).toBeVisible();
      
      // 저장 버튼 확인
      const saveBtn = modal.getByRole('button', { name: /저장/ });
      await expect(saveBtn).toBeVisible();
      
      // 완료 버튼으로 모달 닫기
      const closeBtn = modal.getByRole('button', { name: /완료/ });
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      
      // 모달이 닫힐 때까지 대기
      await modal.waitFor({ state: 'hidden', timeout: 5000 });
    }
  });
}); 