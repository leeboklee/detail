import React from 'react';
// 釉뚮씪?곗? 肄섏넄?먯꽌 ?ㅽ뻾???붾쾭源??ㅽ겕由쏀듃

// 1. ?꾩옱 ?섏씠吏??紐⑤뱺 input ?붿냼 ?뺤씤
console.log('=== 紐⑤뱺 INPUT ?붿냼 ?뺤씤 ===');
const allInputs = document.querySelectorAll('input');
console.log(`珥?input ?붿냼: ${allInputs.length}媛?);

allInputs.forEach((input, index) => {
  console.log(`${index}: name="${input.name}" type="${input.type}" placeholder="${input.placeholder}" visible=${input.offsetParent !== null}`);
});

// 2. 媛앹떎 ?뺣낫 ?뱀뀡 李얘린
console.log('\n=== 媛앹떎 ?뺣낫 ?뱀뀡 ?뺤씤 ===');
const roomSections = Array.from(document.querySelectorAll('*')).filter(el => 
  el.textContent && el.textContent.includes('媛앹떎 ?뺣낫')
);
console.log(`媛앹떎 ?뺣낫 ?뱀뀡: ${roomSections.length}媛?);
roomSections.forEach((section, index) => {
  console.log(`${index}: ${section.tagName} - ${section.textContent.substring(0, 50)}`);
});

// 3. 媛?ν븳 而⑦뀒?대꼫???뺤씤
console.log('\n=== 媛?ν븳 而⑦뀒?대꼫??===');
const containers = document.querySelectorAll('[class*="room"], [class*="modal"], [class*="container"]');
console.log(`而⑦뀒?대꼫?? ${containers.length}媛?);

// 4. 媛앹떎 ?뺣낫 ?뱀뀡 ?대┃ ?쒕??덉씠??
console.log('\n=== 媛앹떎 ?뺣낫 ?뱀뀡 ?대┃ ?쒕??덉씠??===');
if (roomSections.length > 0) {
  roomSections[0].click();
  console.log('媛앹떎 ?뺣낫 ?뱀뀡 ?대┃??);
  
  setTimeout(() => {
    console.log('\n=== ?대┃ ???ы솗??===');
    const afterInputs = document.querySelectorAll('input');
    console.log(`?대┃ ??input ?붿냼: ${afterInputs.length}媛?);
    
    afterInputs.forEach((input, index) => {
      console.log(`${index}: name="${input.name}" type="${input.type}" placeholder="${input.placeholder}" visible=${input.offsetParent !== null}`);
    });
    
    // name ?띿꽦?쇰줈 寃??
    const nameInputs = document.querySelectorAll('input[name="name"]');
    const typeInputs = document.querySelectorAll('input[name="type"]');
    console.log(`name="name" ?꾨뱶: ${nameInputs.length}媛?);
    console.log(`name="type" ?꾨뱶: ${typeInputs.length}媛?);
    
  }, 2000);
} else {
  console.log('媛앹떎 ?뺣낫 ?뱀뀡??李얠쓣 ???놁쓬');
}

// 5. React 而댄룷?뚰듃 ?곹깭 ?뺤씤 (媛?ν븳 寃쎌슦)
console.log('\n=== React ?곹깭 ?뺤씤 ?쒕룄 ===');
try {
  // React DevTools媛 ?덈뒗 寃쎌슦
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools 媛먯???);
  }
} catch (e) {
  console.log('React ?곹깭 ?뺤씤 遺덇?');
}

console.log('\n=== ?붾쾭源??꾨즺 ===');
console.log('???ㅽ겕由쏀듃瑜?釉뚮씪?곗? 肄섏넄(F12)?먯꽌 ?ㅽ뻾?섏꽭??'); 
