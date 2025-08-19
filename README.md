# Detail Project

## 🚀 PostgreSQL 마이그레이션 완료!

### 📋 변경사항
- **SQLite** → **PostgreSQL**로 데이터베이스 변경
- Vercel 배포 호환성 확보

### 🔧 환경설정

#### 1. 환경변수 설정
`.env.local` 파일 생성:
```bash
DATABASE_URL="postgresql://username:password@localhost:5432/detail_db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3900"
```

#### 2. PostgreSQL 설치
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# https://www.postgresql.org/download/windows/
```

#### 3. 데이터베이스 생성
```bash
sudo -u postgres psql
CREATE DATABASE detail_db;
CREATE USER detail_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE detail_db TO detail_user;
\q
```

#### 4. 의존성 설치
```bash
npm install
npm install pg @types/pg
```

#### 5. Prisma 설정
```bash
# 스키마 동기화
npx prisma db push

# 클라이언트 생성
npx prisma generate
```

### 🚀 개발 서버 실행
```bash
npm run dev
```

### 📦 Vercel 배포
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

### 🔄 데이터 마이그레이션 (기존 SQLite 데이터가 있는 경우)
```bash
node scripts/migrate-to-postgres.js
```

## 📁 프로젝트 구조
```
detail/
├── app/                 # Next.js 앱 라우터
├── components/          # React 컴포넌트
├── prisma/             # 데이터베이스 스키마
├── scripts/            # 유틸리티 스크립트
└── package.json        # 프로젝트 의존성
``` 