const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

class ServiceMonitor {
  constructor() {
    this.serviceName = 'HotelDetailServer';
    this.logFile = path.join(process.cwd(), 'logs', 'service-monitor.log');
    
    // 로그 디렉토리 생성
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    fs.appendFileSync(this.logFile, logMessage);
  }

  async checkServiceStatus() {
    try {
      const { stdout } = await execAsync(`sc query ${this.serviceName}`);
      return stdout;
    } catch (error) {
      return null;
    }
  }

  async checkPort() {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :3900`);
      return stdout.includes(`LISTENING`) && stdout.includes(`:3900`);
    } catch (error) {
      return false;
    }
  }

  async checkMemoryUsage() {
    try {
      const { stdout } = await execAsync(`tasklist /fi "imagename eq node.exe" /fo csv`);
      const lines = stdout.split('\n').filter(line => line.includes('node.exe'));
      let totalMemory = 0;
      
      lines.forEach(line => {
        const parts = line.split(',');
        if (parts.length > 4) {
          const memory = parseInt(parts[4].replace(/"/g, '').replace(' K', ''));
          if (!isNaN(memory)) {
            totalMemory += memory;
          }
        }
      });
      
      return totalMemory;
    } catch (error) {
      return 0;
    }
  }

  async getServiceInfo() {
    const status = await this.checkServiceStatus();
    const isPortActive = await this.checkPort();
    const memoryUsage = await this.checkMemoryUsage();
    
    const info = {
      serviceName: this.serviceName,
      status: status ? 'RUNNING' : 'STOPPED',
      isPortActive: isPortActive,
      memoryUsage: `${Math.round(memoryUsage / 1024)} MB`,
      timestamp: new Date().toISOString()
    };
    
    this.log(`📊 서비스 정보:`);
    this.log(`   서비스명: ${info.serviceName}`);
    this.log(`   상태: ${info.status}`);
    this.log(`   포트활성: ${info.isPortActive}`);
    this.log(`   메모리사용: ${info.memoryUsage}`);
    this.log(`   시간: ${info.timestamp}`);
    
    return info;
  }

  async startMonitoring() {
    this.log('🔍 서비스 모니터링 시작...');
    
    // 초기 상태 확인
    await this.getServiceInfo();
    
    // 주기적으로 상태 확인 (5분마다)
    setInterval(async () => {
      await this.getServiceInfo();
    }, 300000); // 5분
    
    // 메모리 사용량 경고 (1분마다)
    setInterval(async () => {
      const memoryUsage = await this.checkMemoryUsage();
      const memoryMB = Math.round(memoryUsage / 1024);
      
      if (memoryMB > 500) { // 500MB 초과 시 경고
        this.log(`⚠️ 메모리 사용량 높음: ${memoryMB} MB`);
      }
    }, 60000); // 1분
  }

  async stopService() {
    try {
      this.log('🛑 서비스 중지 중...');
      await execAsync(`net stop ${this.serviceName}`);
      this.log('✅ 서비스 중지 완료');
    } catch (error) {
      this.log(`❌ 서비스 중지 실패: ${error.message}`);
    }
  }

  async startService() {
    try {
      this.log('🚀 서비스 시작 중...');
      await execAsync(`net start ${this.serviceName}`);
      this.log('✅ 서비스 시작 완료');
    } catch (error) {
      this.log(`❌ 서비스 시작 실패: ${error.message}`);
    }
  }

  async restartService() {
    try {
      this.log('🔄 서비스 재시작 중...');
      await this.stopService();
      await new Promise(resolve => setTimeout(resolve, 3000));
      await this.startService();
      this.log('✅ 서비스 재시작 완료');
    } catch (error) {
      this.log(`❌ 서비스 재시작 실패: ${error.message}`);
    }
  }
}

// CLI 사용법
async function main() {
  const args = process.argv.slice(2);
  const monitor = new ServiceMonitor();
  
  switch (args[0]) {
    case 'monitor':
      await monitor.startMonitoring();
      break;
    case 'status':
      await monitor.getServiceInfo();
      break;
    case 'stop':
      await monitor.stopService();
      break;
    case 'start':
      await monitor.startService();
      break;
    case 'restart':
      await monitor.restartService();
      break;
    default:
      monitor.log('🔍 서비스 모니터링 도구');
      monitor.log('');
      monitor.log('사용법:');
      monitor.log('  node scripts/service-monitor.cjs monitor  - 실시간 모니터링');
      monitor.log('  node scripts/service-monitor.cjs status   - 현재 상태 확인');
      monitor.log('  node scripts/service-monitor.cjs stop     - 서비스 중지');
      monitor.log('  node scripts/service-monitor.cjs start    - 서비스 시작');
      monitor.log('  node scripts/service-monitor.cjs restart  - 서비스 재시작');
      monitor.log('');
      monitor.log('💡 리소스 사용량과 서비스 상태를 실시간으로 모니터링합니다!');
  }
}

if (require.main === module) {
  main();
}

module.exports = ServiceMonitor; 