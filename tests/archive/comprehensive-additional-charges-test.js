/**
 * 異붽??붽툑 湲곕뒫 醫낇빀 ?뚯뒪???ㅽ겕由쏀듃
 * 蹂듦뎄??異붽??붽툑 ?꾨뱶?ㅺ낵 ?덈줈??湲곕뒫?ㅼ쓣 紐⑤몢 ?뚯뒪??
 */

console.log('?㎦ 異붽??붽툑 湲곕뒫 醫낇빀 ?뚯뒪???쒖옉');

// ?뚯뒪??寃곌낵 ???
const testResults = {
  fieldTests: [],
  buttonTests: [],
  dataTests: [],
  errors: []
};

// 1. ?꾨뱶 議댁옱 ?뺤씤 ?뚯뒪??
function testFieldsExistence() {
  console.log('?뱥 1. ?꾨뱶 議댁옱 ?뺤씤 ?뚯뒪??);
  
  const fieldsToCheck = [
    { name: '二쇰쭚 異붽??붽툑', selector: 'input[placeholder*="20%"]' },
    { name: '?깆닔湲?怨듯쑕??異붽??붽툑', selector: 'input[placeholder*="30%"]' },
    { name: '怨꾩젅蹂??붽툑 ?뺣낫', selector: 'textarea[placeholder*="怨꾩젅蹂?]' },
    { name: '異붽? ?붽툑 ?덈궡', selector: 'textarea[placeholder*="議곗떇"]' }
  ];
  
  fieldsToCheck.forEach(field => {
    const element = document.querySelector(field.selector);
    const exists = element !== null;
    
    testResults.fieldTests.push({
      field: field.name,
      exists: exists,
      element: element
    });
    
    console.log(`  ${exists ? '?? : '??} ${field.name}: ${exists ? '議댁옱?? : '?놁쓬'}`);
  });
}

// 2. 踰꾪듉 ?대┃ ?뚯뒪??
function testButtons() {
  console.log('?뵖 2. 踰꾪듉 ?대┃ ?뚯뒪??);
  
  const buttonsToTest = [
    { name: '??ぉ 異붽?', text: '+ ??ぉ 異붽?' },
    { name: '?쒗뵆由????, text: '?뮶 ?쒗뵆由???? },
    { name: '?쒗뵆由?遺덈윭?ㅺ린', text: '?뱛 ?쒗뵆由?遺덈윭?ㅺ린' },
    { name: '珥덇린??, text: '?뿊截?珥덇린?? },
    { name: '?뚯뒪???곗씠???낅젰', text: '?㎦ ?뚯뒪???곗씠???낅젰' },
    { name: '?곗씠???뺤씤', text: '?뵇 ?곗씠???뺤씤' }
  ];
  
  buttonsToTest.forEach(buttonInfo => {
    const button = Array.from(document.querySelectorAll('button')).find(btn => 
      btn.textContent.includes(buttonInfo.text)
    );
    
    const exists = button !== undefined;
    const enabled = exists && !button.disabled;
    
    testResults.buttonTests.push({
      button: buttonInfo.name,
      exists: exists,
      enabled: enabled,
      element: button
    });
    
    console.log(`  ${exists ? '?? : '??} ${buttonInfo.name}: ${exists ? (enabled ? '?쒖꽦?붾맖' : '鍮꾪솢?깊솕??) : '?놁쓬'}`);
  });
}

// 3. ?곗씠???낅젰/異쒕젰 ?뚯뒪??
function testDataInputOutput() {
  console.log('?뱷 3. ?곗씠???낅젰/異쒕젰 ?뚯뒪??);
  
  // ?뚯뒪???곗씠???낅젰 踰꾪듉 ?대┃
  const testDataButton = Array.from(document.querySelectorAll('button')).find(btn => 
    btn.textContent.includes('?㎦ ?뚯뒪???곗씠???낅젰')
  );
  
  if (testDataButton) {
    console.log('  ?봽 ?뚯뒪???곗씠???낅젰 踰꾪듉 ?대┃...');
    testDataButton.click();
    
    // ?좎떆 ?湲????곗씠???뺤씤
    setTimeout(() => {
      // 二쇰쭚 異붽??붽툑 ?꾨뱶 ?뺤씤
      const weekendField = document.querySelector('input[placeholder*="20%"]');
      const weekendValue = weekendField ? weekendField.value : '';
      
      // ?깆닔湲?怨듯쑕??異붽??붽툑 ?꾨뱶 ?뺤씤
      const holidayField = document.querySelector('input[placeholder*="30%"]');
      const holidayValue = holidayField ? holidayField.value : '';
      
      // 怨꾩젅蹂??붽툑 ?뺣낫 ?꾨뱶 ?뺤씤
      const seasonalField = document.querySelector('textarea[placeholder*="怨꾩젅蹂?]');
      const seasonalValue = seasonalField ? seasonalField.value : '';
      
      testResults.dataTests.push({
        field: '二쇰쭚 異붽??붽툑',
        value: weekendValue,
        hasData: weekendValue.length > 0
      });
      
      testResults.dataTests.push({
        field: '?깆닔湲?怨듯쑕??異붽??붽툑',
        value: holidayValue,
        hasData: holidayValue.length > 0
      });
      
      testResults.dataTests.push({
        field: '怨꾩젅蹂??붽툑 ?뺣낫',
        value: seasonalValue,
        hasData: seasonalValue.length > 0
      });
      
      console.log('  ?뱤 ?곗씠???낅젰 寃곌낵:');
      console.log(`    二쇰쭚 異붽??붽툑: "${weekendValue}"`);
      console.log(`    ?깆닔湲?怨듯쑕??異붽??붽툑: "${holidayValue}"`);
      console.log(`    怨꾩젅蹂??붽툑 ?뺣낫: "${seasonalValue}"`);
      
      // ?곗씠???뺤씤 踰꾪듉 ?대┃
      const dataCheckButton = Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent.includes('?뵇 ?곗씠???뺤씤')
      );
      
      if (dataCheckButton) {
        console.log('  ?뵇 ?곗씠???뺤씤 踰꾪듉 ?대┃...');
        dataCheckButton.click();
      }
      
      // 理쒖쥌 寃곌낵 異쒕젰
      setTimeout(() => {
        showTestResults();
      }, 1000);
      
    }, 1000);
  } else {
    console.log('  ???뚯뒪???곗씠???낅젰 踰꾪듉??李얠쓣 ???놁쓬');
    showTestResults();
  }
}

// 4. ?뚯뒪??寃곌낵 異쒕젰
function showTestResults() {
  console.log('\n?뱤 === 異붽??붽툑 湲곕뒫 醫낇빀 ?뚯뒪??寃곌낵 ===');
  
  // ?꾨뱶 ?뚯뒪??寃곌낵
  console.log('\n?뤇截??꾨뱶 議댁옱 ?뚯뒪??');
  const fieldsPassed = testResults.fieldTests.filter(t => t.exists).length;
  console.log(`  ${fieldsPassed}/${testResults.fieldTests.length} 媛??꾨뱶 議댁옱`);
  
  // 踰꾪듉 ?뚯뒪??寃곌낵
  console.log('\n?뵖 踰꾪듉 ?뚯뒪??');
  const buttonsPassed = testResults.buttonTests.filter(t => t.exists && t.enabled).length;
  console.log(`  ${buttonsPassed}/${testResults.buttonTests.length} 媛?踰꾪듉 ?쒖꽦??);
  
  // ?곗씠???뚯뒪??寃곌낵
  console.log('\n?뱷 ?곗씠???뚯뒪??');
  const dataPassed = testResults.dataTests.filter(t => t.hasData).length;
  console.log(`  ${dataPassed}/${testResults.dataTests.length} 媛??꾨뱶???곗씠???낅젰??);
  
  // ?꾩껜 ?먯닔
  const totalTests = testResults.fieldTests.length + testResults.buttonTests.length + testResults.dataTests.length;
  const totalPassed = fieldsPassed + buttonsPassed + dataPassed;
  const score = Math.round((totalPassed / totalTests) * 100);
  
  console.log(`\n?렞 ?꾩껜 ?먯닔: ${score}% (${totalPassed}/${totalTests})`);
  
  if (score >= 90) {
    console.log('?럦 ?곗닔! 異붽??붽툑 湲곕뒫???뺤긽?곸쑝濡?蹂듦뎄?섏뿀?듬땲??');
  } else if (score >= 70) {
    console.log('?몟 ?묓샇! ?遺遺꾩쓽 湲곕뒫???묐룞?⑸땲??');
  } else {
    console.log('?좑툘 媛쒖꽑 ?꾩슂! ?쇰? 湲곕뒫??臾몄젣媛 ?덉뒿?덈떎.');
  }
  
  // ?곸꽭 寃곌낵瑜??꾩뿭 蹂?섎줈 ???
  window.additionalChargesTestResults = testResults;
}

// 5. 硫붿씤 ?뚯뒪???ㅽ뻾
function runComprehensiveTest() {
  try {
    testFieldsExistence();
    testButtons();
    testDataInputOutput();
  } catch (error) {
    console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
    testResults.errors.push(error.message);
    showTestResults();
  }
}

// ?섏씠吏 濡쒕뱶 ?뺤씤 ???뚯뒪???ㅽ뻾
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(runComprehensiveTest, 2000);
  });
} else {
  setTimeout(runComprehensiveTest, 2000);
}

console.log('??2珥????뚯뒪?멸? ?쒖옉?⑸땲??..'); 
