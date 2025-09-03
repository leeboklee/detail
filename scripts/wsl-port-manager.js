#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class WSLPortManager {
  constructor(port = 3900) {
    this.port = port;
    this.reserved = false;
  }

  async reservePort() {
    try {
      console.log(`🔒 WSL2에서 포트 ${this.port} 예약 중...`);
      
      // 윈도우 프로세스 확인 및 정리
      await this.cleanWindowsProcesses();
      
      // WSL2 내부 포트 정리
      await this.cleanWSLProcesses();
      
      // 포트 상태 확인
      await this.verifyPort();
      
      this.reserved = true;
      console.log(`✅ 포트 ${this.port}가 WSL2에서 안전하게 예약되었습니다.`);
      
    } catch (error) {
      console.error(`❌ 포트 예약 실패: ${error.message}`);
      throw error;
    }
  }

  async cleanWindowsProcesses() {
    try {
      // 윈도우에서 해당 포트 사용하는 프로세스 확인
      const { stdout } = await execAsync(`netstat -ano | findstr :${this.port}`, { shell: 'cmd.exe' });
      
      if (stdout.trim()) {
        console.log(`🪟 윈도우에서 포트 ${this.port} 사용 프로세스 발견, 정리 중...`);
        
        // 윈도우 프로세스 종료 (관리자 권한 필요)
        await execAsync(`powershell -Command "Get-NetTCPConnection -LocalPort ${this.port} | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"`, { shell: 'cmd.exe' });
      }
    } catch (error) {
      // 윈도우 명령어 실패 시 무시 (WSL2에서 실행 중일 수 있음)
      console.log('⚠️ 윈도우 프로세스 정리 스킵 (WSL2 환경)');
    }
  }

  async cleanWSLProcesses() {
    try {
      // WSL2 내부 프로세스 정리
      await execAsync(`sudo fuser -k ${this.port}/tcp 2>/dev/null || true`);
      await execAsync(`pkill -f "next dev.*${this.port}" || true`);
      await execAsync(`pkill -f "npm.*${this.port}" || true`);
      
      // 포트가 완전히 해제될 때까지 대기
      await this.waitForPortFree();
      
    } catch (error) {
      console.log(`⚠️ WSL2 프로세스 정리 중 오류: ${error.message}`);
    }
  }

  async waitForPortFree() {
    for (let i = 0; i < 15; i++) {
      if (await this.isPortFree()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    throw new Error(`포트 ${this.port}를 해제할 수 없습니다.`);
  }

  async isPortFree() {
    try {
      const { stdout } = await execAsync(`sudo lsof -i :${this.port}`);
      return stdout.trim() === '';
    } catch (error) {
      return true;
    }
  }

  async verifyPort() {
    if (!(await this.isPortFree())) {
      throw new Error(`포트 ${this.port}가 여전히 사용 중입니다.`);
    }
  }

  async releasePort() {
    if (this.reserved) {
      console.log(`🔓 포트 ${this.port} 해제 중...`);
      await this.cleanWSLProcesses();
      this.reserved = false;
      console.log(`✅ 포트 ${this.port}가 해제되었습니다.`);
    }
  }
}

module.exports = WSLPortManager;
