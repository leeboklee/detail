# Scripts Directory Guide

## 📁 폴더 구조

```
scripts/
├── port-management/          # 포트 관리
│   ├── auto-port-manager.js
│   ├── kill-port-safe.bat
│   └── kill-port.bat
├── error-detection/          # 오류 감지
│   └── auto-error-detector.js
├── performance/              # 성능 최적화
│   ├── performance-optimizer.js
│   ├── memory-analysis.js
│   └── memory-monitor.js
├── monitoring/               # 모니터링
│   ├── auto-ui-state-monitor.js
│   ├── auto-loading-detector.js
│   └── monitor-errors.js
├── automation/               # 자동화
│   ├── debug-tools/          # 디버깅 도구
│   │   ├── force-refresh-browser.js
│   │   ├── quick-console-check.js
│   │   ├── capture-console-logs.js
│   │   ├── check-console-playwright.js
│   │   ├── check-console.js
│   │   ├── check-db.js
│   │   ├── capture-screenshot.cjs
│   │   ├── capture-browser-logs.js
│   │   ├── fix-encoding.js
│   │   └── check-server.js
│   ├── ui-fixers/            # UI 수정 도구
│   │   ├── auto-ui-button-fixer.js
│   │   ├── instant-ui-fixer.js
│   │   └── auto-healing-visual-system.js
│   ├── ai-tools/             # AI 도구
│   │   ├── auto-ai-code-fixer.js
│   │   ├── ai-vision-code-fixer.js
│   │   ├── smart-auto-fixer.js
│   │   └── ultimate-auto-fixer.js
│   ├── auto-hydration-fixer.js
│   ├── auto-replace-port.js
│   ├── reset-data.js
│   ├── precise-click.js
│   ├── page-source-debug.js
│   ├── find-input-fields.js
│   ├── find-correct-selectors.js
│   ├── dom-inspector.js
│   ├── dom-analysis.js
│   ├── detailed-analysis.js
│   ├── capture-console-log.js
│   ├── auto-debug-runner.js
│   ├── start-server.js
│   ├── video-cleanup.js
│   └── cleanup_logs.js
├── database/                 # 데이터베이스
│   ├── change-postgres-password.bat
│   └── reset-postgres-password.bat
├── build/                    # 빌드
│   └── replace-alias-to-relative.json
├── testing/                  # 테스트 (향후 확장)
├── utils/                    # 유틸리티
│   ├── cleanup.ps1
│   ├── set-env.bat
│   └── credential-helper-hook.js
└── README.md                 # 이 파일
```

## 🚀 주요 스크립트 사용법

### 포트 관리
```bash
# 포트 상태 확인
npm run port-check

# 포트 킬
npm run port-kill

# 포트 모니터링
npm run port-monitor
```

### 오류 감지
```bash
# 오류 모니터링
npm run error-monitor

# 실시간 오류 감지
npm run error-realtime
```

### 성능 최적화
```bash
# 성능 체크
npm run performance-check

# 메모리 체크
npm run memory-check
```

### 모니터링
```bash
# UI 상태 모니터링
npm run ui-monitor

# 로딩 체크
npm run loading-check
```

### 개발 서버
```bash
# 기본 개발 서버
npm run dev

# 빠른 개발 서버 (터보팩)
npm run dev:fast

# 최대 성능 개발 서버
npm run dev:max

# 디버그 모드
npm run dev:debug
```

## 🔧 직접 실행

### 포트 관리
```bash
node scripts/port-management/auto-port-manager.js check
node scripts/port-management/auto-port-manager.js kill
node scripts/port-management/auto-port-manager.js monitor
```

### 오류 감지
```bash
node scripts/error-detection/auto-error-detector.js monitor
node scripts/error-detection/auto-error-detector.js realtime
```

### 성능 분석
```bash
node scripts/performance/performance-optimizer.js
node scripts/performance/memory-analysis.js
node scripts/performance/memory-monitor.js
```

### UI 모니터링
```bash
node scripts/monitoring/auto-ui-state-monitor.js
node scripts/monitoring/auto-loading-detector.js
```

### 디버깅 도구
```bash
node scripts/automation/debug-tools/quick-console-check.js
node scripts/automation/debug-tools/check-server.js
node scripts/automation/debug-tools/check-db.js
```

### AI 도구
```bash
node scripts/automation/ai-tools/auto-ai-code-fixer.js
node scripts/automation/ai-tools/ai-vision-code-fixer.js
node scripts/automation/ai-tools/smart-auto-fixer.js
```

## 📝 스크립트 추가 가이드

새로운 스크립트를 추가할 때는 적절한 폴더에 배치하세요:

- **포트 관련**: `port-management/`
- **오류 처리**: `error-detection/`
- **성능 최적화**: `performance/`
- **모니터링**: `monitoring/`
- **자동화**: `automation/`
- **UI 수정**: `automation/ui-fixers/`
- **AI 도구**: `automation/ai-tools/`
- **디버깅**: `automation/debug-tools/`
- **데이터베이스**: `database/`
- **빌드**: `build/`
- **유틸리티**: `utils/`

## 🔄 업데이트 히스토리

- **2025-07-28**: 스크립트 폴더 구조화 완료
- 포트 관리, 오류 감지, 성능 최적화, 모니터링 분리
- 자동화 도구를 하위 카테고리로 세분화
- package.json 스크립트 경로 업데이트 