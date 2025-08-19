const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class DockerAutoManager {
  constructor() {
    this.containerName = 'detail-app';
    this.port = 3900;
  }

  // Docker 컨테이너 상태 확인
  async checkContainerStatus() {
    return new Promise((resolve) => {
      exec(`docker ps --filter "name=${this.containerName}" --format "{{.Status}}"`, (error, stdout) => {
        if (error || !stdout.trim()) {
          resolve('stopped');
        } else {
          resolve('running');
        }
      });
    });
  }

  // 포트 사용 확인
  async checkPortStatus() {
    return new Promise((resolve) => {
      exec(`netstat -ano | findstr :${this.port}`, (error, stdout) => {
        resolve(!error && stdout.trim() !== '');
      });
    });
  }

  // Docker 컨테이너 시작
  async startContainer() {
    console.log('🚀 Docker 컨테이너 시작 중...');
    return new Promise((resolve, reject) => {
      exec('docker-compose up -d --build', (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Docker 시작 실패:', error.message);
          reject(error);
        } else {
          console.log('✅ Docker 컨테이너 시작 완료');
          resolve(stdout);
        }
      });
    });
  }

  // Docker 컨테이너 중지
  async stopContainer() {
    console.log('🛑 Docker 컨테이너 중지 중...');
    return new Promise((resolve) => {
      exec('docker-compose down', (error, stdout) => {
        if (error) {
          console.error('❌ Docker 중지 실패:', error.message);
        } else {
          console.log('✅ Docker 컨테이너 중지 완료');
        }
        resolve();
      });
    });
  }

  // Docker 컨테이너 재시작
  async restartContainer() {
    console.log('🔄 Docker 컨테이너 재시작 중...');
    await this.stopContainer();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.startContainer();
  }

  // 파일 변경 감지 및 자동 재시작
  async watchAndRestart() {
    const watchPaths = [
      './app',
      './components',
      './lib',
      './prisma/schema.prisma',
      './package.json'
    ];

    console.log('👀 파일 변경 감지 시작...');
    
    watchPaths.forEach(watchPath => {
      if (fs.existsSync(watchPath)) {
        fs.watch(watchPath, { recursive: true }, async (eventType, filename) => {
          if (filename && !filename.includes('node_modules') && !filename.includes('.next')) {
            console.log(`📝 파일 변경 감지: ${filename}`);
            const status = await this.checkContainerStatus();
            if (status === 'running') {
              console.log('🔄 컨테이너 재시작 중...');
              await this.restartContainer();
            }
          }
        });
      }
    });
  }

  // 메인 실행 함수
  async run() {
    try {
      const status = await this.checkContainerStatus();
      const portInUse = await this.checkPortStatus();

      if (status === 'stopped') {
        if (portInUse) {
          console.log('⚠️ 포트 3900이 사용 중입니다. 기존 프로세스 종료 후 Docker 시작...');
          exec(`netstat -ano | findstr :${this.port} | findstr LISTENING`, (error, stdout) => {
            if (!error && stdout) {
              const pid = stdout.split(/\s+/)[4];
              exec(`taskkill /F /PID ${pid}`, () => {
                setTimeout(() => this.startContainer(), 1000);
              });
            }
          });
        } else {
          await this.startContainer();
        }
      } else {
        console.log('✅ Docker 컨테이너가 이미 실행 중입니다.');
      }

      // 파일 변경 감지 시작
      await this.watchAndRestart();

    } catch (error) {
      console.error('❌ Docker 자동 관리 오류:', error.message);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const manager = new DockerAutoManager();
  manager.run();
}

module.exports = DockerAutoManager; 