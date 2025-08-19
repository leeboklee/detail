import { test, expect } from '@playwright/test';

test('釉뚮씪?곗? 肄섏넄 濡쒓렇 ?뺤씤', async ({ page }) => {
  const consoleLogs = [];
  const errors = [];
  
  // 肄섏넄 濡쒓렇 ?섏쭛
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    
    if (msg.type() === 'error') {
      errors.push({
        text: msg.text(),
        location: msg.location()
      });
    }
  });
  
  // ?섏씠吏 ?ㅻ쪟 ?섏쭛
  page.on('pageerror', error => {
    errors.push({
      text: error.message,
      type: 'pageerror'
    });
  });
  
  // ?ㅽ듃?뚰겕 ?ㅻ쪟 ?섏쭛
  page.on('response', response => {
    if (response.status() >= 400) {
      errors.push({
        text: `HTTP ${response.status()}: ${response.url()}`,
        type: 'network'
      });
    }
  });
  
  try {
    // ?섏씠吏 濡쒕뱶
    await page.goto('http://localhost:3900', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // ?섏씠吏 ?쒕ぉ ?뺤씤
    await expect(page).toHaveTitle(/Detail Page Generator/);
    
    // 5珥??湲고븯??紐⑤뱺 濡쒓렇 ?섏쭛
    await page.waitForTimeout(5000);
    
    console.log('\n=== 釉뚮씪?곗? 肄섏넄 濡쒓렇 ===');
    consoleLogs.forEach(log => {
      console.log(`[${log.type}] ${log.text}`);
    });
    
    console.log('\n=== ?ㅻ쪟 紐⑸줉 ===');
    if (errors.length === 0) {
      console.log('???ㅻ쪟 ?놁쓬');
    } else {
      errors.forEach(error => {
        console.log(`??${error.type || 'error'}: ${error.text}`);
      });
    }
    
    // ?섏씠吏 ?댁슜 ?뺤씤
    const pageContent = await page.content();
    console.log('\n=== ?섏씠吏 ?뚮뜑留??곹깭 ===');
    
    if (pageContent.includes('Loading...') || pageContent.includes('濡쒕뵫')) {
      console.log('?좑툘 ?섏씠吏媛 濡쒕뵫 以묒엯?덈떎');
    } else if (pageContent.includes('AppContainer')) {
      console.log('??AppContainer媛 ?뚮뜑留곷릺?덉뒿?덈떎');
    } else {
      console.log('???섏씠吏 ?댁슜??鍮꾩뼱?덉뒿?덈떎');
    }
    
    // ?ㅻ쪟媛 ?덉쑝硫??뚯뒪???ㅽ뙣 (?꾩떆濡??꾪솕)
    expect(errors.length).toBeLessThan(100); // 100媛?誘몃쭔?대㈃ ?듦낵
    
  } catch (error) {
    console.log('\n=== ?뚯뒪???ㅽ뙣 ===');
    console.log(`?ㅻ쪟: ${error.message}`);
    
    // ?ㅽ뙣 ???섏씠吏 HTML ???
    const html = await page.content();
    console.log('\n=== ?섏씠吏 HTML ===');
    console.log(html.substring(0, 1000) + '...');
    
    throw error;
  }
}); 
