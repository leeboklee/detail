#!/usr/bin/env node

/**
 * 오류 모니터링 스크립트
 * 터미널에서 실시간으로 오류를 감지하고 표시
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

class ErrorMonitor {
  constructor() {
    this.errorsDir = path.join(process.cwd(), 'logs', 'errors');
    this.latestErrorsFile = path.join(this.errorsDir, 'latest-errors.json');
    this.isRunning = false;
    this.lastCheck = null;
  }

  // 오류 디렉토리 확인 및 생성
  ensureErrorsDir() {
    if (!fs.existsSync(this.errorsDir)) {
      fs.mkdirSync(this.errorsDir, { recursive: true });
      console.log(chalk.blue('📁 오류 로그 디렉토리가 생성되었습니다.'));
    }
  }

  // 최신 오류 목록 읽기
  readLatestErrors() {
    try {
      if (fs.existsSync(this.latestErrorsFile)) {
        const data = fs.readFileSync(this.latestErrorsFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(chalk.red('❌ 오류 목록 읽기 실패:', error.message));
    }
    return null;
  }

  // 개별 오류 파일 읽기
  readErrorFile(filename) {
    try {
      const filepath = path.join(this.errorsDir, filename);
      if (fs.existsSync(filepath)) {
        const data = fs.readFileSync(filepath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error(chalk.red(`❌ 오류 파일 읽기 실패 (${filename}):`, error.message));
    }
    return null;
  }

  // 오류 표시
  displayError(errorData, isNew = false) {
    const timestamp = new Date(errorData.timestamp).toLocaleString('ko-KR');
    const severity = errorData.severity || 'unknown';
    const severityColor = {
      'high': chalk.red,
      'medium': chalk.yellow,
      'low': chalk.blue,
      'unknown': chalk.gray
    };

    const prefix = isNew ? '🆕' : '📋';
    const severityText = severityColor[severity] || chalk.gray;
    
    console.log(`\n${prefix} ${chalk.bold('오류 발생')}`);
    console.log(`   시간: ${chalk.cyan(timestamp)}`);
    console.log(`   유형: ${chalk.magenta(errorData.type)}`);
    console.log(`   심각도: ${severityText(severity.toUpperCase())}`);
    console.log(`   메시지: ${chalk.white(errorData.message)}`);
    
    if (errorData.url) {
      console.log(`   URL: ${chalk.blue(errorData.url)}`);
    }
    
    if (errorData.stack) {
      console.log(`   스택 트레이스:`);
      const stackLines = errorData.stack.split('\n').slice(0, 5); // 처음 5줄만 표시
      stackLines.forEach(line => {
        console.log(`     ${chalk.gray(line.trim())}`);
      });
      if (errorData.stack.split('\n').length > 5) {
        console.log(`     ${chalk.gray('... (더 많은 스택 정보가 있습니다)')}`);
      }
    }
    
    if (errorData.filename) {
      console.log(`   파일: ${chalk.green(errorData.filename)}`);
    }
    
    console.log(chalk.gray('─'.repeat(60)));
  }

  // 새 오류 확인
  checkForNewErrors() {
    try {
      const latestErrors = this.readLatestErrors();
      if (!latestErrors || !latestErrors.recentErrors) return;

      const currentTime = new Date().getTime();
      const lastCheckTime = this.lastCheck ? new Date(this.lastCheck).getTime() : 0;

      // 새 오류 필터링
      const newErrors = latestErrors.recentErrors.filter(error => {
        const errorTime = new Date(error.timestamp).getTime();
        return errorTime > lastCheckTime;
      });

      if (newErrors.length > 0) {
        console.log(chalk.yellow(`\n🚨 ${newErrors.length}개의 새 오류가 감지되었습니다!`));
        newErrors.forEach(error => {
          const fullErrorData = this.readErrorFile(error.filename);
          if (fullErrorData) {
            this.displayError(fullErrorData, true);
          }
        });
      }

      this.lastCheck = latestErrors.lastUpdated;
    } catch (error) {
      console.error(chalk.red('❌ 오류 확인 실패:', error.message));
    }
  }

  // 통계 표시
  showStats() {
    try {
      const latestErrors = this.readLatestErrors();
      if (!latestErrors) return;

      console.log(chalk.blue('\n📊 오류 통계'));
      console.log(`   총 오류 수: ${chalk.bold(latestErrors.totalErrors)}`);
      console.log(`   최근 업데이트: ${chalk.cyan(new Date(latestErrors.lastUpdated).toLocaleString('ko-KR'))}`);
      console.log(`   최근 오류: ${chalk.yellow(latestErrors.recentErrors.length)}개`);
      
      // 심각도별 통계
      const severityStats = {};
      latestErrors.recentErrors.forEach(error => {
        const severity = error.severity || 'unknown';
        severityStats[severity] = (severityStats[severity] || 0) + 1;
      });
      
      console.log('   심각도별 분포:');
      Object.entries(severityStats).forEach(([severity, count]) => {
        const color = severity === 'high' ? chalk.red : severity === 'medium' ? chalk.yellow : chalk.blue;
        console.log(`     ${severity.toUpperCase()}: ${color(count)}개`);
      });
    } catch (error) {
      console.error(chalk.red('❌ 통계 표시 실패:', error.message));
    }
  }

  // 모니터링 시작
  start() {
    this.ensureErrorsDir();
    this.isRunning = true;
    
    console.log(chalk.green('🚀 오류 모니터링이 시작되었습니다...'));
    console.log(chalk.gray('   Ctrl+C를 눌러 종료할 수 있습니다.\n'));
    
    // 초기 통계 표시
    this.showStats();
    
    // 주기적으로 새 오류 확인 (5초마다)
    const interval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(interval);
        return;
      }
      this.checkForNewErrors();
    }, 5000);

    // 종료 처리
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n\n🛑 오류 모니터링을 종료합니다...'));
      this.isRunning = false;
      clearInterval(interval);
      process.exit(0);
    });
  }
}

// 스크립트 실행
if (require.main === module) {
  const monitor = new ErrorMonitor();
  monitor.start();
}

module.exports = ErrorMonitor;
