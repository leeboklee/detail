// Puppeteer占??占쎌슜???占쎈젰 ??誘몃━蹂닿린 ?占쎌꽦 ?占쎌뒪??
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM?占쎌꽌 __dirname 援ы쁽
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 濡쒓렇 ?占쎈젆?占쎈━ ?占쎌젙
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ?占쏀겕由곗꺑 ?占쎈젆?占쎈━ ?占쎌젙
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// ?占?占쎌뒪?占쏀봽 ?占쎌꽦 ?占쎌닔
const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

// 濡쒓렇 ?占???占쎌닔
const saveLog = (filename, data) => {
  const filePath = path.join(logsDir, `${filename}-${getTimestamp()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`濡쒓렇媛 ?占?占쎈릺?占쎌뒿?占쎈떎: ${filePath}`);
};

// ?占쏀겕由곗꺑 ?占???占쎌닔
const saveScreenshot = async (page, name) => {
  const filePath = path.join(screenshotsDir, `${name}-${getTimestamp()}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`?占쏀겕由곗꺑???占?占쎈릺?占쎌뒿?占쎈떎: ${filePath}`);
};

(async () => {
  // 釉뚮씪?占쏙옙? ?占쎌옉 (?占쎈뱶由ъ뒪 紐⑤뱶 鍮꾪솢?占쏀솕 - ?占쎄컖?占쎌쑝占??占쎌씤 媛??
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--window-size=1920,1080'],
    timeout: 60000
  });

  try {
    // ???占쎌씠吏 ?占쎄린
    const page = await browser.newPage();
    
    // 肄섏넄 濡쒓렇 ?占쎌쭛
    const logs = [];
    page.on('console', msg => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      logs.push(logEntry);
      console.log(`${logEntry.timestamp} [${logEntry.type}] ${logEntry.text}`);
    });
    
    // ?占쎌씠吏 濡쒕뱶
    console.log('?占쎌씠吏 濡쒕뵫 占?..');
    await page.goto(`http://localhost:${process.env.PORT || 3900}`, { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('?占쎌씠吏 濡쒕뱶 ?占쎈즺');
    
    // 濡쒕뵫 ?占쏀뵾?占쏙옙? ?占쎈떎占??占쎈씪占??占쎄퉴吏 ?占쏙옙?
    console.log('濡쒕뵫 ?占쏀뵾??泥댄겕 占?..');
    const initialSpinnerSelector = '.spinner';
    const initialSpinnerExists = await page.$(initialSpinnerSelector) !== null;
    if (initialSpinnerExists) {
      console.log('珥덇린 濡쒕뵫 ?占쏀뵾??媛먲옙?, ?占쎈씪占??占쎄퉴吏 ?占쏙옙?..');
      await page.waitForFunction(
        selector => !document.querySelector(selector),
        { timeout: 30000 },
        initialSpinnerSelector
      );
      console.log('濡쒕뵫 ?占쏀뵾?占쏙옙? ?占쎈씪議뚯뒿?占쎈떎.');
      // 異뷂옙? ?占쎌젙???占쏙옙?
      await page.waitForTimeout(2000);
    }
    
    // 珥덇린 ?占쏀겕由곗꺑
    await saveScreenshot(page, 'initial-page');
    
    // ?占쎌씠吏 ?占쎈ぉ ?占쎌씤 (timeout 利앾옙?)
    console.log('?占쎌씠吏 ?占쎈ぉ 李얜뒗 占?..');
    await page.waitForSelector('h1', { visible: true, timeout: 20000 });
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`?占쎌씠吏 ?占쎈ぉ: ${title}`);
    if (title !== '?占쏀뀛 ?占쎌꽭 ?占쎌씠吏 ?占쎌꽦占?) {
      throw new Error(`?占쎌긽???占쎌씠吏 ?占쎈ぉ???占쎈떃?占쎈떎. ?占쎌옱 ?占쎈ぉ: ${title}`);
    }
    
    // ?占쏀뀛 湲곕낯 ?占쎈낫 ?占쎌뀡 李얘린
    console.log('?占쏀뀛 湲곕낯 ?占쎈낫 ?占쎌뀡 李얜뒗 占?..');
    await page.waitForSelector('#hotelBase', { visible: true, timeout: 20000 });
    console.log('?占쏀뀛 湲곕낯 ?占쎈낫 ?占쎌뀡 李얠쓬');
    
    // ?占쎌씠???占쎈젰?占쎄린
    console.log('?占쏀뀛 ?占쎈쫫 ?占쎈젰 占?..');
    await page.waitForSelector('#hotelBase input[name="name"]', { visible: true, timeout: 10000 });
    await page.type('#hotelBase input[name="name"]', '?占쏀렖?占쎌뼱 ?占쎌뒪???占쏀뀛');
    
    console.log('?占쏀뀛 ?占쎈챸 ?占쎈젰 占?..');
    await page.waitForSelector('#hotelBase textarea[name="description"]', { visible: true, timeout: 10000 });
    await page.type('#hotelBase textarea[name="description"]', '???占쏀뀛?占??占쏀렖?占쎌뼱 ?占쎌뒪?占쏙옙? ?占쏀븳 ?占쎈챸?占쎈땲??\n?占쎈윭 占??占쎈젰 ?占쎌뒪??');
    
    // 二쇱냼 ?占쎈젰 (?占쎈뱶媛 ?占쎈뒗 寃쎌슦)
    try {
      console.log('二쇱냼 ?占쎈뱶 ?占쎌씤 占?..');
      const addressInputExists = await page.$('#hotelBase input[name="address"]') !== null;
      if (addressInputExists) {
        console.log('二쇱냼 ?占쎈젰 占?..');
        await page.type('#hotelBase input[name="address"]', '?占쎌슱???占쎌뒪?占쎄뎄 ?占쏀렖?占쎌뼱占?123');
      } else {
        console.log('二쇱냼 ?占쎈뱶媛 ?占쎌뒿?占쎈떎.');
      }
    } catch (e) {
      console.log('二쇱냼 ?占쎈뱶 ?占쎌씤 占??占쎈쪟:', e.message);
    }
    
    // ?占쎈젰 ???占쏀겕由곗꺑
    await saveScreenshot(page, 'after-input');
    
    // 誘몃━蹂닿린 ?占쎌뿭 ?占쎌씤
    console.log('誘몃━蹂닿린 ?占쎌뿭 ?占쎌씤 占?..');
    await page.waitForSelector('#previewContainer', { visible: true, timeout: 10000 });
    
    // 誘몃━蹂닿린 ?占쎌꽦 踰꾪듉 ?占쎈┃
    console.log('誘몃━蹂닿린 踰꾪듉 李얜뒗 占?..');
    // 踰꾪듉 ?占쎌뒪?占쎈줈 李얘린
    try {
      await page.waitForXPath("//button[contains(text(), '誘몃━蹂닿린 ?占쎌꽦')]", { 
        visible: true, 
        timeout: 10000 
      });
      const [previewButton] = await page.$x("//button[contains(text(), '誘몃━蹂닿린 ?占쎌꽦')]");
      if (!previewButton) throw new Error('誘몃━蹂닿린 ?占쎌꽦 踰꾪듉??李얠쓣 ???占쎌뒿?占쎈떎.');
      
      console.log('誘몃━蹂닿린 踰꾪듉 ?占쎈┃ 占?..');
      // 誘몃━蹂닿린 踰꾪듉 ?占쎈┃ ???占쏀겕由곗꺑
      await saveScreenshot(page, 'before-click');
      
      // 踰꾪듉 ?占쎈┃
      await previewButton.click();
      console.log('誘몃━蹂닿린 踰꾪듉 ?占쎈┃ ?占쎈즺');
    } catch (e) {
      console.error('誘몃━蹂닿린 踰꾪듉 ?占쎈┃ 占??占쎈쪟:', e.message);
      
      // ?占쏙옙?諛⑸쾿: ?占쎈룞 媛깆떊 ?占쎌〈
      console.log('?占?? ?占쎈룞 誘몃━蹂닿린 媛깆떊 ?占쎌슜');
      // ?占쎈젰 ?占쎈뱶 ?占쎌젙?占쎌뿬 ?占쎈룞 媛깆떊 ?占쎈룄
      await page.type('#hotelBase input[name="name"]', ' (?占쎌젙??');
    }
    
    // 濡쒕뵫 ?占쏙옙?(?占쏀뵾???占쎈뒗 ?占쎄컙 湲곕컲)
    console.log('誘몃━蹂닿린 ?占쎌꽦 ?占쏙옙?占?..');
    await page.waitForTimeout(3000); // 湲곕낯 ?占쏙옙?
    
    // ?占쏀뵾?占쏙옙? ?占쎈떎占??占쏀뵾?占쏙옙? ?占쎈씪占??占쎄퉴吏 ?占쏙옙?
    const spinnerSelector = '#previewContainer .spinner';
    const spinnerExists = await page.$(spinnerSelector) !== null;
    if (spinnerExists) {
      console.log('?占쏀뵾??媛먲옙?, ?占쎈씪占??占쎄퉴吏 ?占쏙옙?..');
      await page.waitForFunction(
        selector => !document.querySelector(selector),
        { timeout: 10000 },
        spinnerSelector
      );
    }
    
    // iframe ?占쎌슜 ?占쎌씤???占쏀븳 ?占쏀겕由곗꺑
    await saveScreenshot(page, 'after-preview-generation');
    
    // iframe ?占쎌슜 ?占쎌씤
    console.log('iframe ?占쎌씤 占?..');
    const iframeSelector = '#previewContainer iframe';
    await page.waitForSelector(iframeSelector, { visible: true, timeout: 10000 });
    
    // iframe ?占쎌슜 異붿텧 (蹂댁븞 ?占쎌콉???占쏀빐 ?占쎄렐??李⑤떒?????占쎌뼱 try/catch占?媛먯떥占?
    console.log('iframe ?占쎌슜 異붿텧 ?占쎈룄...');
    let iframeContent;
    try {
      iframeContent = await page.evaluate(selector => {
        const iframe = document.querySelector(selector);
        if (!iframe) return { error: 'iframe??李얠쓣 ???占쎌뒿?占쎈떎.' };
        
        try {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
          return {
            html: iframeDocument.documentElement.outerHTML,
            text: iframeDocument.body.textContent
          };
        } catch (e) {
          return { error: `iframe ?占쎄렐 占??占쎈쪟: ${e.message}` };
        }
      }, iframeSelector);
    } catch (e) {
      console.warn('iframe ?占쎌슜 ?占쎄렐 ?占쎈쪟:', e.message);
      iframeContent = { error: `iframe ?占쎌슜 異붿텧 ?占쏀뙣: ${e.message}` };
    }
    
    // iframe ?占쎌슜 濡쒓퉭
    saveLog('iframe-content', iframeContent || { error: 'iframe ?占쎌슜 異붿텧 ?占쏀뙣' });
    
    // iframe ?占쎌슜 寃占?
    console.log('iframe ?占쎌슜 寃占?占?..');
    if (iframeContent && iframeContent.text) {
      const containsHotelName = iframeContent.text.includes('?占쏀렖?占쎌뼱 ?占쎌뒪???占쏀뀛');
      const containsDescription = iframeContent.text.includes('?占쏀렖?占쎌뼱 ?占쎌뒪?占쏙옙? ?占쏀븳 ?占쎈챸?占쎈땲??);
      
      console.log(`?占쏀뀛 ?占쎈쫫 ?占쏀븿: ${containsHotelName}`);
      console.log(`?占쏀뀛 ?占쎈챸 ?占쏀븿: ${containsDescription}`);
      
      if (containsHotelName && containsDescription) {
        console.log('???占쎌뒪???占쎄났: ?占쎈젰???占쎈낫媛 誘몃━蹂닿린???占쏙옙?占??占쎌떆?占쎈땲??');
      } else {
        console.log('???占쎌뒪???占쏀뙣: ?占쎈젰???占쎈낫媛 誘몃━蹂닿린???占쏙옙?占??占쎌떆?占쏙옙? ?占쎌뒿?占쎈떎.');
        
        // ?占?? ?占쎌껜 ?占쎌씠吏 ?占쎌뒪???占쎌씤
        console.log('?占?? ?占쎌껜 ?占쎌씠吏 ?占쎌뒪???占쎌씤...');
        const pageText = await page.evaluate(() => document.body.innerText);
        const pageHasHotelName = pageText.includes('?占쏀렖?占쎌뼱 ?占쎌뒪???占쏀뀛');
        const pageHasDescription = pageText.includes('?占쏀렖?占쎌뼱 ?占쎌뒪?占쏙옙? ?占쏀븳 ?占쎈챸?占쎈땲??);
        
        console.log(`?占쎌씠吏???占쏀뀛 ?占쎈쫫 ?占쏀븿: ${pageHasHotelName}`);
        console.log(`?占쎌씠吏???占쏀뀛 ?占쎈챸 ?占쏀븿: ${pageHasDescription}`);
        
        if (pageHasHotelName && pageHasDescription) {
          console.log('?占쏙툘 李멸퀬: iframe?占쎌꽌??媛먲옙??占쏙옙? ?占쎌븯吏占??占쎌씠吏?占쎈뒗 ?占쎈젰???占쎈낫媛 ?占쎌떆?占쎈땲??');
        }
      }
    } else if (iframeContent && iframeContent.error) {
      console.log(`?占쏙툘 iframe ?占쎄렐 ?占쎈쪟: ${iframeContent.error}`);

      // ?占?占쎌쑝占?iframe ?占쏀겕由곗꺑 李띻린
      try {
        const frame = page.frames().find(frame => {
          return frame.parentFrame() === page.mainFrame();
        });
        
        if (frame) {
          console.log('iframe ?占쎈젅??李얠쓬. ?占쏀겕由곗꺑 李띻린 ?占쎈룄...');
          const elementHandle = await page.$(iframeSelector);
          if (elementHandle) {
            await elementHandle.screenshot({ 
              path: path.join(screenshotsDir, `iframe-content-${getTimestamp()}.png`) 
            });
            console.log('iframe ?占쏀겕由곗꺑 ?占???占쎈즺');
          }
        }
      } catch (e) {
        console.warn('iframe ?占쏀겕由곗꺑 ?占???占쏀뙣:', e.message);
      }
    } else {
      console.log('?占쏙툘 寃쎄퀬: iframe ?占쎌슜??媛?占쎌삱 ???占쎌뒿?占쎈떎.');
    }
    
    // 紐⑤뱺 肄섏넄 濡쒓렇 ?占??
    saveLog('console-logs', logs);
    
    // 理쒖쥌 ?占쏀겕由곗꺑
    await saveScreenshot(page, 'final-state');
    
    console.log('?占쎌뒪???占쎈즺');
    
  } catch (error) {
    console.error('?占쎌뒪??占??占쎈쪟 諛쒖깮:', error);
    saveLog('error', { error: error.message, stack: error.stack });
    
    // ?占쎈쪟 諛쒖깮 ?占쎌뿉??理쒖쥌 ?占쏀겕由곗꺑 ?占??
    try {
      if (page) {
        await saveScreenshot(page, 'error-state');
      }
    } catch (e) {
      console.error('?占쎈쪟 ?占쏀깭 ?占쏀겕由곗꺑 ?占???占쏀뙣:', e);
    }
  } finally {
    // 10占???釉뚮씪?占쏙옙? 醫낅즺 (?占쏀겕由곗꺑 ?占쎌씤???占쎄컙)
    console.log('10占???釉뚮씪?占쏙옙?媛 醫낅즺?占쎈땲??..');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
})(); 
