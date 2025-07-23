const puppeteer = require('puppeteer');
const fs = require('fs');

async function testModal() {
  console.log('🧪 객실 모달 테스트 시작...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    defaultViewport: { width: 1280, height: 720 } 
  });
  
  try {
    const page = await browser.newPage();
    
    // 콘솔 로그 수집
    page.on('console', msg => {
      console.log('🖥️ 브라우저 로그:', msg.text());
    });
    
    // 1. 페이지 로드
    console.log('🌐 페이지 로드 중...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle0' });
    
    // 2. React 컴포넌트 로딩 완료 대기 (카드 그리드가 렌더링될 때까지)
    console.log('⏳ React 컴포넌트 로딩 대기 중...');
    await page.waitForFunction(() => {
      // 카드 그리드가 렌더링될 때까지 대기
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      const cards = gridContainer ? gridContainer.querySelectorAll('.cursor-pointer') : [];
      return cards.length > 0;
    }, { timeout: 15000 });
    
    console.log('✅ React 컴포넌트 로딩 완료');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. 초기 스크린샷
    await page.screenshot({ path: 'test-results/browser-test-01-initial.png', fullPage: true });
    console.log('📸 초기 스크린샷 저장 완료');
    
    // 4. 페이지 구조 확인
    const cardCount = await page.evaluate(() => {
      const gridContainer = document.querySelector('.grid.grid-cols-2.md\\:grid-cols-3.lg\\:grid-cols-4.xl\\:grid-cols-5');
      return gridContainer ? gridContainer.querySelectorAll('.cursor-pointer').length : 0;
    });
    console.log(`📊 카드 개수: ${cardCount}개`);
    
    // 5. 객실 카드 찾기 - 텍스트로 찾기
    const roomCardExists = await page.evaluate(() => {
      const cards = document.querySelectorAll('.cursor-pointer');
      for (let card of cards) {
        if (card.textContent.includes('객실 정보')) {
          return true;
        }
      }
      return false;
    });
    console.log(`🏠 객실 카드 존재: ${roomCardExists}`);
    
    if (roomCardExists) {
      // 6. 카드 텍스트 확인
      const cardText = await page.evaluate(() => {
        const cards = document.querySelectorAll('.cursor-pointer');
        for (let card of cards) {
          if (card.textContent.includes('객실 정보')) {
            return card.textContent;
          }
        }
        return null;
      });
      console.log(`📝 카드 텍스트: ${cardText?.substring(0, 100)}...`);
      
      // 7. 모달 상태 확인 (클릭 전)
      const modalsBefore = await page.evaluate(() => {
        return document.querySelectorAll('[role="dialog"]').length;
      });
      console.log(`🎭 클릭 전 모달 개수: ${modalsBefore}`);
      
      // 8. 카드 클릭 - 객실 정보 카드를 찾아서 클릭
      await page.evaluate(() => {
        const cards = document.querySelectorAll('.cursor-pointer');
        for (let card of cards) {
          if (card.textContent.includes('객실 정보')) {
            card.click();
            return;
          }
        }
      });
      console.log('👆 객실 카드 클릭 완료');
      
      // 9. 클릭 후 모달 렌더링 대기
      console.log('⏳ 모달 렌더링 대기 중...');
      try {
        await page.waitForFunction(() => {
          const modals = document.querySelectorAll('[role="dialog"]');
          return modals.length > 0 && modals[0].offsetParent !== null;
        }, { timeout: 5000 });
        console.log('✅ 모달 렌더링 완료');
      } catch (e) {
        console.log('⚠️ 모달 렌더링 타임아웃 (계속 진행)');
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // 10. 모달 상태 확인 (클릭 후)
      const modalsAfter = await page.evaluate(() => {
        const modals = document.querySelectorAll('[role="dialog"]');
        return {
          count: modals.length,
          visible: Array.from(modals).map(m => ({
            visible: m.offsetParent !== null,
            display: getComputedStyle(m).display,
            opacity: getComputedStyle(m).opacity,
            className: m.className
          }))
        };
      });
      console.log(`🎭 클릭 후 모달 상태:`, modalsAfter);
      
      // 11. 클릭 후 스크린샷
      await page.screenshot({ path: 'test-results/browser-test-02-after-click.png', fullPage: true });
      console.log('📸 클릭 후 스크린샷 저장 완료');
      
      // 12. 모달이 있다면 입력 필드 확인
      if (modalsAfter.count > 0) {
        const inputFields = await page.evaluate(() => {
          const modal = document.querySelector('[role="dialog"]');
          if (modal) {
            const inputs = modal.querySelectorAll('input');
            const textareas = modal.querySelectorAll('textarea');
            return {
              inputs: inputs.length,
              textareas: textareas.length,
              inputTypes: Array.from(inputs).map(i => ({ type: i.type, name: i.name, placeholder: i.placeholder }))
            };
          }
          return null;
        });
        
        console.log(`🔤 입력 필드 정보:`, inputFields);
        
        if (inputFields && inputFields.inputs > 0) {
          // 첫 번째 입력 필드에 테스트 입력
          await page.type('[role="dialog"] input:first-of-type', '테스트 객실명');
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const inputValue = await page.$eval('[role="dialog"] input:first-of-type', el => el.value);
          console.log(`✍️ 입력 테스트 결과: "${inputValue}"`);
          
          await page.screenshot({ path: 'test-results/browser-test-03-input-test.png', fullPage: true });
          console.log('📸 입력 테스트 스크린샷 저장 완료');
        }
      } else {
        console.log('❌ 모달이 열리지 않았음');
        
        // React 상태 디버깅
        const reactDebug = await page.evaluate(() => {
          const body = document.body;
          return {
            bodyClasses: body.className,
            bodyStyle: body.style.cssText,
            modalElements: document.querySelectorAll('*[class*="modal"], *[class*="Modal"]').length,
            overlayElements: document.querySelectorAll('*[class*="overlay"], *[class*="Overlay"]').length,
            clickableElements: document.querySelectorAll('.cursor-pointer').length,
            roomCards: Array.from(document.querySelectorAll('.cursor-pointer')).filter(card => 
              card.textContent.includes('객실')).length
          };
        });
        console.log('🔍 React 디버깅 정보:', reactDebug);
      }
    } else {
      console.log('❌ 객실 카드를 찾을 수 없음');
      
      // 사용 가능한 카드들 나열
      const availableCards = await page.evaluate(() => {
        const cards = document.querySelectorAll('.cursor-pointer');
        return Array.from(cards).map(card => ({
          text: card.textContent.substring(0, 100)
        }));
      });
      console.log('📋 사용 가능한 카드들:', availableCards);
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
  } finally {
    console.log('🏁 테스트 완료, 브라우저 닫는 중...');
    await browser.close();
  }
}

// 실행
testModal().catch(console.error); 