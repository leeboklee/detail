import { test, expect } from '@playwright/test';

test.describe('객실 ?�보 ?�체 기능 ?�스??, () => {
  test('객실 추�? ???�력 ???�???�체 ?�로???�스??, async ({ page }) => {
    console.log('?���?객실 ?�보 ?�체 기능 ?�스???�작');
    
    // ?�이지 로드
    await page.goto('http://localhost:9002');
    await page.waitForLoadState('networkidle');
    
    console.log('?�� ?�이지 로드 ?�료');
    
    // 객실 ?�보 ?�션 ?�기
    console.log('?�� 객실 ?�보 ?�션 버튼 찾기...');
    const roomSectionButton = page.locator('button:has-text("?���?객실 ?�보")');
    await expect(roomSectionButton).toBeVisible();
    await roomSectionButton.click();
    await page.waitForTimeout(1000);
    
    console.log('??객실 ?�보 ?�션 ?�림');
    
    // ?�재 객실 개수 ?�인
    const roomItems = await page.locator('.border.rounded-lg.p-4.bg-gray-50').count();
    console.log(`?�� ?�재 객실 개수: ${roomItems}�?);
    
    // 객실 추�? 버튼 ?�릭
    console.log('??객실 추�? 버튼 ?�릭...');
    const addRoomButton = page.locator('button:has-text("객실 추�?")');
    await expect(addRoomButton).toBeVisible();
    await addRoomButton.click();
    await page.waitForTimeout(500);
    
    // 추�? ??객실 개수 ?�인
    const newRoomItems = await page.locator('.border.rounded-lg.p-4.bg-gray-50').count();
    console.log(`?�� 추�? ??객실 개수: ${newRoomItems}�?);
    
    if (newRoomItems > roomItems) {
      console.log('??객실 추�? ?�공');
    } else {
      console.log('??객실 추�? ?�패');
    }
    
    // ?�로 추�???객실(마�?�?객실)???�보 ?�력
    console.log('?�️ 객실 ?�보 ?�력 ?�작...');
    
    const lastRoomIndex = newRoomItems - 1;
    const lastRoom = page.locator('.border.rounded-lg.p-4.bg-gray-50').nth(lastRoomIndex);
    
    // 객실 ?�름 ?�력
    const roomNameInput = lastRoom.locator('input[placeholder*="객실 ?�름"]').first();
    await roomNameInput.fill('?�스??객실');
    console.log('??객실 ?�름 ?�력: ?�스??객실');
    
    // 객실 ?�???�력
    const roomTypeInput = lastRoom.locator('input[placeholder*="객실 ?�??]').first();
    await roomTypeInput.fill('?�럭??);
    console.log('??객실 ?�???�력: ?�럭??);
    
    // 구조 ?�력
    const structureInput = lastRoom.locator('input[placeholder*="구조"]').first();
    await structureInput.fill('?�룸??);
    console.log('??구조 ?�력: ?�룸??);
    
    // 침�? ?�???�력
    const bedTypeInput = lastRoom.locator('input[placeholder*="침�?"]').first();
    await bedTypeInput.fill('?�사?�즈');
    console.log('??침�? ?�???�력: ?�사?�즈');
    
    // ?�망 ?�력
    const viewInput = lastRoom.locator('input[placeholder*="?�망"]').first();
    await viewInput.fill('?�티�?);
    console.log('???�망 ?�력: ?�티�?);
    
    // 기�? ?�원 ?�력
    const standardCapacityInput = lastRoom.locator('input[placeholder*="기�? ?�원"]').first();
    await standardCapacityInput.fill('2');
    console.log('??기�? ?�원 ?�력: 2');
    
    // 최�? ?�원 ?�력
    const maxCapacityInput = lastRoom.locator('input[placeholder*="최�? ?�원"]').first();
    await maxCapacityInput.fill('4');
    console.log('??최�? ?�원 ?�력: 4');
    
    // 객실 ?�명 ?�력
    const descriptionTextarea = lastRoom.locator('textarea[placeholder*="?�명"]').first();
    await descriptionTextarea.fill('?�고 쾌적???�스??객실?�니??');
    console.log('??객실 ?�명 ?�력 ?�료');
    
    // ?�력 ?�료 ???�시 ?��?(debounce 처리 ?�해)
    await page.waitForTimeout(1000);
    
    // ?�력??값들???��?�??�?�되?�는지 ?�인
    console.log('?�� ?�력 �??�인 �?..');
    
    const nameValue = await roomNameInput.inputValue();
    const typeValue = await roomTypeInput.inputValue();
    const structureValue = await structureInput.inputValue();
    const bedValue = await bedTypeInput.inputValue();
    const viewValue = await viewInput.inputValue();
    const standardValue = await standardCapacityInput.inputValue();
    const maxValue = await maxCapacityInput.inputValue();
    const descValue = await descriptionTextarea.inputValue();
    
    console.log('?�� ?�력??값들:');
    console.log(`- 객실 ?�름: ${nameValue}`);
    console.log(`- 객실 ?�?? ${typeValue}`);
    console.log(`- 구조: ${structureValue}`);
    console.log(`- 침�? ?�?? ${bedValue}`);
    console.log(`- ?�망: ${viewValue}`);
    console.log(`- 기�? ?�원: ${standardValue}`);
    console.log(`- 최�? ?�원: ${maxValue}`);
    console.log(`- ?�명: ${descValue}`);
    
    // 모든 값이 ?�바르게 ?�력?�었?��? 검�?
    const allInputsValid = 
      nameValue === '?�스??객실' &&
      typeValue === '?�럭?? &&
      structureValue === '?�룸?? &&
      bedValue === '?�사?�즈' &&
      viewValue === '?�티�? &&
      standardValue === '2' &&
      maxValue === '4' &&
      descValue === '?�고 쾌적???�스??객실?�니??';
    
    if (allInputsValid) {
      console.log('??모든 ?�력 값이 ?�바르게 ?�?�됨');
    } else {
      console.log('???��? ?�력 값이 ?�?�되지 ?�음');
    }
    
    // ?�이지 ?�로고침 ???�이???��? ?�인
    console.log('?�� ?�이지 ?�로고침 ???�이???��? ?�인...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // ?�시 객실 ?�보 ?�션 ?�기
    const roomSectionButton2 = page.locator('button:has-text("?���?객실 ?�보")');
    await roomSectionButton2.click();
    await page.waitForTimeout(1000);
    
    // ?�로고침 ??객실 개수 ?�인
    const reloadedRoomItems = await page.locator('.border.rounded-lg.p-4.bg-gray-50').count();
    console.log(`?�� ?�로고침 ??객실 개수: ${reloadedRoomItems}�?);
    
    if (reloadedRoomItems === newRoomItems) {
      console.log('???�로고침 ?�에??객실 개수 ?��???);
      
      // 마�?�?객실???�이?��? ?��??�었?��? ?�인
      const lastRoomAfterReload = page.locator('.border.rounded-lg.p-4.bg-gray-50').nth(reloadedRoomItems - 1);
      const nameAfterReload = await lastRoomAfterReload.locator('input[placeholder*="객실 ?�름"]').first().inputValue();
      const typeAfterReload = await lastRoomAfterReload.locator('input[placeholder*="객실 ?�??]').first().inputValue();
      
      console.log(`?�� ?�로고침 ???�이??`);
      console.log(`- 객실 ?�름: ${nameAfterReload}`);
      console.log(`- 객실 ?�?? ${typeAfterReload}`);
      
      if (nameAfterReload === '?�스??객실' && typeAfterReload === '?�럭??) {
        console.log('???�로고침 ?�에???�력 ?�이?��? ?��???);
      } else {
        console.log('???�로고침 ???�력 ?�이?��? ?�라�?);
      }
    } else {
      console.log('???�로고침 ??객실 개수가 변경됨');
    }
    
    // 객실 ??�� ?�스??
    console.log('?���?객실 ??�� ?�스??..');
    if (reloadedRoomItems > 1) {
      const deleteButton = page.locator('button:has-text("??��")').first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        await page.waitForTimeout(500);
        
        const afterDeleteCount = await page.locator('.border.rounded-lg.p-4.bg-gray-50').count();
        console.log(`?�� ??�� ??객실 개수: ${afterDeleteCount}�?);
        
        if (afterDeleteCount === reloadedRoomItems - 1) {
          console.log('??객실 ??�� ?�공');
        } else {
          console.log('??객실 ??�� ?�패');
        }
      } else {
        console.log('?�️ ??�� 버튼??찾을 ???�음');
      }
    } else {
      console.log('?�️ ??��??객실???�음 (최소 1�??��?)');
    }
    
    // 최종 결과 ?�크린샷
    await page.screenshot({ path: 'tests/screenshots/room-functionality-test-result.png' });
    console.log('?�� ?�스??결과 ?�크린샷 ?�?�됨');
    
    console.log('?�� 객실 ?�보 ?�체 기능 ?�스???�료');
  });
}); 
