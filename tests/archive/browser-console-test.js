const puppeteer = require('puppeteer');

async function browserConsoleTest() {
  console.log('🔍 브라우저 콘솔 로그 모니터링...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    slowMo: 200
  });
  
  try {
    const page = await browser.newPage();
    
    // 모든 콘솔 로그 수집
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      const timestamp = new Date().toISOString().substr(11, 12);
      logs.push({ timestamp, text });
      
      // SimpleInput과 RoomInfoEditor 관련 로그만 출력
      if (text.includes('SimpleInput') || text.includes('RoomInfoEditor') || text.includes('🔧') || text.includes('📝') || text.includes('🏨')) {
        console.log(`[${timestamp}] ${text}`);
      }
    });
    
    // 페이지 로드
    console.log('📄 페이지 로드 중...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle0' });
    
    // React 로딩 대기
    await page.waitForFunction(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      return gridContainer && gridContainer.querySelectorAll('.cursor-pointer').length > 0;
    }, { timeout: 15000 });
    
    console.log('✅ 페이지 로드 완료, 객실 모달 열기...');
    
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
    
    console.log('🎭 모달 열림 완료, 3초 대기...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 입력 필드 확인
    const inputInfo = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]');
      if (!modal) return null;
      
      const nameInputs = Array.from(modal.querySelectorAll('input[name="name"]'));
      return nameInputs.map((input, i) => ({
        index: i,
        value: input.value,
        className: input.className,
        tagName: input.tagName
      }));
    });
    
    console.log(`\n📊 찾은 입력 필드: ${inputInfo.length}개`);
    inputInfo.forEach((input, i) => {
      console.log(`  ${i + 1}. 값: "${input.value}", 클래스: ${input.className}`);
    });
    
    if (inputInfo.length > 0) {
      console.log('\n📝 입력 테스트 시작...');
      
      // 첫 번째 필드에 'ㅌ' 입력 (한글 조합 시작)
      await page.focus('[role="dialog"] input[name="name"]:first-of-type');
      console.log('⌨️ 필드 포커스 완료');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 한 글자씩 입력
      await page.keyboard.type('ㅌ', { delay: 500 });
      console.log('⌨️ "ㅌ" 입력 완료');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.keyboard.type('ㅔ', { delay: 500 });
      console.log('⌨️ "ㅔ" 입력 완료');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.keyboard.type('ㅅ', { delay: 500 });
      console.log('⌨️ "ㅅ" 입력 완료');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await page.keyboard.type('ㅌ', { delay: 500 });
      console.log('⌨️ "ㅌ" 입력 완료');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 최종 값 확인
      const finalValue = await page.$eval('[role="dialog"] input[name="name"]:first-of-type', el => el.value);
      console.log(`\n🎯 최종 입력 값: "${finalValue}"`);
    }
    
    // 최근 로그 출력
    console.log('\n📋 최근 콘솔 로그 (마지막 20개):');
    const recentLogs = logs.slice(-20);
    recentLogs.forEach(log => {
      console.log(`  [${log.timestamp}] ${log.text}`);
    });
    
    // 잠시 대기
    console.log('\n⏱️ 5초 대기 중... (브라우저에서 직접 확인 가능)');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ 테스트 중 오류:', error);
  } finally {
    console.log('🏁 브라우저 콘솔 테스트 완료');
    await browser.close();
  }
}

// 실행
browserConsoleTest().catch(console.error); 