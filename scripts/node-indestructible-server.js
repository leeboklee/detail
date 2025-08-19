#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// 설정
const PORT = 3900;
const PROJECT_DIR = process.cwd();
const NEXTJS_SCRIPT = 'npm run dev';
const AUTO_OPEN_BROWSER = process.env.AUTO_OPEN_BROWSER === '1';

console.log('🚀 Node.js 무적 서버 시작...');
console.log(`📁 프로젝트: ${PROJECT_DIR}`);
console.log(`🔌 포트: ${PORT}`);

class IndestructibleServer {
    constructor() {
        this.nextjsProcess = null;
        this.isRunning = false;
        this.restartCount = 0;
        this.maxRestarts = 1000;
        this.hasOpenedBrowser = false;
    }

    // Next.js 서버 시작
    startNextJSServer() {
        console.log('🔄 Next.js 서버 시작 중...');
        
        try {
            // 포트가 이미 열려 있으면 새로 실행하지 않음
            return this.checkPortStatus().then((alive) => {
                if (alive) {
                    console.log('✅ 포트가 이미 활성화됨. 추가 실행 생략. (브라우저 자동 열기 비활성)');
                    this.hasOpenedBrowser = true;
                    return true;
                }
                
                // Next.js 프로세스 시작
                this.nextjsProcess = spawn('npm', ['run', 'dev'], {
                    cwd: PROJECT_DIR,
                    stdio: 'pipe',
                    shell: true
                });

                // 프로세스 ID 출력
                console.log(`✅ Next.js 서버 시작됨 (PID: ${this.nextjsProcess.pid})`);

                // 로그 출력
                this.nextjsProcess.stdout.on('data', (data) => {
                    console.log(`📝 Next.js: ${data.toString().trim()}`);
                });

                this.nextjsProcess.stderr.on('data', (data) => {
                    console.log(`⚠️ Next.js 오류: ${data.toString().trim()}`);
                });

                // 프로세스 종료 감지
                this.nextjsProcess.on('close', (code) => {
                    console.log(`⚠️ Next.js 프로세스 종료됨 (코드: ${code})`);
                    this.restartNextJSServer();
                });

                this.nextjsProcess.on('error', (error) => {
                    console.log(`❌ Next.js 프로세스 오류: ${error.message}`);
                    this.restartNextJSServer();
                });

                // 브라우저 자동 열기 (옵션, 최초 1회만)
                if (AUTO_OPEN_BROWSER && !this.hasOpenedBrowser) {
                    setTimeout(() => {
                        this.openBrowser();
                        this.hasOpenedBrowser = true;
                    }, 5000);
                }

                return true;
            });
        } catch (error) {
            console.log(`❌ Next.js 서버 시작 실패: ${error.message}`);
            return false;
        }
    }

    // Next.js 서버 재시작
    restartNextJSServer() {
        if (this.restartCount >= this.maxRestarts) {
            console.log('❌ 최대 재시작 횟수 초과');
            return;
        }

        this.restartCount++;
        console.log(`🔄 Next.js 서버 재시작 중... (${this.restartCount}/${this.maxRestarts})`);
        
        // 기존 프로세스 정리
        if (this.nextjsProcess) {
            try {
                this.nextjsProcess.kill('SIGTERM');
            } catch (error) {
                // 무시
            }
        }

        // 잠시 대기 후 재시작
        setTimeout(async () => {
            const alive = await this.checkPortStatus();
            if (alive) {
                console.log('✅ 포트가 이미 활성화됨. 재시작 생략.');
                return;
            }
            this.startNextJSServer();
        }, 2000);
    }

    // 브라우저 열기
    openBrowser() {
        const url = `http://localhost:${PORT}`;
        console.log(`🌐 브라우저 열기: ${url}`);
        
        const platform = process.platform;
        let command;

        switch (platform) {
            case 'win32':
                command = `start ${url}`;
                break;
            case 'darwin':
                command = `open ${url}`;
                break;
            default:
                command = `xdg-open ${url}`;
        }

        exec(command, (error) => {
            if (error) {
                console.log(`⚠️ 브라우저 열기 실패: ${error.message}`);
            }
        });
    }

    // 포트 상태 확인
    checkPortStatus() {
        return new Promise((resolve) => {
            const req = http.get(`http://localhost:${PORT}`, (res) => {
                resolve(res.statusCode === 200);
            });
            
            req.on('error', () => {
                resolve(false);
            });
            
            req.setTimeout(3000, () => {
                req.destroy();
                resolve(false);
            });
        });
    }

    // 서버 모니터링
    async startMonitoring() {
        console.log('🎯 서버 모니터링 시작...');
        
        setInterval(async () => {
            const isHealthy = await this.checkPortStatus();
            
            if (!isHealthy) {
                console.log('⚠️ 서버 상태 불량. 재시작 중...');
                this.restartNextJSServer();
            }
        }, 10000); // 10초마다 체크
    }

    // 무적 서버 시작
    start() {
        console.log('🛡️ Node.js 무적 서버 활성화');
        console.log('💡 Ctrl+C로 종료할 수 있습니다');
        
        this.isRunning = true;
        
        // Next.js 서버 시작
        this.startNextJSServer();
        
        // 모니터링 시작
        this.startMonitoring();
        
        // 시그널 핸들러
        process.on('SIGINT', () => {
            console.log('\n🛑 서버 종료 중...');
            this.stop();
        });
        
        process.on('SIGTERM', () => {
            console.log('\n🛑 서버 종료 신호 수신...');
            this.stop();
        });
    }

    // 서버 종료
    stop() {
        this.isRunning = false;
        
        if (this.nextjsProcess) {
            try {
                this.nextjsProcess.kill('SIGTERM');
                console.log('✅ Next.js 프로세스 종료됨');
            } catch (error) {
                console.log(`⚠️ 프로세스 종료 실패: ${error.message}`);
            }
        }
        
        console.log('🔚 Node.js 무적 서버 종료됨');
        process.exit(0);
    }
}

// 서버 시작
const server = new IndestructibleServer();
server.start(); 