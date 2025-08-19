# 프로젝트: DetailPage 호텔 정보 관리 시스템

## 기본 정보
- **기술 스택**: Next.js 14 + React 18 + TypeScript + PostgreSQL + Prisma
- **개발 포트**: 3900 (서버), 5432 (DB)
- **데이터베이스**: PostgreSQL (로컬: detailpage_local)
- **UI**: Chakra UI + NextUI + Tailwind CSS
- **상태 관리**: Zustand

## 주요 명령어
```bash
npm run dev          # 개발 서버 시작 (안정성 스크립트 포함)
npm run dev:basic    # 기본 개발 서버
npm run build        # 프로덕션 빌드
npm run lint         # ESLint 실행
npm run type-check   # TypeScript 타입 체크
npm run test:e2e     # Playwright E2E 테스트
npm run db:studio    # Prisma Studio
```

## 프로젝트 구조
- `app/`: Next.js 13+ App Router 구조
- `components/`: React 컴포넌트들
  - `hotel/`: 호텔 정보 관련
  - `room/`: 객실 정보 관련  
  - `booking/`: 예약 관련
  - `cancel/`: 취소 정책
  - `notice/`: 공지사항
  - `package/`: 패키지 정보
- `prisma/`: 데이터베이스 스키마
- `scripts/`: 자동화 스크립트들
- `tests/`: 테스트 파일들

## 데이터베이스 모델
- Hotel: 호텔 기본 정보
- Room: 객실 정보
- Package: 패키지 상품
- Notice: 공지사항
- Session: 세션 관리

## 자주 발생하는 이슈
- 포트 충돌 시: `npm run kill-port`
- 메모리 이슈: NODE_OPTIONS="--max-old-space-size=2048"
- 개발 서버 안정성: `scripts/server-stability.js` 사용

## 코딩 컨벤션
- TypeScript 사용 필수
- ESLint + Prettier 적용
- 컴포넌트는 함수형으로 작성
- CSS Modules 또는 Tailwind 사용