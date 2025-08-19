const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class SimpleMonitor {
  constructor() {
    this.port = 3900;
    this.checkInterval = 10000; // 10초마다 확인
  }

  async checkPort() {
    try {
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
      return stdout.includes(`LISTENING`) && stdout.includes(`:${this.port}`);
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
      
      return Math.round(totalMemory / 1024);
    } catch (error) {
      return 0;
    }
  }

  async showStatus() {
    const isPortActive = await this.checkPort();
    const memoryUsage = await this.checkMemoryUsage();
    const timestamp = new Date().toLocaleTimeString();

    console.clear();
    console.log('🔍 서버 상태 모니터링');
    console.log('='.repeat(40));
    console.log(`⏰ 시간: ${timestamp}`);
    console.log(`🌐 포트 ${this.port}: ${isPortActive ? '✅ 활성' : '❌ 비활성'}`);
    console.log(`💾 메모리 사용: ${memoryUsage} MB`);
    console.log(`🔄 ${this.checkInterval/1000}초마다 갱신`);
    console.log('='.repeat(40));
    console.log('💡 Ctrl+C로 종료');
  }

  async startMonitoring() {
    console.log('🔍 간단한 서버 모니터링 시작...');
    
    // 초기 상태 표시
    await this.showStatus();
    
    // 주기적으로 상태 확인
    setInterval(async () => {
      await this.showStatus();
    }, this.checkInterval);
  }
}

// CLI 사용법
async function main() {
  const monitor = new SimpleMonitor();
  
  // Ctrl+C 처리
  process.on('SIGINT', () => {
    console.log('\n🛑 모니터링 종료');
    process.exit(0);
  });

  try {
    await monitor.startMonitoring();
  } catch (error) {
    console.error('❌ 모니터링 실패:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleMonitor; 