#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

let serverProcess = null;
let restartCount = 0;
const MAX_RESTARTS = 5;
const RESTART_DELAY = 3000;
const MEMORY_CHECK_INTERVAL = 30000; // 30초마다 메모리 체크

class ServerManager {
  constructor() {
    this.logFile = join(projectRoot, 'logs', 'server-stability.log');
    this.ensureLogDir();
    this.startServer();
    this.setupMonitoring();
    this.setupGracefulShutdown();
  }

  ensureLogDir() {
    const logDir = join(projectRoot, 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(logMessage.trim());
    fs.appendFileSync(this.logFile, logMessage);
  }

  startServer() {
    if (serverProcess) {
      this.log('Killing existing server process...');
      serverProcess.kill('SIGTERM');
    }

    this.log(`Starting development server (attempt ${restartCount + 1}/${MAX_RESTARTS})...`);
    
    serverProcess = spawn('npm', ['run', 'dev'], {
      cwd: projectRoot,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      env: {
        ...process.env,
        NODE_OPTIONS: '--max-old-space-size=2048 --max-semi-space-size=128',
        NEXT_TELEMETRY_DISABLED: '1',
        NODE_ENV: 'development'
      }
    });

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Ready') || output.includes('compiled') || output.includes('started')) {
        this.log(`Server: ${output.trim()}`);
      }
    });

    serverProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('warn')) {
        this.log(`Server Error: ${error.trim()}`);
      }
    });

    serverProcess.on('exit', (code, signal) => {
      this.log(`Server exited with code ${code}, signal ${signal}`);
      
      if (code !== 0 && restartCount < MAX_RESTARTS) {
        this.log(`Restarting server in ${RESTART_DELAY/1000} seconds...`);
        restartCount++;
        setTimeout(() => this.startServer(), RESTART_DELAY);
      } else if (restartCount >= MAX_RESTARTS) {
        this.log('Maximum restart attempts reached. Manual intervention required.');
        process.exit(1);
      }
    });

    serverProcess.on('error', (error) => {
      this.log(`Failed to start server: ${error.message}`);
    });

    // 서버 시작 후 재시작 카운터 리셋
    setTimeout(() => {
      if (serverProcess && !serverProcess.killed) {
        restartCount = 0;
        this.log('Server stable, reset restart counter');
      }
    }, 10000);
  }

  async checkMemoryUsage() {
    if (!serverProcess || serverProcess.killed) return;

    try {
      const { exec } = await import('child_process');
      exec(`tasklist /fi "PID eq ${serverProcess.pid}" /fo csv`, (error, stdout) => {
        if (error) return;
        
        const lines = stdout.split('\n');
        if (lines.length > 1) {
          const memory = lines[1].split(',')[4]?.replace(/"/g, '').replace(' K', '');
          const memoryMB = parseInt(memory) / 1024;
          
          if (memoryMB > 1500) { // 1.5GB 이상 시 재시작
            this.log(`High memory usage detected: ${memoryMB.toFixed(0)}MB. Restarting server...`);
            this.startServer();
          } else if (memoryMB > 1000) {
            this.log(`Memory usage warning: ${memoryMB.toFixed(0)}MB`);
          }
        }
      });
    } catch (error) {
      this.log(`Memory check failed: ${error.message}`);
    }
  }

  setupMonitoring() {
    // 메모리 모니터링
    setInterval(() => {
      this.checkMemoryUsage();
    }, MEMORY_CHECK_INTERVAL);

    this.log('Memory monitoring started (check every 30 seconds)');
  }

  setupGracefulShutdown() {
    const shutdown = (signal) => {
      this.log(`Received ${signal}, shutting down gracefully...`);
      if (serverProcess) {
        serverProcess.kill('SIGTERM');
        setTimeout(() => {
          if (!serverProcess.killed) {
            serverProcess.kill('SIGKILL');
          }
        }, 5000);
      }
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGHUP', () => shutdown('SIGHUP'));
  }
}

// 스크립트 실행
new ServerManager();