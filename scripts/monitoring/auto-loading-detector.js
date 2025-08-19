import React from 'react';
const { chromium } = require('playwright');
const fs = require('fs');

class AutoLoadingDetector {
  constructor() {
    this.browser = null;
    this.page = null;
    this.loadingStates = [];
    this.timeout = 30000;
  }

  async init() {
    this.browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    this.page = await this.browser.newPage();
    
    // 콘솔 로그 수집
    this.page.on('console', msg => {
      this.loadingStates.push({
        type: 'console',
        message: msg.text(),
        timestamp: new Date().toISOString()
      });
    });

    // 페이지 오류 수집
    this.page.on('pageerror', error => {
      this.loadingStates.push({
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    });
  }

  async detectLoadingState() {
    console.log('🔍 로딩 상태 자동 감지 시작...\n');

    try {
      // 페이지 로드
      await this.page.goto('http://localhost:3900', { 
        waitUntil: 'networkidle',
        timeout: this.timeout 
      });

      // 로딩 스피너 감지
      const spinnerSelectors = [
        '.spinner',
        '[data-testid="spinner"]',
        '.loading',
        '.animate-spin',
        'div[style*="animation: spin"]',
        'div[style*="border-top"]'
      ];

      let spinnerFound = false;
      let spinnerInfo = null;

      for (const selector of spinnerSelectors) {
        const spinner = await this.page.$(selector);
        if (spinner) {
          spinnerFound = true;
          spinnerInfo = await this.analyzeSpinner(spinner, selector);
          break;
        }
      }

      // 페이지 내용 분석
      const pageAnalysis = await this.analyzePageContent();

      // 결과 생성
      const result = {
        timestamp: new Date().toISOString(),
        spinner: {
          found: spinnerFound,
          info: spinnerInfo
        },
        page: pageAnalysis,
        console: this.loadingStates.filter(s => s.type === 'console'),
        errors: this.loadingStates.filter(s => s.type === 'error')
      };

      // 결과 출력
      this.printResults(result);

      // 스크린샷 저장
      await this.page.screenshot({ path: 'auto-loading-detection.png' });
      console.log('📸 스크린샷 저장: auto-loading-detection.png');

      // 결과 파일 저장
      fs.writeFileSync('auto-loading-report.json', JSON.stringify(result, null, 2));
      console.log('📄 분석 결과 저장: auto-loading-report.json');

      return result;

    } catch (error) {
      console.error('❌ 로딩 감지 실패:', error.message);
      return { error: error.message };
    }
  }

  async analyzeSpinner(spinner, selector) {
    const info = await spinner.evaluate(el => ({
      className: el.className,
      id: el.id,
      style: el.getAttribute('style'),
      text: el.textContent.trim(),
      visible: el.offsetParent !== null,
      dimensions: {
        width: el.offsetWidth,
        height: el.offsetHeight
      },
      position: {
        x: el.offsetLeft,
        y: el.offsetTop
      }
    }));

    return {
      selector,
      ...info
    };
  }

  async analyzePageContent() {
    const analysis = await this.page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      return {
        title: document.title,
        bodyText: body.textContent.trim().substring(0, 500),
        hasAppContainer: !!document.querySelector('[data-hydrated], .AppContainer, #__next'),
        hasReactRoot: !!document.querySelector('[data-reactroot]'),
        loadingTexts: Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent.includes('Loading') || 
          el.textContent.includes('로딩') ||
          el.textContent.includes('Loading...')
        ).map(el => ({
          text: el.textContent.trim(),
          tagName: el.tagName,
          className: el.className
        })),
        elements: {
          buttons: document.querySelectorAll('button').length,
          inputs: document.querySelectorAll('input').length,
          divs: document.querySelectorAll('div').length,
          spinners: document.querySelectorAll('.spinner, .loading, .animate-spin').length
        }
      };
    });

    return analysis;
  }

  printResults(result) {
    console.log('\n📊 === 로딩 상태 분석 결과 ===\n');

    // 스피너 상태
    if (result.spinner.found) {
      console.log('⚠️ 로딩 스피너 감지됨:');
      console.log(`   선택자: ${result.spinner.info.selector}`);
      console.log(`   텍스트: "${result.spinner.info.text}"`);
      console.log(`   크기: ${result.spinner.info.dimensions.width}x${result.spinner.info.dimensions.height}`);
      console.log(`   위치: (${result.spinner.info.position.x}, ${result.spinner.info.position.y})`);
      console.log(`   가시성: ${result.spinner.info.visible ? '보임' : '숨김'}`);
    } else {
      console.log('✅ 로딩 스피너 없음');
    }

    // 페이지 상태
    console.log('\n📄 페이지 상태:');
    console.log(`   제목: ${result.page.title}`);
    console.log(`   AppContainer: ${result.page.hasAppContainer ? '✅' : '❌'}`);
    console.log(`   React Root: ${result.page.hasReactRoot ? '✅' : '❌'}`);
    console.log(`   로딩 텍스트: ${result.page.loadingTexts.length}개`);

    // 요소 수
    console.log('\n🔢 페이지 요소:');
    console.log(`   버튼: ${result.page.elements.buttons}개`);
    console.log(`   입력필드: ${result.page.elements.inputs}개`);
    console.log(`   DIV: ${result.page.elements.divs}개`);
    console.log(`   스피너: ${result.page.elements.spinners}개`);

    // 오류
    if (result.errors.length > 0) {
      console.log('\n❌ 오류 목록:');
      result.errors.forEach(error => {
        console.log(`   ${error.message}`);
      });
    }

    // 진단 및 해결책
    console.log('\n🔧 진단 및 해결책:');
    if (result.spinner.found && result.page.loadingTexts.length > 0) {
      console.log('   → 페이지가 로딩 중입니다. 서버 상태를 확인하세요.');
      console.log('   → 포트 3900이 사용 중인지 확인하세요.');
      console.log('   → npm run dev 명령이 실행 중인지 확인하세요.');
    } else if (!result.page.hasAppContainer) {
      console.log('   → React 앱이 제대로 로드되지 않았습니다.');
      console.log('   → 빌드 오류나 의존성 문제일 수 있습니다.');
    } else {
      console.log('   → 페이지가 정상적으로 로드되었습니다.');
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// 스크립트 실행
async function main() {
  const detector = new AutoLoadingDetector();
  
  try {
    await detector.init();
    await detector.detectLoadingState();
  } catch (error) {
    console.error('❌ 감지 실패:', error.message);
  } finally {
    await detector.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = AutoLoadingDetector; 