const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 濡쒓렇 以묐났 諛⑼옙? ?占쏀띁 ?占쎌닔
function addUniqueLog(logArray, newLog, maxBufferSize = 5) {
  // 留덌옙?占?濡쒓렇?占??占쎌씪?占쎈㈃ 移댁슫??利앾옙? ?占쎈뒗 ?占쎈줈 異뷂옙?
  if (logArray.length > 0) {
    const lastLog = logArray[logArray.length - 1];
    if (typeof lastLog === 'object' && lastLog.log === newLog) {
      lastLog.count++;
      return; // 諛곗뿴 蹂占??占쎌쓬
    }
  }
  // ??濡쒓렇 ?占쎈뒗 ?占쎌쟾占??占쎈Ⅸ 濡쒓렇
  logArray.push({ log: newLog, count: 1 });

  // 踰꾪띁 ?占쎄린 ?占쏙옙? (?占쎈옒??濡쒓렇 ?占쎄굅)
  if (logArray.length > maxBufferSize) {
    logArray.shift();
  }
}

// 濡쒓렇 諛곗뿴??臾몄옄??諛곗뿴占?蹂??(異쒕젰??
function formatLogs(logArray) {
  return logArray.map(item => {
    return item.count > 1 ? `${item.log} (x${item.count})` : item.log;
  });
}

(async () => {
  console.log('?占쎌씠吏 遺꾩꽍 ?占쎌옉...');
  
  // 寃곌낵 ?占???占쎈젆?占쎈━
  const analysisDir = path.join(__dirname, 'analysis');
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 濡쒓렇 踰꾪띁 (以묐났 媛먲옙???
  const mainLogBuffer = [];
  const iframeLogBuffer = [];
  // 理쒖쥌 ?占?占쎈맆 濡쒓렇 諛곗뿴
  let collectedLogs = [];

  try {
    // 硫붿씤 ?占쎌씠吏 肄섏넄 濡쒓렇 ?占쎌쭛 ?占쎌젙 (寃쎄퀬 ?占쏀븿, 踰꾪띁 ?占쎌슜)
    page.on('console', msg => {
      const type = msg.type(); // error, warning, log, info, debug ??
      const logText = `[Main - ${type}] ${msg.text()}`;
      addUniqueLog(mainLogBuffer, logText);
    });

    // ?占쎌씠吏 濡쒕뱶
    console.log(`?섏씠吏 濡쒕뱶 ??http://localhost:${process.env.PORT || 3900}`);
    await page.goto(`http://localhost:${process.env.PORT || 3900}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('?占쎌씠吏 濡쒕뱶 ?占쎈즺, 遺꾩꽍 占?..');

    // iframe 李얘린 占?肄섏넄 由ъ뒪??異뷂옙? (寃쎄퀬 ?占쏀븿, 踰꾪띁 ?占쎌슜)
    try {
      // iframe ?占쎌냼媛 ?占쏙옙????占쎄퉴吏 ?占쏙옙?
      // console.log('誘몃━蹂닿린 iframe ?占쎌냼 ?占쏙옙??占쎌옉...'); // ?占쎈쾭占?濡쒓렇 ?占쎄굅
      await page.waitForSelector('iframe[data-testid="preview-iframe"]', { timeout: 5000 }); 
      // console.log('誘몃━蹂닿린 iframe ?占쎌냼 諛쒓껄??'); // ?占쎈쾭占?濡쒓렇 ?占쎄굅

      // ?占쎌씠吏??紐⑤뱺 ?占쎈젅??媛?占쎌삤占?(iframe 濡쒕뱶 ??
      // console.log('--- ?占쎈젅???占쎈낫 ?占쎈쾭占??占쎌옉 ---'); // ?占쎈쾭占?濡쒓렇 ?占쎄굅
      const frames = page.frames();
      // console.log(`占??占쎈젅???? ${frames.length}`); // ?占쎈쾭占?濡쒓렇 ?占쎄굅
      
      let previewFrame = null;
      for (const frame of frames) {
        const frameUrl = frame.url();
        // const frameName = frame.name(); // name?占??占쎌슜 ???占쏙옙?占??占쎄굅
        // console.log(`  - Frame URL: ${frameUrl}, Frame Name: ${frameName}`); // ?占쎈쾭占?濡쒓렇 ?占쎄굅

        // ?占쎈퀎 濡쒖쭅 (srcdoc 湲곕컲)
        if (frameUrl.startsWith('about:srcdoc')) { 
          // console.log(`    >> srcdoc ?占쎈젅??諛쒓껄!`); // ?占쎈쾭占?濡쒓렇 ?占쎄굅
          previewFrame = frame;
          break; // 李얠븯?占쎈㈃ ???占쏀쉶???占쎌슂 ?占쎌쑝誘占?break ?占쎌꽦??
        }
      }
      // console.log('--- ?占쎈젅???占쎈낫 ?占쎈쾭占???---'); // ?占쎈쾭占?濡쒓렇 ?占쎄굅

      if (previewFrame) {
        await previewFrame.waitForLoadState('domcontentloaded'); 
        previewFrame.on('console', msg => {
          const type = msg.type();
          const logText = `[Iframe - ${type}] ${msg.text()}`;
          addUniqueLog(iframeLogBuffer, logText);
        });
        console.log('誘몃━蹂닿린 iframe 肄섏넄 由ъ뒪??異뷂옙???); // 硫붿떆吏 媛꾧껐??
      } else {
          console.log('誘몃━蹂닿린 iframe ?占쎌냼占?李억옙? 紐삵븿'); // 硫붿떆吏 媛꾧껐??
      }
    } catch (e) {
      if (e.name === 'TimeoutError') {
        console.log('誘몃━蹂닿린 iframe ?占쎌냼占??占쎄컙 ?占쎌뿉 李억옙? 紐삵뻽?占쎈땲??');
      } else {
        console.warn('iframe ?占쎌냼 ?占쏙옙?泥섎━ 占??占쎈쪟:', e.message);
      }
    }

    // 遺꾩꽍 濡쒖쭅 ?占쏀뻾 ???占쎌떆 ?占쏙옙?(鍮꾨룞占??占쎌뾽 ?占쎈즺 ?占쎄컙 ?占쎈낫)
    await page.waitForTimeout(500);
    
    // ?占쎌씠吏 ?占?占쏙옙? 媛?占쎌삤占?
    const title = await page.title();
    
    // UI 援ъ“ 遺꾩꽍
    const uiAnalysis = await page.evaluate(() => {
      const analysis = {
        title: document.title,
        sections: [],
        errors: [],
        visibility: {
          previewVisible: false,
          inputFormsVisible: false
        }
      };
      
      // 二쇱슂 而⑦뀒?占쎈꼫 占??占쎌뀡 ?占쎌씤
      const containers = Array.from(document.querySelectorAll('main > div, section'));
      analysis.mainContainers = containers.length;
      
      // ?占쎌뀡 ?占쎈낫 ?占쎌쭛
      const sections = Array.from(document.querySelectorAll('section'));
      analysis.sections = sections.map(section => {
        const title = section.querySelector('h1, h2, h3, h4')?.textContent?.trim() || '?占쎈ぉ ?占쎌쓬';
        const forms = section.querySelectorAll('form, input, select, textarea').length;
        const buttons = section.querySelectorAll('button').length;
        return { title, forms, buttons };
      });
      
      // 誘몃━蹂닿린 ?占쎌뿭 ?占쎌씤
      const preview = document.querySelector('[data-testid="preview"], .preview, #preview');
      if (preview) {
        analysis.visibility.previewVisible = true;
        analysis.preview = {
          width: preview.offsetWidth,
          height: preview.offsetHeight,
          visible: window.getComputedStyle(preview).display !== 'none'
        };
      }
      
      // ?占쎈젰 ???占쎌씤
      const forms = document.querySelectorAll('form, .form-container, [data-testid="form"]');
      if (forms.length > 0) {
        analysis.visibility.inputFormsVisible = true;
        analysis.forms = {
          count: forms.length,
          inputFields: document.querySelectorAll('input, select, textarea').length
        };
      }
      
      // ?占쎈쪟 硫붿떆吏 ?占쎌쭛
      const errorElements = document.querySelectorAll('.error, .alert-danger, [data-testid="error"]');
      analysis.errors = Array.from(errorElements).map(el => el.textContent.trim());
      
      // 而댄룷?占쏀듃 ?占쎈뜑占??占쎌씤
      analysis.componentCheck = {
        hotelInfo: !!document.querySelector('[data-testid="hotel-info"], .hotel-info'),
        roomInfo: !!document.querySelector('[data-testid="room-info"], .room-info'),
        facilitiesInfo: !!document.querySelector('[data-testid="facilities-info"], .facilities-info')
      };
      
      return analysis;
    });
    
    // ?占쎌씠吏 ?占쎈뒫 痢≪젙
    const performanceMetrics = await page.evaluate(() => {
      const performance = window.performance;
      if (!performance) return { error: 'Performance API not available' };
      
      const navTiming = performance.timing;
      const loadTime = navTiming.loadEventEnd - navTiming.navigationStart;
      const domReadyTime = navTiming.domContentLoadedEventEnd - navTiming.navigationStart;
      
      return {
        loadTime,
        domReadyTime,
        resources: performance.getEntriesByType('resource').length
      };
    });
    
    // 異뷂옙? ?占쏙옙??占쎄컙 (iframe ?占쏙옙? ?占쏀겕由쏀듃 ?占쏀뻾 占?濡쒓렇 諛쒖깮 ?占쎄컙 ?占쎈낫)
    await page.waitForTimeout(500);
    
    // 理쒖쥌 濡쒓렇 ?占쎈━ (踰꾪띁 ?占쎌슜??臾몄옄?占쎈줈 蹂??
    collectedLogs = formatLogs(mainLogBuffer).concat(formatLogs(iframeLogBuffer));
    
    // 遺꾩꽍 寃곌낵 ?占??(?占쎈━??濡쒓렇 ?占쎌슜)
    const result = {
      timestamp: new Date().toISOString(),
      title,
      url: page.url(),
      uiAnalysis,
      performanceMetrics,
      logs: collectedLogs.slice(-200) // 濡쒓렇 ?占쎌쭛 理쒙옙? 媛쒖닔 議곗젙
    };
    
    const resultPath = path.join(analysisDir, 'page-analysis.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(`遺꾩꽍 寃곌낵 ?占???占쎈즺: ${resultPath}`);
    
    // 肄섏넄??二쇱슂 寃곌낵 異쒕젰
    console.log('\n[遺꾩꽍 寃곌낵 ?占쎌빟]');
    console.log(`- ?占쎌씠吏 ?占쎈ぉ: ${title}`);
    console.log(`- 誘몃━蹂닿린 ?占쎌떆: ${uiAnalysis.visibility.previewVisible ? '?? : '?占쎈땲??}`);
    console.log(`- ?占쎈젰 ???占쎌떆: ${uiAnalysis.visibility.inputFormsVisible ? '?? : '?占쎈땲??}`);
    console.log(`- ?占쎌뀡 ?? ${uiAnalysis.sections.length}`);
    console.log(`- 濡쒓렇 ??(硫붿씤+iframe, 以묐났 ?占쎌빟): ${collectedLogs.length}`);
    
    if (uiAnalysis.errors && uiAnalysis.errors.length > 0) {
      console.log('\n[諛쒓껄???占쎈쪟]');
      uiAnalysis.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
    }
    
  } catch (error) {
    console.error('?占쎌씠吏 遺꾩꽍 占??占쎈쪟 諛쒖깮:', error);
  } finally {
    await browser.close();
    console.log('?占쎌씠吏 遺꾩꽍 ?占쎈즺');
  }
})(); 
