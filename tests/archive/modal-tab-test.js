const puppeteer = require('puppeteer');

async function modalTabTest() {
    console.log('?? 紐⑤떖 ???뚯뒪???쒖옉');
    
    const browser = await puppeteer.launch({
        headless: false,
        devtools: true,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    try {
        console.log('?벑 ?섏씠吏 濡쒕뵫 以?..');
        await page.goto('http://localhost: {process.env.PORT || 3900}', { waitUntil: 'networkidle2' });
        
        // ?섏씠吏 濡쒕뱶 ?湲?
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // ?쒖꽌 議곗젙 踰꾪듉 ?대┃ (紐⑤떖 ?닿린)
        console.log('\n?봽 ?쒖꽌 議곗젙 踰꾪듉 ?대┃');
        await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const btn = buttons.find(btn => btn.textContent.includes('?봽 ?쒖꽌 議곗젙'));
            if (btn) btn.click();
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 紐⑤떖 ?대? ??援ъ“ ?뺤씤
        console.log('\n?뱫 紐⑤떖 ?대? ??援ъ“:');
        const modalTabs = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('button, [role="tab"], .tab, [data-tab]'));
            return tabs.map(tab => ({
                text: tab.textContent.trim(),
                className: tab.className,
                id: tab.id,
                dataset: tab.dataset,
                tagName: tab.tagName,
                visible: tab.offsetParent !== null
            })).filter(tab => tab.visible && tab.text.length > 0);
        });
        
        modalTabs.forEach((tab, i) => {
            console.log(`  ${i+1}. "${tab.text}" - ${tab.tagName} - class: ${tab.className}`);
        });
        
        // ?ㅽ겕由곗꺑
        await page.screenshot({ 
            path: 'modal-tabs-analysis.png',
            fullPage: true 
        });
        
        console.log('\n?벝 紐⑤떖 ?ㅽ겕由곗꺑 ??? modal-tabs-analysis.png');
        
        // 媛????대┃ ?뚯뒪??
        const tabKeywords = ['?명뀛', '媛앹떎', '?쒖꽕', '?⑦궎吏', '?먮ℓ', '異붽?', '?붽툑', '泥댄겕', '痍⑥냼', '?덉빟', '怨듭?', '?쒗뵆由?, '?곗씠??];
        
        for (let i = 0; i < tabKeywords.length; i++) {
            const keyword = tabKeywords[i];
            console.log(`\n?뱫 [${i+1}/${tabKeywords.length}] "${keyword}" 愿?????뚯뒪??);
            
            try {
                // ?ㅼ썙?쒓? ?ы븿??踰꾪듉 李얘린
                const tabButton = await page.evaluate((keyword) => {
                    const buttons = Array.from(document.querySelectorAll('button'));
                    return buttons.find(btn => 
                        btn.textContent.includes(keyword) && 
                        btn.offsetParent !== null
                    );
                }, keyword);
                
                if (tabButton) {
                    // 踰꾪듉 ?대┃
                    await page.evaluate((keyword) => {
                        const buttons = Array.from(document.querySelectorAll('button'));
                        const btn = buttons.find(btn => 
                            btn.textContent.includes(keyword) && 
                            btn.offsetParent !== null
                        );
                        if (btn) btn.click();
                    }, keyword);
                    
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // 踰꾪듉怨??낅젰 ?꾨뱶 媛쒖닔 ?뺤씤
                    const buttons = await page.$$('button:visible');
                    const inputs = await page.$$('input:visible, textarea:visible, select:visible');
                    
                    console.log(`  ??"${keyword}" ???대┃ ?깃났`);
                    console.log(`  ?뵖 踰꾪듉 ${buttons.length}媛?諛쒓껄`);
                    console.log(`  ?⑨툘 ?낅젰 ?꾨뱶 ${inputs.length}媛?諛쒓껄`);
                    
                    // ?ㅽ겕由곗꺑
                    await page.screenshot({ 
                        path: `modal-tab-${i+1}-${keyword}.png`,
                        fullPage: true 
                    });
                    
                } else {
                    console.log(`  ?좑툘 "${keyword}" 愿????쓣 李얠쓣 ???놁쓬`);
                }
                
            } catch (error) {
                console.log(`  ??"${keyword}" ???뚯뒪???ㅽ뙣:`, error.message);
            }
        }
        
        console.log('\n?럦 紐⑤떖 ???뚯뒪???꾨즺!');
        
        // 釉뚮씪?곗?瑜??댁뼱???곹깭濡??湲?
        console.log('\n??釉뚮씪?곗?瑜??댁뼱???곹깭濡??湲?以?.. (30珥?');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
    } catch (error) {
        console.error('???뚯뒪???ㅻ쪟:', error);
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    modalTabTest();
}
