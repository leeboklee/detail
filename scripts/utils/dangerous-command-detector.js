const fs = require('fs');
const path = require('path');

class DangerousCommandDetector {
  constructor() {
    this.logFile = path.join(__dirname, '../../logs/dangerous-commands.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, type = 'WARNING') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;
    
    console.log(`🚨 ${message}`);
    fs.appendFileSync(this.logFile, logMessage);
  }

  // 위험한 명령어 패턴 정의
  getDangerousPatterns() {
    return [
      {
        pattern: /taskkill\s+\/f\s+\/im\s+node\.exe/i,
        description: '전체 Node.js 프로세스 강제 종료',
        suggestion: 'node scripts/port-management/auto-port-manager.js kill'
      },
      {
        pattern: /taskkill\s+\/f\s+\/im\s+.*\.exe/i,
        description: '전체 프로세스 강제 종료',
        suggestion: '특정 PID만 종료하세요: taskkill /f /pid <PID>'
      },
      {
        pattern: /killall\s+node/i,
        description: '모든 Node.js 프로세스 종료',
        suggestion: 'node scripts/port-management/auto-port-manager.js kill'
      },
      {
        pattern: /pkill\s+-f\s+node/i,
        description: 'Node.js 관련 모든 프로세스 종료',
        suggestion: 'node scripts/port-management/auto-port-manager.js kill'
      },
      {
        pattern: /rm\s+-rf\s+node_modules/i,
        description: 'node_modules 강제 삭제',
        suggestion: 'npm run clean 또는 rimraf node_modules'
      }
    ];
  }

  // 명령어 검사
  detectDangerousCommand(command) {
    const patterns = this.getDangerousPatterns();
    
    for (const { pattern, description, suggestion } of patterns) {
      if (pattern.test(command)) {
        this.log(`위험한 명령어 감지: ${description}`);
        this.log(`명령어: ${command}`);
        this.log(`대안: ${suggestion}`);
        this.log('---');
        return true;
      }
    }
    
    return false;
  }

  // 터미널 입력 감시 (PowerShell용)
  monitorTerminalInput() {
    if (process.platform === 'win32') {
      // Windows PowerShell에서 입력 감시
      process.stdin.on('data', (data) => {
        const input = data.toString().trim();
        if (this.detectDangerousCommand(input)) {
          console.log('\n⚠️ 위험한 명령어가 감지되었습니다!');
          console.log('💡 안전한 대안을 사용하세요.\n');
        }
      });
    }
  }

  // 스크립트 실행 전 검사
  checkScriptBeforeExecution(scriptPath) {
    try {
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      const lines = scriptContent.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (this.detectDangerousCommand(line)) {
          this.log(`스크립트 ${scriptPath}의 ${i + 1}번째 줄에서 위험한 명령어 발견`);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('스크립트 검사 실패:', error);
      return true; // 검사 실패 시 실행 허용
    }
  }
}

// 전역 인스턴스
const detector = new DangerousCommandDetector();

// 명령줄 인수 검사
if (process.argv.length > 2) {
  const fullCommand = process.argv.join(' ');
  if (detector.detectDangerousCommand(fullCommand)) {
    console.log('\n❌ 위험한 명령어가 감지되어 실행이 중단되었습니다.');
    process.exit(1);
  }
}

module.exports = DangerousCommandDetector;
module.exports.detector = detector; 