import { test, expect } from '@playwright/test';

const SECTIONS = [
  { key: 'hotel', label: '?명뀛 ?뺣낫' },
  { key: 'rooms', label: '媛앹떎 ?뺣낫' },
  { key: 'facilities', label: '?쒖꽕 ?뺣낫' },
  { key: 'checkin', label: '泥댄겕???꾩썐' },
  { key: 'packages', label: '?⑦궎吏' },
  { key: 'pricing', label: '?붽툑?? },
  { key: 'cancel', label: '痍⑥냼洹쒖젙' },
  { key: 'booking', label: '?덉빟?덈궡' },
  { key: 'notices', label: '怨듭??ы빆' },
];

test.describe('Admin ?뱀뀡 E2E', () => {
  test('媛??뱀뀡 移대뱶 ?대┃ ???앹뾽/?낅젰/????숈옉', async ({ page }, testInfo) => {
    await page.goto(`http://localhost:${process.env.PORT || 3900}/admin`);
    
    // ?섏씠吏 濡쒕뱶 ?湲?    await page.waitForLoadState('networkidle');
    
    for (const section of SECTIONS) {
      // ???대┃?쇰줈 ?대떦 ?뱀뀡 ?쒖꽦??      const tab = page.locator(`button:has-text("${section.label}")`).first();
      await expect(tab).toBeVisible();
      await tab.click();
      await page.waitForTimeout(1000);
      
      // Card 而댄룷?뚰듃 ?대┃ (?ㅼ젣 援ъ“??留욊쾶 ?섏젙)
      const card = page.locator('div[role="button"], button, [data-pressable="true"]').filter({ hasText: section.label }).first();
      await expect(card).toBeVisible();
      await card.click();
      
      // Modal ?湲?諛??뺤씤 (HeroUI Modal 援ъ“)
      const modal = page.locator('[role="dialog"], [data-slot="base"], .modal, [aria-modal="true"]').first();
      await modal.waitFor({ state: 'visible', timeout: 15000 });
      await expect(modal).toBeVisible();
      
      // ???踰꾪듉 ?뺤씤
      const saveBtn = modal.getByRole('button', { name: /??? });
      await expect(saveBtn).toBeVisible();
      
      // ?꾨즺 踰꾪듉?쇰줈 紐⑤떖 ?リ린
      const closeBtn = modal.getByRole('button', { name: /?꾨즺/ });
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      
      // 紐⑤떖???ロ옄 ?뚭퉴吏 ?湲?      await modal.waitFor({ state: 'hidden', timeout: 5000 });
    }
  });
}); 
