// Puppeteer�??�용???�력 ??미리보기 ?�성 ?�스??
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM?�서 __dirname 구현
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 로그 ?�렉?�리 ?�정
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ?�크린샷 ?�렉?�리 ?�정
const screenshotsDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// ?�?�스?�프 ?�성 ?�수
const getTimestamp = () => new Date().toISOString().replace(/[:.]/g, '-');

// 로그 ?�???�수
const saveLog = (filename, data) => {
  const filePath = path.join(logsDir, `${filename}-${getTimestamp()}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`로그가 ?�?�되?�습?�다: ${filePath}`);
};

// ?�크린샷 ?�???�수
const saveScreenshot = async (page, name) => {
  const filePath = path.join(screenshotsDir, `${name}-${getTimestamp()}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  console.log(`?�크린샷???�?�되?�습?�다: ${filePath}`);
};

(async () => {
  // 브라?��? ?�작 (?�드리스 모드 비활?�화 - ?�각?�으�??�인 가??
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1920, height: 1080 },
    args: ['--window-size=1920,1080'],
    timeout: 60000
  });

  try {
    // ???�이지 ?�기
    const page = await browser.newPage();
    
    // 콘솔 로그 ?�집
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
    
    // ?�이지 로드
    console.log('?�이지 로딩 �?..');
    await page.goto(`http://localhost:${process.env.PORT || 34343}`, { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    console.log('?�이지 로드 ?�료');
    
    // 로딩 ?�피?��? ?�다�??�라�??�까지 ?��?
    console.log('로딩 ?�피??체크 �?..');
    const initialSpinnerSelector = '.spinner';
    const initialSpinnerExists = await page.$(initialSpinnerSelector) !== null;
    if (initialSpinnerExists) {
      console.log('초기 로딩 ?�피??감�?, ?�라�??�까지 ?��?..');
      await page.waitForFunction(
        selector => !document.querySelector(selector),
        { timeout: 30000 },
        initialSpinnerSelector
      );
      console.log('로딩 ?�피?��? ?�라졌습?�다.');
      // 추�? ?�정???��?
      await page.waitForTimeout(2000);
    }
    
    // 초기 ?�크린샷
    await saveScreenshot(page, 'initial-page');
    
    // ?�이지 ?�목 ?�인 (timeout 증�?)
    console.log('?�이지 ?�목 찾는 �?..');
    await page.waitForSelector('h1', { visible: true, timeout: 20000 });
    const title = await page.$eval('h1', el => el.textContent);
    console.log(`?�이지 ?�목: ${title}`);
    if (title !== '?�텔 ?�세 ?�이지 ?�성�?) {
      throw new Error(`?�상???�이지 ?�목???�닙?�다. ?�재 ?�목: ${title}`);
    }
    
    // ?�텔 기본 ?�보 ?�션 찾기
    console.log('?�텔 기본 ?�보 ?�션 찾는 �?..');
    await page.waitForSelector('#hotelBase', { visible: true, timeout: 20000 });
    console.log('?�텔 기본 ?�보 ?�션 찾음');
    
    // ?�이???�력?�기
    console.log('?�텔 ?�름 ?�력 �?..');
    await page.waitForSelector('#hotelBase input[name="name"]', { visible: true, timeout: 10000 });
    await page.type('#hotelBase input[name="name"]', '?�펫?�어 ?�스???�텔');
    
    console.log('?�텔 ?�명 ?�력 �?..');
    await page.waitForSelector('#hotelBase textarea[name="description"]', { visible: true, timeout: 10000 });
    await page.type('#hotelBase textarea[name="description"]', '???�텔?� ?�펫?�어 ?�스?��? ?�한 ?�명?�니??\n?�러 �??�력 ?�스??');
    
    // 주소 ?�력 (?�드가 ?�는 경우)
    try {
      console.log('주소 ?�드 ?�인 �?..');
      const addressInputExists = await page.$('#hotelBase input[name="address"]') !== null;
      if (addressInputExists) {
        console.log('주소 ?�력 �?..');
        await page.type('#hotelBase input[name="address"]', '?�울???�스?�구 ?�펫?�어�?123');
      } else {
        console.log('주소 ?�드가 ?�습?�다.');
      }
    } catch (e) {
      console.log('주소 ?�드 ?�인 �??�류:', e.message);
    }
    
    // ?�력 ???�크린샷
    await saveScreenshot(page, 'after-input');
    
    // 미리보기 ?�역 ?�인
    console.log('미리보기 ?�역 ?�인 �?..');
    await page.waitForSelector('#previewContainer', { visible: true, timeout: 10000 });
    
    // 미리보기 ?�성 버튼 ?�릭
    console.log('미리보기 버튼 찾는 �?..');
    // 버튼 ?�스?�로 찾기
    try {
      await page.waitForXPath("//button[contains(text(), '미리보기 ?�성')]", { 
        visible: true, 
        timeout: 10000 
      });
      const [previewButton] = await page.$x("//button[contains(text(), '미리보기 ?�성')]");
      if (!previewButton) throw new Error('미리보기 ?�성 버튼??찾을 ???�습?�다.');
      
      console.log('미리보기 버튼 ?�릭 �?..');
      // 미리보기 버튼 ?�릭 ???�크린샷
      await saveScreenshot(page, 'before-click');
      
      // 버튼 ?�릭
      await previewButton.click();
      console.log('미리보기 버튼 ?�릭 ?�료');
    } catch (e) {
      console.error('미리보기 버튼 ?�릭 �??�류:', e.message);
      
      // ?��?방법: ?�동 갱신 ?�존
      console.log('?�?? ?�동 미리보기 갱신 ?�용');
      // ?�력 ?�드 ?�정?�여 ?�동 갱신 ?�도
      await page.type('#hotelBase input[name="name"]', ' (?�정??');
    }
    
    // 로딩 ?��?(?�피???�는 ?�간 기반)
    console.log('미리보기 ?�성 ?��?�?..');
    await page.waitForTimeout(3000); // 기본 ?��?
    
    // ?�피?��? ?�다�??�피?��? ?�라�??�까지 ?��?
    const spinnerSelector = '#previewContainer .spinner';
    const spinnerExists = await page.$(spinnerSelector) !== null;
    if (spinnerExists) {
      console.log('?�피??감�?, ?�라�??�까지 ?��?..');
      await page.waitForFunction(
        selector => !document.querySelector(selector),
        { timeout: 10000 },
        spinnerSelector
      );
    }
    
    // iframe ?�용 ?�인???�한 ?�크린샷
    await saveScreenshot(page, 'after-preview-generation');
    
    // iframe ?�용 ?�인
    console.log('iframe ?�인 �?..');
    const iframeSelector = '#previewContainer iframe';
    await page.waitForSelector(iframeSelector, { visible: true, timeout: 10000 });
    
    // iframe ?�용 추출 (보안 ?�책???�해 ?�근??차단?????�어 try/catch�?감싸�?
    console.log('iframe ?�용 추출 ?�도...');
    let iframeContent;
    try {
      iframeContent = await page.evaluate(selector => {
        const iframe = document.querySelector(selector);
        if (!iframe) return { error: 'iframe??찾을 ???�습?�다.' };
        
        try {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
          return {
            html: iframeDocument.documentElement.outerHTML,
            text: iframeDocument.body.textContent
          };
        } catch (e) {
          return { error: `iframe ?�근 �??�류: ${e.message}` };
        }
      }, iframeSelector);
    } catch (e) {
      console.warn('iframe ?�용 ?�근 ?�류:', e.message);
      iframeContent = { error: `iframe ?�용 추출 ?�패: ${e.message}` };
    }
    
    // iframe ?�용 로깅
    saveLog('iframe-content', iframeContent || { error: 'iframe ?�용 추출 ?�패' });
    
    // iframe ?�용 검�?
    console.log('iframe ?�용 검�?�?..');
    if (iframeContent && iframeContent.text) {
      const containsHotelName = iframeContent.text.includes('?�펫?�어 ?�스???�텔');
      const containsDescription = iframeContent.text.includes('?�펫?�어 ?�스?��? ?�한 ?�명?�니??);
      
      console.log(`?�텔 ?�름 ?�함: ${containsHotelName}`);
      console.log(`?�텔 ?�명 ?�함: ${containsDescription}`);
      
      if (containsHotelName && containsDescription) {
        console.log('???�스???�공: ?�력???�보가 미리보기???��?�??�시?�니??');
      } else {
        console.log('???�스???�패: ?�력???�보가 미리보기???��?�??�시?��? ?�습?�다.');
        
        // ?�?? ?�체 ?�이지 ?�스???�인
        console.log('?�?? ?�체 ?�이지 ?�스???�인...');
        const pageText = await page.evaluate(() => document.body.innerText);
        const pageHasHotelName = pageText.includes('?�펫?�어 ?�스???�텔');
        const pageHasDescription = pageText.includes('?�펫?�어 ?�스?��? ?�한 ?�명?�니??);
        
        console.log(`?�이지???�텔 ?�름 ?�함: ${pageHasHotelName}`);
        console.log(`?�이지???�텔 ?�명 ?�함: ${pageHasDescription}`);
        
        if (pageHasHotelName && pageHasDescription) {
          console.log('?�️ 참고: iframe?�서??감�??��? ?�았지�??�이지?�는 ?�력???�보가 ?�시?�니??');
        }
      }
    } else if (iframeContent && iframeContent.error) {
      console.log(`?�️ iframe ?�근 ?�류: ${iframeContent.error}`);

      // ?�?�으�?iframe ?�크린샷 찍기
      try {
        const frame = page.frames().find(frame => {
          return frame.parentFrame() === page.mainFrame();
        });
        
        if (frame) {
          console.log('iframe ?�레??찾음. ?�크린샷 찍기 ?�도...');
          const elementHandle = await page.$(iframeSelector);
          if (elementHandle) {
            await elementHandle.screenshot({ 
              path: path.join(screenshotsDir, `iframe-content-${getTimestamp()}.png`) 
            });
            console.log('iframe ?�크린샷 ?�???�료');
          }
        }
      } catch (e) {
        console.warn('iframe ?�크린샷 ?�???�패:', e.message);
      }
    } else {
      console.log('?�️ 경고: iframe ?�용??가?�올 ???�습?�다.');
    }
    
    // 모든 콘솔 로그 ?�??
    saveLog('console-logs', logs);
    
    // 최종 ?�크린샷
    await saveScreenshot(page, 'final-state');
    
    console.log('?�스???�료');
    
  } catch (error) {
    console.error('?�스??�??�류 발생:', error);
    saveLog('error', { error: error.message, stack: error.stack });
    
    // ?�류 발생 ?�에??최종 ?�크린샷 ?�??
    try {
      if (page) {
        await saveScreenshot(page, 'error-state');
      }
    } catch (e) {
      console.error('?�류 ?�태 ?�크린샷 ?�???�패:', e);
    }
  } finally {
    // 10�???브라?��? 종료 (?�크린샷 ?�인???�간)
    console.log('10�???브라?��?가 종료?�니??..');
    await new Promise(resolve => setTimeout(resolve, 10000));
    await browser.close();
  }
})(); 
