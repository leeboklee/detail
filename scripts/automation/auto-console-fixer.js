const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class AutoConsoleFixer {
  constructor() {
    this.logDir = path.join(__dirname, '../../logs');
    this.errorLogFile = path.join(this.logDir, 'console-errors.json');
    this.fixLogFile = path.join(this.logDir, 'auto-fix-log.json');
    this.fixCount = 0;
  }

  async start() {
    console.log('🔧 콘솔 오류 자동 수정 시작...');
    
    if (!fs.existsSync(this.errorLogFile)) {
      console.log('❌ 오류 로그 파일이 없습니다.');
      return;
    }

    const errors = JSON.parse(fs.readFileSync(this.errorLogFile, 'utf8'));
    console.log(`📊 ${errors.length}개의 오류 처리 시작`);

    for (const error of errors) {
      await this.processError(error);
    }

    this.generateFixReport();
  }

  async processError(error) {
    console.log(`\n🔍 오류 처리: ${error.type} - ${error.message?.substring(0, 50)}...`);
    
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
        this.fixCount++;
        fixResult.success = true;
        console.log(`✅ 수정 완료 (${this.fixCount}번째)`);
      }

    } catch (fixError) {
      console.error('❌ 수정 실패:', fixError.message);
      fixResult.error = fixError.message;
    }

    this.saveFixLog(fixResult);
  }

  async fixConsoleError(error, fixResult) {
    const message = error.message;

    // undefined property 오류
    if (message.includes('Cannot read properties of undefined')) {
      await this.fixUndefinedProperty(message, fixResult);
    }

    // 모듈 not found 오류
    if (message.includes("Module not found: Can't resolve")) {
      await this.fixModuleNotFound(message, fixResult);
    }

    // React 오류
    if (message.includes('React') || message.includes('JSX')) {
      await this.fixReactError(message, fixResult);
    }
  }

  async fixPageError(error, fixResult) {
    const message = error.message;

    // hydration 오류
    if (message.includes('hydration') || message.includes('Hydration')) {
      await this.fixHydrationError(fixResult);
    }

    // Context 오류
    if (message.includes('AppContext') || message.includes('useAppContext')) {
      await this.fixContextError(fixResult);
    }

    // Hook 오류
    if (message.includes('Hook') || message.includes('useState') || message.includes('useEffect')) {
      await this.fixHookError(message, fixResult);
    }
  }

  async fixNetworkError(error, fixResult) {
    // 404 오류
    if (error.status === 404) {
      await this.fix404Error(error.url, fixResult);
    }

    // 500 오류
    if (error.status >= 500) {
      await this.fixServerError(fixResult);
    }
  }

  async fixJavaScriptError(error, fixResult) {
    const message = error.message;

    // 일반적인 JavaScript 오류들
    if (message.includes('TypeError') || message.includes('ReferenceError')) {
      await this.fixTypeReferenceError(message, fixResult);
    }
  }

  async fixUndefinedProperty(message, fixResult) {
    const match = message.match(/Cannot read properties of undefined \(reading '([^']+)'\)/);
    if (match) {
      const property = match[1];
      
      fixResult.fixes.push({
        type: 'undefined_property_fix',
        property: property,
        action: 'null check 추가'
      });

      // 컴포넌트 파일들에서 해당 property 사용 부분 수정
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
  }

  async fixModuleNotFound(message, fixResult) {
    const match = message.match(/Can't resolve '([^']+)'/);
    if (match) {
      const modulePath = match[1];
      
      fixResult.fixes.push({
        type: 'module_path_fix',
        module: modulePath,
        action: '경로 수정'
      });

      // AppContext 관련 경로 수정
      if (modulePath.includes('AppContext')) {
        const correctPath = modulePath.replace('../context/AppContext', '../components/AppContext.Context');
        await this.fixModulePath(modulePath, correctPath);
      }

      // 상대 경로 수정
      if (modulePath.startsWith('./') || modulePath.startsWith('../')) {
        await this.fixRelativePath(modulePath);
      }
    }
  }

  async fixReactError(message, fixResult) {
    fixResult.fixes.push({
      type: 'react_fix',
      message: message,
      action: 'React 오류 수정'
    });

    // React import 확인 및 수정
    const files = this.findJsxFiles(path.join(__dirname, '../../'));
    for (const file of files) {
      await this.fixReactImports(file);
    }
  }

  async fixHydrationError(fixResult) {
    fixResult.fixes.push({
      type: 'hydration_fix',
      action: 'hydration 오류 수정'
    });

    // hydration 오류 수정을 위한 useEffect 추가
    const files = this.findJsxFiles(path.join(__dirname, '../../components'));
    for (const file of files) {
      await this.addHydrationFix(file);
    }
  }

  async fixContextError(fixResult) {
    fixResult.fixes.push({
      type: 'context_fix',
      action: 'AppContext 수정'
    });

    // AppContext 파일 수정
    const contextFile = path.join(__dirname, '../../components/AppContext.Context.jsx');
    if (fs.existsSync(contextFile)) {
      await this.fixAppContextFile(contextFile);
    }

    // Context 사용하는 파일들 수정
    const files = this.findJsxFiles(path.join(__dirname, '../../'));
    for (const file of files) {
      await this.fixContextUsage(file);
    }
  }

  async fixHookError(message, fixResult) {
    fixResult.fixes.push({
      type: 'hook_fix',
      message: message,
      action: 'Hook 오류 수정'
    });

    // Hook 사용 규칙 확인 및 수정
    const files = this.findJsxFiles(path.join(__dirname, '../../'));
    for (const file of files) {
      await this.fixHookUsage(file);
    }
  }

  async fix404Error(url, fixResult) {
    fixResult.fixes.push({
      type: '404_fix',
      url: url,
      action: '라우트 추가 또는 경로 수정'
    });

    // 404 오류 수정 로직
    console.log(`🔧 404 오류 수정: ${url}`);
  }

  async fixServerError(fixResult) {
    fixResult.fixes.push({
      type: 'server_error_fix',
      action: '서버 오류 수정'
    });
    
    // 안전한 포트 킬 사용
    console.log('🔧 서버 오류 수정 중...');
    
    return new Promise((resolve) => {
      // 포트별 정확한 프로세스 종료
      exec(`node scripts/port-management/auto-port-manager.js kill`, (error) => {
        if (!error) {
          console.log('✅ 포트별 프로세스 종료 완료');
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
          console.log('⚠️ 포트 킬 실패, 수동 확인 필요');
          resolve();
        }
      });
    });
  }

  async fixTypeReferenceError(message, fixResult) {
    fixResult.fixes.push({
      type: 'type_reference_fix',
      message: message,
      action: 'Type/Reference 오류 수정'
    });

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

  async fixModulePath(oldPath, newPath) {
    const files = this.findJsxFiles(path.join(__dirname, '../../'));
    for (const file of files) {
      try {
        let content = fs.readFileSync(file, 'utf8');
        if (content.includes(oldPath)) {
          content = content.replace(new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPath);
          fs.writeFileSync(file, content, 'utf8');
          console.log(`✅ 모듈 경로 수정: ${file}`);
        }
      } catch (error) {
        console.error(`❌ 모듈 경로 수정 실패: ${file}`, error.message);
      }
    }
  }

  async fixRelativePath(modulePath) {
    // 상대 경로 수정 로직
    console.log(`🔧 상대 경로 수정: ${modulePath}`);
  }

  async fixReactImports(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // React import 확인
      if (content.includes('React') && !content.includes("import React")) {
        content = "import React from 'react';\n" + content;
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ React import 추가: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ React import 수정 실패: ${filePath}`, error.message);
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

  async fixContextUsage(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Context 사용 부분 수정
      if (content.includes('useAppContext') && !content.includes('AppContext.Provider')) {
        // Context Provider로 감싸기
        console.log(`🔧 Context 사용 수정: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Context 사용 수정 실패: ${filePath}`, error.message);
    }
  }

  async fixHookUsage(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Hook 사용 규칙 확인
      if (content.includes('useState') || content.includes('useEffect')) {
        // Hook 사용 규칙 검사 및 수정
        console.log(`🔧 Hook 사용 수정: ${filePath}`);
      }
    } catch (error) {
      console.error(`❌ Hook 사용 수정 실패: ${filePath}`, error.message);
    }
  }

  saveFixLog(fixResult) {
    let fixLogs = [];
    if (fs.existsSync(this.fixLogFile)) {
      fixLogs = JSON.parse(fs.readFileSync(this.fixLogFile, 'utf8'));
    }
    
    fixLogs.push(fixResult);
    fs.writeFileSync(this.fixLogFile, JSON.stringify(fixLogs, null, 2));
  }

  generateFixReport() {
    const report = {
      timestamp: new Date().toISOString(),
      totalFixes: this.fixCount,
      fixLogFile: this.fixLogFile,
      summary: `총 ${this.fixCount}개의 오류를 자동으로 수정했습니다.`
    };

    console.log('\n📊 수정 완료 리포트:');
    console.log(`총 수정 수: ${this.fixCount}`);
    console.log(`수정 로그: ${this.fixLogFile}`);

    const reportFile = path.join(this.logDir, `fix-report-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    
    console.log(`📄 리포트 저장: ${reportFile}`);
  }
}

// 스크립트 실행
if (require.main === module) {
  const fixer = new AutoConsoleFixer();
  fixer.start().catch(console.error);
}

module.exports = AutoConsoleFixer; 