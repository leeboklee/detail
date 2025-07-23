const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 로그 중복 방�? ?�퍼 ?�수
function addUniqueLog(logArray, newLog, maxBufferSize = 5) {
  // 마�?�?로그?� ?�일?�면 카운??증�? ?�는 ?�로 추�?
  if (logArray.length > 0) {
    const lastLog = logArray[logArray.length - 1];
    if (typeof lastLog === 'object' && lastLog.log === newLog) {
      lastLog.count++;
      return; // 배열 변�??�음
    }
  }
  // ??로그 ?�는 ?�전�??�른 로그
  logArray.push({ log: newLog, count: 1 });

  // 버퍼 ?�기 ?��? (?�래??로그 ?�거)
  if (logArray.length > maxBufferSize) {
    logArray.shift();
  }
}

// 로그 배열??문자??배열�?변??(출력??
function formatLogs(logArray) {
  return logArray.map(item => {
    return item.count > 1 ? `${item.log} (x${item.count})` : item.log;
  });
}

(async () => {
  console.log('?�이지 분석 ?�작...');
  
  // 결과 ?�???�렉?�리
  const analysisDir = path.join(__dirname, 'analysis');
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 로그 버퍼 (중복 감�???
  const mainLogBuffer = [];
  const iframeLogBuffer = [];
  // 최종 ?�?�될 로그 배열
  let collectedLogs = [];

  try {
    // 메인 ?�이지 콘솔 로그 ?�집 ?�정 (경고 ?�함, 버퍼 ?�용)
    page.on('console', msg => {
      const type = msg.type(); // error, warning, log, info, debug ??
      const logText = `[Main - ${type}] ${msg.text()}`;
      addUniqueLog(mainLogBuffer, logText);
    });

    // ?�이지 로드
    console.log(`페이지 로드 → http://localhost:${process.env.PORT || 34343}`);
    await page.goto(`http://localhost:${process.env.PORT || 34343}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('?�이지 로드 ?�료, 분석 �?..');

    // iframe 찾기 �?콘솔 리스??추�? (경고 ?�함, 버퍼 ?�용)
    try {
      // iframe ?�소가 ?��????�까지 ?��?
      // console.log('미리보기 iframe ?�소 ?��??�작...'); // ?�버�?로그 ?�거
      await page.waitForSelector('iframe[data-testid="preview-iframe"]', { timeout: 5000 }); 
      // console.log('미리보기 iframe ?�소 발견??'); // ?�버�?로그 ?�거

      // ?�이지??모든 ?�레??가?�오�?(iframe 로드 ??
      // console.log('--- ?�레???�보 ?�버�??�작 ---'); // ?�버�?로그 ?�거
      const frames = page.frames();
      // console.log(`�??�레???? ${frames.length}`); // ?�버�?로그 ?�거
      
      let previewFrame = null;
      for (const frame of frames) {
        const frameUrl = frame.url();
        // const frameName = frame.name(); // name?� ?�용 ???��?�??�거
        // console.log(`  - Frame URL: ${frameUrl}, Frame Name: ${frameName}`); // ?�버�?로그 ?�거

        // ?�별 로직 (srcdoc 기반)
        if (frameUrl.startsWith('about:srcdoc')) { 
          // console.log(`    >> srcdoc ?�레??발견!`); // ?�버�?로그 ?�거
          previewFrame = frame;
          break; // 찾았?�면 ???�회???�요 ?�으므�?break ?�성??
        }
      }
      // console.log('--- ?�레???�보 ?�버�???---'); // ?�버�?로그 ?�거

      if (previewFrame) {
        await previewFrame.waitForLoadState('domcontentloaded'); 
        previewFrame.on('console', msg => {
          const type = msg.type();
          const logText = `[Iframe - ${type}] ${msg.text()}`;
          addUniqueLog(iframeLogBuffer, logText);
        });
        console.log('미리보기 iframe 콘솔 리스??추�???); // 메시지 간결??
      } else {
          console.log('미리보기 iframe ?�소�?찾�? 못함'); // 메시지 간결??
      }
    } catch (e) {
      if (e.name === 'TimeoutError') {
        console.log('미리보기 iframe ?�소�??�간 ?�에 찾�? 못했?�니??');
      } else {
        console.warn('iframe ?�소 ?��?처리 �??�류:', e.message);
      }
    }

    // 분석 로직 ?�행 ???�시 ?��?(비동�??�업 ?�료 ?�간 ?�보)
    await page.waitForTimeout(500);
    
    // ?�이지 ?�?��? 가?�오�?
    const title = await page.title();
    
    // UI 구조 분석
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
      
      // 주요 컨테?�너 �??�션 ?�인
      const containers = Array.from(document.querySelectorAll('main > div, section'));
      analysis.mainContainers = containers.length;
      
      // ?�션 ?�보 ?�집
      const sections = Array.from(document.querySelectorAll('section'));
      analysis.sections = sections.map(section => {
        const title = section.querySelector('h1, h2, h3, h4')?.textContent?.trim() || '?�목 ?�음';
        const forms = section.querySelectorAll('form, input, select, textarea').length;
        const buttons = section.querySelectorAll('button').length;
        return { title, forms, buttons };
      });
      
      // 미리보기 ?�역 ?�인
      const preview = document.querySelector('[data-testid="preview"], .preview, #preview');
      if (preview) {
        analysis.visibility.previewVisible = true;
        analysis.preview = {
          width: preview.offsetWidth,
          height: preview.offsetHeight,
          visible: window.getComputedStyle(preview).display !== 'none'
        };
      }
      
      // ?�력 ???�인
      const forms = document.querySelectorAll('form, .form-container, [data-testid="form"]');
      if (forms.length > 0) {
        analysis.visibility.inputFormsVisible = true;
        analysis.forms = {
          count: forms.length,
          inputFields: document.querySelectorAll('input, select, textarea').length
        };
      }
      
      // ?�류 메시지 ?�집
      const errorElements = document.querySelectorAll('.error, .alert-danger, [data-testid="error"]');
      analysis.errors = Array.from(errorElements).map(el => el.textContent.trim());
      
      // 컴포?�트 ?�더�??�인
      analysis.componentCheck = {
        hotelInfo: !!document.querySelector('[data-testid="hotel-info"], .hotel-info'),
        roomInfo: !!document.querySelector('[data-testid="room-info"], .room-info'),
        facilitiesInfo: !!document.querySelector('[data-testid="facilities-info"], .facilities-info')
      };
      
      return analysis;
    });
    
    // ?�이지 ?�능 측정
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
    
    // 추�? ?��??�간 (iframe ?��? ?�크립트 ?�행 �?로그 발생 ?�간 ?�보)
    await page.waitForTimeout(500);
    
    // 최종 로그 ?�리 (버퍼 ?�용??문자?�로 변??
    collectedLogs = formatLogs(mainLogBuffer).concat(formatLogs(iframeLogBuffer));
    
    // 분석 결과 ?�??(?�리??로그 ?�용)
    const result = {
      timestamp: new Date().toISOString(),
      title,
      url: page.url(),
      uiAnalysis,
      performanceMetrics,
      logs: collectedLogs.slice(-200) // 로그 ?�집 최�? 개수 조정
    };
    
    const resultPath = path.join(analysisDir, 'page-analysis.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
    console.log(`분석 결과 ?�???�료: ${resultPath}`);
    
    // 콘솔??주요 결과 출력
    console.log('\n[분석 결과 ?�약]');
    console.log(`- ?�이지 ?�목: ${title}`);
    console.log(`- 미리보기 ?�시: ${uiAnalysis.visibility.previewVisible ? '?? : '?�니??}`);
    console.log(`- ?�력 ???�시: ${uiAnalysis.visibility.inputFormsVisible ? '?? : '?�니??}`);
    console.log(`- ?�션 ?? ${uiAnalysis.sections.length}`);
    console.log(`- 로그 ??(메인+iframe, 중복 ?�약): ${collectedLogs.length}`);
    
    if (uiAnalysis.errors && uiAnalysis.errors.length > 0) {
      console.log('\n[발견???�류]');
      uiAnalysis.errors.forEach((err, i) => console.log(`${i+1}. ${err}`));
    }
    
  } catch (error) {
    console.error('?�이지 분석 �??�류 발생:', error);
  } finally {
    await browser.close();
    console.log('?�이지 분석 ?�료');
  }
})(); 
