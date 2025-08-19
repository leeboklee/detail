/**
 * ?뵇 ?꾩껜 ?뱀뀡 ?섏씠釉뚮━???뚯뒪???ㅽ겕由쏀듃
 * ?ㅻ뱶由ъ뒪濡??쒖옉 ??臾몄젣 諛쒓껄???ㅻ뱶?⑥쑝濡??먮룞 ?꾪솚
 * Created: 2025-07-03
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// ?뚯뒪???ㅼ젙
const TEST_CONFIG = {
    url: 'http://localhost: {process.env.PORT || 3900}',
    waitTime: 2000,
    screenshotDir: 'screenshots/hybrid-test',
    resultFile: 'hybrid-test-results.json',
    initialMode: 'headless', // ?쒖옉? ?ㅻ뱶由ъ뒪
    errorThreshold: 3, // ?먮윭 3媛??댁긽???ㅻ뱶?⑥쑝濡??꾪솚
    timeout: 30000
};

// 紐⑤뱺 ???뺣낫
const ALL_TABS = [
    { key: 'hotel', label: '?명뀛 ?뺣낫', icon: '?룧', priority: 1 },
    { key: 'rooms', label: '媛앹떎 ?뺣낫', icon: '?뫁', priority: 2 },
    { key: 'facilities', label: '?쒖꽕 ?뺣낫', icon: '?숋툘', priority: 3 },
    { key: 'packages', label: '?⑦궎吏', icon: '?뱞', priority: 4 },
    { key: 'period', label: '?뱟 ?먮ℓ湲곌컙&?ъ닕??, icon: '?뱟', priority: 5 },
    { key: 'pricing', label: '?뮥 異붽??붽툑', icon: '?뮥', priority: 1 }, // ?곗꽑?쒖쐞 ?믪쓬
    { key: 'charges', label: '?뤇截??붽툑 ??ぉ', icon: '?뤇截?, priority: 3 },
    { key: 'checkin', label: '泥댄겕???꾩썐', icon: '?뱟', priority: 4 },
    { key: 'cancel', label: '痍⑥냼洹쒖젙', icon: '?썳截?, priority: 3 },
    { key: 'booking', label: '?덉빟?덈궡', icon: '?뮶', priority: 2 },
    { key: 'notices', label: '怨듭??ы빆', icon: '?뱞', priority: 4 },
    { key: 'database', label: '?뮶 ?쒗뵆由?紐⑸줉', icon: '?뮶', priority: 2 }
];

// ?곗꽑?쒖쐞蹂꾨줈 ?뺣젹 (?곗꽑?쒖쐞 ?믪? 寃껊???
const SORTED_TABS = ALL_TABS.sort((a, b) => a.priority - b.priority);

class HybridTestRunner {
    constructor() {
        this.browser = null;
        this.page = null;
        this.currentMode = TEST_CONFIG.initialMode;
        this.errorCount = 0;
        this.modeChanged = false;
        this.results = {
            timestamp: new Date().toISOString(),
            initialMode: TEST_CONFIG.initialMode,
            currentMode: this.currentMode,
            modeChanges: [],
            totalTabs: SORTED_TABS.length,
            totalErrors: 0,
            criticalErrors: [],
            testResults: {},
            screenshots: []
        };

        // ?ㅽ겕由곗꺑 ?붾젆?좊━ ?앹꽦
        if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }
    }

    async init(headless = true) {
        console.log(`?? 釉뚮씪?곗? 珥덇린??以?.. (${headless ? 'Headless' : 'Head-on'} 紐⑤뱶)`);
        
        if (this.browser) {
            await this.browser.close();
        }

        this.browser = await puppeteer.launch({
            headless: headless,
            slowMo: headless ? 0 : 300,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                headless ? '' : '--start-maximized'
            ].filter(Boolean),
            defaultViewport: headless ? { width: 1920, height: 1080 } : null,
            devtools: !headless
        });

        this.page = await this.browser.newPage();
        
        // ?먮윭 紐⑤땲?곕쭅
        this.page.on('console', msg => {
            if (msg.type() === 'error') {
                this.handleError('console_error', msg.text());
            }
        });

        this.page.on('pageerror', error => {
            this.handleError('page_error', error.message);
        });

        this.page.on('requestfailed', request => {
            this.handleError('request_failed', `${request.url()} - ${request.failure().errorText}`);
        });

        await this.page.goto(TEST_CONFIG.url, { waitUntil: 'networkidle2' });
        console.log('???섏씠吏 濡쒕뱶 ?꾨즺');
    }

    handleError(type, message) {
        this.errorCount++;
        this.results.totalErrors++;
        
        const errorInfo = {
            type,
            message,
            timestamp: new Date().toISOString(),
            mode: this.currentMode,
            errorCount: this.errorCount
        };

        this.results.criticalErrors.push(errorInfo);
        console.error(`??[${type}] ${message}`);

        // ?먮윭 ?꾧퀎媛?珥덇낵???ㅻ뱶??紐⑤뱶濡??꾪솚
        if (this.currentMode === 'headless' && this.errorCount >= TEST_CONFIG.errorThreshold) {
            this.scheduleHeadOnMode();
        }
    }

    async scheduleHeadOnMode() {
        if (this.modeChanged) return; // ?대? ?꾪솚??寃쎌슦 以묐났 諛⑹?
        
        console.log('\n?슚 ?먮윭 ?꾧퀎媛?珥덇낵! ?ㅻ뱶??紐⑤뱶濡??꾪솚?⑸땲??..');
        this.modeChanged = true;
        
        const modeChange = {
            from: 'headless',
            to: 'headon',
            reason: `?먮윭 ${this.errorCount}媛?諛쒖깮`,
            timestamp: new Date().toISOString()
        };
        
        this.results.modeChanges.push(modeChange);
        await this.switchToHeadOnMode();
    }

    async switchToHeadOnMode() {
        console.log('?봽 ?ㅻ뱶??紐⑤뱶濡??꾪솚 以?..');
        
        this.currentMode = 'headon';
        this.results.currentMode = 'headon';
        
        // ?꾩옱 ?섏씠吏 URL ???
        const currentUrl = await this.page.url();
        
        // ?덈줈???ㅻ뱶??釉뚮씪?곗?濡??ъ큹湲고솕
        await this.init(false);
        
        // ?댁쟾 ?꾩튂濡??대룞
        if (currentUrl !== TEST_CONFIG.url) {
            await this.page.goto(currentUrl, { waitUntil: 'networkidle2' });
        }
        
        console.log('???ㅻ뱶??紐⑤뱶 ?꾪솚 ?꾨즺 - 釉뚮씪?곗? 李쎌뿉???뺤씤 媛??);
        
        // ?ъ슜?먯뿉寃??곹솴 ?뚮┝
        await this.takeScreenshot('mode_switched', '?ㅻ뱶??紐⑤뱶濡??꾪솚??);
        await this.page.waitForTimeout(3000);
    }

    async takeScreenshot(name, description = '') {
        try {
            const filename = `${this.currentMode}_${name}_${Date.now()}.png`;
            const filepath = path.join(TEST_CONFIG.screenshotDir, filename);
            await this.page.screenshot({ path: filepath, fullPage: false });
            this.results.screenshots.push({
                name,
                description,
                filename,
                mode: this.currentMode,
                timestamp: new Date().toISOString()
            });
            console.log(`?벝 ?ㅽ겕由곗꺑: ${filename} ${description ? `(${description})` : ''}`);
        } catch (error) {
            console.error('?ㅽ겕由곗꺑 ????ㅽ뙣:', error.message);
        }
    }

    async smartClick(selector, description, tabKey, options = {}) {
        const isHeadOn = this.currentMode === 'headon';
        
        try {
            // ?ㅻ뱶??紐⑤뱶?먯꽌???쒓컖???쇰뱶諛??쒓났
            if (isHeadOn) {
                await this.page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) {
                        element.style.border = '3px solid red';
                        element.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, selector);
                await this.page.waitForTimeout(1000);
            }
            
            await this.page.waitForSelector(selector, { timeout: 5000 });
            await this.page.click(selector);
            
            // ?ㅻ뱶??紐⑤뱶?먯꽌 ?섏씠?쇱씠???쒓굅
            if (isHeadOn) {
                await this.page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) {
                        element.style.border = '';
                        element.style.backgroundColor = '';
                    }
                }, selector);
            }
            
            console.log(`   ???대┃ ?깃났: ${description}`);
            await this.page.waitForTimeout(isHeadOn ? 2000 : 1000);
            return true;
            
        } catch (error) {
            this.handleError('click_error', `${description}: ${error.message}`);
            return false;
        }
    }

    async smartInput(selector, value, description, tabKey) {
        const isHeadOn = this.currentMode === 'headon';
        
        try {
            if (isHeadOn) {
                await this.page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) {
                        element.style.border = '3px solid blue';
                        element.style.backgroundColor = 'rgba(173, 216, 230, 0.3)';
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, selector);
                await this.page.waitForTimeout(800);
            }
            
            await this.page.waitForSelector(selector, { timeout: 5000 });
            await this.page.click(selector);
            await this.page.keyboard.down('Control');
            await this.page.keyboard.press('KeyA');
            await this.page.keyboard.up('Control');
            await this.page.type(selector, value);
            
            if (isHeadOn) {
                await this.page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) {
                        element.style.border = '';
                        element.style.backgroundColor = '';
                    }
                }, selector);
            }
            
            console.log(`   ???낅젰 ?깃났: ${description} = "${value}"`);
            await this.page.waitForTimeout(isHeadOn ? 1500 : 800);
            return true;
            
        } catch (error) {
            this.handleError('input_error', `${description}: ${error.message}`);
            return false;
        }
    }

    async testTabComprehensively(tab) {
        console.log(`\n${tab.icon} ${tab.label} ?뱀뀡 ?뚯뒪??[?곗꽑?쒖쐞: ${tab.priority}]`);
        
        const tabResult = {
            tabKey: tab.key,
            label: tab.label,
            priority: tab.priority,
            mode: this.currentMode,
            interactions: [],
            screenshots: [],
            errors: [],
            success: false
        };

        try {
            // ???대┃
            const tabClicked = await this.smartClick(
                `[data-key="${tab.key}"]`,
                `${tab.label} ???대┃`,
                tab.key
            );
            
            if (!tabClicked) {
                tabResult.errors.push('???대┃ ?ㅽ뙣');
                this.results.testResults[tab.key] = tabResult;
                return;
            }
            
            await this.takeScreenshot(`tab_${tab.key}`, `${tab.label} ???대┝`);
            tabResult.screenshots.push(`tab_${tab.key}`);

            // ??퀎 ?뱁솕 ?뚯뒪???섑뻾
            await this.performTabSpecificTests(tab, tabResult);
            
            tabResult.success = tabResult.errors.length === 0;
            
        } catch (error) {
            this.handleError('tab_test_error', `${tab.label}: ${error.message}`);
            tabResult.errors.push(error.message);
        } finally {
            this.results.testResults[tab.key] = tabResult;
        }
    }

    async performTabSpecificTests(tab, tabResult) {
        switch (tab.key) {
            case 'pricing':
                // 異붽??붽툑 ?뱀뀡 - 理쒖슦???뚯뒪??
                await this.smartClick('button:has-text("?뵇 ?뚯뒪??)', '?뚯뒪??踰꾪듉 ?대┃', tab.key);
                await this.smartInput('input[type="number"]', '50000', '異붽??붽툑 ?낅젰', tab.key);
                await this.smartClick('button:has-text("?붽툑 怨꾩궛湲?)', '?붽툑 怨꾩궛湲??닿린', tab.key);
                break;
                
            case 'hotel':
                await this.smartInput('input[placeholder*="?명뀛"], input[name*="name"]', '?섏씠釉뚮━???뚯뒪???명뀛', '?명뀛紐?, tab.key);
                await this.smartInput('textarea', '?섏씠釉뚮━??紐⑤뱶?먯꽌 ?뚯뒪?몃맂 ?명뀛?낅땲??', '?명뀛 ?ㅻ챸', tab.key);
                break;
                
            case 'rooms':
                await this.smartClick('button:has-text("媛앹떎 異붽?")', '媛앹떎 異붽?', tab.key);
                await this.smartInput('input[type="text"]', '?섏씠釉뚮━???뚯뒪??猷?, '媛앹떎紐?, tab.key);
                break;
                
            case 'facilities':
                await this.smartClick('[data-testid="add-facility-button"]', '?쒖꽕 異붽?', tab.key);
                await this.smartInput('input[type="text"]', '?섏씠釉뚮━???뚯뒪???쒖꽕', '?쒖꽕紐?, tab.key);
                break;
                
            case 'packages':
                await this.smartClick('[data-testid="add-package-button"]', '?⑦궎吏 異붽?', tab.key);
                await this.smartInput('input[type="text"]', '?섏씠釉뚮━???⑦궎吏', '?⑦궎吏紐?, tab.key);
                break;
                
            case 'notices':
                await this.smartClick('[data-testid="add-notice-button"]', '怨듭? 異붽?', tab.key);
                await this.smartInput('input[type="text"]', '?섏씠釉뚮━???뚯뒪??怨듭?', '怨듭? ?쒕ぉ', tab.key);
                break;
                
            case 'database':
                await this.smartClick('button:has-text("遺덈윭?ㅺ린")', '?쒗뵆由?遺덈윭?ㅺ린', tab.key);
                break;
                
            default:
                // 湲곕낯 ?뚯뒪??- ?낅젰 ?꾨뱶? 踰꾪듉 李얠븘???뚯뒪??
                const inputs = await this.page.$$('input[type="text"], textarea');
                if (inputs.length > 0) {
                    await this.smartInput('input[type="text"], textarea', '?섏씠釉뚮━???뚯뒪??, '?쇰컲 ?낅젰', tab.key);
                }
                
                const buttons = await this.page.$$('button:not([disabled])');
                if (buttons.length > 0) {
                    await this.smartClick('button:not([disabled])', '?쇰컲 踰꾪듉', tab.key);
                }
        }
    }

    async runTest() {
        try {
            console.log('?렞 ?섏씠釉뚮━??紐⑤뱶 ?꾩껜 ?뱀뀡 ?뚯뒪???쒖옉');
            console.log(`?뱥 ?뚯뒪???? ${SORTED_TABS.length}媛?(?곗꽑?쒖쐞蹂??뺣젹)`);
            console.log(`?봽 ?쒖옉 紐⑤뱶: ${this.currentMode}`);
            console.log(`?좑툘 ?먮윭 ${TEST_CONFIG.errorThreshold}媛??댁긽???ㅻ뱶?⑥쑝濡??먮룞 ?꾪솚`);
            
            await this.init(this.currentMode === 'headless');
            await this.takeScreenshot('initial', '珥덇린 ?섏씠吏');

            // ?곗꽑?쒖쐞蹂꾨줈 ???뚯뒪??
            for (let i = 0; i < SORTED_TABS.length; i++) {
                const tab = SORTED_TABS[i];
                console.log(`\n?뱫 [${i+1}/${SORTED_TABS.length}] ${tab.icon} ${tab.label} (?곗꽑?쒖쐞: ${tab.priority}) [${this.currentMode}]`);
                
                await this.testTabComprehensively(tab);
                
                // ?ㅻ뱶??紐⑤뱶?먯꽌??媛????꾨즺 ???뺤씤 ?쒓컙 ?쒓났
                if (this.currentMode === 'headon') {
                    console.log('???ㅼ쓬 ??쑝濡??대룞 ??2珥??湲?..');
                    await this.page.waitForTimeout(2000);
                }
            }

            await this.takeScreenshot('completed', '?꾩껜 ?뚯뒪???꾨즺');
            
        } catch (error) {
            console.error('???섏씠釉뚮━???뚯뒪???ㅽ뻾 以??ㅻ쪟:', error);
            this.handleError('test_execution_error', error.message);
        } finally {
            await this.generateReport();
            
            // ?ㅻ뱶??紐⑤뱶??寃쎌슦 寃곌낵 ?뺤씤 ?쒓컙 ?쒓났
            if (this.currentMode === 'headon') {
                console.log('\n??寃곌낵 ?뺤씤???꾪빐 15珥???釉뚮씪?곗?媛 ?ロ옓?덈떎...');
                await this.page.waitForTimeout(15000);
            }
            
            await this.cleanup();
        }
    }

    async generateReport() {
        this.results.endTime = new Date().toISOString();
        this.results.duration = new Date() - new Date(this.results.timestamp);
        
        const testResults = Object.values(this.results.testResults);
        this.results.successfulTabs = testResults.filter(r => r.success).length;
        this.results.failedTabs = testResults.filter(r => !r.success).length;
        this.results.successRate = this.results.totalTabs > 0 
            ? ((this.results.successfulTabs / this.results.totalTabs) * 100).toFixed(2) 
            : 0;

        fs.writeFileSync(TEST_CONFIG.resultFile, JSON.stringify(this.results, null, 2), 'utf8');

        console.log('\n' + '='.repeat(60));
        console.log('?럦 ?섏씠釉뚮━??紐⑤뱶 ?뚯뒪???꾨즺');
        console.log('='.repeat(60));
        console.log(`?봽 紐⑤뱶 ?뺣낫:`);
        console.log(`   ???쒖옉 紐⑤뱶: ${this.results.initialMode}`);
        console.log(`   ??理쒖쥌 紐⑤뱶: ${this.results.currentMode}`);
        console.log(`   ??紐⑤뱶 蹂寃? ${this.results.modeChanges.length}??);
        
        if (this.results.modeChanges.length > 0) {
            this.results.modeChanges.forEach((change, i) => {
                console.log(`     ${i+1}. ${change.from} ??${change.to} (${change.reason})`);
            });
        }
        
        console.log(`\n?뱤 ?뚯뒪???듦퀎:`);
        console.log(`   ??珥??? ${this.results.totalTabs}`);
        console.log(`   ???깃났: ${this.results.successfulTabs}`);
        console.log(`   ???ㅽ뙣: ${this.results.failedTabs}`);
        console.log(`   ???깃났瑜? ${this.results.successRate}%`);
        console.log(`   ??珥??먮윭: ${this.results.totalErrors}`);
        console.log(`   ???ㅽ겕由곗꺑: ${this.results.screenshots.length}媛?);
        console.log(`   ???뚯슂?쒓컙: ${Math.round(this.results.duration / 1000)}珥?);

        console.log(`\n?뱥 ??퀎 寃곌낵 (?곗꽑?쒖쐞??:`);
        SORTED_TABS.forEach(tab => {
            const result = this.results.testResults[tab.key];
            if (result) {
                const status = result.success ? '?? : '??;
                const mode = result.mode === 'headon' ? '?몓截? : '?쨼';
                console.log(`   ${status} ${mode} ${tab.icon} ${tab.label} (?곗꽑?쒖쐞: ${tab.priority})`);
            }
        });

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
    const testRunner = new HybridTestRunner();
    
    testRunner.runTest().catch(error => {
        console.error('?뮙 ?섏씠釉뚮━???뚯뒪???ㅽ뻾 ?ㅽ뙣:', error);
        process.exit(1);
    });
}

module.exports = HybridTestRunner; 
