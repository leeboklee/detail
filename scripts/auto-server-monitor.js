#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoServerMonitor {
  constructor() {
    this.port = 3900;
    this.projectDir = '/home/rsvshop/projects/detail';
    this.checkInterval = 5000; // 5초마다 체크
    this.isRunning = false;
    this.restartCount = 0;
    this.maxRestarts = 10;
  }

  // 포트 사용 상태 확인
  async checkPort() {
    return new Promise((resolve) => {
      exec(`ss -tlnp | grep :${this.port}`, (error, stdout) => {
        resolve(stdout.trim().length > 0);
      });
    });
  }

  // 서버 상태 확인
  async checkServerHealth() {
    try {
      const response = await fetch(`http://localhost:${this.port}/`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 서버 시작
  async startServer() {
    if (this.isRunning) {
      console.log('🔄 서버가 이미 시작 중입니다...');
      return;
    }

    console.log('🚀 서버 시작 중...');
    this.isRunning = true;

    const nodemon = spawn('npx', ['nodemon', '--config', './nodemon.json'], {
      cwd: this.projectDir,
      stdio: 'pipe'
    });

    nodemon.stdout.on('data', (data) => {
      console.log(`📤 ${data.toString().trim()}`);
    });

    nodemon.stderr.on('data', (data) => {
      console.log(`❌ ${data.toString().trim()}`);
    });

    nodemon.on('close', (code) => {
      console.log(`🔴 서버 종료 (코드: ${code})`);
      this.isRunning = false;
      
      if (code !== 0 && this.restartCount < this.maxRestarts) {
        console.log('🔄 서버 재시작 시도...');
        this.restartCount++;
        setTimeout(() => this.startServer(), 3000);
      }
    });

    // 서버 시작 대기
    await this.waitForServer();
  }

  // 서버 시작 대기
  async waitForServer() {
    let attempts = 0;
    const maxAttempts = 30; // 30초 대기

    while (attempts < maxAttempts) {
      const portActive = await this.checkPort();
      if (portActive) {
        console.log('✅ 서버가 성공적으로 시작되었습니다!');
        this.restartCount = 0;
        return true;
      }
      
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('❌ 서버 시작 실패');
    this.isRunning = false;
    return false;
  }

  // 메인 모니터링 루프
  async monitor() {
    console.log('🔍 자동 서버 모니터링 시작...');
    console.log(`📍 포트: ${this.port}`);
    console.log(`📁 프로젝트: ${this.projectDir}`);

    setInterval(async () => {
      const portActive = await this.checkPort();
      
      if (!portActive && !this.isRunning) {
        console.log('⚠️  서버가 꺼져있습니다! 자동 재시작...');
        await this.startServer();
      } else if (portActive && !this.isRunning) {
        console.log('✅ 서버가 정상 실행 중입니다');
        this.isRunning = true;
      }
    }, this.checkInterval);

    // 초기 서버 시작
    const portActive = await this.checkPort();
    if (!portActive) {
      console.log('🚀 초기 서버 시작...');
      await this.startServer();
    } else {
      console.log('✅ 서버가 이미 실행 중입니다');
      this.isRunning = true;
    }
  }

  // 모니터링 시작
  start() {
    this.monitor().catch(error => {
      console.error('❌ 모니터링 오류:', error);
      process.exit(1);
    });
  }
}

// 모니터링 시작
const monitor = new AutoServerMonitor();
monitor.start();

// 프로세스 종료 처리
process.on('SIGINT', () => {
  console.log('\n🛑 모니터링 종료...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 모니터링 종료...');
  process.exit(0);
});
