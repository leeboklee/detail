const { chromium } = require('playwright');

async function checkPageStructure() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    console.log('?뵇 ?섏씠吏 援ъ“ ?뺤씤...');
    
    // 紐⑤뱺 ?대┃ 媛?ν븳 ?붿냼 李얘린
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
    
    console.log('?뱥 ?대┃ 媛?ν븳 ?붿냼??');
    clickableElements.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName} - ${el.className} - "${el.textContent}"`);
    });
    
    // ?명뀛 愿???붿냼 李얘린
    const hotelElements = await page.$$eval('*', elements => {
      return elements.filter(el => 
        el.textContent?.includes('?명뀛') || 
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
    
    console.log('\n?룳 ?명뀛 愿???붿냼??');
    hotelElements.forEach((el, index) => {
      console.log(`${index + 1}. ${el.tagName} - ${el.className} - "${el.textContent}"`);
    });
    
    // ?ㅽ겕由곗꺑
    await page.screenshot({ path: 'debug/page-structure.png' });
    
    console.log('???섏씠吏 援ъ“ ?뺤씤 ?꾨즺');
    
  } catch (error) {
    console.error('???ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

checkPageStructure(); 
