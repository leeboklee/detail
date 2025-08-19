const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
// const screenshot = require('screenshot-desktop'); // screenshot-desktop ?占쏀룷???占쎄굅

(async () => {
  console.log('?占쏀겕由곗꺑, 肄섏넄, ?占쏀듃?占쏀겕 濡쒓렇 罹≪쿂 ?占쎌옉...'); // 濡쒓렇 硫붿떆吏 蹂占?
  
  // ?占???占쎈젆?占쎈━
  const outputDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const browser = await chromium.launch({
    headless: true // ?占쎈㈃??釉뚮씪?占쏙옙? ?占쎌떆?占쏙옙? ?占쎌쓬
  });
  
  const page = await browser.newPage();
  
  // --- 紐⑤뱺 肄섏넄 硫붿떆吏 ?占쎌쭛 --- 
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    // 紐⑤뱺 ?占?占쎌쓽 硫붿떆吏 ?占쎌쭛 (議곌굔 ?占쎄굅)
    consoleMessages.push(`[${type.toUpperCase()}] ${msg.text()}`);
  });

  // --- ?占쏀듃?占쏀겕 濡쒓렇 ?占쎌쭛 --- 
  const networkLogs = [];
  page.on('request', request => {
    networkLogs.push(`[Request] ${request.method()} ${request.url()}`);
  });
  page.on('response', response => {
    networkLogs.push(`[Response] ${response.status()} ${response.url()}`);
  });

  try {
    // ?占쎌씠吏 濡쒕뱶
    console.log('硫붿씤 ?섏씠吏 濡쒕뱶 _ http://localhost:3900');
    await page.goto('http://localhost:3900', { 
      waitUntil: 'networkidle',
      timeout: 30000 // 30???占쎌븘??
    });
    
    console.log('?占쎌씠吏 濡쒕뱶 ?占쎈즺'); // 濡쒓렇 硫붿떆吏 ?占쎈났
    
    // --- ?占쏀겕由곗꺑 ??3占??占쏙옙?異뷂옙? ---
    console.log('?占쏀겕由곗꺑 ??3占??占쏙옙?..');
    await page.waitForTimeout(3000); 

    // --- Playwright ?占쏀겕由곗꺑 肄붾뱶 蹂듦뎄 ---
    const screenshotPath = path.join(outputDir, 'main-page.png');
    console.log('?占쎌씠吏 ?占쏀겕由곗꺑 李띾뒗 占?..');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`?占쏀겕由곗꺑 ?占???占쎈즺: ${screenshotPath}`);

    // --- 誘몃━蹂닿린 ?占쎈꼸 ?占쏙옙????占쎈낫 ?占쎌쭛 異뷂옙? ---
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
            display: computedStyle.display, // ?占쎌씠?占쎌썐 ?占쎌씤??
            border: computedStyle.border // ?占쎈몢占??占쎌씤??
          };
        });
        const stylePath = path.join(outputDir, 'preview-styles.json');
        fs.writeFileSync(stylePath, JSON.stringify(styles, null, 2));
        console.log(`誘몃━蹂닿린 ?占쎈꼸 ?占쏙옙????占???占쎈즺: ${stylePath}`);
      } else {
        console.log('誘몃━蹂닿린 ?占쎈꼸(#preview-container)??李얠쓣 ???占쎌뒿?占쎈떎.');
      }
    } catch (styleError) {
      console.error('誘몃━蹂닿린 ?占쎈꼸 ?占쏙옙????占쎌쭛 占??占쎈쪟:', styleError);
    }
    // --- ?占쏙옙????占쎈낫 ?占쎌쭛 ??---

    // --- screenshot-desktop 愿??肄붾뱶 ?占쎄굅 ---
    // console.log('?占쎌껜 ?占쎈㈃ 罹≪쿂 占?..');
    // await screenshot({ filename: screenshotPath, format: 'png' });
    // console.log(`?占쎌껜 ?占쎈㈃ ?占쏀겕由곗꺑 ?占???占쎈즺: ${screenshotPath}`);

    // 鍮꾨룞占?濡쒓렇 ?占쎌갑???占쏀븳 ?占쏙옙??占쎄컙
    await page.waitForTimeout(1000); // ?占쎈옒?占쏙옙?1占??占쏙옙?

    // 紐⑤뱺 肄섏넄 濡쒓렇 ?占??
    if (consoleMessages.length > 0) {
      const consoleLogPath = path.join(outputDir, 'console-all.txt'); // ?占쎌씪 ?占쎈쫫 蹂占?
      fs.writeFileSync(consoleLogPath, consoleMessages.join('\n'));
      console.log(`紐⑤뱺 肄섏넄 濡쒓렇 ?占???占쎈즺: ${consoleLogPath}`);
    } else {
      console.log('肄섏넄 硫붿떆吏媛 諛쒓껄?占쏙옙? ?占쎌븯?占쎈땲??'); // 濡쒓렇 硫붿떆吏 ?占쎈났
    }

    // ?占쏀듃?占쏀겕 濡쒓렇 ?占??
    if (networkLogs.length > 0) {
      const networkLogPath = path.join(outputDir, 'network-log.txt'); // ???占쎌씪
      fs.writeFileSync(networkLogPath, networkLogs.join('\n'));
      console.log(`?占쏀듃?占쏀겕 濡쒓렇 ?占???占쎈즺: ${networkLogPath}`);
    } else {
      console.log('?占쏀듃?占쏀겕 ?占쎈룞??湲곕줉?占쏙옙? ?占쎌븯?占쎈땲??'); // 濡쒓렇 硫붿떆吏 ?占쎈났
    }

    console.log('?占쏀겕由곗꺑, 肄섏넄, ?占쏀듃?占쏀겕 濡쒓렇 罹≪쿂 ?占쎈즺'); // 濡쒓렇 硫붿떆吏 蹂占?
  } catch (error) {
    console.error('罹≪쿂 占??占쎈쪟 諛쒖깮:', error);
  } finally {
    await browser.close();
  }
})(); 
