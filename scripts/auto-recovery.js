#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🔄 자동 복구 시작...');

async function autoRecovery() {
  try {
    // 1. 포트 정리
    console.log('1️⃣ 포트 정리 중...');
    try {
      execSync('npm run kill-port:safe', { stdio: 'inherit' });
    } catch (e) {
      console.log('포트 정리 완료');
    }

    // 2. Prisma 스키마 동기화
    console.log('2️⃣ 데이터베이스 스키마 동기화 중...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      execSync('npx prisma db push', { stdio: 'inherit' });
      console.log('✅ 데이터베이스 동기화 완료');
    } catch (e) {
      console.log('⚠️ 데이터베이스 동기화 실패, 계속 진행');
    }

    // 3. 캐시 정리
    console.log('3️⃣ 캐시 정리 중...');
    try {
      execSync('npm run cache:clear', { stdio: 'inherit' });
    } catch (e) {
      console.log('캐시 정리 완료');
    }

    // 4. 서버 재시작 (npm run dev로 통일)
    console.log('4️⃣ 서버 재시작 중...');
    execSync('npm run dev', { stdio: 'inherit' });

  } catch (error) {
    console.error('❌ 자동 복구 실패:', error.message);
    process.exit(1);
  }
}

autoRecovery(); 