import React from 'react';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

class AutoUIStateMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.monitoring = false;
    this.checkInterval = 5000; // 5초마다 체크
    this.maxRetries = 3;
    this.retryCount = 0;
  }

  async init() {
    console.log('🔧 UI 상태 모니터 초기화...');
    
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    this.page = await this.browser.newPage();
    
    // 이벤트 리스너 설정
    this.page.on('console', msg => this.logConsole(msg));
    this.page.on('pageerror', error => this.logError(error));
    this.page.on('requestfailed', request => this.logRequestFailed(request));
  }

  logConsole(msg) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'console',
      level: msg.type(),
      message: msg.text()
    };
    this.saveLog(logEntry);
  }

  logError(error) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      message: error.message,
      stack: error.stack
    };
    this.saveLog(logEntry);
  }

  logRequestFailed(request) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      type: 'request_failed',
      url: request.url(),
      method: request.method(),
      failure: request.failure().errorText
    };
    this.saveLog(logEntry);
  }

  saveLog(logEntry) {
    const logFile = 'ui-monitor-logs.json';
    let logs = [];
    
    try {
      if (fs.existsSync(logFile)) {
        logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));
      }
    } catch (error) {
      console.log('로그 파일 읽기 실패, 새로 생성');
    }
    
    logs.push(logEntry);
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
  }

  async startMonitoring() {
    console.log('🚀 UI 상태 모니터링 시작...\n');
    this.monitoring = true;
    
    while (this.monitoring) {
      try {
        await this.checkUIState();
        await this.sleep(this.checkInterval);
      } catch (error) {
        console.error('❌ 모니터링 오류:', error.message);
        this.retryCount++;
        
        if (this.retryCount >= this.maxRetries) {
          console.log('🔄 최대 재시도 횟수 도달, 모니터링 중지');
          break;
        }
        
        await this.sleep(2000);
      }
    }
  }

  async checkUIState() {
    const state = await this.analyzeCurrentState();
    const issues = this.detectIssues(state);
    
    if (issues.length > 0) {
      console.log(`⚠️ ${issues.length}개 문제 감지됨:`);
      issues.forEach(issue => {
        console.log(`   - ${issue.type}: ${issue.description}`);
      });
      
      await this.autoFix(issues, state);
    } else {
      console.log('✅ UI 상태 정상');
    }
    
    // 상태 저장
    this.saveState(state);
  }

  async analyzeCurrentState() {
    try {
      const state = await this.page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        
        // 로딩 상태 감지
        const loadingSelectors = [
          '.spinner',
          '[data-testid="spinner"]',
          '.loading',
          '.animate-spin',
          'div[style*="animation: spin"]',
          'div[style*="border-top"]'
        ];
        
        const loadingElements = loadingSelectors.map(selector => {
          const elements = document.querySelectorAll(selector);
          return Array.from(elements).map(el => ({
            selector,
            text: el.textContent.trim(),
            visible: el.offsetParent !== null,
            dimensions: {
              width: el.offsetWidth,
              height: el.offsetHeight
            }
          }));
        }).flat();

        // 페이지 상태
        const pageState = {
          title: document.title,
          url: window.location.href,
          readyState: document.readyState,
          hasAppContainer: !!document.querySelector('[data-hydrated], .AppContainer, #__next'),
          hasReactRoot: !!document.querySelector('[data-reactroot]'),
          bodyText: body.textContent.trim().substring(0, 200),
          loadingTexts: Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent.includes('Loading') || 
            el.textContent.includes('로딩') ||
            el.textContent.includes('Loading...')
          ).map(el => ({
            text: el.textContent.trim(),
            tagName: el.tagName,
            className: el.className
          }))
        };

        // 요소 수
        const elements = {
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          divs: document.querySelectorAll('div').length,
          spinners: document.querySelectorAll('.spinner, .loading, .animate-spin').length,
          forms: document.querySelectorAll('form').length
        };

        return {
          timestamp: new Date().toISOString(),
          loading: {
            elements: loadingElements,
            count: loadingElements.length
          },
          page: pageState,
          elements,
          performance: {
            loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
            domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
          }
        };
      });

      return state;
    } catch (error) {
      return {
        timestamp: new Date().toISOString(),
        error: error.message,
        loading: { elements: [], count: 0 },
        page: { title: 'Error', readyState: 'error' },
        elements: { buttons: 0, inputs: 0, divs: 0, spinners: 0, forms: 0 }
      };
    }
  }

  detectIssues(state) {
    const issues = [];

    // 로딩 스피너가 너무 오래 보이는 경우
    if (state.loading.count > 0) {
      issues.push({
        type: 'loading_spinner',
        severity: 'warning',
        description: `로딩 스피너 ${state.loading.count}개 감지됨`,
        data: state.loading
      });
    }

    // React 앱이 로드되지 않은 경우
    if (!state.page.hasAppContainer && !state.page.hasReactRoot) {
      issues.push({
        type: 'react_not_loaded',
        severity: 'error',
        description: 'React 앱이 로드되지 않음',
        data: state.page
      });
    }

    // 페이지가 비어있는 경우
    if (state.elements.divs < 5 && state.elements.buttons === 0) {
      issues.push({
        type: 'empty_page',
        severity: 'error',
        description: '페이지가 비어있음',
        data: state.elements
      });
    }

    // 로딩 텍스트가 많은 경우
    if (state.page.loadingTexts.length > 3) {
      issues.push({
        type: 'excessive_loading',
        severity: 'warning',
        description: `로딩 텍스트 ${state.page.loadingTexts.length}개 감지됨`,
        data: state.page.loadingTexts
      });
    }

    return issues;
  }

  async autoFix(issues, state) {
    console.log('🔧 자동 수정 시도...');

    for (const issue of issues) {
      switch (issue.type) {
        case 'react_not_loaded':
          await this.fixReactNotLoaded();
          break;
        case 'empty_page':
          await this.fixEmptyPage();
          break;
        case 'loading_spinner':
          await this.fixLoadingSpinner();
          break;
        default:
          console.log(`   알 수 없는 문제 유형: ${issue.type}`);
      }
    }
  }

  async fixReactNotLoaded() {
    console.log('   → React 로드 문제 해결 시도...');
    
    try {
      // 페이지 새로고침
      await this.page.reload({ waitUntil: 'networkidle', timeout: 30000 });
      console.log('   ✅ 페이지 새로고침 완료');
    } catch (error) {
      console.log(`   ❌ 페이지 새로고침 실패: ${error.message}`);
    }
  }

  async fixEmptyPage() {
    console.log('   → 빈 페이지 문제 해결 시도...');
    
    try {
      // 서버 상태 확인
      const response = await this.page.goto('http://localhost:3900', { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      if (response.status() === 200) {
        console.log('   ✅ 서버 응답 정상');
      } else {
        console.log(`   ⚠️ 서버 응답: ${response.status()}`);
      }
    } catch (error) {
      console.log(`   ❌ 서버 연결 실패: ${error.message}`);
    }
  }

  async fixLoadingSpinner() {
    console.log('   → 로딩 스피너 문제 해결 시도...');
    
    try {
      // 로딩 스피너가 사라질 때까지 대기
      await this.page.waitForFunction(
        () => document.querySelectorAll('.spinner, .loading, .animate-spin').length === 0,
        { timeout: 10000 }
      );
      console.log('   ✅ 로딩 스피너 해결됨');
    } catch (error) {
      console.log(`   ⚠️ 로딩 스피너 대기 시간 초과: ${error.message}`);
    }
  }

  saveState(state) {
    const stateFile = 'ui-current-state.json';
    fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async stop() {
    console.log('⏹️ UI 상태 모니터링 중지...');
    this.monitoring = false;
    
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 스크립트 실행
async function main() {
  const monitor = new AutoUIStateMonitor();
  
  try {
    await monitor.init();
    
    // 페이지 로드
    console.log('📄 페이지 로드 중...');
    await monitor.page.goto('http://localhost:3900', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    console.log('✅ 페이지 로드 완료');
    
    // 모니터링 시작
    await monitor.startMonitoring();
    
  } catch (error) {
    console.error('❌ 모니터링 실패:', error.message);
  } finally {
    await monitor.stop();
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoUIStateMonitor; 