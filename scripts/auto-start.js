#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 nodemon 자동 서버 시작 스크립트 실행 중...');
console.log('📡 파일 변경 시 자동 재시작됩니다.');
console.log('⚠️ Ctrl+C로 중단해도 3초 후 자동으로 다시 시작됩니다.');

function startServer() {
  console.log('📡 Next.js 서버 시작 중...');
  
  // nodemon 사용하여 자동 재시작
  const server = spawn('npx', ['nodemon', '--config', './nodemon.json'], {
    stdio: 'inherit',
    cwd: __dirname + '/..',
    shell: true
  });

  server.on('error', (error) => {
    console.error('❌ 서버 시작 오류:', error.message);
    console.log('⏳ 3초 후 재시작...');
    setTimeout(startServer, 3000);
  });

  server.on('exit', (code) => {
    console.log(`⚠️ 서버 종료됨 (코드: ${code}), 3초 후 재시작...`);
    setTimeout(startServer, 3000);
  });

  // Ctrl+C 처리 - 자동 재시작
  process.on('SIGINT', () => {
    console.log('\n🛑 서버 중지 중...');
    console.log('⏳ 3초 후 자동으로 다시 시작됩니다...');
    server.kill('SIGINT');
    
    // 3초 후 자동 재시작
    setTimeout(() => {
      console.log('🔄 자동 재시작 중...');
      startServer();
    }, 3000);
  });

  // SIGTERM 처리 - 자동 재시작
  process.on('SIGTERM', () => {
    console.log('\n🛑 서버 종료 신호 수신...');
    console.log('⏳ 3초 후 자동으로 다시 시작됩니다...');
    server.kill('SIGTERM');
    
    // 3초 후 자동 재시작
    setTimeout(() => {
      console.log('🔄 자동 재시작 중...');
      startServer();
    }, 3000);
  });
}

startServer();
