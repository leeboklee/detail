/**
 * 🔍 전체 섹션 종합 테스트 스크립트 (헤드온 모드)
 * 실제 브라우저 창을 열어서 시각적으로 확인하며 모든 버튼을 테스트
 * Created: 2025-07-03
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 테스트 설정
const TEST_CONFIG = {
    url: 'http://localhost: {process.env.PORT || 34343}',
    waitTime: 3000, // 헤드온 모드에서는 더 길게 대기
    screenshotDir: 'screenshots/headon-test',
    resultFile: 'headon-test-results.json',
    headless: false, // 헤드온 모드
    timeout: 60000,
    slowMo: 500 // 액션 간격을 느리게
};

// 모든 탭 정보
const ALL_TABS = [
    { key: 'hotel', label: '호텔 정보', icon: '🏠' },
    { key: 'rooms', label: '객실 정보', icon: '👥' },
    { key: 'facilities', label: '시설 정보', icon: '⚙️' },
    { key: 'packages', label: '패키지', icon: '📄' },
    { key: 'period', label: '📅 판매기간&투숙일', icon: '📅' },
    { key: 'pricing', label: '💰 추가요금', icon: '💰' },
    { key: 'charges', label: '🏷️ 요금 항목', icon: '🏷️' },
    { key: 'checkin', label: '체크인/아웃', icon: '📅' },
    { key: 'cancel', label: '취소규정', icon: '🛡️' },
    { key: 'booking', label: '예약안내', icon: '💾' },
    { key: 'notices', label: '공지사항', icon: '📄' },
    { key: 'database', label: '💾 템플릿 목록', icon: '💾' }
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

        // 스크린샷 디렉토리 생성
        if (!fs.existsSync(TEST_CONFIG.screenshotDir)) {
            fs.mkdirSync(TEST_CONFIG.screenshotDir, { recursive: true });
        }
    }

    async init() {
        console.log('🚀 헤드온 브라우저 초기화 중...');
        
        this.browser = await puppeteer.launch({
            headless: false,
            slowMo: TEST_CONFIG.slowMo,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--start-maximized'
            ],
            defaultViewport: null, // 전체 화면 사용
            devtools: true // 개발자 도구 자동 열기
        });

        const pages = await this.browser.pages();
        this.page = pages[0] || await this.browser.newPage();
        
        // 개발자 도구에서 콘솔 탭을 활성화
        await this.page.bringToFront();
        
        // 콘솔 로그 캡처 및 출력
        this.page.on('console', msg => {
            const logMessage = `[${msg.type().toUpperCase()}] ${msg.text()}`;
            console.log('🖥️  브라우저:', logMessage);
            this.results.detailedLogs.push({
                type: msg.type(),
                message: msg.text(),
                timestamp: new Date().toISOString()
            });
        });

        await this.page.goto(TEST_CONFIG.url, { waitUntil: 'networkidle2' });
        console.log('✅ 페이지 로드 완료 - 개발자 도구에서 콘솔을 확인하세요');
        
        // 사용자에게 준비 시간 제공
        console.log('⏳ 5초 후 테스트를 시작합니다. 브라우저 창을 확인하세요...');
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
            console.log(`📸 스크린샷 저장: ${filename} ${description ? `(${description})` : ''}`);
        } catch (error) {
            console.error('스크린샷 저장 실패:', error.message);
        }
    }

    async interactiveClick(selector, description, tabKey) {
        console.log(`\n🖱️  클릭 시도: ${description}`);
        console.log(`   선택자: ${selector}`);
        
        try {
            // 요소 존재 확인
            await this.page.waitForSelector(selector, { timeout: 5000 });
            
            // 요소 하이라이트 (시각적 확인용)
            await this.page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    element.style.border = '3px solid red';
                    element.style.backgroundColor = 'yellow';
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, selector);
            
            await this.page.waitForTimeout(1000);
            
            // 클릭 실행
            await this.page.click(selector);
            console.log(`   ✅ 클릭 성공: ${description}`);
            
            // 하이라이트 제거
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
            console.error(`   ❌ 클릭 실패: ${description}`, error.message);
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
        console.log(`\n⌨️  입력 시도: ${description}`);
        console.log(`   선택자: ${selector}`);
        console.log(`   값: ${value}`);
        
        try {
            await this.page.waitForSelector(selector, { timeout: 5000 });
            
            // 요소 하이라이트
            await this.page.evaluate((sel) => {
                const element = document.querySelector(sel);
                if (element) {
                    element.style.border = '3px solid blue';
                    element.style.backgroundColor = 'lightblue';
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, selector);
            
            await this.page.waitForTimeout(1000);
            
            // 기존 값 삭제 후 새 값 입력
            await this.page.click(selector);
            await this.page.keyboard.down('Control');
            await this.page.keyboard.press('KeyA');
            await this.page.keyboard.up('Control');
            await this.page.keyboard.press('Delete');
            await this.page.type(selector, value);
            
            console.log(`   ✅ 입력 성공: ${description}`);
            
            // 하이라이트 제거
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
            console.error(`   ❌ 입력 실패: ${description}`, error.message);
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
        console.log(`\n🎯 ${tab.icon} ${tab.label} 섹션 테스트 시작`);
        
        // 탭 클릭
        const tabClickSuccess = await this.interactiveClick(
            `[data-key="${tab.key}"]`,
            `${tab.label} 탭 클릭`,
            tab.key
        );
        
        if (!tabClickSuccess) {
            console.log(`⏭️ 탭 ${tab.key} 건너뜀`);
            return;
        }
        
        await this.takeScreenshot(`tab_${tab.key}_opened`, `${tab.label} 탭 열림`);
        
        // 각 섹션별로 주요 인터랙션 수행
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
        
        await this.takeScreenshot(`tab_${tab.key}_completed`, `${tab.label} 섹션 테스트 완료`);
        console.log(`✅ ${tab.icon} ${tab.label} 섹션 테스트 완료\n`);
    }

    async testHotelSection(tabKey) {
        console.log('🏨 호텔 정보 섹션 테스트');
        await this.interactiveInput('input[placeholder*="호텔"], input[name*="name"]', '테스트 호텔', '호텔명 입력', tabKey);
        await this.interactiveInput('textarea', '테스트 호텔 설명입니다.', '호텔 설명 입력', tabKey);
    }

    async testRoomsSection(tabKey) {
        console.log('🏠 객실 정보 섹션 테스트');
        // 객실 추가 버튼은 일반적으로 찾기 어려우므로 여러 선택자 시도
        const addRoomSelectors = [
            'button:has-text("객실 추가")',
            'button:has-text("추가")',
            '[data-testid*="add"]',
            '.add-room'
        ];
        
        for (const selector of addRoomSelectors) {
            const success = await this.interactiveClick(selector, '객실 추가 버튼', tabKey);
            if (success) break;
        }
    }

    async testFacilitiesSection(tabKey) {
        console.log('🏢 시설 정보 섹션 테스트');
        await this.interactiveClick('[data-testid="add-facility-button"]', '시설 추가 버튼', tabKey);
        await this.interactiveInput('input[type="text"]', '테스트 시설', '시설명 입력', tabKey);
    }

    async testPackagesSection(tabKey) {
        console.log('📦 패키지 섹션 테스트');
        await this.interactiveClick('[data-testid="add-package-button"]', '패키지 추가 버튼', tabKey);
        await this.interactiveInput('input[type="text"]', '테스트 패키지', '패키지명 입력', tabKey);
        await this.interactiveInput('input[type="number"]', '150000', '패키지 가격 입력', tabKey);
    }

    async testPeriodSection(tabKey) {
        console.log('📅 판매기간&투숙일 섹션 테스트');
        await this.interactiveInput('input[type="date"]', '2025-12-31', '날짜 입력', tabKey);
        await this.interactiveClick('button:has-text("저장")', '저장 버튼', tabKey);
    }

    async testPricingSection(tabKey) {
        console.log('💰 추가요금 섹션 테스트');
        await this.interactiveClick('button:has-text("🔍 테스트")', '테스트 버튼', tabKey);
        await this.interactiveClick('button:has-text("숙박시설 추가")', '숙박시설 추가 버튼', tabKey);
        await this.interactiveClick('button:has-text("요금 계산기")', '요금 계산기 버튼', tabKey);
        await this.interactiveInput('input[type="number"]', '50000', '추가요금 입력', tabKey);
    }

    async testChargesSection(tabKey) {
        console.log('🏷️ 요금 항목 섹션 테스트');
        await this.interactiveClick('button:has-text("항목 추가")', '항목 추가 버튼', tabKey);
        await this.interactiveInput('input[type="text"]', '테스트 요금 항목', '요금 항목명 입력', tabKey);
    }

    async testCheckinSection(tabKey) {
        console.log('🕐 체크인/아웃 섹션 테스트');
        await this.interactiveInput('input[type="time"]', '15:00', '체크인 시간 입력', tabKey);
    }

    async testCancelSection(tabKey) {
        console.log('🛡️ 취소규정 섹션 테스트');
        await this.interactiveClick('button:has-text("규칙 추가")', '규칙 추가 버튼', tabKey);
        await this.interactiveClick('button:has-text("샘플 적용")', '샘플 적용 버튼', tabKey);
    }

    async testBookingSection(tabKey) {
        console.log('📋 예약안내 섹션 테스트');
        await this.interactiveClick('button:has-text("추가")', '항목 추가 버튼', tabKey);
        await this.interactiveInput('textarea', '테스트 예약 안내사항', '예약 안내 입력', tabKey);
    }

    async testNoticesSection(tabKey) {
        console.log('📢 공지사항 섹션 테스트');
        await this.interactiveClick('[data-testid="add-notice-button"]', '공지 추가 버튼', tabKey);
        await this.interactiveInput('input[type="text"]', '테스트 공지사항', '공지 제목 입력', tabKey);
    }

    async testDatabaseSection(tabKey) {
        console.log('💾 템플릿 목록 섹션 테스트');
        await this.interactiveClick('button:has-text("불러오기")', '템플릿 불러오기 버튼', tabKey);
        await this.interactiveClick('button:has-text("새로 저장")', '새로 저장 버튼', tabKey);
    }

    async runTest() {
        try {
            console.log('🎯 헤드온 모드 전체 섹션 테스트 시작');
            console.log('👀 브라우저 창에서 실시간으로 테스트를 확인할 수 있습니다');
            
            await this.init();
            await this.takeScreenshot('initial_page', '초기 페이지 로드');

            // 각 탭을 순회하며 인터랙티브 테스트
            for (let i = 0; i < ALL_TABS.length; i++) {
                const tab = ALL_TABS[i];
                console.log(`\n📑 [${i+1}/${ALL_TABS.length}] ${tab.icon} ${tab.label} 테스트`);
                
                await this.testTabInteractively(tab);
                this.results.totalInteractions++;
                
                // 각 탭 사이에 사용자 확인 시간 제공
                console.log('⏳ 다음 탭으로 이동하기 전 3초 대기...');
                await this.page.waitForTimeout(3000);
            }

            await this.takeScreenshot('test_completed', '모든 테스트 완료');
            
        } catch (error) {
            console.error('❌ 헤드온 테스트 실행 중 오류:', error);
        } finally {
            await this.generateReport();
            console.log('\n⏳ 결과 확인을 위해 30초 후 브라우저가 닫힙니다...');
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
        console.log('🎉 헤드온 모드 테스트 완료');
        console.log('='.repeat(60));
        console.log(`📊 테스트 통계:`);
        console.log(`   • 테스트한 탭: ${this.results.totalInteractions}/${this.results.totalTabs}`);
        console.log(`   • 성공한 인터랙션: ${this.results.successfulInteractions}`);
        console.log(`   • 실패한 인터랙션: ${this.results.failedInteractions}`);
        console.log(`   • 성공률: ${this.results.successRate}%`);
        console.log(`   • 스크린샷: ${this.results.screenshots.length}개`);
        console.log(`   • 소요시간: ${Math.round(this.results.duration / 1000)}초`);
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
    const testRunner = new HeadOnTestRunner();
    
    testRunner.runTest().catch(error => {
        console.error('💥 헤드온 테스트 실행 실패:', error);
        process.exit(1);
    });
}

module.exports = HeadOnTestRunner; 