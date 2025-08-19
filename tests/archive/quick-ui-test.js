const { chromium } = require('playwright');

async function quickUITest() {
    console.log('?뵇 鍮좊Ⅸ UI ?뚯뒪???쒖옉...');
    
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        console.log('?뱞 ?섏씠吏 濡쒕뵫 以?..');
        await page.goto('http://localhost: {process.env.PORT || 3900}/');
        await page.waitForLoadState('networkidle');
        
        console.log('?뱷 ?섏씠吏 ?쒕ぉ:', await page.title());
        
        // ?섏씠吏 ?ㅽ겕由곗꺑 李띻린
        await page.screenshot({ path: 'page-loaded.png' });
        console.log('?벝 ?섏씠吏 濡쒕뵫 ?ㅽ겕由곗꺑 ??λ맖');
        
        // ?명뀛 ?뺣낫 移대뱶 李얘린
        const hotelCard = page.locator('[data-testid="section-card-hotel"]');
        const isCardVisible = await hotelCard.isVisible();
        console.log('?룳 ?명뀛 ?뺣낫 移대뱶 蹂댁엫:', isCardVisible);
        
        if (isCardVisible) {
            console.log('?뼮截??명뀛 ?뺣낫 移대뱶 ?대┃...');
            await hotelCard.click();
            
            // 紐⑤떖 ?湲?
            await page.waitForTimeout(3000);
            
            // ?ㅼ뼇??紐⑤떖 ??됲꽣濡??뺤씤
            const modalSelectors = [
                'div[role="dialog"]',
                '[data-slot="wrapper"]',
                '[data-slot="backdrop"]',
                '.modal',
                '[aria-modal="true"]',
                '[role="dialog"]',
                'div[class*="modal"]',
                'div[class*="backdrop"]'
            ];
            
            let foundModal = null;
            for (const selector of modalSelectors) {
                const modal = page.locator(selector);
                const isVisible = await modal.isVisible();
                if (isVisible) {
                    console.log(`??紐⑤떖 諛쒓껄: ${selector}`);
                    foundModal = modal;
                    break;
                } else {
                    console.log(`???놁쓬: ${selector}`);
                }
            }
            
            if (foundModal) {
                console.log('?벝 紐⑤떖 ?ㅽ겕由곗꺑 李띻린...');
                await page.screenshot({ path: 'modal-found.png' });
                
                // 紐⑤떖 ?댁슜 ?뺤씤
                const modalText = await foundModal.textContent();
                console.log('?뱷 紐⑤떖 ?댁슜 ?쇰?:', modalText?.substring(0, 200));
                
            } else {
                console.log('???대뼡 紐⑤떖 ??됲꽣濡쒕룄 李얠쓣 ???놁쓬');
                
                // DOM 援ъ“ 遺꾩꽍
                const body = await page.locator('body').innerHTML();
                console.log('?뵇 body?먯꽌 "modal" 愿???대옒??李얘린...');
                const modalMatches = body.match(/class="[^"]*modal[^"]*"/gi) || [];
                console.log('紐⑤떖 ?대옒?ㅻ뱾:', modalMatches.slice(0, 5));
                
                // ?덈줈 ?앷릿 div??李얘린
                const allDivs = page.locator('div');
                const divCount = await allDivs.count();
                console.log('?뱤 珥?div 媛쒖닔:', divCount);
                
                // ?붾㈃???덈줈 ?섑???寃껊뱾 ?뺤씤
                await page.screenshot({ path: 'no-modal-found.png' });
            }
        } else {
            console.log('???명뀛 ?뺣낫 移대뱶瑜?李얠쓣 ???놁쓬');
        }
        
        console.log('?깍툘 5珥??湲?(?섎룞 ?뺤씤??...');
        await page.waitForTimeout(5000);
        
    } catch (error) {
        console.error('???뚯뒪??以??ㅻ쪟:', error);
    } finally {
        await browser.close();
        console.log('???뚯뒪???꾨즺');
    }
}

quickUITest(); 
