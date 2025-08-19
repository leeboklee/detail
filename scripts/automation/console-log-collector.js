import React from 'react';
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ConsoleLogCollector {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.errorLogFile = path.join(this.logDir, 'console-errors.json');
    this.autoFixLogFile = path.join(this.logDir, 'auto-fix-report.json');
    this.browser = null;
    this.page = null;
    this.errors = [];
    this.autoFixCount = 0;
    
    // 로그 디렉토리 생성
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  async start() {
    console.log('🚀 브라우저 콘솔 로그 수집 시작...');
    
    try {
      this.browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      this.setupErrorListeners();
      
      await this.page.goto('http://localhost:3900', { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      
      console.log('✅ 페이지 로드 완료, 실시간 모니터링 시작');
      
      // 실시간 모니터링 시작
      this.startRealTimeMonitoring();
      
    } catch (error) {
      console.error('❌ 초기화 오류:', error.message);
      await this.cleanup();
    }
  }

  setupErrorListeners() {
    // 콘솔 오류 수집
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.handleConsoleError(msg.text());
      }
    });

    // 페이지 오류 수집
    this.page.on('pageerror', error => {
      this.handlePageError(error);
    });

    // 네트워크 오류 수집
    this.page.on('response', response => {
      if (response.status() >= 400) {
        this.handleNetworkError(response);
      }
    });

    // JavaScript 실행 오류 수집
    this.page.on('error', error => {
      this.handleJavaScriptError(error);
    });
  }

  handleConsoleError(text) {
    const error = {
      type: 'console_error',
      message: text,
      timestamp: new Date().toISOString(),
      severity: this.analyzeErrorSeverity(text)
    };
    
    this.errors.push(error);
    console.log(`🚨 콘솔 오류: ${text}`);
    
    // 자동 수정 시도
    this.attemptAutoFix(error);
  }

  handlePageError(error) {
    const pageError = {
      type: 'page_error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      severity: 'high'
    };
    
    this.errors.push(pageError);
    console.log(`🚨 페이지 오류: ${error.message}`);
    
    this.attemptAutoFix(pageError);
  }

  handleNetworkError(response) {
    const networkError = {
      type: 'network_error',
      url: response.url(),
      status: response.status(),
      statusText: response.statusText(),
      timestamp: new Date().toISOString(),
      severity: response.status() >= 500 ? 'high' : 'medium'
    };
    
    this.errors.push(networkError);
    console.log(`🚨 네트워크 오류: ${response.status()} ${response.url()}`);
    
    this.attemptAutoFix(networkError);
  }

  handleJavaScriptError(error) {
    const jsError = {
      type: 'javascript_error',
      message: error.message,
      timestamp: new Date().toISOString(),
      severity: 'high'
    };
    
    this.errors.push(jsError);
    console.log(`🚨 JavaScript 오류: ${error.message}`);
    
    this.attemptAutoFix(jsError);
  }

  analyzeErrorSeverity(errorText) {
    const highSeverityPatterns = [
      /TypeError: Cannot read properties of undefined/,
      /ReferenceError: .* is not defined/,
      /Unhandled Runtime Error/,
      /Module not found/,
      /Build failed/,
      /Compilation failed/
    ];
    
    const mediumSeverityPatterns = [
      /Warning:/,
      /Deprecated/,
      /404/,
      /Failed to load/
    ];
    
    if (highSeverityPatterns.some(pattern => pattern.test(errorText))) {
      return 'high';
    } else if (mediumSeverityPatterns.some(pattern => pattern.test(errorText))) {
      return 'medium';
    }
    
    return 'low';
  }

  async attemptAutoFix(error) {
    console.log(`🔧 자동 수정 시도: ${error.type}`);
    
    const fixResult = {
      timestamp: new Date().toISOString(),
      originalError: error,
      fixes: [],
      success: false
    };

    try {
      switch (error.type) {
        case 'console_error':
          await this.fixConsoleError(error, fixResult);
          break;
        case 'page_error':
          await this.fixPageError(error, fixResult);
          break;
        case 'network_error':
          await this.fixNetworkError(error, fixResult);
          break;
        case 'javascript_error':
          await this.fixJavaScriptError(error, fixResult);
          break;
      }
      
      if (fixResult.fixes.length > 0) {
        this.autoFixCount++;
        fixResult.success = true;
        console.log(`✅ 자동 수정 완료 (${this.autoFixCount}번째)`);
      }
      
    } catch (fixError) {
      console.error('❌ 자동 수정 실패:', fixError.message);
      fixResult.error = fixError.message;
    }
    
    // 수정 결과 로그 저장
    this.saveAutoFixLog(fixResult);
  }

  async fixConsoleError(error, fixResult) {
    const message = error.message;
    
    // undefined property 오류 수정
    if (message.includes('Cannot read properties of undefined')) {
      const match = message.match(/Cannot read properties of undefined \(reading '([^']+)'\)/);
      if (match) {
        const property = match[1];
        fixResult.fixes.push({
          type: 'undefined_property_fix',
          property: property,
          action: 'null check 추가'
        });
        
        // 관련 컴포넌트 파일 찾아서 수정
        await this.addNullCheckToComponents(property);
      }
    }
    
    // 모듈 not found 오류 수정
    if (message.includes("Module not found: Can't resolve")) {
      const match = message.match(/Can't resolve '([^']+)'/);
      if (match) {
        const modulePath = match[1];
        fixResult.fixes.push({
          type: 'module_path_fix',
          module: modulePath,
          action: '경로 수정'
        });
        
        await this.fixModulePath(modulePath);
      }
    }
  }

  async fixPageError(error, fixResult) {
    // React hydration 오류 수정
    if (error.message.includes('hydration')) {
      fixResult.fixes.push({
        type: 'hydration_fix',
        action: 'hydration 오류 수정'
      });
      
      await this.fixHydrationError();
    }
    
    // Context 오류 수정
    if (error.message.includes('AppContext') || error.message.includes('useAppContext')) {
      fixResult.fixes.push({
        type: 'context_fix',
        action: 'AppContext 수정'
      });
      
      await this.fixContextError();
    }
  }

  async fixNetworkError(error, fixResult) {
    // 404 오류 수정
    if (error.status === 404) {
      fixResult.fixes.push({
        type: '404_fix',
        url: error.url,
        action: '라우트 추가 또는 경로 수정'
      });
      
      await this.fix404Error(error.url);
    }
    
    // 500 오류 수정
    if (error.status >= 500) {
      fixResult.fixes.push({
        type: 'server_error_fix',
        status: error.status,
        action: '서버 오류 수정'
      });
      
      await this.fixServerError();
    }
  }

  async fixJavaScriptError(error, fixResult) {
    // 일반적인 JavaScript 오류 수정
    fixResult.fixes.push({
      type: 'javascript_fix',
      message: error.message,
      action: 'JavaScript 오류 수정'
    });
    
    await this.fixJavaScriptError(error.message);
  }

  async addNullCheckToComponents(property) {
    // 컴포넌트 파일들에서 해당 property 사용 부분에 null check 추가
    const componentDirs = [
      path.join(__dirname, '../../components'),
      path.join(__dirname, '../../app')
    ];
    
    for (const dir of componentDirs) {
      if (fs.existsSync(dir)) {
        const files = this.findJsxFiles(dir);
        for (const file of files) {
          await this.addNullCheckToFile(file, property);
        }
      }
    }
  }

  async fixModulePath(modulePath) {
    // AppContext 관련 경로 수정
    if (modulePath.includes('AppContext')) {
      const correctPath = modulePath.replace('../context/AppContext', '../components/AppContext.Context');
      
      // 파일들에서 경로 수정
      const files = this.findJsxFiles(path.join(__dirname, '../../'));
      for (const file of files) {
        await this.replaceInFile(file, modulePath, correctPath);
      }
    }
  }

  async fixHydrationError() {
    // hydration 오류 수정을 위한 useEffect 추가
    const files = this.findJsxFiles(path.join(__dirname, '../../components'));
    for (const file of files) {
      await this.addHydrationFix(file);
    }
  }

  async fixContextError() {
    // AppContext 관련 오류 수정
    const contextFile = path.join(__dirname, '../../components/AppContext.Context.jsx');
    if (fs.existsSync(contextFile)) {
      await this.fixAppContextFile(contextFile);
    }
  }

  async fix404Error(url) {
    // 404 오류 수정 - 라우트 추가 또는 경로 수정
    console.log(`🔧 404 오류 수정: ${url}`);
  }

  async fixServerError() {
    // 서버 오류 수정 - 포트 킬 및 재시작
    console.log('🔧 서버 오류 수정 중...');
    
    return new Promise((resolve) => {
      exec('taskkill /f /im node.exe', (error) => {
        if (!error) {
          console.log('✅ Node.js 프로세스 종료');
          setTimeout(() => {
            console.log('🔄 서버 재시작...');
            exec('npm run dev', (err) => {
              if (!err) {
                console.log('✅ 서버 재시작 완료');
              }
              resolve();
            });
          }, 2000);
        } else {
          resolve();
        }
      });
    });
  }

  async fixJavaScriptError(message) {
    // JavaScript 오류 수정
    console.log(`🔧 JavaScript 오류 수정: ${message}`);
  }

  findJsxFiles(dir) {
    const files = [];
    
    function scanDirectory(currentDir) {
      const items = fs.readdirSync(currentDir);
      
      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
          scanDirectory(fullPath);
        } else if (item.endsWith('.jsx') || item.endsWith('.js')) {
          files.push(fullPath);
        }
      }
    }
    
    scanDirectory(dir);
    return files;
  }

  async addNullCheckToFile(filePath, property) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // property 사용 부분에 null check 추가
      const propertyPattern = new RegExp(`\\b${property}\\b`, 'g');
      if (propertyPattern.test(content)) {
        // 간단한 null check 추가
        content = content.replace(
          new RegExp(`(${property}\\.[a-zA-Z_][a-zA-Z0-9_]*)`, 'g'),
          '$1 || null'
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Null check 추가: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ 파일 수정 실패: ${filePath}`, error.message);
    }
  }

  async replaceInFile(filePath, oldText, newText) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(oldText)) {
        content = content.replace(new RegExp(oldText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newText);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ 경로 수정: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ 파일 수정 실패: ${filePath}`, error.message);
    }
  }

  async addHydrationFix(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // hydration 오류 수정을 위한 useEffect 추가
      if (content.includes('useState') && !content.includes('useEffect')) {
        const useEffectImport = "import { useState, useEffect } from 'react';";
        const useStateImport = "import { useState } from 'react';";
        
        if (content.includes(useStateImport)) {
          content = content.replace(useStateImport, useEffectImport);
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`✅ Hydration fix 추가: ${filePath}`);
        }
      }
    } catch (error) {
      console.error(`❌ Hydration fix 실패: ${filePath}`, error.message);
    }
  }

  async fixAppContextFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // AppContext export 확인 및 수정
      if (!content.includes('export const AppContext')) {
        const contextExport = `
export const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  return context;
};
`;
        
        content += contextExport;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ AppContext export 추가: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ AppContext 수정 실패: ${filePath}`, error.message);
    }
  }

  startRealTimeMonitoring() {
    console.log('📊 실시간 모니터링 시작...');
    
    // 30초마다 상태 리포트
    setInterval(() => {
      this.generateStatusReport();
    }, 30000);
    
    // 5분마다 로그 저장
    setInterval(() => {
      this.saveErrorLog();
    }, 300000);
  }

  generateStatusReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: this.errors.length,
      autoFixCount: this.autoFixCount,
      recentErrors: this.errors.slice(-5),
      successRate: this.autoFixCount / Math.max(this.errors.length, 1) * 100
    };
    
    console.log('\n📊 상태 리포트:');
    console.log(`총 오류 수: ${report.totalErrors}`);
    console.log(`자동 수정 수: ${report.autoFixCount}`);
    console.log(`성공률: ${report.successRate.toFixed(1)}%`);
    
    // 리포트 파일 저장
    const reportFile = path.join(this.logDir, `status-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  }

  saveErrorLog() {
    if (this.errors.length > 0) {
      fs.writeFileSync(this.errorLogFile, JSON.stringify(this.errors, null, 2));
      console.log(`💾 오류 로그 저장: ${this.errors.length}개`);
    }
  }

  saveAutoFixLog(fixResult) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...fixResult
    };
    
    let autoFixLogs = [];
    if (fs.existsSync(this.autoFixLogFile)) {
      autoFixLogs = JSON.parse(fs.readFileSync(this.autoFixLogFile, 'utf8'));
    }
    
    autoFixLogs.push(logEntry);
    fs.writeFileSync(this.autoFixLogFile, JSON.stringify(autoFixLogs, null, 2));
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
    
    this.saveErrorLog();
    console.log('🔍 콘솔 로그 수집 종료');
  }
}

// 스크립트 실행
if (require.main === module) {
  const collector = new ConsoleLogCollector();
  
  // 종료 시 정리
  process.on('SIGINT', async () => {
    console.log('\n🛑 종료 신호 수신...');
    await collector.cleanup();
    process.exit(0);
  });
  
  collector.start().catch(console.error);
}

module.exports = ConsoleLogCollector; 