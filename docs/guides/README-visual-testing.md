# 🎨 Visual Regression Testing 가이드

## 개요
디자인이 깨지는 문제를 자동으로 감지하는 Visual Regression Testing 도구입니다.

## 🚀 사용법

### 1. 기본 Visual Testing
```bash
# 첫 실행 (베이스라인 생성)
node advanced-visual-comparison.js

# 두 번째 실행부터 (비교 테스트)
node advanced-visual-comparison.js
```

### 2. Playwright Native Testing
```bash
# 전체 visual regression test 실행
npx playwright test visual-regression-test.js

# HTML 리포트 보기
npx playwright show-report
```

### 3. 베이스라인 재생성
디자인 변경이 의도된 경우 베이스라인을 다시 생성:
```bash
node advanced-visual-comparison.js --baseline
```

## 📁 파일 구조

```
├── baseline-screenshots/    # 기준 이미지들
├── current-screenshots/     # 현재 상태 이미지들  
├── diff-screenshots/        # 차이점 이미지들
├── visual-regression-test.js # Playwright 테스트
└── advanced-visual-comparison.js # 고급 비교 도구
```

## 🔍 테스트 항목

### 전체 페이지
- ✅ Desktop (1920x1080)
- ✅ Tablet (768x1024) 
- ✅ Mobile (375x667)

### 개별 컴포넌트
- ✅ Header 섹션
- ✅ Main Grid
- ✅ 각 카드 (9개)

### 상태별 테스트
- ✅ 기본 상태
- ✅ 호버 상태
- ✅ 모달 열림 상태

## ⚙️ 설정

### 허용 오차 설정
`advanced-visual-comparison.js`에서 수정:
```javascript
// 0.1% 미만 차이면 일치로 간주
match: diffPercentage < 0.1
```

### Playwright 설정
`playwright.config.js`에서 수정:
```javascript
expect: {
  toHaveScreenshot: { 
    threshold: 0.2  // 20% 허용 오차
  }
}
```

## 🛠 문제 해결

### 1. 디자인 깨짐 감지시
1. `diff-screenshots/` 폴더의 차이점 이미지 확인
2. 의도된 변경인지 확인
3. 의도된 변경이면 베이스라인 재생성
4. 의도되지 않은 변경이면 코드 수정

### 2. 폰트 로딩 이슈
```javascript
await page.waitForLoadState('networkidle');
// 또는
await page.waitForFunction(() => document.fonts.ready);
```

### 3. 애니메이션 이슈
```javascript
animations: 'disabled'
reducedMotion: 'reduce'
```

## 📊 결과 해석

### 통과 (✅)
- 차이가 허용 범위 내
- UI가 안정적

### 실패 (❌)  
- 의도되지 않은 디자인 변경 감지
- CSS 오류 가능성
- 레이아웃 깨짐 발생

## 🎯 Best Practices

1. **정기적 실행**: 코드 변경 후 매번 실행
2. **CI/CD 통합**: GitHub Actions 등에 통합
3. **베이스라인 관리**: 의도된 변경시에만 베이스라인 업데이트
4. **허용 오차 조정**: 프로젝트 특성에 맞게 임계값 설정
5. **반응형 테스트**: 다양한 해상도에서 테스트

## 📈 CI/CD 통합 예시

```yaml
# .github/workflows/visual-testing.yml
name: Visual Regression Testing

on: [push, pull_request]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run dev &
      - run: sleep 10
      - run: node advanced-visual-comparison.js
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: visual-test-results
          path: |
            diff-screenshots/
            current-screenshots/
```

## 🔧 고급 기능

### 1. 커스텀 선택자 테스트
```javascript
// 특정 컴포넌트만 테스트
await page.locator('.my-component').screenshot({
  path: 'my-component.png'
});
```

### 2. 동적 데이터 마스킹
```javascript
// 시간 등 동적 데이터 숨기기
await page.addStyleTag({
  content: '.timestamp { visibility: hidden; }'
});
```

### 3. 조건부 테스트
```javascript
// 특정 조건에서만 테스트
if (process.env.NODE_ENV === 'production') {
  // 프로덕션 환경에서만 실행
}
``` 

## 🐞 Playwright 디버깅/헤드리스 실행 가이드

### 1. 헤드리스/헤디드 모드 실행
```bash
# 헤드리스(기본, UI 없이 빠르게 실행)
npx playwright test visual-regression-test.js

# UI(브라우저)로 직접 보면서 실행
yarn playwright test visual-regression-test.js --headed
npx playwright test visual-regression-test.js --headed
```

### 2. 테스트 실패 시 자동 스크린샷/콘솔 로그 확인
- 실패한 테스트는 test-results/ 폴더에 스크린샷, 콘솔 로그가 자동 저장됨
- diff 이미지, actual 이미지, 콘솔 로그 파일을 참고해 원인 추적

### 3. 객실 정보 탭 입력폼이 안 뜨는 경우 실무 점검법
- rooms 데이터가 undefined/null/빈 배열이면 입력폼이 반드시 1개 이상 자동 생성되어야 함
- admin.js 등 상위에서 value 전달이 잘못되면 입력폼이 안 뜰 수 있음
- 탭 클릭 시 setActiveTab, onModalOpen 등 이벤트가 실제로 호출되는지 콘솔로 확인
- RoomInfoEditor 내부 useEffect, props 전달, 상태 관리 구조를 점검
- 코드/상태/이벤트 연결이 정상이어야 입력폼이 항상 보임

### 4. 실무 디버깅 팁
- Playwright --debug 옵션으로 step-by-step 실행 가능
- 테스트 코드에 page.screenshot, page.on('console') 등 직접 추가해도 됨
- UI가 안 뜨면 반드시 상위 value/props/state 전달부터 점검 

## 📝 실무 UI/UX 요구사항 및 구조적 문제 해결 가이드

- **UI/UX 요구사항:**
  - 상단 탭(예: '호텔 정보', '객실 정보', '공지사항') 클릭만으로 입력폼/팝업(Modal)이 반드시 즉시 떠야 함
  - 추가적인 카드 클릭 등 별도 액션 없이, 탭 클릭만으로 바로 입력·수정이 가능해야 함

- **구조적 문제 및 해결법:**
  1. 기존에는 탭 클릭 후 카드 등 추가 클릭이 필요해 입력폼/팝업이 안 뜨는 문제가 있었음
  2. 해결법: 탭 클릭 핸들러에서 setActiveTab과 onModalOpen을 동시에 실행하도록 코드 수정
     ```js
     const handleTabClick = (tab) => {
       setActiveTab(tab.key);
       if (tab.key === 'rooms' || tab.key === 'hotel' || tab.key === 'notice') {
         onModalOpen();
       }
     };
     // ...
     <button onClick={() => handleTabClick(tab)} ...>
     ```
  3. Playwright 테스트에서도 탭 클릭 후 입력폼/팝업/필드가 실제로 보이는지 expect로 명확히 체크해야 함

- **실무 점검 포인트:**
  - 탭 클릭만으로 입력폼/팝업이 안 뜨면, 반드시 이벤트 연결/상태 전달/렌더링 조건을 점검
  - 테스트와 실제 UI 모두에서 동일하게 동작하는지 수동·자동으로 함께 확인

## ⚠️ 실사용/자동화 테스트와 실제 UI 점검 가이드

- Playwright 테스트는 단순 스크린샷 비교가 아니라, '탭 클릭 → 팝업/입력폼/필드가 실제로 보이는지'까지 자동으로 검증해야 함
- 실제 브라우저에서도 탭 클릭 시 팝업/입력폼/필드가 반드시 떠야 하며, 안 뜨면 아래를 점검
  1. 상위 value/props/state 전달이 올바른지 (예: rooms, hotelData 등)
  2. 탭 클릭 이벤트(setActiveTab, onModalOpen 등)가 실제로 호출되는지
  3. 모달/팝업/입력폼의 렌더링 조건(useEffect, 조건부 렌더링 등)이 정상인지
- Playwright 테스트가 실패하면 실제 UI도 동일하게 동작하지 않을 확률이 높으니, 테스트와 수동 클릭 결과를 반드시 함께 확인
- 테스트 코드에 expect(locator).toBeVisible() 등으로 실제 UI 요소가 보이는지 명시적으로 체크할 것
- 수동 점검 시에도 '버튼 클릭 → 팝업/입력폼/필드가 실제로 보이는지'를 반드시 확인

## 🚫 Playwright HTML 리포트 자동 실행 끄기

- Playwright는 기본적으로 테스트 후 HTML 리포트를 자동으로 띄움
- 리포트 자동 실행을 끄고 싶으면 아래처럼 실행:

```bash
npx playwright test --reporter=list
npx playwright test --reporter=dot
```

- 또는 playwright.config.js에서 reporter 옵션을 'list', 'dot', 'line' 등으로 변경

```js
reporter: 'list', // 또는 'dot', 'line' 등
```

- 필요할 때만 수동으로 리포트 확인:
```bash
npx playwright show-report
``` 

- **섹션별 렌더링 지침:**
  - '호텔 정보', '객실 정보', '공지사항' 등 각 섹션에서 탭 클릭만으로 입력폼/팝업이 반드시 렌더링되어야 함
  - 렌더링 조건(useEffect, 조건부 렌더링 등), value/props/state 전달, 이벤트 연결(setActiveTab, onModalOpen 등)이 모두 정상이어야 함
  - Playwright 테스트에서 해당 섹션의 입력폼/필드/팝업이 실제로 DOM에 존재하고 visible해야 통과
  - 테스트 실패 시, 각 섹션의 렌더링 조건/상태 전달/이벤트 연결을 집중적으로 점검·수정할 것

- **입력폼 렌더링 실무 지침:**
  - 각 섹션(호텔 정보, 객실 정보, 공지사항 등) 컴포넌트는 value/props/state가 undefined/null이어도 입력폼이 항상 렌더링되도록 보장해야 함
  - 상위(admin.js 등)에서 각 섹션에 value를 반드시 올바르게 전달해야 함
  - 공지사항 등 누락된 섹션은 파일/컴포넌트/연결을 반드시 추가해야 함
  - Playwright 테스트는 입력폼/필드/팝업이 실제로 보이는지 명시적으로 체크해야 함

- **모든 섹션 점검 및 오류 해결 실무 지침:**
  - 호텔 정보, 객실 정보, 공지사항 등 모든 섹션에서 탭 클릭만으로 입력폼/팝업이 반드시 렌더링되어야 함
  - 각 섹션 컴포넌트는 value/props/state가 undefined/null이어도 입력폼이 항상 보이도록 설계
  - 상위(admin.js 등)에서 각 섹션에 value를 반드시 올바르게 전달해야 함
  - 각 섹션의 파일/컴포넌트/연결이 누락되지 않았는지 반드시 점검·보완
  - Playwright 테스트는 모든 섹션에서 입력폼/필드/팝업이 실제로 보이는지 명시적으로 체크해야 함
  - 테스트 실패 시, 해당 섹션의 렌더링 조건/상태 전달/이벤트 연결/파일 누락 여부를 집중적으로 점검·수정할 것

- **빠른 오류 해결 실무 지침:**
  - 호텔 정보, 객실 정보, 공지사항 등 핵심 섹션만 test.only로 집중 테스트하면 빠르게 디버깅 가능
  - 나머지 섹션도 동일 구조로 test로 확장하면 전체 UI/입력폼/팝업 오류를 자동으로 빠르게 잡을 수 있음
  - Playwright 테스트에서 test.only → test로 바꾸면 전체 섹션 자동 검증
  - 실무에선 필요한 섹션만 빠르게 점검하고, 전체 확장도 쉽게 가능

- **Playwright selector 실무 지침:**
  - expect(locator)는 항상 한 개만 매칭되는 구체적 selector(placeholder, id, label 등)로 작성해야 함
  - 입력폼/필드가 실제로 렌더링되는지, name/id/placeholder 등 selector가 일치하는지 코드와 테스트를 동시에 점검해야 함
  - 여러 개 매칭(strict mode violation) 오류가 나면 selector를 더 구체적으로 수정

- **데이터 구조 일치 실무 지침:**
  - 초기 데이터(INITIAL_DATA)와 상위 value의 구조(필드명, 타입, 배열/객체 형태)가 실제 컴포넌트가 기대하는 구조와 100% 일치하는지 반드시 점검·매핑할 것
  - 구조가 다르면 입력폼이 렌더링되지 않거나, map 등에서 undefined로 처리될 수 있으니 항상 체크

- **데이터 구조 검증 및 오류 점검 실무 지침:**
  - Playwright 테스트와 실제 UI에서 입력폼이 실제로 뜨는지, selector 오류 없이 통과하는지 반드시 검증
  - 테스트 실패 시 데이터 구조(필드명, 타입, 배열/객체 형태)가 컴포넌트 기대와 일치하는지 코드와 UI에서 동시 점검
  - 구조가 다르면 입력폼이 렌더링되지 않거나, map 등에서 undefined로 처리될 수 있으니 항상 체크

- **Selector/렌더링 타이밍 실무 지침:**
  - Playwright selector(placeholder, id, name 등)는 실제 코드와 한 글자도 다르지 않게 반드시 일치시킬 것
  - 렌더링 타이밍/비동기 이슈가 있을 땐 waitForTimeout, waitForSelector 등으로 충분히 대기하며 테스트
  - 테스트 실패 시 selector 오타/불일치, 렌더링 지연, 비동기 이슈까지 코드와 테스트에서 동시 점검
