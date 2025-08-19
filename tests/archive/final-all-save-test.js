const { chromium } = require('playwright');

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const sections = [
  { name: '?명뀛 ?뺣낫', buttonText: '?뮶 ?명뀛?뺣낫 ??? },
  { name: '媛앹떎 ?뺣낫', buttonText: '?뮶 媛앹떎?뺣낫 ??? },
  { name: '?쒖꽕 ?뺣낫', buttonText: '?뮶 ?쒖꽕?뺣낫 ??? },
  { name: '?⑦궎吏', buttonText: '?뮶 ?⑦궎吏 ??? },
  { name: '異붽??붽툑', buttonText: '?뮶 異붽??붽툑 ??? }
];

async function testAllSaveFunctions() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle' });
    await delay(3000);
    
    // ?ㅽ듃?뚰겕 ?붿껌 紐⑤땲?곕쭅
    const responses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          method: response.request().method(),
          timestamp: new Date().toISOString()
        });
      }
    });
    
    // alert ??붿긽??泥섎━
    const alerts = [];
    page.on('dialog', async dialog => {
      alerts.push(dialog.message());
      console.log('?슚 Alert:', dialog.message());
      await dialog.accept();
    });
    
    const results = [];
    
    for (const section of sections) {
      console.log(`\n?㎦ ?뚯뒪?? ${section.name} ???湲곕뒫`);
      
      try {
        // ?뱀뀡 ?대┃
        await page.evaluate((sectionName) => {
          const elements = Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent && el.textContent.includes(sectionName) && 
            (el.tagName === 'DIV' || el.tagName === 'BUTTON' || el.tagName === 'SPAN')
          );
          
          const clickableElement = elements.find(el => {
            const style = window.getComputedStyle(el);
            return style.cursor === 'pointer' || 
                   el.tagName === 'BUTTON' || 
                   el.onclick || 
                   el.getAttribute('role') === 'button';
          });
          
          if (clickableElement) {
            clickableElement.click();
            return true;
          }
          
          if (elements.length > 0) {
            elements[0].click();
            return true;
          }
          
          return false;
        }, section.name);
        
        await delay(2000);
        console.log(`??${section.name} 紐⑤떖 ?대┝`);
        
        // ???踰꾪듉 ?대┃
        const saveResult = await page.evaluate((buttonText) => {
          const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes(buttonText)
          );
          
          if (saveButtons.length > 0) {
            const saveButton = saveButtons[0];
            const rect = saveButton.getBoundingClientRect();
            const isVisible = rect.width > 0 && rect.height > 0;
            
            if (isVisible) {
              saveButton.click();
              return { success: true, buttonText: saveButton.textContent };
            } else {
              return { success: false, reason: '踰꾪듉??蹂댁씠吏 ?딆쓬' };
            }
          }
          return { success: false, reason: '???踰꾪듉??李얠쓣 ???놁쓬' };
        }, section.buttonText);
        
        if (saveResult.success) {
          console.log(`??${section.name} ???踰꾪듉 ?대┃ ?깃났`);
          
          // 5珥??湲?(???泥섎━)
          await delay(5000);
          
          results.push({
            section: section.name,
            status: '?깃났',
            buttonText: section.buttonText
          });
        } else {
          console.log(`??${section.name} ????ㅽ뙣: ${saveResult.reason}`);
          results.push({
            section: section.name,
            status: '?ㅽ뙣',
            reason: saveResult.reason
          });
        }
        
        // 紐⑤떖 ?リ린 (ESC)
        await page.keyboard.press('Escape');
        await delay(1000);
        
      } catch (error) {
        console.log(`??${section.name} ?뚯뒪??以??ㅻ쪟: ${error.message}`);
        results.push({
          section: section.name,
          status: '?ㅻ쪟',
          error: error.message
        });
        
        // 紐⑤떖 ?リ린 ?쒕룄
        try {
          await page.keyboard.press('Escape');
          await delay(1000);
        } catch (e) {
          // 臾댁떆
        }
      }
    }
    
    // 寃곌낵 異쒕젰
    console.log('\n?뱤 ?꾩껜 ???湲곕뒫 ?뚯뒪??寃곌낵:');
    console.log('==================================================');
    
    let successCount = 0;
    results.forEach((result, index) => {
      const statusIcon = result.status === '?깃났' ? '?? : '??;
      console.log(`${index + 1}. ${result.section}: ${statusIcon} ${result.status}`);
      if (result.reason) {
        console.log(`   ?댁쑀: ${result.reason}`);
      }
      if (result.error) {
        console.log(`   ?ㅻ쪟: ${result.error}`);
      }
      
      if (result.status === '?깃났') successCount++;
    });
    
    console.log('==================================================');
    console.log(`珥?${results.length}媛??뱀뀡 以?${successCount}媛??깃났 (${Math.round(successCount/results.length*100)}%)`);
    
    // API ?붿껌 ?붿빟
    const postRequests = responses.filter(r => r.method === 'POST');
    console.log(`\n?뙋 API ?붿껌 ?붿빟:`);
    console.log(`- 珥?API ?붿껌: ${responses.length}媛?);
    console.log(`- POST ?붿껌 (???: ${postRequests.length}媛?);
    console.log(`- GET ?붿껌 (濡쒕뱶): ${responses.length - postRequests.length}媛?);
    
    if (postRequests.length > 0) {
      console.log('\n?뱷 ????붿껌 ?곸꽭:');
      postRequests.forEach((req, index) => {
        console.log(`${index + 1}. ${req.timestamp} POST ${req.url} - ${req.status}`);
      });
    }
    
    // Alert 硫붿떆吏 ?붿빟
    console.log(`\n?슚 Alert 硫붿떆吏: ${alerts.length}媛?);
    alerts.forEach((alert, index) => {
      console.log(`${index + 1}. ${alert}`);
    });
    
    await delay(2000);
    
  } catch (error) {
    console.error('???꾩껜 ?뚯뒪??以??ㅻ쪟:', error);
  } finally {
    await browser.close();
  }
}

testAllSaveFunctions().catch(console.error); 
