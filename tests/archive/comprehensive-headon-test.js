/**
 * ?뵇 ?꾩껜 ?뱀뀡 醫낇빀 ?뚯뒪???ㅽ겕由쏀듃 (?ㅻ뱶??紐⑤뱶)
 * ?ㅼ젣 釉뚮씪?곗? 李쎌쓣 ?댁뼱???쒓컖?곸쑝濡??뺤씤?섎ŉ 紐⑤뱺 踰꾪듉???뚯뒪??
 * Created: 2025-07-03
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ?뚯뒪???ㅼ젙
const TEST_CONFIG = {
    url: 'http://localhost: {process.env.PORT || 3900}',
    waitTime: 3000, // ?ㅻ뱶??紐⑤뱶?먯꽌????湲멸쾶 ?湲?
    screenshotDir: 'screenshots/headon-test',
    resultFile: 'headon-test-results.json',
    headless: false, // ?ㅻ뱶??紐⑤뱶
    timeout: 60000,
    slowMo: 500 // ?≪뀡 媛꾧꺽???먮━寃?
};

// 紐⑤뱺 ???뺣낫
const ALL_TABS = [
    { key: 'hotel', label: '?명뀛 ?뺣낫', icon: '?룧' },
    { key: 'rooms', label: '媛앹떎 ?뺣낫', icon: '?뫁' },
    { key: 'facilities', label: '?쒖꽕 ?뺣낫', icon: '?숋툘' },
    { key: 'packages', label: '?⑦궎吏', icon: '?뱞' },
    { key: 'period', label: '?뱟 ?먮ℓ湲곌컙&?ъ닕??, icon: '?뱟' },
    { key: 'pricing', label: '?뮥 異붽??붽툑', icon: '?뮥' },
    { key: 'charges', label: '?뤇截??붽툑 ??ぉ', icon: '?뤇截? },
    { key: 'checkin', label: '泥댄겕???꾩썐', icon: '?뱟' },
    { key: 'cancel', label: '痍⑥냼洹쒖젙', icon: '?썳截? },
    { key: 'booking', label: '?덉빟?덈궡', icon: '?뮶' },
    { key: 'notices', label: '怨듭??ы빆', icon: '?뱞' },
    { key: 'database', label: '?뮶 ?쒗뵆由?紐⑸줉', icon: '?뮶' }
];

class HeadOnTestRunner {
    constructor() {
        this.browser = null;
        this.page = null;
        this.results = {
            timestamp: new Date().toISOString(),
            mode: 'headon',
            totalTabs: ALL_TABS.length,
            totalInteractions: 0,
            successfulInteractions: 0,
            failedInteractions: 0,
            userObservations: [],
            detailedLogs: [],
            screenshots: []
        };

        // ?ㅽ겕由곗꺑 ?붾젆?좊━ ?앹꽦
        if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }
    }

    async init() {
        console.log('?? ?ㅻ뱶??釉뚮씪?곗? 珥덇린??以?..');
        
        this.browser = await puppeteer.launch({
            headless: false,
            slowMo: TEST_CONFIG.slowMo,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--start-maximized'
            ],
            defaultViewport: null, // ?꾩껜 ?붾㈃ ?ъ슜
            devtools: true // 媛쒕컻???꾧뎄 ?먮룞 ?닿린
        });

        const pages = await this.browser.pages();
        this.page = pages[0] || await this.browser.newPage();
        
        // 媛쒕컻???꾧뎄?먯꽌 肄섏넄 ??쓣 ?쒖꽦??
        await this.page.bringToFront();
        
        // 肄섏넄 濡쒓렇 罹≪쿂 諛?異쒕젰
        this.page.on('console', msg => {
            const logMessage = `[${msg.type().toUpperCase()}] ${msg.text()}`;
            console.log('?뼢截? 釉뚮씪?곗?:', logMessage);
            this.results.detailedLogs.push({
                type: msg.type(),
                message: msg.text(),
                timestamp: new Date().toISOString()
            });
        });

        await this.page.goto(TEST_CONFIG.url, { waitUntil: 'networkidle2' });
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺 - 媛쒕컻???꾧뎄?먯꽌 肄섏넄???뺤씤?섏꽭??);
        
        // ?ъ슜?먯뿉寃?以鍮??쒓컙 ?쒓났
        console.log('??5珥????뚯뒪?몃? ?쒖옉?⑸땲?? 釉뚮씪?곗? 李쎌쓣 ?뺤씤?섏꽭??..');
        await this.page.waitForTimeout(5000);
    }

    async takeScreenshot(name, description = '') {
        try {
            const filename = `${name}_${Date.now()}.png`;
            const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
            await this.page.screenshot({ path: filepath, fullPage: false });
            this.results.screenshots.push({
                name,
                description,
                filename,
                timestamp: new Date().toISOString()
            });
            console.log(`?벝 ?ㅽ겕由곗꺑 ??? ${filename} ${description ? `(${description})` : ''}`);
        } catch (error) {
            console.error('?ㅽ겕由곗꺑 ????ㅽ뙣:', error.message);
        }
    }

    async interactiveClick(selector, description, tabKey) {
        console.log(`\n?뼮截? ?대┃ ?쒕룄: ${description}`);
        console.log(`   ?좏깮?? ${selector}`);
        
        try {
            // ?붿냼 議댁옱 ?뺤씤
            await this.page.waitForSelector(selector, { timeout: 5000 });
            
            // ?붿냼 ?섏씠?쇱씠??(?쒓컖???뺤씤??
            await this.page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    element.style.border = '3px solid red';
                    element.style.backgroundColor = 'yellow';
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, selector);
            
            await this.page.waitForTimeout(1000);
            
            // ?대┃ ?ㅽ뻾
            await this.page.click(selector);
            console.log(`   ???대┃ ?깃났: ${description}`);
            
            // ?섏씠?쇱씠???쒓굅
            await this.page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    element.style.border = '';
                    element.style.backgroundColor = '';
                }
            }, selector);
            
            this.results.successfulInteractions++;
            this.results.detailedLogs.push({
                type: 'interaction_success',
                tab: tabKey,
                action: 'click',
                selector,
                description,
                timestamp: new Date().toISOString()
            });
            
            await this.page.waitForTimeout(2000);
            return true;
            
        } catch (error) {
            console.error(`   ???대┃ ?ㅽ뙣: ${description}`, error.message);
            this.results.failedInteractions++;
            this.results.detailedLogs.push({
                type: 'interaction_error',
                tab: tabKey,
                action: 'click',
                selector,
                description,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }

    async interactiveInput(selector, value, description, tabKey) {
        console.log(`\n?⑨툘  ?낅젰 ?쒕룄: ${description}`);
        console.log(`   ?좏깮?? ${selector}`);
        console.log(`   媛? ${value}`);
        
        try {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            
            // ?붿냼 ?섏씠?쇱씠??
            await this.page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    element.style.border = '3px solid blue';
                    element.style.backgroundColor = 'lightblue';
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, selector);
            
            await this.page.waitForTimeout(1000);
            
            // 湲곗〈 媛???젣 ????媛??낅젰
            await this.page.click(selector);
            await this.page.keyboard.down('Control');
            await this.page.keyboard.press('KeyA');
            await this.page.keyboard.up('Control');
            await this.page.keyboard.press('Delete');
            await this.page.type(selector, value);
            
            console.log(`   ???낅젰 ?깃났: ${description}`);
            
            // ?섏씠?쇱씠???쒓굅
            await this.page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    element.style.border = '';
                    element.style.backgroundColor = '';
                }
            }, selector);
            
            this.results.successfulInteractions++;
            this.results.detailedLogs.push({
                type: 'interaction_success',
                tab: tabKey,
                action: 'input',
                selector,
                description,
                value,
                timestamp: new Date().toISOString()
            });
            
            await this.page.waitForTimeout(1500);
            return true;
            
        } catch (error) {
            console.error(`   ???낅젰 ?ㅽ뙣: ${description}`, error.message);
            this.results.failedInteractions++;
            this.results.detailedLogs.push({
                type: 'interaction_error',
                tab: tabKey,
                action: 'input',
                selector,
                description,
                value,
                error: error.message,
                timestamp: new Date().toISOString()
            });
            return false;
        }
    }

    async testTabInteractively(tab) {
        console.log(`\n?렞 ${tab.icon} ${tab.label} ?뱀뀡 ?뚯뒪???쒖옉`);
        
        // ???대┃
        const tabClickSuccess = await this.interactiveClick(
            `[data-key="${tab.key}"]`,
            `${tab.label} ???대┃`,
            tab.key
        );
        
        if (!tabClickSuccess) {
            console.log(`??툘 ??${tab.key} 嫄대꼫?`);
            return;
        }
        
        await this.takeScreenshot(`tab_${tab.key}_opened`, `${tab.label} ???대┝`);
        
        // 媛??뱀뀡蹂꾨줈 二쇱슂 ?명꽣?숈뀡 ?섑뻾
        switch (tab.key) {
            case 'hotel':
                await this.testHotelSection(tab.key);
                break;
            case 'rooms':
                await this.testRoomsSection(tab.key);
                break;
            case 'facilities':
                await this.testFacilitiesSection(tab.key);
                break;
            case 'packages':
                await this.testPackagesSection(tab.key);
                break;
            case 'period':
                await this.testPeriodSection(tab.key);
                break;
            case 'pricing':
                await this.testPricingSection(tab.key);
                break;
            case 'charges':
                await this.testChargesSection(tab.key);
                break;
            case 'checkin':
                await this.testCheckinSection(tab.key);
                break;
            case 'cancel':
                await this.testCancelSection(tab.key);
                break;
            case 'booking':
                await this.testBookingSection(tab.key);
                break;
            case 'notices':
                await this.testNoticesSection(tab.key);
                break;
            case 'database':
                await this.testDatabaseSection(tab.key);
                break;
        }
        
        await this.takeScreenshot(`tab_${tab.key}_completed`, `${tab.label} ?뱀뀡 ?뚯뒪???꾨즺`);
        console.log(`??${tab.icon} ${tab.label} ?뱀뀡 ?뚯뒪???꾨즺\n`);
    }

    async testHotelSection(tabKey) {
        console.log('?룳 ?명뀛 ?뺣낫 ?뱀뀡 ?뚯뒪??);
        await this.interactiveInput('input[placeholder*="?명뀛"], input[name*="name"]', '?뚯뒪???명뀛', '?명뀛紐??낅젰', tabKey);
        await this.interactiveInput('textarea', '?뚯뒪???명뀛 ?ㅻ챸?낅땲??', '?명뀛 ?ㅻ챸 ?낅젰', tabKey);
    }

    async testRoomsSection(tabKey) {
        console.log('?룧 媛앹떎 ?뺣낫 ?뱀뀡 ?뚯뒪??);
        // 媛앹떎 異붽? 踰꾪듉? ?쇰컲?곸쑝濡?李얘린 ?대젮?곕?濡??щ윭 ?좏깮???쒕룄
        const addRoomSelectors = [
            'button:has-text("媛앹떎 異붽?")',
            'button:has-text("異붽?")',
            '[data-testid*="add"]',
            '.add-room'
        ];
        
        for (const selector of addRoomSelectors) {
            const success = await this.interactiveClick(selector, '媛앹떎 異붽? 踰꾪듉', tabKey);
            if (success) break;
        }
    }

    async testFacilitiesSection(tabKey) {
        console.log('?룫 ?쒖꽕 ?뺣낫 ?뱀뀡 ?뚯뒪??);
        await this.interactiveClick('[data-testid="add-facility-button"]', '?쒖꽕 異붽? 踰꾪듉', tabKey);
        await this.interactiveInput('input[type="text"]', '?뚯뒪???쒖꽕', '?쒖꽕紐??낅젰', tabKey);
    }

    async testPackagesSection(tabKey) {
        console.log('?벀 ?⑦궎吏 ?뱀뀡 ?뚯뒪??);
        await this.interactiveClick('[data-testid="add-package-button"]', '?⑦궎吏 異붽? 踰꾪듉', tabKey);
        await this.interactiveInput('input[type="text"]', '?뚯뒪???⑦궎吏', '?⑦궎吏紐??낅젰', tabKey);
        await this.interactiveInput('input[type="number"]', '150000', '?⑦궎吏 媛寃??낅젰', tabKey);
    }

    async testPeriodSection(tabKey) {
        console.log('?뱟 ?먮ℓ湲곌컙&?ъ닕???뱀뀡 ?뚯뒪??);
        await this.interactiveInput('input[type="date"]', '2025-12-31', '?좎쭨 ?낅젰', tabKey);
        await this.interactiveClick('button:has-text("???)', '???踰꾪듉', tabKey);
    }

    async testPricingSection(tabKey) {
        console.log('?뮥 異붽??붽툑 ?뱀뀡 ?뚯뒪??);
        await this.interactiveClick('button:has-text("?뵇 ?뚯뒪??)', '?뚯뒪??踰꾪듉', tabKey);
        await this.interactiveClick('button:has-text("?숇컯?쒖꽕 異붽?")', '?숇컯?쒖꽕 異붽? 踰꾪듉', tabKey);
        await this.interactiveClick('button:has-text("?붽툑 怨꾩궛湲?)', '?붽툑 怨꾩궛湲?踰꾪듉', tabKey);
        await this.interactiveInput('input[type="number"]', '50000', '異붽??붽툑 ?낅젰', tabKey);
    }

    async testChargesSection(tabKey) {
        console.log('?뤇截??붽툑 ??ぉ ?뱀뀡 ?뚯뒪??);
        await this.interactiveClick('button:has-text("??ぉ 異붽?")', '??ぉ 異붽? 踰꾪듉', tabKey);
        await this.interactiveInput('input[type="text"]', '?뚯뒪???붽툑 ??ぉ', '?붽툑 ??ぉ紐??낅젰', tabKey);
    }

    async testCheckinSection(tabKey) {
        console.log('?븧 泥댄겕???꾩썐 ?뱀뀡 ?뚯뒪??);
        await this.interactiveInput('input[type="time"]', '15:00', '泥댄겕???쒓컙 ?낅젰', tabKey);
    }

    async testCancelSection(tabKey) {
        console.log('?썳截?痍⑥냼洹쒖젙 ?뱀뀡 ?뚯뒪??);
        await this.interactiveClick('button:has-text("洹쒖튃 異붽?")', '洹쒖튃 異붽? 踰꾪듉', tabKey);
        await this.interactiveClick('button:has-text("?섑뵆 ?곸슜")', '?섑뵆 ?곸슜 踰꾪듉', tabKey);
    }

    async testBookingSection(tabKey) {
        console.log('?뱥 ?덉빟?덈궡 ?뱀뀡 ?뚯뒪??);
        await this.interactiveClick('button:has-text("異붽?")', '??ぉ 異붽? 踰꾪듉', tabKey);
        await this.interactiveInput('textarea', '?뚯뒪???덉빟 ?덈궡?ы빆', '?덉빟 ?덈궡 ?낅젰', tabKey);
    }

    async testNoticesSection(tabKey) {
        console.log('?뱼 怨듭??ы빆 ?뱀뀡 ?뚯뒪??);
        await this.interactiveClick('[data-testid="add-notice-button"]', '怨듭? 異붽? 踰꾪듉', tabKey);
        await this.interactiveInput('input[type="text"]', '?뚯뒪??怨듭??ы빆', '怨듭? ?쒕ぉ ?낅젰', tabKey);
    }

    async testDatabaseSection(tabKey) {
        console.log('?뮶 ?쒗뵆由?紐⑸줉 ?뱀뀡 ?뚯뒪??);
        await this.interactiveClick('button:has-text("遺덈윭?ㅺ린")', '?쒗뵆由?遺덈윭?ㅺ린 踰꾪듉', tabKey);
        await this.interactiveClick('button:has-text("?덈줈 ???)', '?덈줈 ???踰꾪듉', tabKey);
    }

    async runTest() {
        try {
            console.log('?렞 ?ㅻ뱶??紐⑤뱶 ?꾩껜 ?뱀뀡 ?뚯뒪???쒖옉');
            console.log('?? 釉뚮씪?곗? 李쎌뿉???ㅼ떆媛꾩쑝濡??뚯뒪?몃? ?뺤씤?????덉뒿?덈떎');
            
            await this.init();
            await this.takeScreenshot('initial_page', '珥덇린 ?섏씠吏 濡쒕뱶');

            // 媛???쓣 ?쒗쉶?섎ŉ ?명꽣?숉떚釉??뚯뒪??
            for (let i = 0; i < ALL_TABS.length; i++) {
                const tab = ALL_TABS[i];
                console.log(`\n?뱫 [${i+1}/${ALL_TABS.length}] ${tab.icon} ${tab.label} ?뚯뒪??);
                
                await this.testTabInteractively(tab);
                this.results.totalInteractions++;
                
                // 媛????ъ씠???ъ슜???뺤씤 ?쒓컙 ?쒓났
                console.log('???ㅼ쓬 ??쑝濡??대룞?섍린 ??3珥??湲?..');
                await this.page.waitForTimeout(3000);
            }

            await this.takeScreenshot('test_completed', '紐⑤뱺 ?뚯뒪???꾨즺');
            
        } catch (error) {
            console.error('???ㅻ뱶???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
        } finally {
            await this.generateReport();
            console.log('\n??寃곌낵 ?뺤씤???꾪빐 30珥???釉뚮씪?곗?媛 ?ロ옓?덈떎...');
            await this.page.waitForTimeout(30000);
            await this.cleanup();
        }
    }

    async generateReport() {
        this.results.endTime = new Date().toISOString();
        this.results.duration = new Date() - new Date(this.results.timestamp);
        this.results.successRate = this.results.totalInteractions > 0 
            ? ((this.results.successfulInteractions / this.results.totalInteractions) * 100).toFixed(2) 
            : 0;

        fs.writeFileSync(TEST_CONFIG.resultFile, JSON.stringify(this.results, null, 2), 'utf8');

        console.log('\n' + '='.repeat(60));
        console.log('?럦 ?ㅻ뱶??紐⑤뱶 ?뚯뒪???꾨즺');
        console.log('='.repeat(60));
        console.log(`?뱤 ?뚯뒪???듦퀎:`);
        console.log(`   ???뚯뒪?명븳 ?? ${this.results.totalInteractions}/${this.results.totalTabs}`);
        console.log(`   ???깃났???명꽣?숈뀡: ${this.results.successfulInteractions}`);
        console.log(`   ???ㅽ뙣???명꽣?숈뀡: ${this.results.failedInteractions}`);
        console.log(`   ???깃났瑜? ${this.results.successRate}%`);
        console.log(`   ???ㅽ겕由곗꺑: ${this.results.screenshots.length}媛?);
        console.log(`   ???뚯슂?쒓컙: ${Math.round(this.results.duration / 1000)}珥?);
        console.log(`\n?뱞 ?곸꽭 寃곌낵: ${TEST_CONFIG.resultFile}`);
        console.log(`?벝 ?ㅽ겕由곗꺑: ${TEST_CONFIG.screenshotDir}/`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('?뵚 釉뚮씪?곗? 醫낅즺');
        }
    }
}

// ?ㅽ겕由쏀듃 ?ㅽ뻾
if (require.main === module) {
    const testRunner = new HeadOnTestRunner();
    
    testRunner.runTest().catch(error => {
        console.error('?뮙 ?ㅻ뱶???뚯뒪???ㅽ뻾 ?ㅽ뙣:', error);
        process.exit(1);
    });
}

module.exports = HeadOnTestRunner; 
