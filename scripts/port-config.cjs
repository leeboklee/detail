const fs = require('fs');
const path = require('path');

class PortConfig {
  constructor() {
    this.configFile = path.join(process.cwd(), 'port-config.json');
    this.defaultPort = 3900;
  }

  loadConfig() {
    try {
      if (fs.existsSync(this.configFile)) {
        const config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
        return config;
      }
    } catch (error) {
      console.log('⚠️ 설정 파일 로드 실패, 기본값 사용');
    }
    
    return { port: this.defaultPort };
  }

  saveConfig(config) {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(config, null, 2));
      console.log('✅ 포트 설정 저장 완료');
    } catch (error) {
      console.log('❌ 포트 설정 저장 실패:', error.message);
    }
  }

  setPort(newPort) {
    const config = this.loadConfig();
    config.port = parseInt(newPort);
    this.saveConfig(config);
    
    console.log(`🔧 포트 변경: ${newPort}`);
    console.log('💡 윈도우 서비스를 재설치해야 합니다:');
    console.log('   npm run service:uninstall');
    console.log('   npm run service:install');
  }

  getPort() {
    const config = this.loadConfig();
    return config.port;
  }

  showCurrentPort() {
    const port = this.getPort();
    console.log(`📊 현재 포트: ${port}`);
    return port;
  }
}

// CLI 사용법
async function main() {
  const args = process.argv.slice(2);
  const config = new PortConfig();
  
  switch (args[0]) {
    case 'set':
      if (args[1]) {
        config.setPort(args[1]);
      } else {
        console.log('❌ 포트 번호를 입력해주세요');
        console.log('사용법: node scripts/port-config.cjs set 4000');
      }
      break;
    case 'get':
      config.showCurrentPort();
      break;
    case 'show':
      config.showCurrentPort();
      break;
    default:
      console.log('🔧 포트 설정 관리 도구');
      console.log('');
      console.log('사용법:');
      console.log('  node scripts/port-config.cjs set 4000  - 포트 변경');
      console.log('  node scripts/port-config.cjs get       - 현재 포트 확인');
      console.log('  node scripts/port-config.cjs show      - 현재 포트 표시');
      console.log('');
      console.log('💡 포트 변경 후 윈도우 서비스를 재설치해야 합니다!');
  }
}

if (require.main === module) {
  main();
}

module.exports = PortConfig; 