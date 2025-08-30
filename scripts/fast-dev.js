#!/usr/bin/env node

/**
 * 빠른 개발 서버 실행 스크립트
 * 최적화된 설정으로 Next.js 개발 서버를 실행
 */

const { spawn } = require('child_process');
const path = require('path');

// 환경 변수 설정
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_SHARP_PATH = '0';
process.env.NEXT_SKIP_LOCKFILE_CHECK = '1';
process.env.FAST_REFRESH = 'true';
process.env.NODE_OPTIONS = '--max-old-space-size=4096 --max-semi-space-size=512';

console.log('🚀 빠른 개발 서버를 시작합니다...');
console.log('📊 메모리 최적화: 4GB');
console.log('⚡ Turbopack 활성화');
console.log('🔄 빠른 새로고침 활성화');
console.log('📝 린트 및 타입체크 비활성화');

// Next.js 개발 서버 실행
const devProcess = spawn('npx', [
  'next',
  'dev',
  '-H', '::',
  '-p', '3900',
  '--turbo',
  '--no-lint',
  '--no-typecheck'
], {
  stdio: 'inherit',
  env: process.env,
  cwd: process.cwd()
});

// 프로세스 종료 처리
devProcess.on('close', (code) => {
  console.log(`\n🛑 개발 서버가 종료되었습니다. (코드: ${code})`);
  process.exit(code);
});

devProcess.on('error', (error) => {
  console.error('❌ 개발 서버 실행 오류:', error);
  process.exit(1);
});

// 시그널 처리
process.on('SIGINT', () => {
  console.log('\n🛑 개발 서버를 종료합니다...');
  devProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 개발 서버를 종료합니다...');
  devProcess.kill('SIGTERM');
});
