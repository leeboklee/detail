# Node.js 20 Alpine 이미지 사용 (가장 가벼운 버전)
FROM node:20-alpine

# 시스템 패키지 최소화
RUN apk add --no-cache curl

# 작업 디렉토리 설정
WORKDIR /app

# 패키지 파일만 복사 (캐시 최적화)
COPY package*.json ./

# 개발 의존성만 설치 (프로덕션 빌드 제외)
RUN npm ci --only=development && npm cache clean --force

# 개발 환경 설정
ENV NODE_ENV=development
ENV PORT=3900
ENV NODE_OPTIONS=--max-old-space-size=512

# 개발 서버 실행 (빌드 없이)
CMD ["npm", "run", "dev:basic"]

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3900/api/health || exit 1 