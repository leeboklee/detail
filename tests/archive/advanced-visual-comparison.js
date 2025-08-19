const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default || require('pixelmatch');
const fs = require('fs');

class VisualTestingManager {
  constructor() {
    this.baselineDir = './baseline-screenshots/';
    this.currentDir = './current-screenshots/';
    this.diffDir = './diff-screenshots/';
    
    // ?붾젆?좊━ ?앹꽦
    [this.baselineDir, this.currentDir, this.diffDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 踰좎씠?ㅻ씪???앹꽦 (理쒖큹 1??
  async createBaseline() {
    console.log('?뱥 踰좎씠?ㅻ씪???ㅽ겕由곗꺑 ?앹꽦 以?..');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });
    
    try {
      await page.goto('http://localhost: {process.env.PORT || 3900}');
      await page.waitForLoadState('networkidle');
      
      // ?꾩껜 ?섏씠吏
      await page.screenshot({ 
        path: `${this.baselineDir}full-page.png`,
        fullPage: true,
        animations: 'disabled'
      });
      
      // ?ㅻ뜑
      await page.locator('header').screenshot({ 
        path: `${this.baselineDir}header.png` 
      });
      
      // 硫붿씤 洹몃━??
      await page.locator('main').screenshot({ 
        path: `${this.baselineDir}main-grid.png` 
      });
      
      // 媛?移대뱶??
      const cards = await page.locator('[data-testid^="section-card-"]').all();
      for (let i = 0; i < cards.length; i++) {
        await cards[i].screenshot({ 
          path: `${this.baselineDir}card-${i}.png` 
        });
      }
      
      // 諛섏쓳???뚯뒪??
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
      
      console.log('??踰좎씠?ㅻ씪???앹꽦 ?꾨즺!');
      
    } finally {
      await browser.close();
    }
  }

  // ?꾩옱 ?곹깭 罹≪쿂
  async captureCurrentState() {
    console.log('?벜 ?꾩옱 ?곹깭 罹≪쿂 以?..');
    
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({
      viewport: { width: 1280, height: 720 }
    });
    
    try {
      await page.goto('http://localhost: {process.env.PORT || 3900}');
      await page.waitForLoadState('networkidle');
      
      // ?꾩껜 ?섏씠吏
      await page.screenshot({ 
        path: `${this.currentDir}full-page.png`,
        fullPage: true,
        animations: 'disabled'
      });
      
      // ?ㅻ뜑
      await page.locator('header').screenshot({ 
        path: `${this.currentDir}header.png` 
      });
      
      // 硫붿씤 洹몃━??
      await page.locator('main').screenshot({ 
        path: `${this.currentDir}main-grid.png` 
      });
      
      // 媛?移대뱶??
      const cards = await page.locator('[data-testid^="section-card-"]').all();
      for (let i = 0; i < cards.length; i++) {
        await cards[i].screenshot({ 
          path: `${this.currentDir}card-${i}.png` 
        });
      }
      
      // 諛섏쓳???뚯뒪??
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
      
      console.log('???꾩옱 ?곹깭 罹≪쿂 ?꾨즺!');
      
    } finally {
      await browser.close();
    }
  }

  // ?대?吏 鍮꾧탳
  compareImages(baselinePath, currentPath, diffPath) {
    if (!fs.existsSync(baselinePath)) {
      console.log(`?좑툘 踰좎씠?ㅻ씪???놁쓬: ${baselinePath}`);
      return { match: false, reason: 'no-baseline' };
    }
    
    if (!fs.existsSync(currentPath)) {
      console.log(`?좑툘 ?꾩옱 ?대?吏 ?놁쓬: ${currentPath}`);
      return { match: false, reason: 'no-current' };
    }
    
    const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
    const current = PNG.sync.read(fs.readFileSync(currentPath));
    
    if (baseline.width !== current.width || baseline.height !== current.height) {
      console.log(`?좑툘 ?대?吏 ?ш린 遺덉씪移? ${baselinePath}`);
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
    
    // diff ?대?吏 ???
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    
    const totalPixels = baseline.width * baseline.height;
    const diffPercentage = (numDiffPixels / totalPixels) * 100;
    
    return {
      match: diffPercentage < 0.2, // 0.2% 誘몃쭔 李⑥씠硫??쇱튂濡?媛꾩＜
      diffPixels: numDiffPixels,
      totalPixels,
      diffPercentage: diffPercentage.toFixed(2)
    };
  }

  // ?꾩껜 鍮꾧탳 ?ㅽ뻾
  async runComparison() {
    console.log('?뵇 Visual Regression Testing ?쒖옉...');
    
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
        console.log(`??${testCase}: ?쇱튂`);
      } else {
        console.log(`??${testCase}: 遺덉씪移?(${result.diffPercentage}% 李⑥씠)`);
      }
    }
    
    // 寃곌낵 ?붿빟
    const passed = results.filter(r => r.match).length;
    const failed = results.length - passed;
    
    console.log('\n?뱤 ?뚯뒪??寃곌낵 ?붿빟:');
    console.log(`???듦낵: ${passed}媛?);
    console.log(`???ㅽ뙣: ${failed}媛?);
    console.log(`?뱢 ?듦낵?? ${((passed / results.length) * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n?뵇 ?ㅽ뙣???뚯뒪?몃뱾:');
      results
        .filter(r => !r.match)
        .forEach(r => {
          console.log(`  - ${r.testCase}: ${r.reason || r.diffPercentage + '% 李⑥씠'}`);
        });
    }
    
    return results;
  }
}

// ?ъ슜 ?덉떆
async function main() {
  const vtm = new VisualTestingManager();
  
  // 泥??ㅽ뻾?쒖뿉??踰좎씠?ㅻ씪???앹꽦
  const baselineExists = fs.existsSync('./baseline-screenshots/full-page.png');
  
  if (!baselineExists) {
    console.log('?룛截?踰좎씠?ㅻ씪?몄씠 ?놁뼱???앹꽦?⑸땲??..');
    await vtm.createBaseline();
    console.log('?렞 踰좎씠?ㅻ씪???앹꽦 ?꾨즺! ?댁젣 ?ㅼ떆 ?ㅽ뻾?섎㈃ 鍮꾧탳媛 ?⑸땲??');
    return;
  }
  
  // ?꾩옱 ?곹깭 罹≪쿂
  await vtm.captureCurrentState();
  
  // 鍮꾧탳 ?ㅽ뻾
  await vtm.runComparison();
}

// 紐낅졊???몄옄 泥섎━
const args = process.argv.slice(2);
if (args.includes('--baseline')) {
  const vtm = new VisualTestingManager();
  vtm.createBaseline().then(() => {
    console.log('?렞 踰좎씠?ㅻ씪???ъ깮???꾨즺!');
  });
} else {
  main();
} 
