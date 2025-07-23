// log-collector.js - 브라?��? 콘솔 로그 �?API ?�버깅을 ?�한 ?�크립트

import { chromium } from 'playwright';
import fs from 'fs';

async function saveLog(message) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const logText = `[${timestamp}] ${message}\n`;
  fs.appendFileSync('./test-log.txt', logText);
  console.log(message);
}

async function collectLogs() {
  const browser = await chromium.launch({
    headless: false, // GUI 모드�??�행?�여 ?�시�??�인 가??
  });
  
  saveLog('브라?��?가 ?�작?�었?�니??');
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  
  // 콘솔 로그 ?�집
  context.on('console', message => {
    const type = message.type();
    const text = message.text();
    
    // 로그 ?�형�?출력 ?�맷??
    if (type === 'error') {
      saveLog(`브라?��? 콘솔 ?�류: ${text}`);
    } else if (type === 'warning') {
      saveLog(`브라?��? 콘솔 경고: ${text}`);
    } else {
      saveLog(`브라?��? 콘솔 ${type}: ${text}`);
    }
  });
  
  // ?�이지 ?�벤???�집
  const page = await context.newPage();
  
  // ?�트?�크 ?�청/?�답 감시
  page.on('request', request => {
    saveLog(`?�청: ${request.method()} ${request.url()}`);
  });
  
  page.on('response', async response => {
    const status = response.status();
    const url = response.url();
    
    // API ?�답?� ??�� 기록
    if (url.includes('/api/')) {
      saveLog(`API ?�답 (${status}): ${url}`);
      try {
        const responseBody = await response.text();
        saveLog(`API ?�답 본문: ${responseBody.substring(0, 200)}${responseBody.length > 200 ? '...' : ''}`);
      } catch (err) {
        saveLog(`API ?�답 본문 ?�싱 ?�류: ${err.message}`);
      }
    }
    // ?�류 ?�답�??�세 출력
    else if (status >= 400) {
      saveLog(`?�답 ?�류 (${status}): ${url}`);
      try {
        const body = await response.text();
        saveLog(`?�답 본문: ${body.substring(0, 500)}`);
      } catch (err) {
        saveLog(`?�답 본문 ?�싱 ?�류: ${err.message}`);
      }
    } else {
      saveLog(`?�답 (${status}): ${url}`);
    }
  });
  
  // ?�이지 ?�류 ?�집
  page.on('pageerror', error => {
    saveLog(`?�이지 ?�류: ${error.message}`);
  });
  
  try {
    saveLog('?�이지 로딩 ?�작: http://localhost: {process.env.PORT || 34343}');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { timeout: 30000 });
    saveLog('?�이지 로딩 ?�료');
    
    // ?�이지 ?�크린샷 
    await page.screenshot({ path: 'screenshot-start.png', fullPage: true });
    saveLog('초기 ?�크린샷 ?�???�료: screenshot-start.png');
    
    // 1. 기본 ?�태 ?�인
    saveLog('--- 기본 ?�태 ?�인 ---');
    await page.waitForTimeout(2000);
    
    // 2. ?�스??모드 버튼 ?�릭
    try {
      saveLog('?�스??모드 버튼 찾기 ?�도...');
      // ???�확???�택???�용
      await page.waitForSelector('button:has-text("?�스??모드")');
      const testModeButton = await page.$('button:has-text("?�스??모드")');
      if (testModeButton) {
        saveLog('?�스??모드 버튼 찾음, ?�릭 ?�도...');
        await testModeButton.click();
        saveLog('?�스??모드 버튼 ?�릭 ?�료');
        await page.waitForTimeout(2000);
      } else {
        saveLog('?�스??모드 버튼??찾을 ???�습?�다.');
      }
    } catch (err) {
      saveLog(`?�스??모드 버튼 ?�릭 ?�패: ${err.message}`);
    }
    
    // 3. 객실 ?�보 ?�력 ?�스??
    try {
      saveLog('--- 객실 ?�보 ?�력 ?�스??---');
      
      // 객실 ?�보 ?�션 ?�인
      await page.waitForSelector('section#room', { timeout: 5000 });
      saveLog('객실 ?�보 ?�션 찾음');
      
      // 객실�??�력
      saveLog('객실�??�력 ?�도...');
      const roomNameInput = await page.$('input[name="name"]');
      if (roomNameInput) {
        // ?�전 �??�인
        const prevValue = await roomNameInput.inputValue();
        saveLog(`객실�??�력 ?�드 ?�전 �? "${prevValue}"`);
        
        // ??�??�력
        await roomNameInput.fill('?�스???�위?�룸');
        
        // ?�력 ??�??�인
        const newValue = await roomNameInput.inputValue();
        saveLog(`객실�??�력 ??�? "${newValue}"`);
      } else {
        saveLog('객실�??�력 ?�드�?찾을 ???�음');
      }
      
      // ?�???�력
      const roomTypeInput = await page.$('input[name="type"]');
      if (roomTypeInput) {
        await roomTypeInput.fill('?�럭??);
        saveLog('객실 ?�???�력 ?�료');
      } else {
        saveLog('?�???�력 ?�드�?찾을 ???�음');
      }
      
      // 구조 ?�력
      const roomStructureInput = await page.$('input[name="structure"]');
      if (roomStructureInput) {
        await roomStructureInput.fill('�?+?�실1');
        saveLog('구조 ?�력 ?�료');
      } else {
        saveLog('구조 ?�력 ?�드�?찾을 ???�음');
      }
      
      // 베드?�???�력
      const roomBedTypeInput = await page.$('input[name="bedType"]');
      if (roomBedTypeInput) {
        await roomBedTypeInput.fill('???�이�?1�?);
        saveLog('베드?�???�력 ?�료');
      } else {
        saveLog('베드?�???�력 ?�드�?찾을 ???�음');
      }
      
      // ?�력 ???�시 ?��?
      saveLog('?�력 ???�태 ?�데?�트 ?��?..');
      await page.waitForTimeout(2000);
      
      // ?�력 ???�크린샷
      await page.screenshot({ path: 'screenshot-after-input.png', fullPage: true });
      saveLog('?�력 ???�크린샷 ?�???�료: screenshot-after-input.png');
    } catch (err) {
      saveLog(`객실 ?�보 ?�력 ?�스???�패: ${err.message}`);
    }
    
    // 4. 미리보기 버튼 ?�릭 ?�스??
    try {
      saveLog('--- 미리보기 버튼 ?�릭 ?�스??---');
      
      // 미리보기 버튼 찾기
      await page.waitForSelector('button:has-text("미리보기 ?�성")');
      const previewButton = await page.$('button:has-text("미리보기 ?�성")');
      
      if (previewButton) {
        saveLog('미리보기 버튼 찾음, ?�릭 ?�도...');
        await previewButton.click();
        saveLog('미리보기 버튼 ?�릭 ?�료');
        
        // 로딩 ?��?
        saveLog('미리보기 ?�성 �?.. (5�??��?');
        await page.waitForTimeout(5000);
        
        // 미리보기 결과 ?�크린샷
        await page.screenshot({ path: 'screenshot-preview.png', fullPage: true });
        saveLog('미리보기 ???�크린샷 ?�???�료: screenshot-preview.png');
        
        // HTML 미리보기 ?�용 ?�인
        const previewContent = await page.locator('#previewContainer iframe').contentFrame();
        if (previewContent) {
          saveLog('미리보기 iframe 찾음, ?�용 ?�인 �?..');
          
          // iframe ?�용 가?�오�?
          const frameContent = await previewContent.content();
          if (frameContent) {
            saveLog(`미리보기 iframe ?�용 ?��?: ${frameContent.substring(0, 200)}...`);
            
            // ?�정 ?�용 ?�인
            if (frameContent.includes('?�스???�위?�룸')) {
              saveLog('??미리보기??객실명이 ?�상?�으�??�시?�니??');
            } else {
              saveLog('??미리보기??객실명이 ?�시?��? ?�습?�다!');
            }
            
            if (frameContent.includes('?�럭??)) {
              saveLog('??미리보기??객실 ?�?�이 ?�상?�으�??�시?�니??');
            } else {
              saveLog('??미리보기??객실 ?�?�이 ?�시?��? ?�습?�다!');
            }
          } else {
            saveLog('미리보기 iframe ?�용??가?�올 ???�습?�다.');
          }
        } else {
          saveLog('미리보기 iframe??찾을 ???�습?�다.');
        }
      } else {
        saveLog('미리보기 버튼??찾을 ???�습?�다.');
      }
    } catch (err) {
      saveLog(`미리보기 ?�스???�패: ${err.message}`);
    }
    
    // ?�시 ?��???종료
    saveLog('?�스???�료, 5�???종료');
    await page.waitForTimeout(5000);
  } catch (err) {
    saveLog(`?�스??�??�류 발생: ${err}`);
  } finally {
    await browser.close();
    saveLog('브라?��?가 종료?�었?�니??');
  }
}

// ?�크립트 ?�행
collectLogs().catch(err => {
  console.error('로그 ?�집 ?�크립트 ?�류:', err);
  process.exit(1);
}); 
