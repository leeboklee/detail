import { test, expect } from '@playwright/test';

// 테스트에 사용될 기본 데이터 구조
const createInitialData = () => ({
  hotel: {
    id: null, name: '', address: '', description: '', phone: '',
    checkin_time: '15:00', checkout_time: '11:00', imageUrl: ''
  },
  rooms: [{
    name: '스탠다드', type: '더블', structure: '원룸', bedType: '킹', view: '시티',
    standardCapacity: 2, maxCapacity: 2, description: '기본 객실', image: '', amenities: [], price: '0'
  }],
  facilities: { general: [], business: [], leisure: [], dining: [] },
  packages: [],
  period: {}, cancel: {}, pricing: {}, booking: {}, notices: [], charges: {}, checkin: {}
});

test.describe('종합 템플릿 관리 DB 연동 테스트 (API 최적화)', () => {

  // 각 테스트 실행 전 데이터베이스 초기화
  test.beforeEach(async ({ page }) => {
    console.log('Initializing database...');
    const response = await page.request.post('/api/init-db');
    await expect(response.ok()).toBeTruthy();
    console.log('Database initialized.');

    console.log('Warming up database connection...');
    const warmupResponse = await page.request.get('/api/init-db');
    await expect(warmupResponse.ok()).toBeTruthy();
    console.log('Database connection is warm.');
  });

  test('템플릿 생성, 저장, 로드, 수정 및 검증', async ({ page }) => {
    
    // --- API를 통한 테스트 데이터 사전 생성 ---
    console.log('1. API를 통해 "룸온리"와 "조식PKG" 템플릿을 사전 생성합니다.');
    
    // "룸온리" 데이터 생성
    const roomOnlyData = createInitialData();
    roomOnlyData.hotel.name = '룸온리';
    roomOnlyData.rooms[0].price = '200000';
    roomOnlyData.rooms[0].standardCapacity = 2;

    await page.request.post('/api/hotels/save-all', { data: roomOnlyData });

    // "조식PKG" 데이터 생성
    const breakfastPkgData = createInitialData();
    breakfastPkgData.hotel.name = '조식PKG';
    breakfastPkgData.rooms[0].price = '250000';
    breakfastPkgData.rooms[0].standardCapacity = 2;
    
    await page.request.post('/api/hotels/save-all', { data: breakfastPkgData });

    // 1. 페이지 접속 및 새로고침으로 데이터 로드 보장
    await page.goto('/');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible({ timeout: 60000 });

    // --- 템플릿 목록 확인 ---
    console.log('2. 템플릿 목록에서 사전 생성된 템플릿들을 확인합니다.');
    
    // 2. '템플릿 목록' 탭으로 이동
    await page.getByRole('tab', { name: '템플릿 목록' }).click();
    
    // 3. "룸온리"와 "조식PKG"가 목록에 있는지 확인
    await expect(page.locator('div:has-text("룸온리")').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('div:has-text("조식PKG")').first()).toBeVisible({ timeout: 30000 });

    // --- "룸온리" 템플릿 불러오기 및 수정 ---
    console.log('3. "룸온리" 템플릿을 불러와 수정하고 새로 저장합니다.');
    
    await page.locator('div.flex:has-text("룸온리")').getByRole('button', { name: '불러오기' }).click();
    await expect(page.locator('div[role="alert"]:has-text("로드 완료")')).toBeVisible({ timeout: 10000 });

    await page.getByRole('tab', { name: '호텔 정보' }).click();
    await expect(page.getByPlaceholder('호텔/업체 이름을 입력하세요')).toHaveValue('룸온리');
    await page.getByRole('tab', { name: '객실 정보 (통합)' }).click();
    await expect(page.locator('input[name="price"]').first()).toHaveValue('200000');

    await page.getByRole('tab', { name: '호텔 정보' }).click();
    await page.getByPlaceholder('호텔/업체 이름을 입력하세요').fill('룸온리_가격수정');
    await page.getByRole('tab', { name: '객실 정보 (통합)' }).click();
    await page.locator('input[name="price"]').first().fill('210000');
    await page.getByRole('button', { name: '전체 저장' }).click();
    await expect(page.locator('div[role="alert"]:has-text("성공적으로 저장되었습니다")')).toBeVisible({ timeout: 10000 });

    // --- "조식PKG" 템플릿 불러오기 및 수정 ---
    console.log('4. "조식PKG" 템플릿을 불러와 수정합니다.');
    
    await page.getByRole('tab', { name: '템플릿 목록' }).click();
    await page.locator('div.flex:has-text("조식PKG")').getByRole('button', { name: '불러오기' }).click();
    await expect(page.locator('div[role="alert"]:has-text("로드 완료")')).toBeVisible({ timeout: 10000 });

    await page.getByRole('tab', { name: '객실 정보 (통합)' }).click();
    await expect(page.locator('input[name="standardCapacity"]').first()).toHaveValue('2');
    
    console.log('기준 인원을 2 -> 3으로 수정합니다.');
    await page.locator('input[name="standardCapacity"]').first().fill('3');
    
    await page.getByRole('tab', { name: '호텔 정보' }).click();
    await page.getByPlaceholder('호텔/업체 이름을 입력하세요').fill('조식PKG_3인');
    await page.getByRole('button', { name: '전체 저장' }).click();
    await expect(page.locator('div[role="alert"]:has-text("성공적으로 저장되었습니다")')).toBeVisible({ timeout: 10000 });

    // --- 최종 확인 ---
    console.log('5. 최종적으로 모든 템플릿이 목록에 있는지 확인합니다.');
    await page.getByRole('tab', { name: '템플릿 목록' }).click();
    await expect(page.locator('div:has-text("룸온리_가격수정")').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('div:has-text("조식PKG_3인")').first()).toBeVisible({ timeout: 30000 });

    console.log('✅ 종합 템플릿 관리 DB 연동 테스트가 성공적으로 완료되었습니다.');
  });
}); 

