#!/usr/bin/env node

const { spawn } = require('child_process');
const WSLPortManager = require('./wsl-port-manager');

class SafeDevServer {
  constructor(port = 3900) {
    this.port = port;
    this.portManager = new WSLPortManager(port);
    this.serverProcess = null;
  }

  async start() {
    try {
      console.log(`🚀 안전한 Next.js 서버 시작 (포트: ${this.port})`);
      
      // WSL2에서 포트 예약 및 정리
      await this.portManager.reservePort();
      
      // 서버 시작
      await this.startServer();
      
      // 프로세스 종료 시그널 처리
      this.setupProcessHandlers();
      
    } catch (error) {
      console.error(`❌ 서버 시작 실패: ${error.message}`);
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

      console.log(`📡 명령어 실행: npx ${args.join(' ')}`);
      
      this.serverProcess = spawn('npx', args, {
        stdio: 'inherit',
        shell: true
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
        console.log(`✅ 서버가 포트 ${this.port}에서 시작되었습니다.`);
        console.log(`🌐 브라우저에서 http://localhost:${this.port} 접속`);
        resolve();
      }, 5000);
    });
  }

  setupProcessHandlers() {
    const cleanup = async () => {
      console.log('\n🛑 서버 종료 중...');
      
      if (this.serverProcess) {
        this.serverProcess.kill('SIGTERM');
      }
      
      // 포트 해제
      await this.portManager.releasePort();
      
      console.log('✅ 서버가 안전하게 종료되었습니다.');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    process.on('exit', cleanup);
  }
}

async function main() {
  const port = parseInt(process.argv[2]) || 3900;
  const server = new SafeDevServer(port);
  
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

module.exports = SafeDevServer;
