const { chromium } = require('playwright');

async function manualCheck() {
    console.log('?뵇 ?섎룞 ?뺤씤???꾪빐 釉뚮씪?곗?瑜??댁뼱?〓땲??');
    console.log('?뱦 ?ㅼ쓬???뺤씤?댁＜?몄슂:');
    console.log('   1. ?섏씠吏媛 ?뺤긽?곸쑝濡?濡쒕뱶?섎뒗吏');
    console.log('   2. ?대뼡 踰꾪듉/?곸뿭???대┃?댁빞 ?낅젰 ?꾨뱶媛 ?섑??섎뒗吏');
    console.log('   3. ?낅젰 ?꾨뱶?먯꽌 ??댄븨????踰꾨쾮嫄곕━?붿?');
    console.log('   4. ?먮룞??μ씠 ?몄젣 ?숈옉?섎뒗吏');
    console.log('');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 300,
        args: ['--start-maximized'] // 釉뚮씪?곗? 理쒕???
    });
    
    try {
        const page = await browser.newPage();
        
        // 釉뚮씪?곗? ?ш린 ?ㅼ젙
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        // 肄섏넄 硫붿떆吏 異쒕젰
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('AutoSave') || text.includes('???) || text.includes('?ㅻ쪟') || text.includes('Error')) {
                console.log(`?뙋 [${msg.type()}] ${text}`);
            }
        });
        
        console.log('?뱞 http://localhost: {process.env.PORT || 3900} 濡쒕뵫...');
        await page.goto('http://localhost: {process.env.PORT || 3900}');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // ?꾩옱 ?곹깭 異쒕젰
        const pageInfo = await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button')).map(btn => btn.textContent?.trim()).filter(text => text);
            const inputs = document.querySelectorAll('input, textarea, select').length;
            const cards = Array.from(document.querySelectorAll('.cursor-pointer')).length;
            const modals = document.querySelectorAll('[role="dialog"], .modal, .fixed.inset-0').length;
            
            return { buttons, inputs, cards, modals };
        });
        
        console.log('\n?뱤 ?꾩옱 ?섏씠吏 ?곹깭:');
        console.log(`   - 踰꾪듉?? [${pageInfo.buttons.join(', ')}]`);
        console.log(`   - ?낅젰 ?꾨뱶: ${pageInfo.inputs}媛?);
        console.log(`   - ?대┃ 媛?ν븳 移대뱶: ${pageInfo.cards}媛?);
        console.log(`   - ?대┛ 紐⑤떖: ${pageInfo.modals}媛?);
        
        console.log('\n??釉뚮씪?곗?瑜??댁뼱?〓땲?? ?섎룞?쇰줈 ?뚯뒪?명빐蹂댁꽭??');
        console.log('   ?뮕 ?? 媛??뱀뀡 移대뱶??踰꾪듉???대┃?대낫?몄슂.');
        console.log('   ?뮕 ?? ?낅젰 ?꾨뱶媛 ?섑??섎㈃ ??댄븨 ?뚯뒪?명빐蹂댁꽭??');
        console.log('   ?뮕 ?? 釉뚮씪?곗? 肄섏넄?먯꽌 異붽? ?뺣낫瑜??뺤씤?섏꽭??');
        console.log('\n   醫낅즺?섎젮硫????곕??먯뿉??Ctrl+C瑜??꾨Ⅴ?몄슂.');
        
        // 臾댄븳 ?湲?(?ъ슜?먭? ?섎룞?쇰줈 醫낅즺???뚭퉴吏)
        await new Promise(resolve => {
            // 60珥덈쭏???곹깭 ?낅뜲?댄듃
            const interval = setInterval(async () => {
                try {
                    const currentInputs = await page.evaluate(() => document.querySelectorAll('input, textarea, select').length);
                    console.log(`???꾩옱 ?낅젰 ?꾨뱶 ?? ${currentInputs}媛?);
                } catch (err) {
                    console.log('?좑툘 ?섏씠吏 ?묎렐 ?ㅻ쪟 - 釉뚮씪?곗?媛 ?ロ삍?????덉뒿?덈떎.');
                    clearInterval(interval);
                    resolve();
                }
            }, 60000);
            
            // ?섏씠吏 ?ロ옒 媛먯?
            page.on('close', () => {
                console.log('?뵚 ?섏씠吏媛 ?ロ삍?듬땲??');
                clearInterval(interval);
                resolve();
            });
        });
        
    } catch (error) {
        console.error('???ㅻ쪟 諛쒖깮:', error);
    } finally {
        console.log('?뵚 ?섎룞 ?뺤씤 醫낅즺.');
        await browser.close();
    }
}

manualCheck().catch(console.error); 
