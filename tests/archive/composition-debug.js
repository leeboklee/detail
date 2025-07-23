const puppeteer = require('puppeteer');

async function compositionDebug() {
  console.log('🔍 조합 이벤트 디버깅...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    slowMo: 100
  });
  
  try {
    const page = await browser.newPage();
    
    // 모든 콘솔 로그 수집
    page.on('console', msg => {
      const text = msg.text();
      const timestamp = new Date().toISOString().substr(11, 12);
      console.log(`[${timestamp}] ${text}`);
    });
    
    // 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle0' });
    
    // React 로딩 대기
    await page.waitForFunction(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      return gridContainer && gridContainer.querySelectorAll('.cursor-pointer').length > 0;
    }, { timeout: 15000 });
    
    // 객실 카드 클릭
    await page.evaluate(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      for (let card of cards) {
        if (card.textContent.includes('객실 정보')) {
          card.click();
          return;
        }
      }
    });
    
    // 모달 대기
    await page.waitForFunction(() => {
      const modals = document.querySelectorAll('[role="dialog"]');
      return modals.length > 0 && modals[0].offsetParent !== null;
    }, { timeout: 5000 });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('🎭 모달 준비 완료');
    
    // 조합 이벤트 리스너를 직접 DOM에 추가
    await page.evaluate(() => {
      const input = document.querySelector('[role=\"dialog\"] input[name=\"name\"]:first-of-type');
      if (input) {
        console.log('🎯 조합 이벤트 리스너 추가됨');
        
        input.addEventListener('compositionstart', (e) => {
          console.log('🔴 DOM compositionstart 이벤트 발생:', e.data);
        });
        
        input.addEventListener('compositionupdate', (e) => {
          console.log('🟡 DOM compositionupdate 이벤트 발생:', e.data);
        });
        
        input.addEventListener('compositionend', (e) => {
          console.log('🟢 DOM compositionend 이벤트 발생:', e.data);
        });
        
        input.addEventListener('input', (e) => {
          console.log('⚪ DOM input 이벤트 발생:', e.target.value);
        });
        
        input.addEventListener('change', (e) => {
          console.log('🔵 DOM change 이벤트 발생:', e.target.value);
        });
      } else {
        console.log('❌ 입력 필드를 찾을 수 없음');
      }
    });
    
    // 필드 포커스
    const selector = '[role="dialog"] input[name="name"]:first-of-type';
    await page.focus(selector);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('\\n📝 "디" 입력 테스트...');
    
    // 한 글자만 입력
    await page.keyboard.type('디', { delay: 300 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\\n📝 "럭" 추가 입력...');
    await page.keyboard.type('럭', { delay: 300 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\\n📝 "스" 추가 입력...');
    await page.keyboard.type('스', { delay: 300 });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('\\n📝 blur 실행...');
    await page.evaluate((sel) => {
      const input = document.querySelector(sel);
      if (input) {
        input.blur();
        console.log('✅ blur 실행됨, 현재 값:', input.value);
      }
    }, selector);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 최종 값 확인
    const finalValue = await page.$eval(selector, el => el.value);
    console.log(`\\n🎯 최종 값: "${finalValue}"`);
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error);
  } finally {
    console.log('\\n🏁 조합 이벤트 디버깅 완료');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();
  }
}

// 실행
compositionDebug().catch(console.error); 