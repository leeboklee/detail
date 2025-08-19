import { test, expect } from '@playwright/test';

test.describe('媛앹떎 ?占쎈낫 ?占쎌껜 湲곕뒫 ?占쎌뒪??, () => {
  test('媛앹떎 異뷂옙? ???占쎈젰 ???占???占쎌껜 ?占쎈줈???占쎌뒪??, async ({ page }) => {
    console.log('?占쏙옙占?媛앹떎 ?占쎈낫 ?占쎌껜 湲곕뒫 ?占쎌뒪???占쎌옉');
    
    // ?占쎌씠吏 濡쒕뱶
    await page.goto('http://localhost:3900');
    await page.waitForLoadState('networkidle');
    
    console.log('?占쏙옙 ?占쎌씠吏 濡쒕뱶 ?占쎈즺');
    
    // 媛앹떎 ?占쎈낫 ?占쎌뀡 ?占쎄린
    console.log('?占쏙옙 媛앹떎 ?占쎈낫 ?占쎌뀡 踰꾪듉 李얘린...');
    const roomSectionButton = page.locator('button:has-text("?占쏙옙占?媛앹떎 ?占쎈낫")');
    await expect(roomSectionButton).toBeVisible();
    await roomSectionButton.click();
    await page.waitForTimeout(1000);
    
    console.log('??媛앹떎 ?占쎈낫 ?占쎌뀡 ?占쎈┝');
    
    // ?占쎌옱 媛앹떎 媛쒖닔 ?占쎌씤
    const roomItems = await page.locator('.border.rounded-lg.p-4.bg-gray-50').count();
    console.log(`?占쏙옙 ?占쎌옱 媛앹떎 媛쒖닔: ${roomItems}占?);
    
    // 媛앹떎 異뷂옙? 踰꾪듉 ?占쎈┃
    console.log('??媛앹떎 異뷂옙? 踰꾪듉 ?占쎈┃...');
    const addRoomButton = page.locator('button:has-text("媛앹떎 異뷂옙?")');
    await expect(addRoomButton).toBeVisible();
    await addRoomButton.click();
    await page.waitForTimeout(500);
    
    // 異뷂옙? ??媛앹떎 媛쒖닔 ?占쎌씤
    const newRoomItems = await page.locator('.border.rounded-lg.p-4.bg-gray-50').count();
    console.log(`?占쏙옙 異뷂옙? ??媛앹떎 媛쒖닔: ${newRoomItems}占?);
    
    if (newRoomItems > roomItems) {
      console.log('??媛앹떎 異뷂옙? ?占쎄났');
    } else {
      console.log('??媛앹떎 異뷂옙? ?占쏀뙣');
    }
    
    // ?占쎈줈 異뷂옙???媛앹떎(留덌옙?占?媛앹떎)???占쎈낫 ?占쎈젰
    console.log('?占쏙툘 媛앹떎 ?占쎈낫 ?占쎈젰 ?占쎌옉...');
    
    const lastRoomIndex = newRoomItems - 1;
    const lastRoom = page.locator('.border.rounded-lg.p-4.bg-gray-50').nth(lastRoomIndex);
    
    // 媛앹떎 ?占쎈쫫 ?占쎈젰
    const roomNameInput = lastRoom.locator('input[placeholder*="媛앹떎 ?占쎈쫫"]').first();
    await roomNameInput.fill('?占쎌뒪??媛앹떎');
    console.log('??媛앹떎 ?占쎈쫫 ?占쎈젰: ?占쎌뒪??媛앹떎');
    
    // 媛앹떎 ?占???占쎈젰
    const roomTypeInput = lastRoom.locator('input[placeholder*="媛앹떎 ?占??]').first();
    await roomTypeInput.fill('?占쎈윮??);
    console.log('??媛앹떎 ?占???占쎈젰: ?占쎈윮??);
    
    // 援ъ“ ?占쎈젰
    const structureInput = lastRoom.locator('input[placeholder*="援ъ“"]').first();
    await structureInput.fill('?占쎈８??);
    console.log('??援ъ“ ?占쎈젰: ?占쎈８??);
    
    // 移⑨옙? ?占???占쎈젰
    const bedTypeInput = lastRoom.locator('input[placeholder*="移⑨옙?"]').first();
    await bedTypeInput.fill('?占쎌궗?占쎌쫰');
    console.log('??移⑨옙? ?占???占쎈젰: ?占쎌궗?占쎌쫰');
    
    // ?占쎈쭩 ?占쎈젰
    const viewInput = lastRoom.locator('input[placeholder*="?占쎈쭩"]').first();
    await viewInput.fill('?占쏀떚占?);
    console.log('???占쎈쭩 ?占쎈젰: ?占쏀떚占?);
    
    // 湲곤옙? ?占쎌썝 ?占쎈젰
    const standardCapacityInput = lastRoom.locator('input[placeholder*="湲곤옙? ?占쎌썝"]').first();
    await standardCapacityInput.fill('2');
    console.log('??湲곤옙? ?占쎌썝 ?占쎈젰: 2');
    
    // 理쒙옙? ?占쎌썝 ?占쎈젰
    const maxCapacityInput = lastRoom.locator('input[placeholder*="理쒙옙? ?占쎌썝"]').first();
    await maxCapacityInput.fill('4');
    console.log('??理쒙옙? ?占쎌썝 ?占쎈젰: 4');
    
    // 媛앹떎 ?占쎈챸 ?占쎈젰
    const descriptionTextarea = lastRoom.locator('textarea[placeholder*="?占쎈챸"]').first();
    await descriptionTextarea.fill('?占쎄퀬 苡뚯쟻???占쎌뒪??媛앹떎?占쎈땲??');
    console.log('??媛앹떎 ?占쎈챸 ?占쎈젰 ?占쎈즺');
    
    // ?占쎈젰 ?占쎈즺 ???占쎌떆 ?占쏙옙?(debounce 泥섎━ ?占쏀빐)
    await page.waitForTimeout(1000);
    
    // ?占쎈젰??媛믩뱾???占쏙옙?占??占?占쎈릺?占쎈뒗吏 ?占쎌씤
    console.log('?占쏙옙 ?占쎈젰 占??占쎌씤 占?..');
    
    const nameValue = await roomNameInput.inputValue();
    const typeValue = await roomTypeInput.inputValue();
    const structureValue = await structureInput.inputValue();
    const bedValue = await bedTypeInput.inputValue();
    const viewValue = await viewInput.inputValue();
    const standardValue = await standardCapacityInput.inputValue();
    const maxValue = await maxCapacityInput.inputValue();
    const descValue = await descriptionTextarea.inputValue();
    
    console.log('?占쏙옙 ?占쎈젰??媛믩뱾:');
    console.log(`- 媛앹떎 ?占쎈쫫: ${nameValue}`);
    console.log(`- 媛앹떎 ?占?? ${typeValue}`);
    console.log(`- 援ъ“: ${structureValue}`);
    console.log(`- 移⑨옙? ?占?? ${bedValue}`);
    console.log(`- ?占쎈쭩: ${viewValue}`);
    console.log(`- 湲곤옙? ?占쎌썝: ${standardValue}`);
    console.log(`- 理쒙옙? ?占쎌썝: ${maxValue}`);
    console.log(`- ?占쎈챸: ${descValue}`);
    
    // 紐⑤뱺 媛믪씠 ?占쎈컮瑜닿쾶 ?占쎈젰?占쎌뿀?占쏙옙? 寃占?
    const allInputsValid = 
      nameValue === '?占쎌뒪??媛앹떎' &&
      typeValue === '?占쎈윮?? &&
      structureValue === '?占쎈８?? &&
      bedValue === '?占쎌궗?占쎌쫰' &&
      viewValue === '?占쏀떚占? &&
      standardValue === '2' &&
      maxValue === '4' &&
      descValue === '?占쎄퀬 苡뚯쟻???占쎌뒪??媛앹떎?占쎈땲??';
    
    if (allInputsValid) {
      console.log('??紐⑤뱺 ?占쎈젰 媛믪씠 ?占쎈컮瑜닿쾶 ?占?占쎈맖');
    } else {
      console.log('???占쏙옙? ?占쎈젰 媛믪씠 ?占?占쎈릺吏 ?占쎌쓬');
    }
    
    // ?占쎌씠吏 ?占쎈줈怨좎묠 ???占쎌씠???占쏙옙? ?占쎌씤
    console.log('?占쏙옙 ?占쎌씠吏 ?占쎈줈怨좎묠 ???占쎌씠???占쏙옙? ?占쎌씤...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // ?占쎌떆 媛앹떎 ?占쎈낫 ?占쎌뀡 ?占쎄린
    const roomSectionButton2 = page.locator('button:has-text("?占쏙옙占?媛앹떎 ?占쎈낫")');
    await roomSectionButton2.click();
    await page.waitForTimeout(1000);
    
    // ?占쎈줈怨좎묠 ??媛앹떎 媛쒖닔 ?占쎌씤
    const reloadedRoomItems = await page.locator('.border.rounded-lg.p-4.bg-gray-50').count();
    console.log(`?占쏙옙 ?占쎈줈怨좎묠 ??媛앹떎 媛쒖닔: ${reloadedRoomItems}占?);
    
    if (reloadedRoomItems === newRoomItems) {
      console.log('???占쎈줈怨좎묠 ?占쎌뿉??媛앹떎 媛쒖닔 ?占쏙옙???);
      
      // 留덌옙?占?媛앹떎???占쎌씠?占쏙옙? ?占쏙옙??占쎌뿀?占쏙옙? ?占쎌씤
      const lastRoomAfterReload = page.locator('.border.rounded-lg.p-4.bg-gray-50').nth(reloadedRoomItems - 1);
      const nameAfterReload = await lastRoomAfterReload.locator('input[placeholder*="媛앹떎 ?占쎈쫫"]').first().inputValue();
      const typeAfterReload = await lastRoomAfterReload.locator('input[placeholder*="媛앹떎 ?占??]').first().inputValue();
      
      console.log(`?占쏙옙 ?占쎈줈怨좎묠 ???占쎌씠??`);
      console.log(`- 媛앹떎 ?占쎈쫫: ${nameAfterReload}`);
      console.log(`- 媛앹떎 ?占?? ${typeAfterReload}`);
      
      if (nameAfterReload === '?占쎌뒪??媛앹떎' && typeAfterReload === '?占쎈윮??) {
        console.log('???占쎈줈怨좎묠 ?占쎌뿉???占쎈젰 ?占쎌씠?占쏙옙? ?占쏙옙???);
      } else {
        console.log('???占쎈줈怨좎묠 ???占쎈젰 ?占쎌씠?占쏙옙? ?占쎈씪占?);
      }
    } else {
      console.log('???占쎈줈怨좎묠 ??媛앹떎 媛쒖닔媛 蹂寃쎈맖');
    }
    
    // 媛앹떎 ??占쏙옙 ?占쎌뒪??
    console.log('?占쏙옙占?媛앹떎 ??占쏙옙 ?占쎌뒪??..');
    if (reloadedRoomItems > 1) {
      const deleteButton = page.locator('button:has-text("??占쏙옙")').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(500);
        
        const afterDeleteCount = await page.locator('.border.rounded-lg.p-4.bg-gray-50').count();
        console.log(`?占쏙옙 ??占쏙옙 ??媛앹떎 媛쒖닔: ${afterDeleteCount}占?);
        
        if (afterDeleteCount === reloadedRoomItems - 1) {
          console.log('??媛앹떎 ??占쏙옙 ?占쎄났');
        } else {
          console.log('??媛앹떎 ??占쏙옙 ?占쏀뙣');
        }
      } else {
        console.log('?占쏙툘 ??占쏙옙 踰꾪듉??李얠쓣 ???占쎌쓬');
      }
    } else {
      console.log('?占쏙툘 ??占쏙옙??媛앹떎???占쎌쓬 (理쒖냼 1占??占쏙옙?)');
    }
    
    // 理쒖쥌 寃곌낵 ?占쏀겕由곗꺑
    await page.screenshot({ path: 'tests/screenshots/room-functionality-test-result.png' });
    console.log('?占쏙옙 ?占쎌뒪??寃곌낵 ?占쏀겕由곗꺑 ?占?占쎈맖');
    
    console.log('?占쏙옙 媛앹떎 ?占쎈낫 ?占쎌껜 湲곕뒫 ?占쎌뒪???占쎈즺');
  });
}); 
