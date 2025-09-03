#!/usr/bin/env node

const WSL2Optimizer = require('./wsl-optimizer');
const WSLPortManager = require('./wsl-port-manager');
const { spawn } = require('child_process');

class WSL2DevServer {
  constructor(port = 3900) {
    this.port = port || 3900; // 기본값 3900으로 강제
    this.optimizer = new WSL2Optimizer();
    this.portManager = new WSLPortManager(this.port);
    this.serverProcess = null;
  }

  async start() {
    try {
      console.log('🚀 WSL2 최적화 Next.js 서버 시작');
      
      // 1. WSL2 환경 감지 및 최적화
      await this.optimizer.detectWSL2();
      
      // 2. 포트 3900 전용 예약
      await this.portManager.reservePort();
      
      // 3. 서버 시작
      await this.startServer();
      
      // 4. 프로세스 종료 시그널 처리
      this.setupProcessHandlers();
      
    } catch (error) {
      console.error(`❌ WSL2 서버 시작 실패: ${error.message}`);
      process.exit(1);
    }
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      const args = [
        'next', 'dev',
        '-H', '0.0.0.0',
        '-p', this.port.toString(),
        '--turbo'
      ];

      console.log(`📡 WSL2 최적화 명령어: npx ${args.join(' ')}`);
      
      // WSL2 환경 변수 설정
      const env = {
        ...process.env,
        NODE_ENV: 'development',
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_SHARP_PATH: '0',
        NODE_OPTIONS: '--max-old-space-size=4096 --max-semi-space-size=512'
      };
      
      this.serverProcess = spawn('npx', args, {
        stdio: 'inherit',
        shell: true,
        env: env,
        cwd: process.cwd()
      });

      this.serverProcess.on('error', (error) => {
        console.error(`❌ 서버 프로세스 오류: ${error.message}`);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0) {
          console.log(`⚠️ 서버가 종료되었습니다. (코드: ${code})`);
        }
      });

      // 서버가 준비될 때까지 대기
      setTimeout(() => {
        console.log(`✅ WSL2 최적화 서버가 포트 ${this.port}에서 시작되었습니다.`);
        console.log(`🌐 WSL 내부 접속: http://localhost:${this.port}`);
        console.log(`🌐 Windows 브라우저 접속: http://172.19.254.74:${this.port}`);
        console.log(`🔒 포트 ${this.port}는 WSL2에서 전용으로 사용됩니다.`);
        resolve();
      }, 8000); // WSL2에서는 조금 더 기다림
    });
  }

  setupProcessHandlers() {
    const cleanup = async () => {
      console.log('\n🛑 WSL2 서버 종료 중...');
      
      if (this.serverProcess) {
        this.serverProcess.kill('SIGTERM');
      }
      
      // 포트 해제
      await this.portManager.releasePort();
      
      console.log('✅ WSL2 서버가 안전하게 종료되었습니다.');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }
}

async function main() {
  // 환경변수에서 포트 우선, 그 다음 명령행 인수, 마지막 기본값 3900
  const port = parseInt(process.env.PORT) || parseInt(process.argv[2]) || 3900;
  
  // 포트가 3900이 아닌 경우 경고
  if (port !== 3900) {
    console.log(`⚠️  포트 ${port}로 실행 중 (권장: 3900)`);
  }
  
  const server = new WSL2DevServer(port);
  
  try {
    await server.start();
  } catch (error) {
    console.error(`❌ 치명적 오류: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = WSL2DevServer;
