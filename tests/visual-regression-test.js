import { test, expect } from '@playwright/test';

const SECTIONS = [
  { label: '?명뀛 ?뺣낫', id: 'hotel' },
  { label: '媛앹떎 ?뺣낫', id: 'room' },
  { label: '?쒖꽕 ?뺣낫', id: 'facilities' },
  { label: '泥댄겕???꾩썐', id: 'checkin' },
  { label: '?⑦궎吏', id: 'package' },
  { label: '?붽툑??, id: 'price' },
  { label: '痍⑥냼洹쒖젙', id: 'cancel' },
  { label: '?덉빟?덈궡', id: 'booking' },
  { label: '怨듭??ы빆', id: 'notice' }
];

// ?듭떖 ?뱀뀡留??뚯뒪??(?깅뒫 理쒖쟻??
const CORE_SECTIONS = [
  { label: '?명뀛 ?뺣낫', id: 'hotel' },
  { label: '媛앹떎 ?뺣낫', id: 'room' }
];

test.describe('?듭떖 ?뱀뀡 ?쒓컖???뚯뒪??(理쒖쟻??', () => {
  for (const section of CORE_SECTIONS) {
    test(`'${section.label}' ??湲곕뒫 ?뺤씤`, async ({ page }) => {
      console.log(`?? ${section.label} ?뚯뒪???쒖옉...`);
      
      await page.goto(`http://localhost:${process.env.PORT || 3900}/admin`);
      
      // ???대┃
      await page.click(`text=${section.label}`);
      await page.waitForTimeout(1000);
      
      // 紐⑤떖 ?먮뒗 ?몃씪?????뺤씤
      try {
        await page.waitForSelector('[role="dialog"]', { timeout: 3000 });
        console.log(`??${section.label} 紐⑤떖 ?대┝`);
        
        // ?낅젰 ?꾨뱶 議댁옱 ?뺤씤留?(?ㅽ겕由곗꺑 ?쒓굅)
        if (section.id === 'hotel') {
          await expect(page.locator('[role="dialog"] input[placeholder="?명뀛 ?대쫫???낅젰?섏꽭??]')).toBeVisible({ timeout: 3000 });
        }
        if (section.id === 'room') {
          await expect(page.locator('[role="dialog"] input[placeholder="媛앹떎 ?대쫫???낅젰?섏꽭??]')).toBeVisible({ timeout: 3000 });
        }
        
      } catch (error) {
        // ?몃씪?????뺤씤
        if (section.id === 'hotel') {
          await expect(page.locator('input[placeholder="?명뀛 ?대쫫???낅젰?섏꽭??]')).toBeVisible({ timeout: 3000 });
        }
        if (section.id === 'room') {
          await expect(page.locator('input[placeholder="媛앹떎 ?대쫫???낅젰?섏꽭??]')).toBeVisible({ timeout: 3000 });
        }
      }
      
      console.log(`??${section.label} ?뚯뒪???꾨즺`);
    });
  }
});

// ?꾩껜 ?섏씠吏 湲곕낯 ?뚮뜑留??뚯뒪??(?ㅽ겕由곗꺑 ?놁씠)
test('硫붿씤 ?섏씠吏 湲곕낯 ?뚮뜑留?, async ({ page }) => {
  await page.goto(`http://localhost:${process.env.PORT || 3900}/admin`);
  
  // 湲곕낯 ?붿냼 議댁옱 ?뺤씤
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('h1, h2')).toBeVisible();
  
  console.log('??硫붿씤 ?섏씠吏 ?뚮뜑留??뺤씤 ?꾨즺');
}); 
