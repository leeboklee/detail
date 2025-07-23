const puppeteer = require('puppeteer');

async function manualTestHelper() {
  console.log('🔧 수동 테스트 헬퍼 시작...');
  console.log('📝 브라우저가 열리면 직접 한글을 입력해보세요.');
  console.log('🎯 테스트할 내용: "디럭스 트윈룸", "프리미엄 스위트" 등');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 },
    slowMo: 0 // 수동 입력이므로 slowMo 제거
  });
  
  try {
    const page = await browser.newPage();
    
    // 콘솔 로그 모니터링
    page.on('console', msg => {
      const text = msg.text();
      const timestamp = new Date().toISOString().substr(11, 12);
      
      // 중요한 로그만 출력
      if (text.includes('SimpleInput') || text.includes('RoomInfoEditor') || 
          text.includes('🇰🇷') || text.includes('⏰') || text.includes('✅') || 
          text.includes('🚫') || text.includes('👀') || text.includes('📝')) {
        console.log(`[${timestamp}] ${text}`);
      }
    });
    
    // 페이지 로드
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle0' });
    
    // React 로딩 대기
    await page.waitForFunction(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      return gridContainer && gridContainer.querySelectorAll('.cursor-pointer').length > 0;
    }, { timeout: 15000 });
    
    console.log('✅ 페이지 로드 완료');
    
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
    
    console.log('🎭 모달이 열렸습니다!');
    console.log('');
    console.log('📋 수동 테스트 가이드:');
    console.log('  1. 첫 번째 객실명 필드를 클릭하세요');
    console.log('  2. "디럭스 트윈룸"을 천천히 입력해보세요');
    console.log('  3. Tab 키를 눌러 다음 필드로 이동하세요');
    console.log('  4. "프리미엄 스위트"를 입력해보세요');
    console.log('  5. 각 입력 후 콘솔 로그를 확인하세요');
    console.log('');
    console.log('🔍 확인사항:');
    console.log('  - 조합 이벤트가 발생하는지 (🇰🇷 로그)');
    console.log('  - debounce가 올바르게 작동하는지 (⏰ 로그)');
    console.log('  - 최종 값이 정확히 저장되는지');
    console.log('');
    console.log('⚠️ 테스트 완료 후 Ctrl+C를 눌러 종료하세요.');
    
    // 테스트용 유틸리티 함수를 페이지에 추가
    await page.evaluate(() => {
      window.testHelper = {
        // 현재 모든 입력 필드 값 확인
        checkAllValues: () => {
          const modal = document.querySelector('[role="dialog"]');
          if (!modal) return { error: 'Modal not found' };
          
          const nameInputs = Array.from(modal.querySelectorAll('input[name="name"]'));
          const typeInputs = Array.from(modal.querySelectorAll('input[name="type"]'));
          
          console.log('📊 현재 입력 값들:');
          nameInputs.forEach((input, i) => {
            console.log(`  객실 ${i + 1} 이름: "${input.value}"`);
          });
          typeInputs.forEach((input, i) => {
            if (input.value) {
              console.log(`  객실 ${i + 1} 타입: "${input.value}"`);
            }
          });
          
          return {
            names: nameInputs.map(input => input.value),
            types: typeInputs.map(input => input.value)
          };
        },
        
        // 입력 필드 강조 표시
        highlightFields: () => {
          const nameInputs = Array.from(document.querySelectorAll('[role="dialog"] input[name="name"]'));
          nameInputs.forEach((input, i) => {
            input.style.border = '3px solid red';
            input.style.backgroundColor = '#fff3cd';
            setTimeout(() => {
              input.style.border = '';
              input.style.backgroundColor = '';
            }, 3000);
          });
          console.log('✨ 객실명 입력 필드들을 강조 표시했습니다 (3초간)');
        }
      };
      
      console.log('🛠️ 테스트 유틸리티 함수가 추가되었습니다:');
      console.log('  - testHelper.checkAllValues() : 현재 모든 입력 값 확인');
      console.log('  - testHelper.highlightFields() : 입력 필드 강조 표시');
    });
    
    // 무한 대기 (사용자가 Ctrl+C로 종료할 때까지)
    console.log('⏳ 수동 테스트 진행 중... (Ctrl+C로 종료)');
    
    // 30초마다 상태 확인 메시지 출력
    setInterval(() => {
      console.log('📝 수동 테스트 진행 중... 브라우저에서 직접 입력해보세요.');
    }, 30000);
    
    // Promise that never resolves (until process is killed)
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ 헬퍼 실행 중 오류:', error);
  } finally {
    await browser.close();
  }
}

// Ctrl+C 핸들러
process.on('SIGINT', () => {
  console.log('\n🏁 수동 테스트 헬퍼 종료');
  process.exit(0);
});

// 실행
manualTestHelper().catch(console.error); 