const puppeteer = require('puppeteer');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function findCorrectSelectors() {
  console.log('🔍 올바른 섹션 선택자 찾기...');
  
  const browser = await puppeteer.launch({
    headless: false,
    devtools: true,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'domcontentloaded' });
    console.log('✅ 페이지 로드 완료');
    
    await delay(3000);
    
    // 모든 클릭 가능한 섹션 요소 찾기
    const sections = await page.evaluate(() => {
      const clickableElements = Array.from(document.querySelectorAll('[class*="cursor-pointer"], .cursor-pointer, div[data-section]'));
      
      return clickableElements.map((el, index) => {
        const text = el.textContent?.trim() || '';
        const classes = el.className || '';
        const dataSection = el.getAttribute('data-section') || '';
        const tagName = el.tagName;
        
        return {
          index,
          text: text.substring(0, 50),
          classes,
          dataSection,
          tagName,
          selector: el.id ? `#${el.id}` : 
                   el.className ? `.${el.className.split(' ')[0]}` :
                   tagName.toLowerCase()
        };
      }).filter(item => 
        item.text.includes('호텔') || 
        item.text.includes('객실') || 
        item.text.includes('시설') || 
        item.text.includes('패키지') ||
        item.text.includes('요금') ||
        item.text.includes('취소') ||
        item.text.includes('예약') ||
        item.text.includes('공지')
      );
    });
    
    console.log('📋 발견된 섹션들:');
    sections.forEach((section, i) => {
      console.log(`${i + 1}. "${section.text}" - ${section.tagName} (${section.selector})`);
      if (section.dataSection) {
        console.log(`   data-section: ${section.dataSection}`);
      }
    });
    
    // 첫 번째 섹션 클릭 테스트
    if (sections.length > 0) {
      console.log('\n🖱️ 첫 번째 섹션 클릭 테스트...');
      
      // 호텔 정보 섹션 찾기
      const hotelSection = sections.find(s => s.text.includes('호텔 정보'));
      if (hotelSection) {
        console.log(`호텔 정보 섹션 발견: "${hotelSection.text}"`);
        
        // 실제 클릭 가능한 요소 찾기
        const clickableSelector = await page.evaluate(() => {
          const hotelElements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent?.includes('호텔 정보') && 
            el.style.cursor === 'pointer' ||
            el.classList.contains('cursor-pointer')
          );
          
          return hotelElements.map(el => {
            const rect = el.getBoundingClientRect();
            return {
              text: el.textContent?.trim(),
              tagName: el.tagName,
              className: el.className,
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height
            };
          });
        });
        
        console.log('클릭 가능한 호텔 정보 요소들:', clickableSelector);
      }
    }
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    setTimeout(async () => {
      await browser.close();
      console.log('🔚 브라우저 종료');
    }, 10000);
  }
}

findCorrectSelectors().catch(console.error); 