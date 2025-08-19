const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class DockerMonitor {
    constructor() {
        this.serverProcess = null;
        this.isRunning = false;
        this.restartCount = 0;
        this.maxRestarts = 50;
        this.logFile = path.join(__dirname, '../logs/docker-monitor.log');
        this.pidFile = path.join(__dirname, '../logs/server.pid');
        
        // 로그 디렉토리 생성
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
        
        this.log('🚀 Docker 모니터 시작됨');
    }
    
    log(message) {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${message}\n`;
        console.log(logMessage.trim());
        fs.appendFileSync(this.logFile, logMessage);
    }
    
    startServer() {
        if (this.isRunning) {
            this.log('⚠️ 서버가 이미 실행 중입니다');
            return;
        }
        
        this.log('🔄 서버 시작 중...');
        
        // Next.js 서버 시작
        this.serverProcess = spawn('npx', ['next', 'dev', '-p', '3900'], {
            stdio: 'pipe',
            shell: true,
            env: { ...process.env, NODE_ENV: 'development' }
        });
        
        // PID 파일 저장
        fs.writeFileSync(this.pidFile, this.serverProcess.pid.toString());
        
        this.serverProcess.stdout.on('data', (data) => {
            const output = data.toString();
            this.log(`📤 서버 출력: ${output.trim()}`);
            
            // 서버 준비 완료 감지
            if (output.includes('Ready') || output.includes('started server')) {
                this.log('✅ 서버 준비 완료!');
                this.isRunning = true;
                this.restartCount = 0;
            }
        });
        
        this.serverProcess.stderr.on('data', (data) => {
            const error = data.toString();
            this.log(`❌ 서버 오류: ${error.trim()}`);
        });
        
        this.serverProcess.on('close', (code) => {
            this.log(`🔴 서버 종료됨 (코드: ${code})`);
            this.isRunning = false;
            
            // PID 파일 삭제
            if (fs.existsSync(this.pidFile)) {
                fs.unlinkSync(this.pidFile);
            }
            
            // 자동 재시작
            if (this.restartCount < this.maxRestarts) {
                this.restartCount++;
                this.log(`🔄 자동 재시작 시도 ${this.restartCount}/${this.maxRestarts}`);
                setTimeout(() => this.startServer(), 2000);
            } else {
                this.log('❌ 최대 재시작 횟수 초과');
            }
        });
        
        this.serverProcess.on('error', (error) => {
            this.log(`💥 서버 프로세스 오류: ${error.message}`);
        });
    }
    
    stopServer() {
        if (!this.isRunning || !this.serverProcess) {
            this.log('⚠️ 서버가 실행 중이 아닙니다');
            return;
        }
        
        this.log('🛑 서버 중지 중...');
        this.serverProcess.kill('SIGTERM');
        
        // PID 파일 삭제
        if (fs.existsSync(this.pidFile)) {
            fs.unlinkSync(this.pidFile);
        }
    }
    
    restartServer() {
        this.log('🔄 서버 재시작 중...');
        this.stopServer();
        setTimeout(() => this.startServer(), 1000);
    }
    
    getStatus() {
        const status = {
            isRunning: this.isRunning,
            restartCount: this.restartCount,
            pid: this.serverProcess ? this.serverProcess.pid : null,
            uptime: this.isRunning ? Date.now() - this.startTime : 0
        };
        
        this.log(`📊 상태: ${JSON.stringify(status, null, 2)}`);
        return status;
    }
    
    // 포트 확인
    checkPort() {
        return new Promise((resolve) => {
            const net = require('net');
            const socket = new net.Socket();
            
            socket.setTimeout(1000);
            
            socket.on('connect', () => {
                socket.destroy();
                resolve(true);
            });
            
            socket.on('timeout', () => {
                socket.destroy();
                resolve(false);
            });
            
            socket.on('error', () => {
                socket.destroy();
                resolve(false);
            });
            
            socket.connect(3900, 'localhost');
        });
    }
    
    // 메모리 사용량 확인
    getMemoryUsage() {
        if (!this.serverProcess) return null;
        
        try {
            const usage = process.memoryUsage();
            return {
                rss: Math.round(usage.rss / 1024 / 1024), // MB
                heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
                heapTotal: Math.round(usage.heapTotal / 1024 / 1024) // MB
            };
        } catch (error) {
            this.log(`❌ 메모리 사용량 확인 실패: ${error.message}`);
            return null;
        }
    }
}

// CLI 인터페이스
if (require.main === module) {
    const monitor = new DockerMonitor();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'start':
            monitor.startServer();
            break;
        case 'stop':
            monitor.stopServer();
            break;
        case 'restart':
            monitor.restartServer();
            break;
        case 'status':
            monitor.getStatus();
            break;
        case 'monitor':
            // 실시간 모니터링
            monitor.startServer();
            setInterval(async () => {
                const portStatus = await monitor.checkPort();
                const memory = monitor.getMemoryUsage();
                const status = monitor.getStatus();
                
                console.clear();
                console.log('🔄 실시간 모니터링');
                console.log('='.repeat(50));
                console.log(`서버 상태: ${status.isRunning ? '✅ 실행 중' : '❌ 중지됨'}`);
                console.log(`포트 3900: ${portStatus ? '✅ 열림' : '❌ 닫힘'}`);
                console.log(`재시작 횟수: ${status.restartCount}`);
                if (memory) {
                    console.log(`메모리 사용량: ${memory.rss}MB (RSS)`);
                }
                console.log('='.repeat(50));
            }, 5000);
            break;
        default:
            console.log('사용법: node docker-monitor.cjs [start|stop|restart|status|monitor]');
    }
}

module.exports = DockerMonitor; 