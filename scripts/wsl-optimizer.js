#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const fs = require('fs');
const path = require('path');

class WSL2Optimizer {
  constructor() {
    this.isWSL2 = false;
    this.projectPath = process.cwd();
  }

  async detectWSL2() {
    try {
      // WSL2 환경 감지
      const { stdout } = await execAsync('uname -a');
      this.isWSL2 = stdout.includes('Microsoft') || stdout.includes('WSL2');
      
      if (this.isWSL2) {
        console.log('🐧 WSL2 환경이 감지되었습니다.');
        await this.optimizeForWSL2();
      } else {
        console.log('💻 일반 Linux 환경입니다.');
      }
      
      return this.isWSL2;
    } catch (error) {
      console.log('⚠️ WSL2 감지 실패, 기본 설정 사용');
      return false;
    }
  }

  async optimizeForWSL2() {
    console.log('⚡ WSL2 환경 최적화 중...');
    
    // 1. 파일시스템 성능 최적화
    await this.optimizeFileSystem();
    
    // 2. 네트워크 설정 최적화
    await this.optimizeNetwork();
    
    // 3. 메모리 설정 최적화
    await this.optimizeMemory();
    
    console.log('✅ WSL2 최적화 완료');
  }

  async optimizeFileSystem() {
    try {
      // .next 폴더를 WSL2 내부로 이동 (성능 향상)
      const nextPath = path.join(this.projectPath, '.next');
      const wslNextPath = path.join('/tmp', 'detail-next');
      
      if (fs.existsSync(nextPath)) {
        console.log('📁 .next 폴더를 WSL2 내부로 이동 중...');
        await execAsync(`mv "${nextPath}" "${wslNextPath}"`);
        await execAsync(`ln -sf "${wslNextPath}" "${nextPath}"`);
      }
    } catch (error) {
      console.log('⚠️ 파일시스템 최적화 스킵');
    }
  }

  async optimizeNetwork() {
    try {
      // WSL2 네트워크 설정 최적화
      console.log('🌐 WSL2 네트워크 최적화 중...');
      
      // TCP 연결 최적화
      await execAsync('echo "net.core.rmem_max = 16777216" | sudo tee -a /etc/sysctl.conf');
      await execAsync('echo "net.core.wmem_max = 16777216" | sudo tee -a /etc/sysctl.conf');
      await execAsync('sudo sysctl -p');
      
    } catch (error) {
      console.log('⚠️ 네트워크 최적화 스킵 (권한 부족)');
    }
  }

  async optimizeMemory() {
    try {
      // WSL2 메모리 설정 최적화
      console.log('💾 WSL2 메모리 최적화 중...');
      
      // Node.js 메모리 설정
      process.env.NODE_OPTIONS = '--max-old-space-size=4096 --max-semi-space-size=512';
      
      // Next.js 캐시 최적화
      process.env.NEXT_TELEMETRY_DISABLED = '1';
      process.env.NEXT_SHARP_PATH = '0';
      
    } catch (error) {
      console.log('⚠️ 메모리 최적화 스킵');
    }
  }

  async getWSL2Info() {
    try {
      const { stdout: version } = await execAsync('wsl.exe --version');
      const { stdout: status } = await execAsync('wsl.exe --status');
      
      console.log('📊 WSL2 정보:');
      console.log(version);
      console.log(status);
      
    } catch (error) {
      console.log('⚠️ WSL2 정보 조회 실패');
    }
  }
}

module.exports = WSL2Optimizer;
