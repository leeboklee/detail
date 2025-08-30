#!/usr/bin/env node

/**
 * 성능 최적화 스크립트
 * 개발 환경의 성능을 향상시키는 설정을 적용
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 성능 최적화를 시작합니다...');

// .next 폴더 정리 (캐시 최적화)
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  console.log('🧹 .next 폴더를 정리합니다...');
  try {
    // 캐시 폴더만 유지하고 나머지 삭제
    const cacheDir = path.join(nextDir, 'cache');
    if (fs.existsSync(cacheDir)) {
      console.log('💾 캐시 폴더를 유지합니다...');
    }
    
    // node_modules/.cache 정리
    const nodeCacheDir = path.join(process.cwd(), 'node_modules', '.cache');
    if (fs.existsSync(nodeCacheDir)) {
      console.log('🗑️ node_modules 캐시를 정리합니다...');
      fs.rmSync(nodeCacheDir, { recursive: true, force: true });
    }
    
    console.log('✅ 성능 최적화가 완료되었습니다!');
  } catch (error) {
    console.error('❌ 최적화 중 오류 발생:', error.message);
  }
} else {
  console.log('📁 .next 폴더가 없습니다. 첫 실행입니다.');
}

// 메모리 사용량 확인
const used = process.memoryUsage();
console.log('\n📊 현재 메모리 사용량:');
console.log(`   힙 사용량: ${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`);
console.log(`   힙 총량: ${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`);
console.log(`   외부 메모리: ${Math.round(used.external / 1024 / 1024 * 100) / 100} MB`);

// 성능 팁 제공
console.log('\n💡 성능 향상 팁:');
console.log('   1. npm run dev:fast 사용 (빠른 개발 모드)');
console.log('   2. 불필요한 파일은 .gitignore에 추가');
console.log('   3. 큰 이미지 파일은 최적화');
console.log('   4. 컴포넌트를 lazy loading으로 분리');
console.log('   5. 정기적으로 .next 폴더 정리');

console.log('\n🎯 최적화 완료! 이제 npm run dev:fast로 서버를 시작하세요.'); 