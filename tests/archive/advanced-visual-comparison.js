const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default || require('pixelmatch');
const fs = require('fs');

class VisualTestingManager {
  constructor() {
    this.baselineDir = './baseline-screenshots/';
    this.currentDir = './current-screenshots/';
    this.diffDir = './diff-screenshots/';
    
    // 디렉토리 생성
    [this.baselineDir, this.currentDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 베이스라인 생성 (최초 1회)
  async createBaseline() {
    console.log('📋 베이스라인 스크린샷 생성 중...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });
    
    try {
      await page.goto('http://localhost: {process.env.PORT || 34343}');
      await page.waitForLoadState('networkidle');
      
      // 전체 페이지
      await page.screenshot({ 
        path: `${this.baselineDir}full-page.png`,
        fullPage: true,
        animations: 'disabled'
      });
      
      // 헤더
      await page.locator('header').screenshot({ 
        path: `${this.baselineDir}header.png` 
      });
      
      // 메인 그리드
      await page.locator('main').screenshot({ 
        path: `${this.baselineDir}main-grid.png` 
      });
      
      // 각 카드들
      const cards = await page.locator('[data-testid^="section-card-"]').all();
      for (let i = 0; i < cards.length; i++) {
        await cards[i].screenshot({ 
          path: `${this.baselineDir}card-${i}.png` 
        });
      }
      
      // 반응형 테스트
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 }
      ];
      
      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.screenshot({ 
          path: `${this.baselineDir}${vp.name}.png`,
          fullPage: true 
        });
      }
      
      console.log('✅ 베이스라인 생성 완료!');
      
    } finally {
      await browser.close();
    }
  }

  // 현재 상태 캡처
  async captureCurrentState() {
    console.log('📷 현재 상태 캡처 중...');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });
    
    try {
      await page.goto('http://localhost: {process.env.PORT || 34343}');
      await page.waitForLoadState('networkidle');
      
      // 전체 페이지
      await page.screenshot({ 
        path: `${this.currentDir}full-page.png`,
        fullPage: true,
        animations: 'disabled'
      });
      
      // 헤더
      await page.locator('header').screenshot({ 
        path: `${this.currentDir}header.png` 
      });
      
      // 메인 그리드
      await page.locator('main').screenshot({ 
        path: `${this.currentDir}main-grid.png` 
      });
      
      // 각 카드들
      const cards = await page.locator('[data-testid^="section-card-"]').all();
      for (let i = 0; i < cards.length; i++) {
        await cards[i].screenshot({ 
          path: `${this.currentDir}card-${i}.png` 
        });
      }
      
      // 반응형 테스트
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1920, height: 1080 }
      ];
      
      for (const vp of viewports) {
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.screenshot({ 
          path: `${this.currentDir}${vp.name}.png`,
          fullPage: true 
        });
      }
      
      console.log('✅ 현재 상태 캡처 완료!');
      
    } finally {
      await browser.close();
    }
  }

  // 이미지 비교
  compareImages(baselinePath, currentPath, diffPath) {
    if (!fs.existsSync(baselinePath)) {
      console.log(`⚠️ 베이스라인 없음: ${baselinePath}`);
      return { match: false, reason: 'no-baseline' };
    }
    
    if (!fs.existsSync(currentPath)) {
      console.log(`⚠️ 현재 이미지 없음: ${currentPath}`);
      return { match: false, reason: 'no-current' };
    }
    
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));
    
    if (baseline.width !== current.width || baseline.height !== current.height) {
      console.log(`⚠️ 이미지 크기 불일치: ${baselinePath}`);
      return { 
        match: false, 
        reason: 'size-mismatch',
        baselineSize: { width: baseline.width, height: baseline.height },
        currentSize: { width: current.width, height: current.height }
      };
    }
    
    const diff = new PNG({ width: baseline.width, height: baseline.height });
    const numDiffPixels = pixelmatch(
      baseline.data, 
      current.data, 
      diff.data,
      baseline.width, 
      baseline.height, 
      { threshold: 0.2 }
    );
    
    // diff 이미지 저장
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    
    const totalPixels = baseline.width * baseline.height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;
    
    return {
      match: diffPercentage < 0.2, // 0.2% 미만 차이면 일치로 간주
      diffPixels: numDiffPixels,
      totalPixels,
      diffPercentage: diffPercentage.toFixed(2)
    };
  }

  // 전체 비교 실행
  async runComparison() {
    console.log('🔍 Visual Regression Testing 시작...');
    
    const testCases = [
      'full-page.png',
      'header.png', 
      'main-grid.png',
      'card-0.png',
      'card-1.png',
      'card-2.png',
      'card-3.png',
      'card-4.png',
      'card-5.png',
      'card-6.png',
      'card-7.png',
      'card-8.png',
      'mobile.png',
      'tablet.png',
      'desktop.png'
    ];
    
    const results = [];
    
    for (const testCase of testCases) {
      const baselinePath = `${this.baselineDir}${testCase}`;
      const currentPath = `${this.currentDir}${testCase}`;
      const diffPath = `${this.diffDir}${testCase}`;
      
      const result = this.compareImages(baselinePath, currentPath, diffPath);
      
      results.push({
        testCase,
        ...result
      });
      
      if (result.match) {
        console.log(`✅ ${testCase}: 일치`);
      } else {
        console.log(`❌ ${testCase}: 불일치 (${result.diffPercentage}% 차이)`);
      }
    }
    
    // 결과 요약
    const passed = results.filter(r => r.match).length;
    const failed = results.length - passed;
    
    console.log('\n📊 테스트 결과 요약:');
    console.log(`✅ 통과: ${passed}개`);
    console.log(`❌ 실패: ${failed}개`);
    console.log(`📈 통과율: ${((passed / results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n🔍 실패한 테스트들:');
      results
        .filter(r => !r.match)
        .forEach(r => {
          console.log(`  - ${r.testCase}: ${r.reason || r.diffPercentage + '% 차이'}`);
        });
    }
    
    return results;
  }
}

// 사용 예시
async function main() {
  const vtm = new VisualTestingManager();
  
  // 첫 실행시에는 베이스라인 생성
  const baselineExists = fs.existsSync('./baseline-screenshots/full-page.png');
  
  if (!baselineExists) {
    console.log('🏗️ 베이스라인이 없어서 생성합니다...');
    await vtm.createBaseline();
    console.log('🎯 베이스라인 생성 완료! 이제 다시 실행하면 비교가 됩니다.');
    return;
  }
  
  // 현재 상태 캡처
  await vtm.captureCurrentState();
  
  // 비교 실행
  await vtm.runComparison();
}

// 명령행 인자 처리
const args = process.argv.slice(2);
if (args.includes('--baseline')) {
  const vtm = new VisualTestingManager();
  vtm.createBaseline().then(() => {
    console.log('🎯 베이스라인 재생성 완료!');
  });
} else {
  main();
} 