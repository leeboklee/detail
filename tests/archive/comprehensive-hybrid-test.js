/**
 * 🔍 전체 섹션 하이브리드 테스트 스크립트
 * 헤드리스로 시작 → 문제 발견시 헤드온으로 자동 전환
 * Created: 2025-07-03
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 테스트 설정
const TEST_CONFIG = {
    url: 'http://localhost: {process.env.PORT || 34343}',
    waitTime: 2000,
    screenshotDir: 'screenshots/hybrid-test',
    resultFile: 'hybrid-test-results.json',
    initialMode: 'headless', // 시작은 헤드리스
    errorThreshold: 3, // 에러 3개 이상시 헤드온으로 전환
    timeout: 30000
};

// 모든 탭 정보
const ALL_TABS = [
    { key: 'hotel', label: '호텔 정보', icon: '🏠', priority: 1 },
    { key: 'rooms', label: '객실 정보', icon: '👥', priority: 2 },
    { key: 'facilities', label: '시설 정보', icon: '⚙️', priority: 3 },
    { key: 'packages', label: '패키지', icon: '📄', priority: 4 },
    { key: 'period', label: '📅 판매기간&투숙일', icon: '📅', priority: 5 },
    { key: 'pricing', label: '💰 추가요금', icon: '💰', priority: 1 }, // 우선순위 높음
    { key: 'charges', label: '🏷️ 요금 항목', icon: '🏷️', priority: 3 },
    { key: 'checkin', label: '체크인/아웃', icon: '📅', priority: 4 },
    { key: 'cancel', label: '취소규정', icon: '🛡️', priority: 3 },
    { key: 'booking', label: '예약안내', icon: '💾', priority: 2 },
    { key: 'notices', label: '공지사항', icon: '📄', priority: 4 },
    { key: 'database', label: '💾 템플릿 목록', icon: '💾', priority: 2 }
];

// 우선순위별로 정렬 (우선순위 높은 것부터)
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

        // 스크린샷 디렉토리 생성
        if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }
    }

    async init(headless = true) {
        console.log(`🚀 브라우저 초기화 중... (${headless ? 'Headless' : 'Head-on'} 모드)`);
        
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
        
        // 에러 모니터링
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
        console.log('✅ 페이지 로드 완료');
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
        console.error(`❌ [${type}] ${message}`);

        // 에러 임계값 초과시 헤드온 모드로 전환
        if (this.currentMode === 'headless' && this.errorCount >= TEST_CONFIG.errorThreshold) {
            this.scheduleHeadOnMode();
        }
    }

    async scheduleHeadOnMode() {
        if (this.modeChanged) return; // 이미 전환된 경우 중복 방지
        
        console.log('\n🚨 에러 임계값 초과! 헤드온 모드로 전환합니다...');
        this.modeChanged = true;
        
        const modeChange = {
            from: 'headless',
            to: 'headon',
            reason: `에러 ${this.errorCount}개 발생`,
            timestamp: new Date().toISOString()
        };
        
        this.results.modeChanges.push(modeChange);
        await this.switchToHeadOnMode();
    }

    async switchToHeadOnMode() {
        console.log('🔄 헤드온 모드로 전환 중...');
        
        this.currentMode = 'headon';
        this.results.currentMode = 'headon';
        
        // 현재 페이지 URL 저장
        const currentUrl = await this.page.url();
        
        // 새로운 헤드온 브라우저로 재초기화
        await this.init(false);
        
        // 이전 위치로 이동
        if (currentUrl !== TEST_CONFIG.url) {
            await this.page.goto(currentUrl, { waitUntil: 'networkidle2' });
        }
        
        console.log('✅ 헤드온 모드 전환 완료 - 브라우저 창에서 확인 가능');
        
        // 사용자에게 상황 알림
        await this.takeScreenshot('mode_switched', '헤드온 모드로 전환됨');
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
            console.log(`📸 스크린샷: ${filename} ${description ? `(${description})` : ''}`);
        } catch (error) {
            console.error('스크린샷 저장 실패:', error.message);
        }
    }

    async smartClick(selector, description, tabKey, options = {}) {
        const isHeadOn = this.currentMode === 'headon';
        
        try {
            // 헤드온 모드에서는 시각적 피드백 제공
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
            
            // 헤드온 모드에서 하이라이트 제거
            if (isHeadOn) {
                await this.page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    if (element) {
                        element.style.border = '';
                        element.style.backgroundColor = '';
                    }
                }, selector);
            }
            
            console.log(`   ✅ 클릭 성공: ${description}`);
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
            
            console.log(`   ✅ 입력 성공: ${description} = "${value}"`);
            await this.page.waitForTimeout(isHeadOn ? 1500 : 800);
            return true;
            
        } catch (error) {
            this.handleError('input_error', `${description}: ${error.message}`);
            return false;
        }
    }

    async testTabComprehensively(tab) {
        console.log(`\n${tab.icon} ${tab.label} 섹션 테스트 [우선순위: ${tab.priority}]`);
        
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
            // 탭 클릭
            const tabClicked = await this.smartClick(
                `[data-key="${tab.key}"]`,
                `${tab.label} 탭 클릭`,
                tab.key
            );
            
            if (!tabClicked) {
                tabResult.errors.push('탭 클릭 실패');
                this.results.testResults[tab.key] = tabResult;
                return;
            }
            
            await this.takeScreenshot(`tab_${tab.key}`, `${tab.label} 탭 열림`);
            tabResult.screenshots.push(`tab_${tab.key}`);

            // 탭별 특화 테스트 수행
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
                // 추가요금 섹션 - 최우선 테스트
                await this.smartClick('button:has-text("🔍 테스트")', '테스트 버튼 클릭', tab.key);
                await this.smartInput('input[type="number"]', '50000', '추가요금 입력', tab.key);
                await this.smartClick('button:has-text("요금 계산기")', '요금 계산기 열기', tab.key);
                break;
                
            case 'hotel':
                await this.smartInput('input[placeholder*="호텔"], input[name*="name"]', '하이브리드 테스트 호텔', '호텔명', tab.key);
                await this.smartInput('textarea', '하이브리드 모드에서 테스트된 호텔입니다.', '호텔 설명', tab.key);
                break;
                
            case 'rooms':
                await this.smartClick('button:has-text("객실 추가")', '객실 추가', tab.key);
                await this.smartInput('input[type="text"]', '하이브리드 테스트 룸', '객실명', tab.key);
                break;
                
            case 'facilities':
                await this.smartClick('[data-testid="add-facility-button"]', '시설 추가', tab.key);
                await this.smartInput('input[type="text"]', '하이브리드 테스트 시설', '시설명', tab.key);
                break;
                
            case 'packages':
                await this.smartClick('[data-testid="add-package-button"]', '패키지 추가', tab.key);
                await this.smartInput('input[type="text"]', '하이브리드 패키지', '패키지명', tab.key);
                break;
                
            case 'notices':
                await this.smartClick('[data-testid="add-notice-button"]', '공지 추가', tab.key);
                await this.smartInput('input[type="text"]', '하이브리드 테스트 공지', '공지 제목', tab.key);
                break;
                
            case 'database':
                await this.smartClick('button:has-text("불러오기")', '템플릿 불러오기', tab.key);
                break;
                
            default:
                // 기본 테스트 - 입력 필드와 버튼 찾아서 테스트
                const inputs = await this.page.$$('input[type="text"], textarea');
                if (inputs.length > 0) {
                    await this.smartInput('input[type="text"], textarea', '하이브리드 테스트', '일반 입력', tab.key);
                }
                
                const buttons = await this.page.$$('button:not([disabled])');
                if (buttons.length > 0) {
                    await this.smartClick('button:not([disabled])', '일반 버튼', tab.key);
                }
        }
    }

    async runTest() {
        try {
            console.log('🎯 하이브리드 모드 전체 섹션 테스트 시작');
            console.log(`📋 테스트 탭: ${SORTED_TABS.length}개 (우선순위별 정렬)`);
            console.log(`🔄 시작 모드: ${this.currentMode}`);
            console.log(`⚠️ 에러 ${TEST_CONFIG.errorThreshold}개 이상시 헤드온으로 자동 전환`);
            
            await this.init(this.currentMode === 'headless');
            await this.takeScreenshot('initial', '초기 페이지');

            // 우선순위별로 탭 테스트
            for (let i = 0; i < SORTED_TABS.length; i++) {
                const tab = SORTED_TABS[i];
                console.log(`\n📑 [${i+1}/${SORTED_TABS.length}] ${tab.icon} ${tab.label} (우선순위: ${tab.priority}) [${this.currentMode}]`);
                
                await this.testTabComprehensively(tab);
                
                // 헤드온 모드에서는 각 탭 완료 후 확인 시간 제공
                if (this.currentMode === 'headon') {
                    console.log('⏳ 다음 탭으로 이동 전 2초 대기...');
                    await this.page.waitForTimeout(2000);
                }
            }

            await this.takeScreenshot('completed', '전체 테스트 완료');
            
        } catch (error) {
            console.error('❌ 하이브리드 테스트 실행 중 오류:', error);
            this.handleError('test_execution_error', error.message);
        } finally {
            await this.generateReport();
            
            // 헤드온 모드인 경우 결과 확인 시간 제공
            if (this.currentMode === 'headon') {
                console.log('\n⏳ 결과 확인을 위해 15초 후 브라우저가 닫힙니다...');
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
        console.log('🎉 하이브리드 모드 테스트 완료');
        console.log('='.repeat(60));
        console.log(`🔄 모드 정보:`);
        console.log(`   • 시작 모드: ${this.results.initialMode}`);
        console.log(`   • 최종 모드: ${this.results.currentMode}`);
        console.log(`   • 모드 변경: ${this.results.modeChanges.length}회`);
        
        if (this.results.modeChanges.length > 0) {
            this.results.modeChanges.forEach((change, i) => {
                console.log(`     ${i+1}. ${change.from} → ${change.to} (${change.reason})`);
            });
        }
        
        console.log(`\n📊 테스트 통계:`);
        console.log(`   • 총 탭: ${this.results.totalTabs}`);
        console.log(`   • 성공: ${this.results.successfulTabs}`);
        console.log(`   • 실패: ${this.results.failedTabs}`);
        console.log(`   • 성공률: ${this.results.successRate}%`);
        console.log(`   • 총 에러: ${this.results.totalErrors}`);
        console.log(`   • 스크린샷: ${this.results.screenshots.length}개`);
        console.log(`   • 소요시간: ${Math.round(this.results.duration / 1000)}초`);

        console.log(`\n📋 탭별 결과 (우선순위순):`);
        SORTED_TABS.forEach(tab => {
            const result = this.results.testResults[tab.key];
            if (result) {
                const status = result.success ? '✅' : '❌';
                const mode = result.mode === 'headon' ? '👁️' : '🤖';
                console.log(`   ${status} ${mode} ${tab.icon} ${tab.label} (우선순위: ${tab.priority})`);
            }
        });

        console.log(`\n📄 상세 결과: ${TEST_CONFIG.resultFile}`);
        console.log(`📸 스크린샷: ${TEST_CONFIG.screenshotDir}/`);
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔚 브라우저 종료');
        }
    }
}

// 스크립트 실행
if (require.main === module) {
    const testRunner = new HybridTestRunner();
    
    testRunner.runTest().catch(error => {
        console.error('💥 하이브리드 테스트 실행 실패:', error);
        process.exit(1);
    });
}

module.exports = HybridTestRunner; 