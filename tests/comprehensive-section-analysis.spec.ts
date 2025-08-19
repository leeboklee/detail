import { test, expect } from '@playwright/test';

test.describe('?占쎌껜 ?占쎌뀡 湲곕뒫 遺꾩꽍', () => {
  test('紐⑤뱺 ?占쎌뀡 踰꾪듉占?湲곕뒫 泥닿퀎??遺꾩꽍', async ({ page }) => {
    await page.goto('http://localhost:3900');
    await page.waitForLoadState('networkidle');
    
    const results = {
      sections: {},
      missingFeatures: [],
      brokenFeatures: [],
      workingFeatures: []
    };

    console.log('?占쏙옙 ?占쎌껜 ?占쎌뀡 遺꾩꽍 ?占쎌옉...');

    // 1. ?占쏀뀛 ?占쎈낫 ?占쎌뀡
    console.log('\n=== ?占쏙옙 ?占쏀뀛 ?占쎈낫 ?占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 ?占쏀뀛 ?占쎈낫")');
      await page.waitForTimeout(1000);
      
      const hotelInputs = await page.locator('input, textarea').count();
      const hotelButtons = await page.locator('button').count();
      
      results.sections['hotel'] = {
        opened: true,
        inputCount: hotelInputs,
        buttonCount: hotelButtons,
        status: 'working'
      };
      
      console.log(`???占쏀뀛 ?占쎈낫: ${hotelInputs}占??占쎈젰?占쎈뱶, ${hotelButtons}占?踰꾪듉`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['hotel'] = { status: 'error', error: error.message };
      console.log('???占쏀뀛 ?占쎈낫 ?占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 2. 媛앹떎 ?占쎈낫 ?占쎌뀡
    console.log('\n=== ?占쏙옙占?媛앹떎 ?占쎈낫 ?占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙占?媛앹떎 ?占쎈낫")');
      await page.waitForTimeout(1000);
      
      const roomInputs = await page.locator('input, textarea').count();
      const addRoomBtn = await page.locator('button:has-text("媛앹떎 異뷂옙?")').count();
      const deleteRoomBtns = await page.locator('button:has-text("??占쏙옙")').count();
      
      // 媛앹떎 異뷂옙? 踰꾪듉 ?占쎌뒪??
      if (addRoomBtn > 0) {
        const beforeCount = await page.locator('[class*="room"], .room-item').count();
        await page.click('button:has-text("媛앹떎 異뷂옙?")');
        await page.waitForTimeout(500);
        const afterCount = await page.locator('[class*="room"], .room-item').count();
        
        results.sections['rooms'] = {
          opened: true,
          inputCount: roomInputs,
          addButtonWorks: afterCount > beforeCount,
          deleteButtonCount: deleteRoomBtns,
          status: 'working'
        };
        console.log(`??媛앹떎 ?占쎈낫: ${roomInputs}占??占쎈젰?占쎈뱶, 異뷂옙?踰꾪듉 ?占쎈룞: ${afterCount > beforeCount}`);
      } else {
        results.sections['rooms'] = {
          opened: true,
          inputCount: roomInputs,
          addButtonWorks: false,
          status: 'missing_add_button'
        };
        console.log('?占쏙툘 媛앹떎 異뷂옙? 踰꾪듉 ?占쎌쓬');
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['rooms'] = { status: 'error', error: error.message };
      console.log('??媛앹떎 ?占쎈낫 ?占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 3. ?占쎌꽕 ?占쎈낫 ?占쎌뀡
    console.log('\n=== ?占쏙옙 ?占쎌꽕 ?占쎈낫 ?占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 ?占쎌꽕 ?占쎈낫")');
      await page.waitForTimeout(1000);
      
      const facilityInputs = await page.locator('input, textarea').count();
      const addFacilityBtn = await page.locator('button:has-text("遺?占?占쎌꽕 異뷂옙?"), button:has-text("?占쎌꽕 異뷂옙?")').count();
      
      if (addFacilityBtn > 0) {
        const beforeCount = await page.locator('.facility-item, [class*="facility"]').count();
        await page.click('button:has-text("遺?占?占쎌꽕 異뷂옙?"), button:has-text("?占쎌꽕 異뷂옙?")').first();
        await page.waitForTimeout(500);
        const afterCount = await page.locator('.facility-item, [class*="facility"]').count();
        
        results.sections['facilities'] = {
          opened: true,
          inputCount: facilityInputs,
          addButtonWorks: afterCount > beforeCount,
          status: 'working'
        };
        console.log(`???占쎌꽕 ?占쎈낫: ${facilityInputs}占??占쎈젰?占쎈뱶, 異뷂옙?踰꾪듉 ?占쎈룞: ${afterCount > beforeCount}`);
      } else {
        results.sections['facilities'] = {
          opened: true,
          inputCount: facilityInputs,
          addButtonWorks: false,
          status: 'missing_add_button'
        };
        console.log('?占쏙툘 ?占쎌꽕 異뷂옙? 踰꾪듉 ?占쎌쓬');
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['facilities'] = { status: 'error', error: error.message };
      console.log('???占쎌꽕 ?占쎈낫 ?占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 4. 泥댄겕???占쎌썐 ?占쎌뀡
    console.log('\n=== ?占쏙옙 泥댄겕???占쎌썐 ?占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 泥댄겕???占쎌썐")');
      await page.waitForTimeout(1000);
      
      const checkinInputs = await page.locator('input, textarea').count();
      const timeInputs = await page.locator('input[type="time"]').count();
      
      results.sections['checkin'] = {
        opened: true,
        inputCount: checkinInputs,
        timeInputCount: timeInputs,
        status: 'working'
      };
      
      console.log(`??泥댄겕???占쎌썐: ${checkinInputs}占??占쎈젰?占쎈뱶, ${timeInputs}占??占쎄컙?占쎈뱶`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['checkin'] = { status: 'error', error: error.message };
      console.log('??泥댄겕???占쎌썐 ?占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 5. ?占쏀궎吏 ?占쎌뀡
    console.log('\n=== ?占쏙옙 ?占쏀궎吏 ?占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 ?占쏀궎吏")');
      await page.waitForTimeout(1000);
      
      const packageInputs = await page.locator('input, textarea').count();
      const addPackageBtn = await page.locator('button:has-text("?占쏀궎吏 異뷂옙?"), button:has-text("???占쏀궎吏")').count();
      
      if (addPackageBtn > 0) {
        const beforeCount = await page.locator('.package-item, [class*="package"]').count();
        await page.click('button:has-text("?占쏀궎吏 異뷂옙?"), button:has-text("???占쏀궎吏")').first();
        await page.waitForTimeout(500);
        const afterCount = await page.locator('.package-item, [class*="package"]').count();
        
        results.sections['packages'] = {
          opened: true,
          inputCount: packageInputs,
          addButtonWorks: afterCount > beforeCount,
          status: 'working'
        };
        console.log(`???占쏀궎吏: ${packageInputs}占??占쎈젰?占쎈뱶, 異뷂옙?踰꾪듉 ?占쎈룞: ${afterCount > beforeCount}`);
      } else {
        results.sections['packages'] = {
          opened: true,
          inputCount: packageInputs,
          addButtonWorks: false,
          status: 'missing_add_button'
        };
        console.log('?占쏙툘 ?占쏀궎吏 異뷂옙? 踰꾪듉 ?占쎌쓬');
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['packages'] = { status: 'error', error: error.message };
      console.log('???占쏀궎吏 ?占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 6. ?占쎈ℓ湲곌컙&?占쎌닕???占쎌뀡
    console.log('\n=== ?占쏙옙 ?占쎈ℓ湲곌컙&?占쎌닕???占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 ?占쎈ℓ湲곌컙&?占쎌닕??)');
      await page.waitForTimeout(1000);
      
      const periodInputs = await page.locator('input, textarea').count();
      const dateInputs = await page.locator('input[type="date"]').count();
      const additionalChargeFields = await page.locator('input[placeholder*="異뷂옙??占쎄툑"], input[placeholder*="二쇰쭚"], input[placeholder*="?占쎌닔占?]').count();
      
      results.sections['period'] = {
        opened: true,
        inputCount: periodInputs,
        dateInputCount: dateInputs,
        additionalChargeFields: additionalChargeFields,
        status: 'working'
      };
      
      console.log(`???占쎈ℓ湲곌컙&?占쎌닕?? ${periodInputs}占??占쎈젰?占쎈뱶, ${dateInputs}占??占쎌쭨?占쎈뱶, ${additionalChargeFields}占?異뷂옙??占쎄툑?占쎈뱶`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['period'] = { status: 'error', error: error.message };
      console.log('???占쎈ℓ湲곌컙&?占쎌닕???占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 7. ?占쎄툑???占쎌뀡
    console.log('\n=== ?占쏙옙 ?占쎄툑???占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 ?占쎄툑??)');
      await page.waitForTimeout(1000);
      
      const priceInputs = await page.locator('input, textarea').count();
      const addLodgeBtn = await page.locator('button:has-text("?占쏀뀛 異뷂옙?"), button:has-text("?占쎌냼 異뷂옙?")').count();
      const addRoomBtn = await page.locator('button:has-text("媛앹떎 異뷂옙?")').count();
      
      results.sections['pricing'] = {
        opened: true,
        inputCount: priceInputs,
        addLodgeButton: addLodgeBtn > 0,
        addRoomButton: addRoomBtn > 0,
        status: 'working'
      };
      
      console.log(`???占쎄툑?? ${priceInputs}占??占쎈젰?占쎈뱶, ?占쏀뀛異뷂옙?踰꾪듉: ${addLodgeBtn > 0}, 媛앹떎異뷂옙?踰꾪듉: ${addRoomBtn > 0}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['pricing'] = { status: 'error', error: error.message };
      console.log('???占쎄툑???占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 8. 痍⑥냼洹쒖젙 ?占쎌뀡
    console.log('\n=== ?占쏙옙 痍⑥냼洹쒖젙 ?占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 痍⑥냼洹쒖젙")');
      await page.waitForTimeout(1000);
      
      const cancelInputs = await page.locator('input, textarea').count();
      const addPolicyBtn = await page.locator('button:has-text("?占쎌콉 異뷂옙?"), button:has-text("洹쒖젙 異뷂옙?")').count();
      
      results.sections['cancel'] = {
        opened: true,
        inputCount: cancelInputs,
        addPolicyButton: addPolicyBtn > 0,
        status: 'working'
      };
      
      console.log(`??痍⑥냼洹쒖젙: ${cancelInputs}占??占쎈젰?占쎈뱶, ?占쎌콉異뷂옙?踰꾪듉: ${addPolicyBtn > 0}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['cancel'] = { status: 'error', error: error.message };
      console.log('??痍⑥냼洹쒖젙 ?占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 9. ?占쎌빟?占쎈궡 ?占쎌뀡
    console.log('\n=== ?占쏙옙 ?占쎌빟?占쎈궡 ?占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 ?占쎌빟?占쎈궡")');
      await page.waitForTimeout(1000);
      
      const bookingInputs = await page.locator('input, textarea').count();
      const addPolicyBtn = await page.locator('button:has-text("?占쎌콉 異뷂옙?")').count();
      const addNoteBtn = await page.locator('button:has-text("?占쎈궡?占쏀빆 異뷂옙?")').count();
      const contactFields = await page.locator('input[type="email"], input[type="url"], input[placeholder*="?占쏀솕"]').count();
      
      results.sections['booking'] = {
        opened: true,
        inputCount: bookingInputs,
        addPolicyButton: addPolicyBtn > 0,
        addNoteButton: addNoteBtn > 0,
        contactFields: contactFields,
        status: 'working'
      };
      
      console.log(`???占쎌빟?占쎈궡: ${bookingInputs}占??占쎈젰?占쎈뱶, ?占쎌콉異뷂옙?: ${addPolicyBtn > 0}, ?占쎈궡異뷂옙?: ${addNoteBtn > 0}, ?占쎈씫泥섑븘?? ${contactFields}占?);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['booking'] = { status: 'error', error: error.message };
      console.log('???占쎌빟?占쎈궡 ?占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 10. 怨듸옙??占쏀빆 ?占쎌뀡
    console.log('\n=== ?占쏙옙 怨듸옙??占쏀빆 ?占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 怨듸옙??占쏀빆")');
      await page.waitForTimeout(1000);
      
      const noticeInputs = await page.locator('input, textarea').count();
      const addNoticeBtn = await page.locator('button:has-text("怨듸옙? 異뷂옙?"), button:has-text("怨듸옙??占쏀빆 異뷂옙?")').count();
      const typeSelectors = await page.locator('select, input[type="radio"]').count();
      
      if (addNoticeBtn > 0) {
        const beforeCount = await page.locator('.notice-item, [class*="notice"]').count();
        await page.click('button:has-text("怨듸옙? 異뷂옙?"), button:has-text("怨듸옙??占쏀빆 異뷂옙?")').first();
        await page.waitForTimeout(500);
        const afterCount = await page.locator('.notice-item, [class*="notice"]').count();
        
        results.sections['notices'] = {
          opened: true,
          inputCount: noticeInputs,
          addButtonWorks: afterCount > beforeCount,
          typeSelectors: typeSelectors,
          status: 'working'
        };
        console.log(`??怨듸옙??占쏀빆: ${noticeInputs}占??占쎈젰?占쎈뱶, 異뷂옙?踰꾪듉 ?占쎈룞: ${afterCount > beforeCount}, ?占?占쎌꽑?? ${typeSelectors}占?);
      } else {
        results.sections['notices'] = {
          opened: true,
          inputCount: noticeInputs,
          addButtonWorks: false,
          status: 'missing_add_button'
        };
        console.log('?占쏙툘 怨듸옙??占쏀빆 異뷂옙? 踰꾪듉 ?占쎌쓬');
      }
      
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['notices'] = { status: 'error', error: error.message };
      console.log('??怨듸옙??占쏀빆 ?占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 11. ?占쏀뵆占?愿占??占쎌뀡 (?占쏙옙 ?占쏀뵆占?紐⑸줉)
    console.log('\n=== ?占쏙옙 ?占쏀뵆占?愿占??占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙 ?占쏀뵆占?紐⑸줉")');
      await page.waitForTimeout(1000);
      
      const templateInputs = await page.locator('input, textarea').count();
      const createTemplateBtn = await page.locator('button:has-text("占??占쏀뵆占??占쎌꽦"), button:has-text("???占쏀뵆占?)').count();
      const loadTemplateBtn = await page.locator('button:has-text("遺덈윭?占쎄린")').count();
      const deleteTemplateBtn = await page.locator('button:has-text("??占쏙옙")').count();
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
      
      console.log(`???占쏀뵆占?愿占? ${templateInputs}占??占쎈젰?占쎈뱶, ?占쎌꽦踰꾪듉: ${createTemplateBtn > 0}, 遺덈윭?占쎄린: ${loadTemplateBtn > 0}, ??占쏙옙: ${deleteTemplateBtn > 0}, 移댄뀒怨좊━: ${categoryFilters}占?);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['templates'] = { status: 'error', error: error.message };
      console.log('???占쏀뵆占?愿占??占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 12. ?占쎌씠?占쎈쿋?占쎌뒪 愿占??占쎌뀡
    console.log('\n=== ?占쏙옙占??占쎌씠?占쎈쿋?占쎌뒪 愿占??占쎌뀡 ===');
    try {
      await page.click('button:has-text("?占쏙옙占??占쎌씠?占쎈쿋?占쎌뒪 愿占?)');
      await page.waitForTimeout(1000);
      
      const dbInputs = await page.locator('input, textarea').count();
      const saveBtn = await page.locator('button:has-text("?占??)').count();
      const loadBtn = await page.locator('button:has-text("遺덈윭?占쎄린")').count();
      const deleteBtn = await page.locator('button:has-text("??占쏙옙")').count();
      
      results.sections['database'] = {
        opened: true,
        inputCount: dbInputs,
        saveButton: saveBtn > 0,
        loadButton: loadBtn > 0,
        deleteButton: deleteBtn > 0,
        status: 'working'
      };
      
      console.log(`???占쎌씠?占쎈쿋?占쎌뒪 愿占? ${dbInputs}占??占쎈젰?占쎈뱶, ?占?? ${saveBtn > 0}, 遺덈윭?占쎄린: ${loadBtn > 0}, ??占쏙옙: ${deleteBtn > 0}`);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    } catch (error) {
      results.sections['database'] = { status: 'error', error: error.message };
      console.log('???占쎌씠?占쎈쿋?占쎌뒪 愿占??占쎌뀡 ?占쎈쪟:', error.message);
    }

    // 寃곌낵 遺꾩꽍
    console.log('\n?占쏙옙 === 遺꾩꽍 寃곌낵 ?占쎌빟 ===');
    
    for (const [sectionName, sectionData] of Object.entries(results.sections)) {
      if (sectionData.status === 'error') {
        results.brokenFeatures.push(`${sectionName}: ${sectionData.error}`);
        console.log(`??${sectionName}: ?占쎈쪟 諛쒖깮`);
      } else if (sectionData.status === 'missing_add_button') {
        results.missingFeatures.push(`${sectionName}: 異뷂옙? 踰꾪듉 ?占쎈씫`);
        console.log(`?占쏙툘 ${sectionName}: 異뷂옙? 踰꾪듉 ?占쎈씫`);
      } else if (sectionData.addButtonWorks === false) {
        results.missingFeatures.push(`${sectionName}: 異뷂옙? 踰꾪듉 ?占쎈룞 ?占쏀븿`);
        console.log(`?占쏙툘 ${sectionName}: 異뷂옙? 踰꾪듉 ?占쎈룞 ?占쏀븿`);
      } else {
        results.workingFeatures.push(sectionName);
        console.log(`??${sectionName}: ?占쎌긽 ?占쎈룞`);
      }
    }

    console.log(`\n?占쏙옙 ?占쎌긽 ?占쎈룞: ${results.workingFeatures.length}占?);
    console.log(`?占쏙툘 ?占쎈씫??湲곕뒫: ${results.missingFeatures.length}占?);
    console.log(`???占쎈쪟 諛쒖깮: ${results.brokenFeatures.length}占?);

    if (results.missingFeatures.length > 0) {
      console.log('\n?占쏙옙 蹂듦뎄 ?占쎌슂??湲곕뒫??');
      results.missingFeatures.forEach(feature => console.log(`- ${feature}`));
    }

    if (results.brokenFeatures.length > 0) {
      console.log('\n?占쏙옙 ?占쎌젙 ?占쎌슂???占쎈쪟??');
      results.brokenFeatures.forEach(feature => console.log(`- ${feature}`));
    }

    // 寃곌낵占??占쎌씪占??占??
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

    console.log('\n?占쏙옙 遺꾩꽍 寃곌낵媛 comprehensive-section-analysis.json ?占쎌씪占??占?占쎈릺?占쎌뒿?占쎈떎.');
  });
}); 
