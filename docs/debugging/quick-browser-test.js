import React from 'react';
const { chromium } = require('playwright');

async function testBrowser() {
  console.log('?? 釉뚮씪?곗? ?뚯뒪???쒖옉...');
  
  let browser = null;
  let context = null;
  let page = null;
  
  try {
    // 釉뚮씪?곗? ?ㅽ뻾
    browser = await chromium.launch({ 
      headless: false,
      args: ['--no-sandbox', '--disable-dev-shm-usage']
    });
    
    context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    
    page = await context.newPage();
    
    // 肄섏넄 濡쒓렇 罹먯튂
    page.on('console', msg => {
      console.log(`?뼢截?肄섏넄: ${msg.type()}: ${msg.text()}`);
    });
    
    // ?먮윭 罹먯튂
    page.on('pageerror', error => {
      console.log(`???섏씠吏 ?먮윭: ${error.message}`);
    });
    
    // ?ㅽ듃?뚰겕 ?붿껌 紐⑤땲?곕쭅
    page.on('request', request => {
      console.log(`?뱻 ?붿껌: ${request.method()} ${request.url()}`);
    });
    
    page.on('response', response => {
      console.log(`?벂 ?묐떟: ${response.status()} ${response.url()}`);
    });
    
    console.log('?뙋 localhost: {process.env.PORT || 3900}濡??대룞 以?..');
    
    // ?섏씠吏 濡쒕뱶 (??꾩븘???ㅼ젙)
    await page.goto('http://localhost: {process.env.PORT || 3900}', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
    
    // ?섏씠吏 ?쒕ぉ ?뺤씤
    const title = await page.title();
    console.log(`?뱞 ?섏씠吏 ?쒕ぉ: ${title}`);
    
    // DOM 湲곕낯 ?붿냼???뺤씤
    const bodyText = await page.textContent('body');
    console.log(`?뱷 ?섏씠吏 ?댁슜 (泥?200??: ${bodyText?.substring(0, 200)}...`);
    
    // React ?깆씠 濡쒕뱶?섏뿀?붿? ?뺤씤
    const reactElements = await page.locator('[data-reactroot], #__next, .App').count();
    console.log(`?쏉툘 React ?붿냼 媛먯?: ${reactElements}媛?);
    
    // 二쇱슂 ?뱀뀡???뺤씤
    const sections = await page.locator('section, .section, [class*="section"]').count();
    console.log(`?뱫 ?뱀뀡 ?붿냼: ${sections}媛?);
    
    // ?낅젰 ?꾨뱶???뺤씤
    const inputs = await page.locator('input, textarea, select').count();
    console.log(`?뱷 ?낅젰 ?꾨뱶: ${inputs}媛?);
    
    // 踰꾪듉???뺤씤
    const buttons = await page.locator('button, [role="button"]').count();
    console.log(`?뵖 踰꾪듉: ${buttons}媛?);
    
    // ?ㅽ겕由곗꺑 ???
    await page.screenshot({ path: 'debug-browser-test.png', fullPage: true });
    console.log('?벝 ?ㅽ겕由곗꺑 ????꾨즺: debug-browser-test.png');
    
    // ?좎떆 ?湲?(?섏씠吏 ?뺤씤??
    console.log('??5珥덇컙 ?섏씠吏 ?좎?...');
    await page.waitForTimeout(5000);
    
  } catch (error) {
    console.log(`??釉뚮씪?곗? ?뚯뒪???ㅽ뙣: ${error.message}`);
    console.log(`?뱤 ?ㅽ깮 ?몃젅?댁뒪:`, error.stack);
  } finally {
    if (browser) {
      await browser.close();
      console.log('?뵚 釉뚮씪?곗? 醫낅즺');
    }
  }
}

// ?뚯뒪???ㅽ뻾
testBrowser().catch(console.error); 
