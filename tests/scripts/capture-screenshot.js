const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
// const screenshot = require('screenshot-desktop'); // screenshot-desktop ?�포???�거

(async () => {
  console.log('?�크린샷, 콘솔, ?�트?�크 로그 캡처 ?�작...'); // 로그 메시지 변�?
  
  // ?�???�렉?�리
  const outputDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const browser = await chromium.launch({
    headless: true // ?�면??브라?��? ?�시?��? ?�음
  });
  
  const page = await browser.newPage();
  
  // --- 모든 콘솔 메시지 ?�집 --- 
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    // 모든 ?�?�의 메시지 ?�집 (조건 ?�거)
    consoleMessages.push(`[${type.toUpperCase()}] ${msg.text()}`);
  });

  // --- ?�트?�크 로그 ?�집 --- 
  const networkLogs = [];
  page.on('request', request => {
    networkLogs.push(`[Request] ${request.method()} ${request.url()}`);
  });
  page.on('response', response => {
    networkLogs.push(`[Response] ${response.status()} ${response.url()}`);
  });

  try {
    // ?�이지 로드
    console.log('메인 페이지 로드 _ http://localhost:34343');
    await page.goto('http://localhost:34343', { 
      waitUntil: 'networkidle',
      timeout: 30000 // 30???�아??
    });
    
    console.log('?�이지 로드 ?�료'); // 로그 메시지 ?�복
    
    // --- ?�크린샷 ??3�??��?추�? ---
    console.log('?�크린샷 ??3�??��?..');
    await page.waitForTimeout(3000); 

    // --- Playwright ?�크린샷 코드 복구 ---
    const screenshotPath = path.join(outputDir, 'main-page.png');
    console.log('?�이지 ?�크린샷 찍는 �?..');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`?�크린샷 ?�???�료: ${screenshotPath}`);

    // --- 미리보기 ?�널 ?��????�보 ?�집 추�? ---
    try {
      const previewElement = await page.$('#preview-container');
      if (previewElement) {
        const styles = await previewElement.evaluate(element => {
          const computedStyle = window.getComputedStyle(element);
          return {
            position: computedStyle.position,
            top: computedStyle.top,
            right: computedStyle.right,
            width: computedStyle.width,
            height: computedStyle.height,
            zIndex: computedStyle.zIndex,
            display: computedStyle.display, // ?�이?�웃 ?�인??
            border: computedStyle.border // ?�두�??�인??
          };
        });
        const stylePath = path.join(outputDir, 'preview-styles.json');
        fs.writeFileSync(stylePath, JSON.stringify(styles, null, 2));
        console.log(`미리보기 ?�널 ?��????�???�료: ${stylePath}`);
      } else {
        console.log('미리보기 ?�널(#preview-container)??찾을 ???�습?�다.');
      }
    } catch (styleError) {
      console.error('미리보기 ?�널 ?��????�집 �??�류:', styleError);
    }
    // --- ?��????�보 ?�집 ??---

    // --- screenshot-desktop 관??코드 ?�거 ---
    // console.log('?�체 ?�면 캡처 �?..');
    // await screenshot({ filename: screenshotPath, format: 'png' });
    // console.log(`?�체 ?�면 ?�크린샷 ?�???�료: ${screenshotPath}`);

    // 비동�?로그 ?�착???�한 ?��??�간
    await page.waitForTimeout(1000); // ?�래?��?1�??��?

    // 모든 콘솔 로그 ?�??
    if (consoleMessages.length > 0) {
      const consoleLogPath = path.join(outputDir, 'console-all.txt'); // ?�일 ?�름 변�?
      fs.writeFileSync(consoleLogPath, consoleMessages.join('\n'));
      console.log(`모든 콘솔 로그 ?�???�료: ${consoleLogPath}`);
    } else {
      console.log('콘솔 메시지가 발견?��? ?�았?�니??'); // 로그 메시지 ?�복
    }

    // ?�트?�크 로그 ?�??
    if (networkLogs.length > 0) {
      const networkLogPath = path.join(outputDir, 'network-log.txt'); // ???�일
      fs.writeFileSync(networkLogPath, networkLogs.join('\n'));
      console.log(`?�트?�크 로그 ?�???�료: ${networkLogPath}`);
    } else {
      console.log('?�트?�크 ?�동??기록?��? ?�았?�니??'); // 로그 메시지 ?�복
    }

    console.log('?�크린샷, 콘솔, ?�트?�크 로그 캡처 ?�료'); // 로그 메시지 변�?
  } catch (error) {
    console.error('캡처 �??�류 발생:', error);
  } finally {
    await browser.close();
  }
})(); 
