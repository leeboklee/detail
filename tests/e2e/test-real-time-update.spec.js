import { test, expect } from '@playwright/test';

test('?쇱そ ?낅젰???ㅻⅨ履쎌뿉 ?ㅼ떆媛?諛섏쁺?섎뒗吏 ?뚯뒪??, async ({ page }) => {
  console.log('?㎦ ?ㅼ떆媛??낅뜲?댄듃 ?뚯뒪???쒖옉...');
  
  // ?섏씠吏 濡쒕뱶
  await page.goto('http://localhost:3900');
  console.log('?뱞 ?섏씠吏 濡쒕뵫 ?꾨즺');
  
  // ?명뀛 ?대쫫 ?낅젰 ?꾨뱶 李얘린 (???좎뿰?섍쾶)
  const nameInput = page.locator('input[name="name"], input[placeholder*="?명뀛"], input[placeholder*="?대쫫"]').first();
  await expect(nameInput).toBeVisible();
  console.log('???명뀛 ?대쫫 ?낅젰 ?꾨뱶 諛쒓껄');
  
  // 湲곗〈 媛??뺤씤
  const initialValue = await nameInput.inputValue();
  console.log('?뱥 珥덇린 媛?', initialValue);
  
  // ?덈줈??媛??낅젰
  const testValue = '?뚯뒪???명뀛 123';
  await nameInput.fill(testValue);
  console.log('?륅툘 ?덈줈??媛??낅젰:', testValue);
  
  // ?좎떆 ?湲?(?ㅼ떆媛??낅뜲?댄듃 ?湲?
  await page.waitForTimeout(2000);
  
  // ?ㅻⅨ履?誘몃━蹂닿린?먯꽌 ?댁슜 ?뺤씤
  const previewContent = await page.evaluate(() => {
    // 誘몃━蹂닿린 而⑦뀒?대꼫 李얘린 (??援ъ껜?곸쑝濡?
    const previewElement = document.querySelector('[style*="overflow: auto"]') ||
                          document.querySelector('.preview-content') ||
                          document.querySelector('[ref="previewRef"]') ||
                          document.querySelector('[style*="background: #ffffff"]') ||
                          document.querySelector('div[style*="padding: 10px"]');
    
    if (previewElement) {
      console.log('誘몃━蹂닿린 ?붿냼 諛쒓껄:', previewElement.outerHTML.substring(0, 200));
      return previewElement.textContent || previewElement.innerText;
    }
    
    // ?꾩껜 ?섏씠吏?먯꽌 ?댁슜 寃??
    const bodyText = document.body.textContent;
    console.log('?꾩껜 ?섏씠吏 ?댁슜:', bodyText.substring(0, 500));
    return bodyText;
  });
  
  console.log('?? 誘몃━蹂닿린 ?댁슜:', previewContent.substring(0, 200) + '...');
  
  // 寃곌낵 ?뺤씤
  if (previewContent.includes(testValue)) {
    console.log('???깃났: ?쇱そ ?낅젰???ㅻⅨ履쎌뿉 ?ㅼ떆媛?諛섏쁺??');
  } else {
    console.log('???ㅽ뙣: ?쇱そ ?낅젰???ㅻⅨ履쎌뿉 諛섏쁺?섏? ?딆쓬');
    console.log('?뵇 李얠? ?댁슜:', previewContent);
  }
  
  // ?ㅽ겕由곗꺑 ???
  await page.screenshot({ path: 'real-time-update-test.png', fullPage: true });
  console.log('?벝 ?ㅽ겕由곗꺑 ??λ맖: real-time-update-test.png');
  
  // ?뚯뒪??寃곌낵 寃利?
  expect(previewContent).toContain(testValue);
}); 
