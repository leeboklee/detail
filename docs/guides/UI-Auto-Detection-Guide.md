# UI 자동 감지 시스템 사용법

## 개요
이 시스템은 브라우저에서 로딩 스피너나 UI 문제를 자동으로 감지하고 분석하는 도구입니다.

## 사용법

### 1. 로딩 상태 일회성 감지
```bash
npm run ui:detect
```
- 현재 페이지의 로딩 상태를 분석
- 스크린샷과 분석 결과를 파일로 저장
- 결과: `auto-loading-detection.png`, `auto-loading-report.json`

### 2. 실시간 UI 상태 모니터링
```bash
npm run ui:monitor
```
- 5초마다 UI 상태를 체크
- 문제 감지 시 자동으로 해결 시도
- 로그: `ui-monitor-logs.json`, `ui-current-state.json`

### 3. 종합 체크
```bash
npm run ui:check
```
- 일회성 감지 + 실시간 모니터링 순차 실행

## 감지 가능한 문제들

### 1. 로딩 스피너 문제
- **감지**: `.spinner`, `.loading`, `.animate-spin` 등
- **해결**: 스피너가 사라질 때까지 대기

### 2. React 앱 로드 실패
- **감지**: `AppContainer`, `React Root` 없음
- **해결**: 페이지 새로고침

### 3. 빈 페이지 문제
- **감지**: 버튼 0개, DIV 5개 미만
- **해결**: 서버 상태 확인 및 재연결

### 4. 과도한 로딩 텍스트
- **감지**: "Loading", "로딩" 텍스트 3개 이상
- **해결**: 로딩 상태 분석 및 대기

## 결과 파일 설명

### auto-loading-report.json
```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "spinner": {
    "found": true,
    "info": {
      "selector": ".spinner",
      "text": "Loading...",
      "dimensions": { "width": 40, "height": 40 }
    }
  },
  "page": {
    "title": "Hotel Detail App",
    "hasAppContainer": false,
    "loadingTexts": [...]
  },
  "errors": [...]
}
```

### ui-monitor-logs.json
```json
[
  {
    "timestamp": "2024-01-01T12:00:00.000Z",
    "type": "console",
    "level": "log",
    "message": "AppContainer rendering..."
  }
]
```

## 문제 해결 가이드

### 로딩 스피너가 계속 돌 때
1. `npm run ui:detect` 실행
2. 결과 확인 후 서버 재시작: `npm run dev`
3. 포트 충돌 시: `npm run kill-port`

### React 앱이 로드되지 않을 때
1. 빌드 오류 확인: `npm run build`
2. 의존성 재설치: `npm install`
3. 캐시 정리: `npm run clean`

### 페이지가 비어있을 때
1. 서버 상태 확인: `npm run check-port`
2. 포트 킬 후 재시작: `npm run kill-port && npm run dev`
3. 브라우저 캐시 삭제

## 고급 사용법

### 커스텀 감지 규칙 추가
`scripts/auto-ui-state-monitor.js`의 `detectIssues()` 함수 수정:

```javascript
detectIssues(state) {
  const issues = [];
  
  // 커스텀 규칙 추가
  if (state.elements.buttons > 100) {
    issues.push({
      type: 'too_many_buttons',
      severity: 'warning',
      description: '버튼이 너무 많음',
      data: state.elements
    });
  }
  
  return issues;
}
```

### 모니터링 간격 조정
```javascript
constructor() {
  this.checkInterval = 3000; // 3초마다 체크
}
```

## 트러블슈팅

### Playwright 설치 오류
```bash
npm install @playwright/test
npx playwright install chromium
```

### 권한 오류
```bash
# Windows
npm run kill-port:force

# Linux/Mac
sudo npm run ui:detect
```

### 메모리 부족
```bash
# Node.js 메모리 증가
cross-env NODE_OPTIONS="--max-old-space-size=4096" npm run ui:monitor
```

## 자동화 예제

### CI/CD 파이프라인에 추가
```yaml
# .github/workflows/ui-check.yml
- name: UI 상태 체크
  run: npm run ui:detect
- name: 결과 업로드
  uses: actions/upload-artifact@v2
  with:
    name: ui-detection-results
    path: auto-loading-report.json
```

### 스케줄링
```bash
# 매시간 체크 (cron)
0 * * * * cd /path/to/project && npm run ui:detect
```

## 성능 최적화

### 헤드리스 모드 사용
```javascript
const browser = await chromium.launch({ 
  headless: true,  // GUI 없이 실행
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
```

### 병렬 처리
```javascript
// 여러 페이지 동시 모니터링
const pages = await Promise.all([
  browser.newPage(),
  browser.newPage(),
  browser.newPage()
]);
```

## 보안 고려사항

1. **헤드리스 모드**: 프로덕션에서는 반드시 헤드리스 모드 사용
2. **타임아웃 설정**: 무한 대기 방지를 위한 적절한 타임아웃 설정
3. **로그 관리**: 민감한 정보가 로그에 포함되지 않도록 주의
4. **권한 제한**: 필요한 최소 권한만 사용

## 지원 및 문의

문제가 발생하면 다음 순서로 확인:
1. 로그 파일 확인: `ui-monitor-logs.json`
2. 스크린샷 확인: `auto-loading-detection.png`
3. 서버 상태 확인: `npm run check-port`
4. 의존성 확인: `npm list @playwright/test` 