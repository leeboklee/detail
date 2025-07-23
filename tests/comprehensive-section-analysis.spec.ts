import { test, expect } from '@playwright/test';

test.describe('?�체 ?�션 기능 분석', () => {
  test('모든 ?�션 버튼�?기능 체계??분석', async ({ page }) => {
    await page.goto('http://localhost:9002');
    await page.waitForLoadState('networkidle');
    
    const results = {
      sections: {},
      missingFeatures: [],
      brokenFeatures: [],
      workingFeatures: []
    };

    console.log('?�� ?�체 ?�션 분석 ?�작...');

    // 1. ?�텔 ?�보 ?�션
    console.log('\n=== ?�� ?�텔 ?�보 ?�션 ===');
    try {
      await page.click('button:has-text("?�� ?�텔 ?�보")');
      await page.waitForTimeout(1000);
      
      const hotelInputs = await page.locator('input, textarea').count();
      const hotelButtons = await page.locator('button').count();
      
      results.sections['hotel'] = {
        opened: true,
        inputCount: hotelInputs,
        buttonCount: hotelButtons,
        status: 'working'
      };
      
      console.log(`???�텔 ?�보: ${hotelInputs}�??�력?�드, ${hotelButtons}�?버튼`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['hotel'] = { status: 'error', error: error.message };
      console.log('???�텔 ?�보 ?�션 ?�류:', error.message);
    }

    // 2. 객실 ?�보 ?�션
    console.log('\n=== ?���?객실 ?�보 ?�션 ===');
    try {
      await page.click('button:has-text("?���?객실 ?�보")');
      await page.waitForTimeout(1000);
      
      const roomInputs = await page.locator('input, textarea').count();
      const addRoomBtn = await page.locator('button:has-text("객실 추�?")').count();
      const deleteRoomBtns = await page.locator('button:has-text("??��")').count();
      
      // 객실 추�? 버튼 ?�스??
      if (addRoomBtn > 0) {
        const beforeCount = await page.locator('[class*="room"], .room-item').count();
        await page.click('button:has-text("객실 추�?")');
        await page.waitForTimeout(500);
        const afterCount = await page.locator('[class*="room"], .room-item').count();
        
        results.sections['rooms'] = {
          opened: true,
          inputCount: roomInputs,
          addButtonWorks: afterCount > beforeCount,
          deleteButtonCount: deleteRoomBtns,
          status: 'working'
        };
        console.log(`??객실 ?�보: ${roomInputs}�??�력?�드, 추�?버튼 ?�동: ${afterCount > beforeCount}`);
      } else {
        results.sections['rooms'] = {
          opened: true,
          inputCount: roomInputs,
          addButtonWorks: false,
          status: 'missing_add_button'
        };
        console.log('?�️ 객실 추�? 버튼 ?�음');
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['rooms'] = { status: 'error', error: error.message };
      console.log('??객실 ?�보 ?�션 ?�류:', error.message);
    }

    // 3. ?�설 ?�보 ?�션
    console.log('\n=== ?�� ?�설 ?�보 ?�션 ===');
    try {
      await page.click('button:has-text("?�� ?�설 ?�보")');
      await page.waitForTimeout(1000);
      
      const facilityInputs = await page.locator('input, textarea').count();
      const addFacilityBtn = await page.locator('button:has-text("부?�?�설 추�?"), button:has-text("?�설 추�?")').count();
      
      if (addFacilityBtn > 0) {
        const beforeCount = await page.locator('.facility-item, [class*="facility"]').count();
        await page.click('button:has-text("부?�?�설 추�?"), button:has-text("?�설 추�?")').first();
        await page.waitForTimeout(500);
        const afterCount = await page.locator('.facility-item, [class*="facility"]').count();
        
        results.sections['facilities'] = {
          opened: true,
          inputCount: facilityInputs,
          addButtonWorks: afterCount > beforeCount,
          status: 'working'
        };
        console.log(`???�설 ?�보: ${facilityInputs}�??�력?�드, 추�?버튼 ?�동: ${afterCount > beforeCount}`);
      } else {
        results.sections['facilities'] = {
          opened: true,
          inputCount: facilityInputs,
          addButtonWorks: false,
          status: 'missing_add_button'
        };
        console.log('?�️ ?�설 추�? 버튼 ?�음');
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['facilities'] = { status: 'error', error: error.message };
      console.log('???�설 ?�보 ?�션 ?�류:', error.message);
    }

    // 4. 체크???�웃 ?�션
    console.log('\n=== ?�� 체크???�웃 ?�션 ===');
    try {
      await page.click('button:has-text("?�� 체크???�웃")');
      await page.waitForTimeout(1000);
      
      const checkinInputs = await page.locator('input, textarea').count();
      const timeInputs = await page.locator('input[type="time"]').count();
      
      results.sections['checkin'] = {
        opened: true,
        inputCount: checkinInputs,
        timeInputCount: timeInputs,
        status: 'working'
      };
      
      console.log(`??체크???�웃: ${checkinInputs}�??�력?�드, ${timeInputs}�??�간?�드`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['checkin'] = { status: 'error', error: error.message };
      console.log('??체크???�웃 ?�션 ?�류:', error.message);
    }

    // 5. ?�키지 ?�션
    console.log('\n=== ?�� ?�키지 ?�션 ===');
    try {
      await page.click('button:has-text("?�� ?�키지")');
      await page.waitForTimeout(1000);
      
      const packageInputs = await page.locator('input, textarea').count();
      const addPackageBtn = await page.locator('button:has-text("?�키지 추�?"), button:has-text("???�키지")').count();
      
      if (addPackageBtn > 0) {
        const beforeCount = await page.locator('.package-item, [class*="package"]').count();
        await page.click('button:has-text("?�키지 추�?"), button:has-text("???�키지")').first();
        await page.waitForTimeout(500);
        const afterCount = await page.locator('.package-item, [class*="package"]').count();
        
        results.sections['packages'] = {
          opened: true,
          inputCount: packageInputs,
          addButtonWorks: afterCount > beforeCount,
          status: 'working'
        };
        console.log(`???�키지: ${packageInputs}�??�력?�드, 추�?버튼 ?�동: ${afterCount > beforeCount}`);
      } else {
        results.sections['packages'] = {
          opened: true,
          inputCount: packageInputs,
          addButtonWorks: false,
          status: 'missing_add_button'
        };
        console.log('?�️ ?�키지 추�? 버튼 ?�음');
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['packages'] = { status: 'error', error: error.message };
      console.log('???�키지 ?�션 ?�류:', error.message);
    }

    // 6. ?�매기간&?�숙???�션
    console.log('\n=== ?�� ?�매기간&?�숙???�션 ===');
    try {
      await page.click('button:has-text("?�� ?�매기간&?�숙??)');
      await page.waitForTimeout(1000);
      
      const periodInputs = await page.locator('input, textarea').count();
      const dateInputs = await page.locator('input[type="date"]').count();
      const additionalChargeFields = await page.locator('input[placeholder*="추�??�금"], input[placeholder*="주말"], input[placeholder*="?�수�?]').count();
      
      results.sections['period'] = {
        opened: true,
        inputCount: periodInputs,
        dateInputCount: dateInputs,
        additionalChargeFields: additionalChargeFields,
        status: 'working'
      };
      
      console.log(`???�매기간&?�숙?? ${periodInputs}�??�력?�드, ${dateInputs}�??�짜?�드, ${additionalChargeFields}�?추�??�금?�드`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['period'] = { status: 'error', error: error.message };
      console.log('???�매기간&?�숙???�션 ?�류:', error.message);
    }

    // 7. ?�금???�션
    console.log('\n=== ?�� ?�금???�션 ===');
    try {
      await page.click('button:has-text("?�� ?�금??)');
      await page.waitForTimeout(1000);
      
      const priceInputs = await page.locator('input, textarea').count();
      const addLodgeBtn = await page.locator('button:has-text("?�텔 추�?"), button:has-text("?�소 추�?")').count();
      const addRoomBtn = await page.locator('button:has-text("객실 추�?")').count();
      
      results.sections['pricing'] = {
        opened: true,
        inputCount: priceInputs,
        addLodgeButton: addLodgeBtn > 0,
        addRoomButton: addRoomBtn > 0,
        status: 'working'
      };
      
      console.log(`???�금?? ${priceInputs}�??�력?�드, ?�텔추�?버튼: ${addLodgeBtn > 0}, 객실추�?버튼: ${addRoomBtn > 0}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['pricing'] = { status: 'error', error: error.message };
      console.log('???�금???�션 ?�류:', error.message);
    }

    // 8. 취소규정 ?�션
    console.log('\n=== ?�� 취소규정 ?�션 ===');
    try {
      await page.click('button:has-text("?�� 취소규정")');
      await page.waitForTimeout(1000);
      
      const cancelInputs = await page.locator('input, textarea').count();
      const addPolicyBtn = await page.locator('button:has-text("?�책 추�?"), button:has-text("규정 추�?")').count();
      
      results.sections['cancel'] = {
        opened: true,
        inputCount: cancelInputs,
        addPolicyButton: addPolicyBtn > 0,
        status: 'working'
      };
      
      console.log(`??취소규정: ${cancelInputs}�??�력?�드, ?�책추�?버튼: ${addPolicyBtn > 0}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['cancel'] = { status: 'error', error: error.message };
      console.log('??취소규정 ?�션 ?�류:', error.message);
    }

    // 9. ?�약?�내 ?�션
    console.log('\n=== ?�� ?�약?�내 ?�션 ===');
    try {
      await page.click('button:has-text("?�� ?�약?�내")');
      await page.waitForTimeout(1000);
      
      const bookingInputs = await page.locator('input, textarea').count();
      const addPolicyBtn = await page.locator('button:has-text("?�책 추�?")').count();
      const addNoteBtn = await page.locator('button:has-text("?�내?�항 추�?")').count();
      const contactFields = await page.locator('input[type="email"], input[type="url"], input[placeholder*="?�화"]').count();
      
      results.sections['booking'] = {
        opened: true,
        inputCount: bookingInputs,
        addPolicyButton: addPolicyBtn > 0,
        addNoteButton: addNoteBtn > 0,
        contactFields: contactFields,
        status: 'working'
      };
      
      console.log(`???�약?�내: ${bookingInputs}�??�력?�드, ?�책추�?: ${addPolicyBtn > 0}, ?�내추�?: ${addNoteBtn > 0}, ?�락처필?? ${contactFields}�?);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['booking'] = { status: 'error', error: error.message };
      console.log('???�약?�내 ?�션 ?�류:', error.message);
    }

    // 10. 공�??�항 ?�션
    console.log('\n=== ?�� 공�??�항 ?�션 ===');
    try {
      await page.click('button:has-text("?�� 공�??�항")');
      await page.waitForTimeout(1000);
      
      const noticeInputs = await page.locator('input, textarea').count();
      const addNoticeBtn = await page.locator('button:has-text("공�? 추�?"), button:has-text("공�??�항 추�?")').count();
      const typeSelectors = await page.locator('select, input[type="radio"]').count();
      
      if (addNoticeBtn > 0) {
        const beforeCount = await page.locator('.notice-item, [class*="notice"]').count();
        await page.click('button:has-text("공�? 추�?"), button:has-text("공�??�항 추�?")').first();
        await page.waitForTimeout(500);
        const afterCount = await page.locator('.notice-item, [class*="notice"]').count();
        
        results.sections['notices'] = {
          opened: true,
          inputCount: noticeInputs,
          addButtonWorks: afterCount > beforeCount,
          typeSelectors: typeSelectors,
          status: 'working'
        };
        console.log(`??공�??�항: ${noticeInputs}�??�력?�드, 추�?버튼 ?�동: ${afterCount > beforeCount}, ?�?�선?? ${typeSelectors}�?);
      } else {
        results.sections['notices'] = {
          opened: true,
          inputCount: noticeInputs,
          addButtonWorks: false,
          status: 'missing_add_button'
        };
        console.log('?�️ 공�??�항 추�? 버튼 ?�음');
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['notices'] = { status: 'error', error: error.message };
      console.log('??공�??�항 ?�션 ?�류:', error.message);
    }

    // 11. ?�플�?관�??�션 (?�� ?�플�?목록)
    console.log('\n=== ?�� ?�플�?관�??�션 ===');
    try {
      await page.click('button:has-text("?�� ?�플�?목록")');
      await page.waitForTimeout(1000);
      
      const templateInputs = await page.locator('input, textarea').count();
      const createTemplateBtn = await page.locator('button:has-text("�??�플�??�성"), button:has-text("???�플�?)').count();
      const loadTemplateBtn = await page.locator('button:has-text("불러?�기")').count();
      const deleteTemplateBtn = await page.locator('button:has-text("??��")').count();
      const categoryFilters = await page.locator('button[class*="category"], .category-filter').count();
      
      results.sections['templates'] = {
        opened: true,
        inputCount: templateInputs,
        createButton: createTemplateBtn > 0,
        loadButton: loadTemplateBtn > 0,
        deleteButton: deleteTemplateBtn > 0,
        categoryFilters: categoryFilters,
        status: 'working'
      };
      
      console.log(`???�플�?관�? ${templateInputs}�??�력?�드, ?�성버튼: ${createTemplateBtn > 0}, 불러?�기: ${loadTemplateBtn > 0}, ??��: ${deleteTemplateBtn > 0}, 카테고리: ${categoryFilters}�?);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['templates'] = { status: 'error', error: error.message };
      console.log('???�플�?관�??�션 ?�류:', error.message);
    }

    // 12. ?�이?�베?�스 관�??�션
    console.log('\n=== ?���??�이?�베?�스 관�??�션 ===');
    try {
      await page.click('button:has-text("?���??�이?�베?�스 관�?)');
      await page.waitForTimeout(1000);
      
      const dbInputs = await page.locator('input, textarea').count();
      const saveBtn = await page.locator('button:has-text("?�??)').count();
      const loadBtn = await page.locator('button:has-text("불러?�기")').count();
      const deleteBtn = await page.locator('button:has-text("??��")').count();
      
      results.sections['database'] = {
        opened: true,
        inputCount: dbInputs,
        saveButton: saveBtn > 0,
        loadButton: loadBtn > 0,
        deleteButton: deleteBtn > 0,
        status: 'working'
      };
      
      console.log(`???�이?�베?�스 관�? ${dbInputs}�??�력?�드, ?�?? ${saveBtn > 0}, 불러?�기: ${loadBtn > 0}, ??��: ${deleteBtn > 0}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['database'] = { status: 'error', error: error.message };
      console.log('???�이?�베?�스 관�??�션 ?�류:', error.message);
    }

    // 결과 분석
    console.log('\n?�� === 분석 결과 ?�약 ===');
    
    for (const [sectionName, sectionData] of Object.entries(results.sections)) {
      if (sectionData.status === 'error') {
        results.brokenFeatures.push(`${sectionName}: ${sectionData.error}`);
        console.log(`??${sectionName}: ?�류 발생`);
      } else if (sectionData.status === 'missing_add_button') {
        results.missingFeatures.push(`${sectionName}: 추�? 버튼 ?�락`);
        console.log(`?�️ ${sectionName}: 추�? 버튼 ?�락`);
      } else if (sectionData.addButtonWorks === false) {
        results.missingFeatures.push(`${sectionName}: 추�? 버튼 ?�동 ?�함`);
        console.log(`?�️ ${sectionName}: 추�? 버튼 ?�동 ?�함`);
      } else {
        results.workingFeatures.push(sectionName);
        console.log(`??${sectionName}: ?�상 ?�동`);
      }
    }

    console.log(`\n?�� ?�상 ?�동: ${results.workingFeatures.length}�?);
    console.log(`?�️ ?�락??기능: ${results.missingFeatures.length}�?);
    console.log(`???�류 발생: ${results.brokenFeatures.length}�?);

    if (results.missingFeatures.length > 0) {
      console.log('\n?�� 복구 ?�요??기능??');
      results.missingFeatures.forEach(feature => console.log(`- ${feature}`));
    }

    if (results.brokenFeatures.length > 0) {
      console.log('\n?�� ?�정 ?�요???�류??');
      results.brokenFeatures.forEach(feature => console.log(`- ${feature}`));
    }

    // 결과�??�일�??�??
    await page.evaluate((results) => {
      const dataStr = JSON.stringify(results, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'comprehensive-section-analysis.json';
      a.click();
      URL.revokeObjectURL(url);
    }, results);

    console.log('\n?�� 분석 결과가 comprehensive-section-analysis.json ?�일�??�?�되?�습?�다.');
  });
}); 
