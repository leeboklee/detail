const { chromium } = require('playwright');

async function checkPageStructure() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('📄 페이지 로드...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('🔍 페이지 구조 확인...');
    
    // 모든 클릭 가능한 요소 찾기
    const clickableElements = await page.$$eval('*[onclick], button, a, [role="button"], div[class*="card"], div[class*="section"]', elements => {
      return elements.map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        textContent: el.textContent?.substring(0, 50) || '',
        onclick: el.onclick ? 'has onclick' : null,
        dataset: Object.keys(el.dataset).length > 0 ? el.dataset : null
      }));
    });
    
    console.log('📋 클릭 가능한 요소들:');
    clickableElements.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName} - ${el.className} - "${el.textContent}"`);
    });
    
    // 호텔 관련 요소 찾기
    const hotelElements = await page.$$eval('*', elements => {
      return elements.filter(el => 
        el.textContent?.includes('호텔') || 
        el.textContent?.includes('Hotel') ||
        el.className?.includes('hotel') ||
        el.id?.includes('hotel')
      ).map(el => ({
        tagName: el.tagName,
        className: el.className,
        id: el.id,
        textContent: el.textContent?.substring(0, 100) || ''
      }));
    });
    
    console.log('\n🏨 호텔 관련 요소들:');
    hotelElements.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName} - ${el.className} - "${el.textContent}"`);
    });
    
    // 스크린샷
    await page.screenshot({ path: 'debug/page-structure.png' });
    
    console.log('✅ 페이지 구조 확인 완료');
    
  } catch (error) {
    console.error('❌ 오류:', error);
  } finally {
    await browser.close();
  }
}

checkPageStructure(); 