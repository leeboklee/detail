const { spawn } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

const execAsync = promisify(exec);

class WindowsService {
  constructor(port = process.env.SERVER_PORT || 3900) {
    this.port = port;
    this.serviceName = 'HotelDetailServer';
    this.displayName = 'Hotel Detail Page Server';
    this.description = 'Next.js development server for hotel detail page';
    this.projectPath = process.cwd();
  }

  async createServiceScript() {
    const scriptContent = `@echo off
cd /d "${this.projectPath}"
set SERVER_PORT=${this.port}
node scripts/auto-restart-server.cjs
`;
    
    const scriptPath = path.join(this.projectPath, 'start-server.bat');
    fs.writeFileSync(scriptPath, scriptContent);
    return scriptPath;
  }

  async installService() {
    try {
      console.log('🔧 Windows 서비스 설치 중...');
      
      const scriptPath = await this.createServiceScript();
      const nssmPath = path.join(this.projectPath, 'nssm.exe');
      
      // NSSM 다운로드 (Windows 서비스 관리자)
      if (!fs.existsSync(nssmPath)) {
        console.log('📥 NSSM 다운로드 중...');
        await execAsync(`powershell -Command "Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'nssm.zip'"`);
        await execAsync(`powershell -Command "Expand-Archive -Path 'nssm.zip' -DestinationPath '.' -Force"`);
        await execAsync(`copy "nssm-2.24\\win64\\nssm.exe" "nssm.exe"`);
        await execAsync(`rmdir /s /q nssm-2.24`);
        await execAsync(`del nssm.zip`);
      }
      
      // 서비스 설치
      await execAsync(`"${nssmPath}" install "${this.serviceName}" "${scriptPath}"`);
      await execAsync(`"${nssmPath}" set "${this.serviceName}" DisplayName "${this.displayName}"`);
      await execAsync(`"${nssmPath}" set "${this.serviceName}" Description "${this.description}"`);
      await execAsync(`"${nssmPath}" set "${this.serviceName}" AppDirectory "${this.projectPath}"`);
      await execAsync(`"${nssmPath}" set "${this.serviceName}" Start SERVICE_AUTO_START`);
      
      console.log('✅ Windows 서비스 설치 완료!');
      console.log(`📋 서비스 이름: ${this.serviceName}`);
      console.log(`🌐 포트: ${this.port}`);
      console.log(`📁 프로젝트 경로: ${this.projectPath}`);
      
    } catch (error) {
      console.error('❌ 서비스 설치 실패:', error.message);
    }
  }

  async startService() {
    try {
      console.log('🚀 Windows 서비스 시작 중...');
      await execAsync(`net start ${this.serviceName}`);
      console.log('✅ 서비스 시작 완료!');
    } catch (error) {
      console.error('❌ 서비스 시작 실패:', error.message);
    }
  }

  async stopService() {
    try {
      console.log('🛑 Windows 서비스 중지 중...');
      await execAsync(`net stop ${this.serviceName}`);
      console.log('✅ 서비스 중지 완료!');
    } catch (error) {
      console.error('❌ 서비스 중지 실패:', error.message);
    }
  }

  async uninstallService() {
    try {
      console.log('🗑️ Windows 서비스 제거 중...');
      const nssmPath = path.join(this.projectPath, 'nssm.exe');
      await execAsync(`"${nssmPath}" remove "${this.serviceName}" confirm`);
      console.log('✅ 서비스 제거 완료!');
    } catch (error) {
      console.error('❌ 서비스 제거 실패:', error.message);
    }
  }

  async getServiceStatus() {
    try {
      const { stdout } = await execAsync(`sc query ${this.serviceName}`);
      console.log('📊 서비스 상태:');
      console.log(stdout);
    } catch (error) {
      console.error('❌ 서비스 상태 확인 실패:', error.message);
    }
  }
}

// CLI 사용법
async function main() {
  const args = process.argv.slice(2);
  const service = new WindowsService(3900);
  
  switch (args[0]) {
    case 'install':
      await service.installService();
      break;
    case 'start':
      await service.startService();
      break;
    case 'stop':
      await service.stopService();
      break;
    case 'uninstall':
      await service.uninstallService();
      break;
    case 'status':
      await service.getServiceStatus();
      break;
    default:
      console.log('🔧 Windows 서비스 관리 도구');
      console.log('');
      console.log('사용법:');
      console.log('  node scripts/windows-service.cjs install   - 서비스 설치');
      console.log('  node scripts/windows-service.cjs start     - 서비스 시작');
      console.log('  node scripts/windows-service.cjs stop      - 서비스 중지');
      console.log('  node scripts/windows-service.cjs uninstall - 서비스 제거');
      console.log('  node scripts/windows-service.cjs status    - 서비스 상태 확인');
      console.log('');
      console.log('⚠️  관리자 권한이 필요합니다!');
  }
}

if (require.main === module) {
  main();
}

module.exports = WindowsService; 