const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ?뚯뒪???ㅼ젙
const TEST_CONFIG = {
  url: 'http://localhost: {process.env.PORT || 3900}',
  timeout: 60000,
  retries: 3,
  sections: [
    { name: '?명뀛 ?뺣낫', selector: 'text=?명뀛 ?뺣낫' },
    { name: '媛앹떎 ?뺣낫', selector: 'text=媛앹떎 ?뺣낫' },
    { name: '?쒖꽕 ?뺣낫', selector: 'text=?쒖꽕 ?뺣낫' },
    { name: '?⑦궎吏', selector: 'text=?⑦궎吏' },
    { name: '異붽??붽툑', selector: 'text=異붽??붽툑' }
  ]
};

// ?좏떥由ы떚 ?⑥닔??
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async (operation, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`?좑툘 ?ъ떆??${i + 1}/${retries}: ${error.message}`);
      await delay(2000);
    }
  }
};

const takeScreenshot = async (page, filename) => {
  const screenshotPath = path.join(__dirname, 'debug', filename);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`?벝 ?ㅽ겕由곗꺑 ??? ${screenshotPath}`);
};

// 硫붿씤 ?뚯뒪???⑥닔
async function runSaveTest() {
  console.log('?? ???湲곕뒫 ?뚯뒪???쒖옉...');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized', '--disable-web-security']
  });

  const page = await browser.newPage();
  
  try {
    // ?섏씠吏 濡쒕뱶
    console.log('?뱞 ?섏씠吏 濡쒕뱶...');
    await page.goto(TEST_CONFIG.url, { 
      waitUntil: 'networkidle2', 
      timeout: TEST_CONFIG.timeout 
    });

    await delay(3000);

    const results = [];

    // 媛??뱀뀡蹂????湲곕뒫 ?뚯뒪??
    for (const section of TEST_CONFIG.sections) {
      console.log(`\n?㎦ ?뚯뒪?? ${section.name} ???湲곕뒫`);
      
      try {
        // ?뱀뀡 ?대┃ (?띿뒪??湲곕컲)
        await retryOperation(async () => {
          await page.evaluate((sectionName) => {
            const elements = Array.from(document.querySelectorAll('*')).filter(el => 
              el.textContent && el.textContent.includes(sectionName) && 
              (el.tagName === 'DIV' || el.tagName === 'BUTTON' || el.tagName === 'SPAN')
            );
            
            // ?대┃ 媛?ν븳 ?붿냼 李얘린
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
            
            // ?대┃ 媛?ν븳 ?붿냼媛 ?놁쑝硫?泥?踰덉㎏ ?붿냼 ?대┃
            if (elements.length > 0) {
              elements[0].click();
              return true;
            }
            
            return false;
          }, section.name);
          
          console.log(`??${section.name} ?대┃ ?깃났`);
        });

        // 紐⑤떖 ?湲?
        await retryOperation(async () => {
          await page.waitForSelector('[role="dialog"]', { visible: true, timeout: 10000 });
          console.log(`??${section.name} 紐⑤떖 ?대┝ ?뺤씤`);
        });

        await delay(2000);

        // DB ???踰꾪듉 李얘린 諛??대┃
        const saveResult = await page.evaluate(() => {
          const saveButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
            btn.textContent.includes('DB ???) || 
            btn.textContent.includes('??ν븯湲?) ||
            (btn.textContent.includes('???) && !btn.textContent.includes('遺덈윭?ㅺ린'))
          );
          
          console.log('李얠? ???踰꾪듉:', saveButtons.map(btn => btn.textContent));
          
          if (saveButtons.length > 0) {
            // 媛???곸젅?????踰꾪듉 ?좏깮
            const saveButton = saveButtons.find(btn => btn.textContent.includes('DB ???)) || saveButtons[0];
            
            // 踰꾪듉??蹂댁씠?붿? ?뺤씤
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
        });

        if (saveResult.success) {
          console.log(`??${section.name} ???踰꾪듉 ?대┃ ?깃났: ${saveResult.buttonText}`);
          
          // ????꾨즺 硫붿떆吏 ?湲?(??湲멸쾶)
          await delay(5000);
          
          // ???硫붿떆吏 ?뺤씤 (???볦? 踰붿쐞)
          const saveMessage = await page.evaluate(() => {
            const messageElements = Array.from(document.querySelectorAll('*')).filter(el => 
              el.textContent && (
                el.textContent.includes('??λ릺?덉뒿?덈떎') || 
                el.textContent.includes('????깃났') ||
                el.textContent.includes('????꾨즺') ||
                el.textContent.includes('???以?) ||
                el.textContent.includes('??) ||
                el.textContent.includes('?깃났') ||
                el.textContent.includes('?꾨즺')
              )
            );
            
            // 紐⑤뱺 硫붿떆吏 濡쒓렇濡?異쒕젰
            console.log('李얠? 硫붿떆吏 ?붿냼??', messageElements.map(el => el.textContent.trim()).slice(0, 10));
            
            return messageElements.length > 0 ? messageElements[0].textContent.trim() : null;
          });

          if (saveMessage) {
            console.log(`??${section.name} ????꾨즺: ${saveMessage}`);
            results.push({ section: section.name, status: '?깃났', message: saveMessage });
          } else {
            console.log(`?좑툘 ${section.name} ???硫붿떆吏 ?뺤씤 ?덈맖`);
            results.push({ section: section.name, status: '遺덈챸', message: '???硫붿떆吏 ?놁쓬' });
          }
        } else {
          console.log(`??${section.name} ???踰꾪듉 ?대┃ ?ㅽ뙣: ${saveResult.reason}`);
          results.push({ section: section.name, status: '?ㅽ뙣', message: saveResult.reason });
        }

        // 紐⑤떖 ?リ린
        await retryOperation(async () => {
          // ESC ?ㅻ줈 紐⑤떖 ?リ린
          await page.keyboard.press('Escape');
          await delay(1000);
          
          // 紐⑤떖???ロ삍?붿? ?뺤씤
          const modalExists = await page.$('[role="dialog"]');
          if (!modalExists) {
            console.log(`??${section.name} 紐⑤떖 ?リ린 ?깃났`);
          } else {
            throw new Error('紐⑤떖???ロ엳吏 ?딆쓬');
          }
        });

        await delay(2000);

      } catch (error) {
        console.log(`??${section.name} ????뚯뒪???ㅽ뙣: ${error.message}`);
        results.push({ section: section.name, status: '?ㅽ뙣', message: error.message });
        
        // 紐⑤떖???대젮?덈떎硫??リ린 ?쒕룄
        try {
          await page.keyboard.press('Escape');
          await delay(1000);
        } catch (e) {
          // 臾댁떆
        }
      }
    }

    // 寃곌낵 異쒕젰
    console.log('\n?뱤 ???湲곕뒫 ?뚯뒪??寃곌낵:');
    console.log('==================================================');
    
    let successCount = 0;
    results.forEach((result, index) => {
      const statusIcon = result.status === '?깃났' ? '?? : result.status === '?ㅽ뙣' ? '?? : '?좑툘';
      console.log(`${index + 1}. ${result.section}: ${statusIcon} ${result.status}`);
      if (result.message) {
        console.log(`   硫붿떆吏: ${result.message}`);
      }
      
      if (result.status === '?깃났') successCount++;
    });
    
    console.log('==================================================');
    console.log(`珥?${results.length}媛??뱀뀡 以?${successCount}媛??깃났 (${Math.round(successCount/results.length*100)}%)`);

    // 理쒖쥌 ?ㅽ겕由곗꺑
    await takeScreenshot(page, 'save-test-final.png');

    // 寃곌낵 ???
    const resultData = {
      timestamp: new Date().toISOString(),
      results: results,
      summary: {
        total: results.length,
        success: successCount,
        successRate: Math.round(successCount/results.length*100)
      }
    };

    const resultPath = path.join(__dirname, 'debug', 'save-test-results.json');
    fs.writeFileSync(resultPath, JSON.stringify(resultData, null, 2));
    console.log(`?뱞 寃곌낵 ??? ${resultPath}`);

    console.log('\n?뢾 ???湲곕뒫 ?뚯뒪???꾨즺');
    
    return results;

  } catch (error) {
    console.error('???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
    await takeScreenshot(page, 'save-test-error.png');
    throw error;
  } finally {
    await browser.close();
  }
}

// API ????뚯뒪???⑥닔
async function testApiSave() {
  console.log('\n?뵩 API ???湲곕뒫 吏곸젒 ?뚯뒪??..');
  
  const testData = {
    hotel: {
      name: '?뚯뒪???명뀛',
      address: '?쒖슱??媛뺣궓援?,
      phone: '02-1234-5678'
    },
    rooms: [{
      name: '?붾윮??猷?,
      type: '?붾툝',
      structure: '35??,
      bedType: '?뱀궗?댁쫰',
      view: '?쒗떚酉?
    }],
    facilities: [{
      name: '?섏쁺??,
      description: '?쇱쇅 ?섏쁺??,
      category: 'general'
    }],
    packages: [{
      name: '?덈땲臾??⑦궎吏',
      description: '?좏샎遺遺 ?꾩슜 ?⑦궎吏',
      price: 200000
    }],
    charges: {
      items: [{
        name: '二쇱감鍮?,
        price: '5000',
        description: '1??湲곗?'
      }]
    }
  };

  try {
    const response = await fetch('http://localhost: {process.env.PORT || 3900}/api/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '?듯빀 ?뚯뒪???쒗뵆由?,
        ...testData,
        isTemplate: true
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('??API ????뚯뒪???깃났:', result.message || '????꾨즺');
      return true;
    } else {
      console.log('??API ????뚯뒪???ㅽ뙣:', response.status);
      return false;
    }
  } catch (error) {
    console.log('??API ????뚯뒪???ㅻ쪟:', error.message);
    return false;
  }
}

// 硫붿씤 ?ㅽ뻾
async function main() {
  try {
    // ?붾쾭洹??붾젆?좊━ ?앹꽦
    const debugDir = path.join(__dirname, 'debug');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }

    // API ?뚯뒪??癒쇱? ?ㅽ뻾
    await testApiSave();
    
    // UI ???湲곕뒫 ?뚯뒪??
    await runSaveTest();
    
    console.log('\n?렞 紐⑤뱺 ?뚯뒪???꾨즺!');
    
  } catch (error) {
    console.error('???뚯뒪???ㅽ뻾 ?ㅽ뙣:', error);
    process.exit(1);
  }
}

// ?ㅽ뻾
main(); 
