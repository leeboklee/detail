const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('미리보기 ?�역 ?�크린샷 캡처 ?�작...');
  
  // ?�크린샷 ?�???�렉?�리
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // ?�이지 로드
    console.log(`페이지 로드 → http://localhost:${process.env.PORT || 34343}`);
    await page.goto(`http://localhost:${process.env.PORT || 34343}`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    console.log('?�이지 로드 ?�료, 미리보기 ?�역 찾는 �?..');
    
    // ?�체 ?�이지 ?�크린샷
    await page.screenshot({ 
      path: path.join(screenshotDir, 'full-page.png'),
      fullPage: true 
    });
    
    // 미리보기 ?�역 찾기 �??�시 ?��? ?�인
    const previewVisible = await page.evaluate(() => {
      // 가?�한 미리보기 ?�택?�들
      const selectors = [
        '[data-testid="preview"]', 
        '.preview', 
        '#preview', 
        '.preview-container', 
        '.preview-panel',
        '[aria-label="Preview"]',
        // 미리보기?�는 ?�스?��? ?�함?�는 ?�소
        'div:has(h2:contains("미리보기"))',
        // ?�른�??�널 (?�반?�인 미리보기 ?�치)
        '.right-panel'
      ];
      
      // ?�택?��? ?�회?�며 미리보기 ?�소 찾기
      let previewElement = null;
      for (const selector of selectors) {
        try {
          const el = document.querySelector(selector);
          if (el) {
            previewElement = el;
            break;
          }
        } catch (e) {
          // ?�택???�류 무시
        }
      }
      
      // 미리보기 ?�소�?찾았?�면 강조 ?�시
      if (previewElement) {
        // ?�소 주�???빨간???�두�?추�?
        const originalBorder = previewElement.style.border;
        const originalBoxShadow = previewElement.style.boxShadow;
        
        previewElement.style.border = '4px solid red';
        previewElement.style.boxShadow = '0 0 10px rgba(255, 0, 0, 0.5)';
        
        // ?�소???�치 ?�보 반환
        const rect = previewElement.getBoundingClientRect();
        return {
          found: true,
          visible: window.getComputedStyle(previewElement).display !== 'none',
          rect: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          originalBorder,
          originalBoxShadow
        };
      }
      
      return { found: false };
    });
    
    // 미리보기 ?�역??찾아졌으�??�당 ?�역 ?�크린샷
    if (previewVisible.found) {
      console.log('미리보기 ?�역 발견:', previewVisible.visible ? '?�시?? : '?�겨�?);
      
      // 미리보기 ?�역??보이??경우?�만 ?�크린샷
      if (previewVisible.visible) {
        // 미리보기 ?�역 ?�크린샷 찍기
        const clip = previewVisible.rect;
        await page.screenshot({
          path: path.join(screenshotDir, 'preview-area.png'),
          clip: {
            x: clip.x,
            y: clip.y,
            width: clip.width,
            height: clip.height
          }
        });
        console.log('미리보기 ?�역 ?�크린샷 ?�???�료');
      } else {
        console.log('미리보기 ?�역???�겨???�어 ?�크린샷??찍을 ???�습?�다.');
      }
    } else {
      console.log('미리보기 ?�역??찾을 ???�습?�다.');
    }
    
    // ?�이지??주요 구성 ?�소 ?�별 �?기록
    const pageComponents = await page.evaluate(() => {
      return {
        inputSections: document.querySelectorAll('form, .input-section, .form-container').length,
        previewSections: document.querySelectorAll('.preview, #preview, [data-testid="preview"]').length,
        totalSections: document.querySelectorAll('section').length,
        buttons: document.querySelectorAll('button').length,
        inputFields: document.querySelectorAll('input, select, textarea').length
      };
    });
    
    // 결과 ?�??
    const reportPath = path.join(screenshotDir, 'preview-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      previewVisible,
      pageComponents
    }, null, 2));
    
    console.log('미리보기 분석 리포???�???�료:', reportPath);
    
  } catch (error) {
    console.error('미리보기 ?�역 ?�크린샷 캡처 �??�류 발생:', error);
  } finally {
    await browser.close();
    console.log('미리보기 ?�역 ?�크린샷 캡처 ?�료');
  }
})(); 
