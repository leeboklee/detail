const Service = require('node-windows').Service;
const path = require('path');

// Windows 서비스 생성
const svc = new Service({
  name: 'DetailApp',
  description: 'Detail Page Next.js Development Server',
  script: path.join(__dirname, '..', 'node_modules', '.bin', 'next'),
  scriptOptions: 'dev -p 3900',
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: [
    {
      name: "NODE_ENV",
      value: "development"
    },
    {
      name: "PORT",
      value: "3900"
    }
  ]
});

// 서비스 이벤트 리스너
svc.on('install', function() {
  console.log('✅ Windows 서비스 설치 완료');
  svc.start();
});

svc.on('alreadyinstalled', function() {
  console.log('⚠️ 서비스가 이미 설치되어 있습니다');
});

svc.on('start', function() {
  console.log('🚀 서비스 시작됨');
});

svc.on('stop', function() {
  console.log('🛑 서비스 중지됨');
});

svc.on('uninstall', function() {
  console.log('🗑️ 서비스 제거됨');
});

svc.on('error', function(err) {
  console.error('❌ 서비스 오류:', err);
});

// 명령행 인수 처리
const command = process.argv[2];

switch (command) {
  case 'install':
    console.log('🔧 Windows 서비스 설치 중...');
    svc.install();
    break;
    
  case 'uninstall':
    console.log('🗑️ Windows 서비스 제거 중...');
    svc.uninstall();
    break;
    
  case 'start':
    console.log('🚀 Windows 서비스 시작 중...');
    svc.start();
    break;
    
  case 'stop':
    console.log('🛑 Windows 서비스 중지 중...');
    svc.stop();
    break;
    
  case 'restart':
    console.log('🔄 Windows 서비스 재시작 중...');
    svc.restart();
    break;
    
  default:
    console.log('사용법:');
    console.log('  node scripts/windows-service.js install   - 서비스 설치');
    console.log('  node scripts/windows-service.js uninstall - 서비스 제거');
    console.log('  node scripts/windows-service.js start     - 서비스 시작');
    console.log('  node scripts/windows-service.js stop      - 서비스 중지');
    console.log('  node scripts/windows-service.js restart   - 서비스 재시작');
    break;
} 