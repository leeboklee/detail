// Manual Korean Input Test Script
console.log('?? Manual Korean Input Test Started');

// 1. Click Room Card
function clickRoomCard() {
  const cards = document.querySelectorAll('.cursor-pointer');
  for (let card of cards) {
    if (card.textContent.includes('媛앹떎 ?뺣낫')) {
      card.click();
      console.log('??Room card clicked');
      return true;
    }
  }
  console.log('??Room card not found');
  return false;
}

// 2. Wait for Modal
function waitForModal() {
  return new Promise((resolve) => {
    const checkModal = () => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal && modal.offsetParent !== null) {
        console.log('??Modal opened');
        resolve(true);
      } else {
        setTimeout(checkModal, 100);
      }
    };
    checkModal();
  });
}

// 3. Analyze Input Fields
function analyzeInputFields() {
  const modal = document.querySelector('[role="dialog"]');
  if (!modal) {
    console.log('??Modal not found');
    return;
  }
  
  const nameInputs = modal.querySelectorAll('input[name="name"]');
  const typeInputs = modal.querySelectorAll('input[name="type"]');
  const allInputs = modal.querySelectorAll('input, textarea');
  
  console.log('?뱤 Input Field Analysis:');
  console.log(`  Total inputs: ${allInputs.length}`);
  console.log(`  Name inputs: ${nameInputs.length}`);
  console.log(`  Type inputs: ${typeInputs.length}`);
  
  nameInputs.forEach((input, i) => {
    console.log(`  Room name ${i + 1}: "${input.value}" (placeholder: "${input.placeholder}")`);
  });
  
  typeInputs.forEach((input, i) => {
    console.log(`  Room type ${i + 1}: "${input.value}" (placeholder: "${input.placeholder}")`);
  });
  
  return { nameInputs, typeInputs, allInputs };
}

// 4. Test Korean Input
async function testKoreanInput(input, value, fieldName) {
  console.log(`?뱷 Testing "${fieldName}" with "${value}"`);
  
  // Focus
  input.focus();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Clear existing value
  input.select();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simulate Korean input
  const events = [];
  
  // compositionstart
  const compositionStart = new CompositionEvent('compositionstart', {
    bubbles: true,
    cancelable: true,
    data: ''
  });
  input.dispatchEvent(compositionStart);
  events.push('compositionstart');
  
  // Input each character
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    
    const inputEvent = new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      data: char,
      inputType: 'insertText'
    });
    
    input.value = value.substring(0, i + 1);
    input.dispatchEvent(inputEvent);
    events.push(`input: "${char}"`);
    
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  // compositionend
  const compositionEnd = new CompositionEvent('compositionend', {
    bubbles: true,
    cancelable: true,
    data: value
  });
  input.dispatchEvent(compositionEnd);
  events.push('compositionend');
  
  // change event
  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true
  });
  input.dispatchEvent(changeEvent);
  events.push('change');
  
  // blur
  await new Promise(resolve => setTimeout(resolve, 200));
  input.blur();
  events.push('blur');
  
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const result = input.value;
  const success = result === value;
  
  console.log(`  Result: "${result}" ${success ? '?? : '??}`);
  console.log(`  Events: ${events.join(' ??')}`);
  
  if (!success) {
    console.log(`  ?좑툘 Expected: "${value}"`);
  }
  
  return success;
}

// 5. Run Full Test
async function runFullTest() {
  console.log('?렞 Running full test');
  
  // Click room card
  if (!clickRoomCard()) return;
  
  // Wait for modal
  await waitForModal();
  
  // Analyze input fields
  const fields = analyzeInputFields();
  if (!fields) return;
  
  // Test cases
  const testCases = [
    { input: fields.nameInputs[0], value: '?붾윮???몄쐢猷?, name: 'First room name' },
    { input: fields.typeInputs[0], value: '?붾툝踰좊뱶', name: 'First room type' }
  ];
  
  let successCount = 0;
  for (const testCase of testCases) {
    if (testCase.input) {
      const success = await testKoreanInput(testCase.input, testCase.value, testCase.name);
      if (success) successCount++;
    }
  }
  
  console.log(`?뢾 Test completed: ${successCount}/${testCases.length} success`);
  
  // Final state check
  setTimeout(() => {
    console.log('?뱤 Final state:');
    analyzeInputFields();
  }, 1000);
}

// Usage
console.log('?뮕 Usage:');
console.log('  runFullTest() - Run full test');
console.log('  clickRoomCard() - Click room card');
console.log('  analyzeInputFields() - Analyze input fields');

// Auto run
setTimeout(() => {
  runFullTest();
}, 1000); 
