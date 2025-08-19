#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 포트 설정 관리 스크립트
class PortManager {
  constructor() {
    this.configFile = path.join(__dirname, '../../.port-config.json');
    this.defaultPort = 3900;
  }

  // 현재 포트 가져오기
  getCurrentPort() {
    if (process.env.PORT) {
      return process.env.PORT;
    }
    
    if (fs.existsSync(this.configFile)) {
      try {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        return config.port || this.defaultPort;
      } catch (error) {
        console.warn('포트 설정 파일 읽기 실패:', error.message);
      }
    }
    
    return this.defaultPort;
  }

  // 포트 설정
  setPort(port) {
    const portNum = parseInt(port);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.error('❌ 유효하지 않은 포트 번호:', port);
      console.log('포트는 1-65535 사이의 숫자여야 합니다.');
      return false;
    }

    const config = {
      port: portNum,
      updatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };

    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
      console.log(`✅ 포트가 ${portNum}으로 설정되었습니다.`);
      console.log(`📝 설정 파일: ${this.configFile}`);
      return true;
    } catch (error) {
      console.error('❌ 포트 설정 실패:', error.message);
      return false;
    }
  }

  // 포트 정보 표시
  showPortInfo() {
    const currentPort = this.getCurrentPort();
    console.log('🔧 포트 설정 정보:');
    console.log(`- 현재 포트: ${currentPort}`);
    console.log(`- 환경변수 PORT: ${process.env.PORT || '설정되지 않음'}`);
    console.log(`- 설정 파일: ${this.configFile}`);
    
    if (fs.existsSync(this.configFile)) {
      try {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        console.log(`- 마지막 업데이트: ${config.updatedAt}`);
        console.log(`- 환경: ${config.environment}`);
      } catch (error) {
        console.log('- 설정 파일 읽기 실패');
      }
    } else {
      console.log('- 설정 파일 없음 (기본값 사용)');
    }
  }

  // 포트 변경 안내
  showUsage() {
    console.log('📖 포트 설정 사용법:');
    console.log('');
    console.log('1. 포트 설정:');
    console.log('   npm run port:set -- 3000');
    console.log('   node scripts/port-management/set-port.js 3000');
    console.log('');
    console.log('2. 현재 포트 확인:');
    console.log('   npm run port:show');
    console.log('   node scripts/port-management/set-port.js --show');
    console.log('');
    console.log('3. 환경변수로 포트 설정:');
    console.log('   PORT=3000 npm run dev');
    console.log('');
    console.log('4. 서버 시작:');
    console.log('   npm run dev  # 설정된 포트로 시작');
    console.log('   PORT=3000 npm run dev  # 특정 포트로 시작');
  }
}

// 메인 실행
const portManager = new PortManager();
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  portManager.showUsage();
} else if (args.includes('--show') || args.includes('-s')) {
  portManager.showPortInfo();
} else {
  const port = args[0];
  if (portManager.setPort(port)) {
    console.log('');
    console.log('🚀 서버를 시작하려면:');
    console.log(`   npm run dev`);
    console.log(`   또는 PORT=${port} npm run dev`);
  }
}

module.exports = PortManager; 