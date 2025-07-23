// 브라우저 콘솔에서 실행할 디버깅 스크립트

// 1. 현재 페이지의 모든 input 요소 확인
console.log('=== 모든 INPUT 요소 확인 ===');
const allInputs = document.querySelectorAll('input');
console.log(`총 input 요소: ${allInputs.length}개`);

allInputs.forEach((input, index) => {
  console.log(`${index}: name="${input.name}" type="${input.type}" placeholder="${input.placeholder}" visible=${input.offsetParent !== null}`);
});

// 2. 객실 정보 섹션 찾기
console.log('\n=== 객실 정보 섹션 확인 ===');
const roomSections = Array.from(document.querySelectorAll('*')).filter(el => 
  el.textContent && el.textContent.includes('객실 정보')
);
console.log(`객실 정보 섹션: ${roomSections.length}개`);
roomSections.forEach((section, index) => {
  console.log(`${index}: ${section.tagName} - ${section.textContent.substring(0, 50)}`);
});

// 3. 가능한 컨테이너들 확인
console.log('\n=== 가능한 컨테이너들 ===');
const containers = document.querySelectorAll('[class*="room"], [class*="modal"], [class*="container"]');
console.log(`컨테이너들: ${containers.length}개`);

// 4. 객실 정보 섹션 클릭 시뮬레이션
console.log('\n=== 객실 정보 섹션 클릭 시뮬레이션 ===');
if (roomSections.length > 0) {
  roomSections[0].click();
  console.log('객실 정보 섹션 클릭됨');
  
  setTimeout(() => {
    console.log('\n=== 클릭 후 재확인 ===');
    const afterInputs = document.querySelectorAll('input');
    console.log(`클릭 후 input 요소: ${afterInputs.length}개`);
    
    afterInputs.forEach((input, index) => {
      console.log(`${index}: name="${input.name}" type="${input.type}" placeholder="${input.placeholder}" visible=${input.offsetParent !== null}`);
    });
    
    // name 속성으로 검색
    const nameInputs = document.querySelectorAll('input[name="name"]');
    const typeInputs = document.querySelectorAll('input[name="type"]');
    console.log(`name="name" 필드: ${nameInputs.length}개`);
    console.log(`name="type" 필드: ${typeInputs.length}개`);
    
  }, 2000);
} else {
  console.log('객실 정보 섹션을 찾을 수 없음');
}

// 5. React 컴포넌트 상태 확인 (가능한 경우)
console.log('\n=== React 상태 확인 시도 ===');
try {
  // React DevTools가 있는 경우
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('React DevTools 감지됨');
  }
} catch (e) {
  console.log('React 상태 확인 불가');
}

console.log('\n=== 디버깅 완료 ===');
console.log('이 스크립트를 브라우저 콘솔(F12)에서 실행하세요.'); 