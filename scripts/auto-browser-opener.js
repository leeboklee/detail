import { exec } from 'child_process';
import { promisify } from 'util';
import os from 'os';

const execAsync = promisify(exec);

class AutoBrowserOpener {
  constructor(port = 3900) {
    this.port = port;
    this.url = `http://localhost:${port}`;
    this.isWindows = process.platform === 'win32';
    this.isWSL = /microsoft/i.test(os.release());
    this.autoOpenEnabled = process.env.AUTO_OPEN === '1' || process.argv.includes('--enable');
    this.maxAttempts = parseInt(process.env.AUTO_OPEN_ATTEMPTS || getArgValue('--attempts') || '20', 10);
    this.intervalMs = parseInt(process.env.AUTO_OPEN_INTERVAL_MS || getArgValue('--interval') || '1000', 10);
  }

  async openBrowser() {
    if (!this.autoOpenEnabled) {
      console.log('🚫 브라우저 자동 열기가 비활성화되어 있습니다.');
      console.log(`📝 수동으로 접속하세요: ${this.url}`);
      return;
    }

    try {
      console.log(`🌐 브라우저 자동 열기: ${this.url}`);
      if (this.isWindows) {
        await execAsync(`start ${this.url}`);
      } else if (this.isWSL) {
        // WSL: Windows 기본 브라우저로 열기
        await execAsync(`cmd.exe /c start ${this.url}`);
      } else {
        // macOS는 'open', 리눅스는 'xdg-open'
        const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
        await execAsync(`${opener} ${this.url}`);
      }
      console.log('✅ 브라우저가 성공적으로 열렸습니다.');
    } catch (error) {
      console.error('❌ 브라우저 열기 실패:', error.message);
    }
  }

  async openAdminPage() {
    if (!this.autoOpenEnabled) {
      console.log('🚫 브라우저 자동 열기가 비활성화되어 있습니다.');
      console.log(`📝 수동으로 접속하세요: ${this.url}/admin`);
      return;
    }

    try {
      const adminUrl = `${this.url}/admin`;
      console.log(`🏨 관리자 페이지 열기: ${adminUrl}`);
      if (this.isWindows) {
        await execAsync(`start ${adminUrl}`);
      } else if (this.isWSL) {
        await execAsync(`cmd.exe /c start ${adminUrl}`);
      } else {
        const opener = process.platform === 'darwin' ? 'open' : 'xdg-open';
        await execAsync(`${opener} ${adminUrl}`);
      }
      console.log('✅ 관리자 페이지가 성공적으로 열렸습니다.');
    } catch (error) {
      console.error('❌ 관리자 페이지 열기 실패:', error.message);
    }
  }

  async checkServerStatus() {
    // 1) 헬스체크 우선 (가장 신뢰도 높음)
    try {
      const { stdout } = await execAsync(`curl -s -o /dev/null -w "%{http_code}" http://localhost:${this.port}/api/health`);
      if (String(stdout).trim() === '200') return true;
    } catch {}
    // 2) 포트 리슨 확인 (OS별 처리)
    try {
      if (this.isWindows) {
        const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`);
        return stdout.includes(`:${this.port}`);
      }
      const { stdout } = await execAsync(`(ss -ltnp 2>/dev/null | grep :${this.port}) || (netstat -tulpn 2>/dev/null | grep :${this.port})`);
      return String(stdout || '').trim().length > 0;
    } catch {
      return false;
    }
  }

  async waitForServer() {
    console.log(`⏳ 서버 시작 대기 중... (포트: ${this.port})`);
    const maxAttempts = this.maxAttempts;
    const interval = this.intervalMs;
    for (let i = 0; i < maxAttempts; i++) {
      const isRunning = await this.checkServerStatus();
      if (isRunning) {
        console.log('✅ 서버가 실행 중입니다.');
        return true;
      }
      
      console.log(`⏳ 대기 중... (${i + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    console.log('❌ 서버 시작 시간 초과');
    return false;
  }

  async autoOpen() {
    const serverRunning = await this.waitForServer();
    if (serverRunning && this.autoOpenEnabled) {
      await this.openBrowser();
    } else if (serverRunning) {
      console.log('🚫 브라우저 자동 열기가 비활성화되어 있습니다.');
      console.log(`📝 수동으로 접속하세요: ${this.url}`);
    }
  }
}

// CLI 사용법
if (import.meta.url === `file://${process.argv[1]}`) {
  const opener = new AutoBrowserOpener();
  const command = process.argv[2];

  switch (command) {
    case 'admin':
      opener.openAdminPage();
      break;
    case 'wait':
      opener.autoOpen();
      break;
    default:
      opener.openBrowser();
  }
}

// 간단한 CLI 인자 파서 (--flag value | --flag=value)
function getArgValue(flag) {
  const argv = process.argv.slice(2);
  const eq = argv.find(a => a.startsWith(flag + '='));
  if (eq) return eq.split('=')[1];
  const idx = argv.indexOf(flag);
  if (idx !== -1 && argv[idx + 1] && !argv[idx + 1].startsWith('--')) return argv[idx + 1];
  return undefined;
}

export default AutoBrowserOpener; 