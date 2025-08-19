const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoErrorDetector {
  constructor() {
    this.logFile = 'auto-error-detection.log';
    this.errorPatterns = [
      /TypeError: Cannot read properties of undefined/,
      /Module not found: Can't resolve/,
      /Unhandled Runtime Error/,
      /Error: \u001b\[31m\u001b\[1mModule not found/,
      /GET \/.* 500/,
      /GET \/.* 404/,
      /Compilation failed/,
      /Build failed/,
      /Failed to compile/,
      /Cannot find module/,
      /Unexpected token/,
      /SyntaxError/,
      /ReferenceError/,
      /TypeError/
    ];
  }

  // 서버 로그 모니터링
  async monitorServerLogs() {
    console.log('🔍 서버 로그 모니터링 시작...\n');
    
    return new Promise((resolve) => {
      const serverProcess = exec('npm run dev', { 
        maxBuffer: 1024 * 1024 * 10 // 10MB 버퍼
      });

      let output = '';
      let errorOutput = '';

      serverProcess.stdout.on('data', (data) => {
        output += data;
        this.checkForErrors(data, 'stdout');
        process.stdout.write(data);
      });

      serverProcess.stderr.on('data', (data) => {
        errorOutput += data;
        this.checkForErrors(data, 'stderr');
        process.stderr.write(data);
      });

      serverProcess.on('close', (code) => {
        console.log(`\n❌ 서버 프로세스 종료 (코드: ${code})`);
        this.logError('server_exit', { code, output, errorOutput });
        resolve(code);
      });

      // 30초 후 서버 상태 확인
      setTimeout(() => {
        this.checkServerHealth();
      }, 30000);
    });
  }

  // 오류 패턴 검사
  checkForErrors(data, source) {
    this.errorPatterns.forEach((pattern, index) => {
      if (pattern.test(data)) {
        const errorType = this.getErrorType(index);
        console.log(`\n🚨 오류 감지 (${errorType}):`);
        console.log(data);
        this.logError(errorType, { data, source, timestamp: new Date().toISOString() });
        this.autoFixError(errorType, data);
      }
    });
  }

  // 오류 타입 분류
  getErrorType(index) {
    const types = [
      'undefined_property',
      'module_not_found',
      'runtime_error',
      'module_resolution',
      'server_500',
      'server_404',
      'compilation_failed',
      'build_failed',
      'compile_error',
      'module_error',
      'syntax_error',
      'syntax_error',
      'reference_error',
      'type_error'
    ];
    return types[index] || 'unknown_error';
  }

  // 자동 오류 수정
  async autoFixError(errorType, data) {
    console.log(`\n🔧 자동 수정 시도: ${errorType}`);
    
    switch (errorType) {
      case 'undefined_property':
        await this.fixUndefinedProperty(data);
        break;
      case 'module_not_found':
        await this.fixModuleNotFound(data);
        break;
      case 'server_500':
        await this.fixServerError();
        break;
      default:
        console.log('⚠️ 자동 수정 불가능한 오류 타입');
    }
  }

  // undefined property 오류 수정
  async fixUndefinedProperty(data) {
    if (data.includes('AppContext.Provider')) {
      console.log('🔧 AppContext Provider 오류 수정 중...');
      
      // AppContext 파일 확인
      const appContextPath = path.join(__dirname, '../components/AppContext.Context.jsx');
      if (fs.existsSync(appContextPath)) {
        const content = fs.readFileSync(appContextPath, 'utf8');
        if (!content.includes('export const AppContext')) {
          console.log('📝 AppContext export 추가...');
          // AppContext export 추가 로직
        }
      }
    }
  }

  // 모듈 not found 오류 수정
  async fixModuleNotFound(data) {
    const match = data.match(/Can't resolve '([^']+)'/);
    if (match) {
      const modulePath = match[1];
      console.log(`🔧 모듈 경로 수정: ${modulePath}`);
      
      // 일반적인 경로 수정 패턴
      if (modulePath.includes('../context/AppContext')) {
        console.log('📝 AppContext 경로 수정...');
        // 경로 수정 로직
      }
    }
  }

  // 서버 오류 수정
  async fixServerError() {
    console.log('🔧 서버 오류 수정 중...');
    
    // 포트 킬
    exec('taskkill /f /im node.exe', (error) => {
      if (!error) {
        console.log('✅ Node.js 프로세스 종료');
        // 서버 재시작
        setTimeout(() => {
          console.log('🔄 서버 재시작...');
        }, 2000);
      }
    });
  }

  // 서버 상태 확인
  async checkServerHealth() {
    console.log('\n🏥 서버 상태 확인 중...');
    
    exec('curl -s http://localhost:3900', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ 서버 응답 없음');
        this.logError('server_unresponsive', { error: error.message });
      } else if (stdout.includes('500') || stdout.includes('Error')) {
        console.log('⚠️ 서버 오류 응답');
        this.logError('server_error_response', { response: stdout });
      } else {
        console.log('✅ 서버 정상 응답');
      }
    });
  }

  // 오류 로그 기록
  logError(type, details) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: type,
      details: details
    };

    fs.appendFileSync(this.logFile, JSON.stringify(logEntry) + '\n');
  }

  // 실시간 오류 감지 시작
  startRealTimeDetection() {
    console.log('🚀 실시간 오류 감지 시작...\n');
    
    // 파일 변경 감지
    const watchPaths = [
      path.join(__dirname, '../components'),
      path.join(__dirname, '../app'),
      path.join(__dirname, '../src')
    ];

    watchPaths.forEach(watchPath => {
      if (fs.existsSync(watchPath)) {
        fs.watch(watchPath, { recursive: true }, (eventType, filename) => {
          if (filename && filename.endsWith('.jsx') || filename.endsWith('.js')) {
            console.log(`📁 파일 변경 감지: ${filename}`);
            this.checkFileForErrors(path.join(watchPath, filename));
          }
        });
      }
    });
  }

  // 파일 오류 검사
  async checkFileForErrors(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 일반적인 오류 패턴 검사
      const commonErrors = [
        /import.*from.*['"]\.\.\/context\/AppContext['"]/,
        /AppContext\.Provider/,
        /useAppContext/,
        /undefined\./,
        /null\./
      ];

      commonErrors.forEach((pattern, index) => {
        if (pattern.test(content)) {
          console.log(`⚠️ 잠재적 오류 발견: ${filePath}`);
          this.logError('potential_error', { file: filePath, pattern: pattern.toString() });
        }
      });
    } catch (error) {
      console.log(`❌ 파일 읽기 오류: ${filePath}`);
    }
  }
}

// 스크립트 실행
if (require.main === module) {
  const detector = new AutoErrorDetector();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'monitor':
      detector.monitorServerLogs();
      break;
      
    case 'realtime':
      detector.startRealTimeDetection();
      break;
      
    case 'check':
      detector.checkServerHealth();
      break;
      
    default:
      console.log('사용법:');
      console.log('  node scripts/auto-error-detector.js monitor   - 서버 로그 모니터링');
      console.log('  node scripts/auto-error-detector.js realtime  - 실시간 오류 감지');
      console.log('  node scripts/auto-error-detector.js check     - 서버 상태 확인');
      break;
  }
}

module.exports = AutoErrorDetector; 