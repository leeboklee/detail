import { test, expect } from '@playwright/test';

// ?뚯뒪?몄뿉 ?ъ슜??湲곕낯 ?곗씠??援ъ“
const createInitialData = () => ({
  hotel: {
    id: null, name: '', address: '', description: '', phone: '',
    checkin_time: '15:00', checkout_time: '11:00', imageUrl: ''
  },
  rooms: [{
    name: '?ㅽ깲?ㅻ뱶', type: '?붾툝', structure: '?먮８', bedType: '??, view: '?쒗떚',
    standardCapacity: 2, maxCapacity: 2, description: '湲곕낯 媛앹떎', image: '', amenities: [], price: '0'
  }],
  facilities: { general: [], business: [], leisure: [], dining: [] },
  packages: [],
  period: {}, cancel: {}, pricing: {}, booking: {}, notices: [], charges: {}, checkin: {}
});

test.describe('醫낇빀 ?쒗뵆由?愿由?DB ?곕룞 ?뚯뒪??(API 理쒖쟻??', () => {

  // 媛??뚯뒪???ㅽ뻾 ???곗씠?곕쿋?댁뒪 珥덇린??  test.beforeEach(async ({ page }) => {
    console.log('Initializing database...');
    const response = await page.request.post('/api/init-db');
    await expect(response.ok()).toBeTruthy();
    console.log('Database initialized.');

    console.log('Warming up database connection...');
    const warmupResponse = await page.request.get('/api/init-db');
    await expect(warmupResponse.ok()).toBeTruthy();
    console.log('Database connection is warm.');
  });

  test('?쒗뵆由??앹꽦, ??? 濡쒕뱶, ?섏젙 諛?寃利?, async ({ page }) => {
    
    // --- API瑜??듯븳 ?뚯뒪???곗씠???ъ쟾 ?앹꽦 ---
    console.log('1. API瑜??듯빐 "猷몄삩由?? "議곗떇PKG" ?쒗뵆由우쓣 ?ъ쟾 ?앹꽦?⑸땲??');
    
    // "猷몄삩由? ?곗씠???앹꽦
    const roomOnlyData = createInitialData();
    roomOnlyData.hotel.name = '猷몄삩由?;
    roomOnlyData.rooms[0].price = '200000';
    roomOnlyData.rooms[0].standardCapacity = 2;

    await page.request.post('/api/hotels/save-all', { data: roomOnlyData });

    // "議곗떇PKG" ?곗씠???앹꽦
    const breakfastPkgData = createInitialData();
    breakfastPkgData.hotel.name = '議곗떇PKG';
    breakfastPkgData.rooms[0].price = '250000';
    breakfastPkgData.rooms[0].standardCapacity = 2;
    
    await page.request.post('/api/hotels/save-all', { data: breakfastPkgData });

    // 1. ?섏씠吏 ?묒냽 諛??덈줈怨좎묠?쇰줈 ?곗씠??濡쒕뱶 蹂댁옣
    await page.goto('/');
    await new Promise(resolve => setTimeout(resolve, 1000));
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible({ timeout: 60000 });

    // --- ?쒗뵆由?紐⑸줉 ?뺤씤 ---
    console.log('2. ?쒗뵆由?紐⑸줉?먯꽌 ?ъ쟾 ?앹꽦???쒗뵆由용뱾???뺤씤?⑸땲??');
    
    // 2. '?쒗뵆由?紐⑸줉' ??쑝濡??대룞
    await page.getByRole('tab', { name: '?쒗뵆由?紐⑸줉' }).click();
    
    // 3. "猷몄삩由?? "議곗떇PKG"媛 紐⑸줉???덈뒗吏 ?뺤씤
    await expect(page.locator('div:has-text("猷몄삩由?)').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('div:has-text("議곗떇PKG")').first()).toBeVisible({ timeout: 30000 });

    // --- "猷몄삩由? ?쒗뵆由?遺덈윭?ㅺ린 諛??섏젙 ---
    console.log('3. "猷몄삩由? ?쒗뵆由우쓣 遺덈윭? ?섏젙?섍퀬 ?덈줈 ??ν빀?덈떎.');
    
    await page.locator('div.flex:has-text("猷몄삩由?)').getByRole('button', { name: '遺덈윭?ㅺ린' }).click();
    await expect(page.locator('div[role="alert"]:has-text("濡쒕뱶 ?꾨즺")')).toBeVisible({ timeout: 10000 });

    await page.getByRole('tab', { name: '?명뀛 ?뺣낫' }).click();
    await expect(page.getByPlaceholder('?명뀛/?낆껜 ?대쫫???낅젰?섏꽭??)).toHaveValue('猷몄삩由?);
    await page.getByRole('tab', { name: '媛앹떎 ?뺣낫 (?듯빀)' }).click();
    await expect(page.locator('input[name="price"]').first()).toHaveValue('200000');

    await page.getByRole('tab', { name: '?명뀛 ?뺣낫' }).click();
    await page.getByPlaceholder('?명뀛/?낆껜 ?대쫫???낅젰?섏꽭??).fill('猷몄삩由?媛寃⑹닔??);
    await page.getByRole('tab', { name: '媛앹떎 ?뺣낫 (?듯빀)' }).click();
    await page.locator('input[name="price"]').first().fill('210000');
    await page.getByRole('button', { name: '?꾩껜 ??? }).click();
    await expect(page.locator('div[role="alert"]:has-text("?깃났?곸쑝濡???λ릺?덉뒿?덈떎")')).toBeVisible({ timeout: 10000 });

    // --- "議곗떇PKG" ?쒗뵆由?遺덈윭?ㅺ린 諛??섏젙 ---
    console.log('4. "議곗떇PKG" ?쒗뵆由우쓣 遺덈윭? ?섏젙?⑸땲??');
    
    await page.getByRole('tab', { name: '?쒗뵆由?紐⑸줉' }).click();
    await page.locator('div.flex:has-text("議곗떇PKG")').getByRole('button', { name: '遺덈윭?ㅺ린' }).click();
    await expect(page.locator('div[role="alert"]:has-text("濡쒕뱶 ?꾨즺")')).toBeVisible({ timeout: 10000 });

    await page.getByRole('tab', { name: '媛앹떎 ?뺣낫 (?듯빀)' }).click();
    await expect(page.locator('input[name="standardCapacity"]').first()).toHaveValue('2');
    
    console.log('湲곗? ?몄썝??2 -> 3?쇰줈 ?섏젙?⑸땲??');
    await page.locator('input[name="standardCapacity"]').first().fill('3');
    
    await page.getByRole('tab', { name: '?명뀛 ?뺣낫' }).click();
    await page.getByPlaceholder('?명뀛/?낆껜 ?대쫫???낅젰?섏꽭??).fill('議곗떇PKG_3??);
    await page.getByRole('button', { name: '?꾩껜 ??? }).click();
    await expect(page.locator('div[role="alert"]:has-text("?깃났?곸쑝濡???λ릺?덉뒿?덈떎")')).toBeVisible({ timeout: 10000 });

    // --- 理쒖쥌 ?뺤씤 ---
    console.log('5. 理쒖쥌?곸쑝濡?紐⑤뱺 ?쒗뵆由우씠 紐⑸줉???덈뒗吏 ?뺤씤?⑸땲??');
    await page.getByRole('tab', { name: '?쒗뵆由?紐⑸줉' }).click();
    await expect(page.locator('div:has-text("猷몄삩由?媛寃⑹닔??)').first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator('div:has-text("議곗떇PKG_3??)').first()).toBeVisible({ timeout: 30000 });

    console.log('??醫낇빀 ?쒗뵆由?愿由?DB ?곕룞 ?뚯뒪?멸? ?깃났?곸쑝濡??꾨즺?섏뿀?듬땲??');
  });
}); 

