#!/usr/bin/env node

/**
 * 초고속 개발 서버 시작 스크립트
 * 모든 최적화를 적용하여 빠르게 시작
 */

const { spawn } = require('child_process');

console.log('🚀 초고속 개발 서버를 시작합니다...\n');

// 최적화된 환경 변수 설정
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.NEXT_SHARP_PATH = '0';
process.env.NEXT_SKIP_LOCKFILE_CHECK = '1';
process.env.NODE_OPTIONS = '--max-old-space-size=2048 --max-semi-space-size=256 --optimize-for-size';

console.log('📊 메모리 최적화: 2GB (빠른 시작용)');
console.log('⚡ Turbopack 활성화');
console.log('🔧 소스맵 비활성화');
console.log('📝 린트 및 타입체크 비활성화');
console.log('💾 캐시 최적화');

// Next.js 개발 서버 실행 (최적화된 설정)
const devProcess = spawn('npx', [
  'next',
  'dev',
  '-H', '::',
  '-p', '3900',
  '--turbo',
  '--no-lint',
  '--no-typecheck',
  '--no-source-maps'
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

console.log('\n⏱️ 서버 시작 중... 잠시만 기다려주세요.');
console.log('💡 팁: 첫 실행 후에는 훨씬 빨라집니다!');
