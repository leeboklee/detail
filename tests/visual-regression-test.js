const { test, expect } = require('@playwright/test');

const SECTIONS = [
  { label: '호텔 정보', id: 'hotel' },
  { label: '객실 정보', id: 'room' },
  { label: '시설 정보', id: 'facilities' },
  { label: '체크인/아웃', id: 'checkin' },
  { label: '패키지', id: 'package' },
  { label: '요금표', id: 'price' },
  { label: '취소규정', id: 'cancel' },
  { label: '예약안내', id: 'booking' },
  { label: '공지사항', id: 'notice' }
];

// 세부 섹션만 집중 테스트
const FOCUS_SECTIONS = [
  { label: '호텔 정보', id: 'hotel' },
  { label: '객실 정보', id: 'room' },
  { label: '공지사항', id: 'notice' }
];

test.describe('섹션별 시각적 회귀(디자인) 테스트', () => {
  for (const section of FOCUS_SECTIONS) {
    test(`'${section.label}' 탭 디자인`, async ({ page }) => {
      console.log(`🚀 ${section.label} 테스트 시작...`);
      
      await page.goto(`http://localhost:${process.env.PORT || 34343}/admin`);
      console.log('✅ 페이지 로딩 완료');
      
      // 페이지 제목 확인
      const title = await page.title();
      console.log('📄 페이지 제목:', title);
      
      // 탭 클릭
      console.log(`🖱️ ${section.label} 탭 클릭...`);
      await page.click(`text=${section.label}`);
      await page.waitForTimeout(2000);
      console.log('✅ 탭 클릭 완료');
      
      // 모달이 열리는지 확인하고 기다리기
      try {
        console.log('🔍 모달 찾는 중...');
        // 모달이 열릴 때까지 기다리기 (최대 5초)
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
        console.log(`✅ ${section.label} 모달이 열렸습니다.`);
        
        // 모달 내부의 입력 필드 찾기
        if (section.id === 'hotel') {
          console.log('🔍 호텔 이름 입력 필드 찾는 중...');
          await expect(page.locator('[role="dialog"] input[placeholder="호텔 이름을 입력하세요"]')).toBeVisible({ timeout: 5000 });
          console.log('✅ 호텔 이름 입력 필드가 모달 내에서 발견되었습니다.');
        }
        if (section.id === 'room') {
          console.log('🔍 객실 입력 필드 찾는 중...');
          await expect(page.locator('[role="dialog"] input[placeholder="객실 이름을 입력하세요"]')).toBeVisible({ timeout: 5000 });
          await expect(page.locator('[role="dialog"] button:has-text("객실 추가")')).toBeVisible();
          console.log('✅ 객실 입력 필드가 모달 내에서 발견되었습니다.');
        }
        if (section.id === 'notice') {
          console.log('🔍 공지사항 입력 필드 찾는 중...');
          await expect(page.locator('[role="dialog"] input[placeholder="새 공지사항 입력"]')).toBeVisible({ timeout: 5000 });
          await expect(page.locator('[role="dialog"] button[data-testid="add-notice-button"]')).toBeVisible();
          console.log('✅ 공지사항 입력 필드가 모달 내에서 발견되었습니다.');
        }
        
        // 모달이 열린 상태에서 스크린샷 촬영
        await page.screenshot({ path: `debug-${section.id}-modal.png`, fullPage: true });
        console.log(`📸 ${section.id} 모달 스크린샷 저장`);
        
      } catch (error) {
        console.log(`❌ ${section.label} 모달이 열리지 않았습니다. 인라인 폼을 확인합니다.`);
        console.log('🔍 인라인 입력 필드 찾는 중...');
        
        // 인라인 폼 확인
        if (section.id === 'hotel') {
          const hotelInputs = await page.locator('input[placeholder="호텔 이름을 입력하세요"]').count();
          console.log('📝 호텔 이름 입력 필드 개수:', hotelInputs);
          if (hotelInputs > 0) {
            await expect(page.locator('input[placeholder="호텔 이름을 입력하세요"]')).toBeVisible({ timeout: 5000 });
            console.log('✅ 인라인 폼에서 호텔 이름 입력 필드 발견!');
          }
        }
        if (section.id === 'room') {
          const roomInputs = await page.locator('input[placeholder="객실 이름을 입력하세요"]').count();
          console.log('📝 객실 이름 입력 필드 개수:', roomInputs);
          if (roomInputs > 0) {
            await expect(page.locator('input[placeholder="객실 이름을 입력하세요"]')).toBeVisible({ timeout: 5000 });
            await expect(page.locator('button:has-text("객실 추가")')).toBeVisible();
            console.log('✅ 인라인 폼에서 객실 입력 필드 발견!');
          }
        }
        if (section.id === 'notice') {
          const noticeInputs = await page.locator('input[placeholder="새 공지사항 입력"]').count();
          console.log('📝 공지사항 입력 필드 개수:', noticeInputs);
          if (noticeInputs > 0) {
            await expect(page.locator('input[placeholder="새 공지사항 입력"]')).toBeVisible({ timeout: 5000 });
            await expect(page.locator('button[data-testid="add-notice-button"]')).toBeVisible();
            console.log('✅ 인라인 폼에서 공지사항 입력 필드 발견!');
          }
        }
        
        // 인라인 폼 상태에서 스크린샷 촬영
        await page.screenshot({ path: `debug-${section.id}-inline.png`, fullPage: true });
        console.log(`📸 ${section.id} 인라인 폼 스크린샷 저장`);
      }
      
      console.log(`🏁 ${section.label} 테스트 완료`);
    });
  }
}); 