#!/usr/bin/env node

/**
 * 1인 개발자를 위한 개발 환경 최적화 스크립트
 * 빠른 개발을 위한 모든 설정을 자동으로 적용
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 1인 개발자용 개발 환경 최적화를 시작합니다...\n');

// 1. .next 폴더 정리 (캐시 최적화)
console.log('1️⃣ .next 폴더 최적화...');
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  try {
    // 캐시 폴더만 유지
    const cacheDir = path.join(nextDir, 'cache');
    if (fs.existsSync(cacheDir)) {
      console.log('   💾 캐시 폴더 유지');
    }
    
    // node_modules 캐시 정리
    const nodeCacheDir = path.join(process.cwd(), 'node_modules', '.cache');
    if (fs.existsSync(nodeCacheDir)) {
      fs.rmSync(nodeCacheDir, { recursive: true, force: true });
      console.log('   🗑️ node_modules 캐시 정리 완료');
    }
    
    console.log('   ✅ .next 폴더 최적화 완료');
  } catch (error) {
    console.log('   ⚠️ 최적화 중 일부 오류 발생 (계속 진행)');
  }
}

// 2. 메모리 최적화 확인
console.log('\n2️⃣ 메모리 최적화 확인...');
const used = process.memoryUsage();
const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024 * 100) / 100;
const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024 * 100) / 100;

console.log(`   📊 현재 메모리: ${heapUsedMB}MB / ${heapTotalMB}MB`);
if (heapUsedMB > 1000) {
  console.log('   ⚠️ 메모리 사용량이 높습니다. 서버 재시작을 권장합니다.');
} else {
  console.log('   ✅ 메모리 사용량 정상');
}

// 3. 포트 상태 확인
console.log('\n3️⃣ 포트 상태 확인...');
try {
  const portCheck = execSync('lsof -i :3900', { encoding: 'utf8' });
  if (portCheck.includes('LISTEN')) {
    console.log('   🔴 포트 3900이 이미 사용 중입니다.');
    console.log('   💡 기존 서버를 종료하고 새로 시작하세요.');
  } else {
    console.log('   ✅ 포트 3900 사용 가능');
  }
} catch (error) {
  console.log('   ✅ 포트 3900 사용 가능');
}

// 4. 성능 팁 제공
console.log('\n4️⃣ 1인 개발자용 성능 팁:');
console.log('   🚀 npm run dev - 기본 최적화된 개발 서버');
console.log('   📝 코드 변경 시 자동 새로고침');
console.log('   💾 파일시스템 캐시로 빠른 로딩');
console.log('   🔧 린트 및 타입체크 비활성화로 빠른 컴파일');
console.log('   📱 모바일 테스트는 Network URL 사용');

// 5. 빠른 시작 명령어
console.log('\n🎯 최적화 완료! 이제 다음 명령어로 시작하세요:');
console.log('   npm run dev');
console.log('\n💡 추가 팁:');
console.log('   - 브라우저에서 http://localhost:3900 접속');
console.log('   - 코드 변경 시 자동으로 새로고침됨');
console.log('   - 문제 발생 시 Ctrl+C로 서버 재시작');
console.log('   - 정기적으로 이 스크립트 실행하여 최적화 유지');

console.log('\n✨ 1인 개발자도 빠르게 개발할 수 있습니다!');
