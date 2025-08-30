#!/usr/bin/env node

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

class PortChecker {
  constructor(port) {
    this.port = port;
    this.maxRetries = 3;
  }

  async checkPort() {
    try {
      const { stdout } = await execAsync(`sudo lsof -i :${this.port}`);
      return stdout.trim() === '';
    } catch (error) {
      return true; // 포트가 사용되지 않음
    }
  }

  async killPortProcesses() {
    try {
      await execAsync(`sudo fuser -k ${this.port}/tcp 2>/dev/null || true`);
      await execAsync(`pkill -f "next dev.*${this.port}" || true`);
      await execAsync(`pkill -f "npm.*${this.port}" || true`);
      console.log(`포트 ${this.port}의 모든 프로세스를 정리했습니다.`);
    } catch (error) {
      console.log(`포트 ${this.port} 정리 중 오류:`, error.message);
    }
  }

  async waitForPort() {
    for (let i = 0; i < 10; i++) {
      if (await this.checkPort()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
  }

  async ensurePortFree() {
    console.log(`포트 ${this.port} 상태 확인 중...`);
    
    if (!(await this.checkPort())) {
      console.log(`포트 ${this.port}가 사용 중입니다. 프로세스를 정리합니다...`);
      await this.killPortProcesses();
      
      if (!(await this.waitForPort())) {
        throw new Error(`포트 ${this.port}를 해제할 수 없습니다.`);
      }
    }
    
    console.log(`포트 ${this.port}가 사용 가능합니다.`);
    return true;
  }
}

async function main() {
  const port = process.argv[2] || 3900;
  const checker = new PortChecker(port);
  
  try {
    await checker.ensurePortFree();
    console.log(`포트 ${port}에서 Next.js 서버를 시작할 수 있습니다.`);
    process.exit(0);
  } catch (error) {
    console.error(`오류: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PortChecker;
