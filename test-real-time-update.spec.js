import { test, expect } from '@playwright/test';

test('왼쪽 입력이 오른쪽에 실시간 반영되는지 테스트', async ({ page }) => {
  console.log('🧪 실시간 업데이트 테스트 시작...');
  
  // 페이지 로드
  await page.goto('http://localhost:3900');
  console.log('📄 페이지 로딩 완료');
  
  // 호텔 이름 입력 필드 찾기
  const nameInput = page.locator('input[name="name"]');
  await expect(nameInput).toBeVisible();
  console.log('✅ 호텔 이름 입력 필드 발견');
  
  // 기존 값 확인
  const initialValue = await nameInput.inputValue();
  console.log('📋 초기 값:', initialValue);
  
  // 새로운 값 입력
  const testValue = '테스트 호텔 123';
  await nameInput.fill(testValue);
  console.log('✏️ 새로운 값 입력:', testValue);
  
  // 잠시 대기 (실시간 업데이트 대기)
  await page.waitForTimeout(2000);
  
  // 오른쪽 미리보기에서 내용 확인
  const previewContent = await page.evaluate(() => {
    // 미리보기 컨테이너 찾기
    const previewElement = document.querySelector('[style*="overflow: auto"]') ||
                          document.querySelector('.preview-content') ||
                          document.querySelector('[ref="previewRef"]');
    
    if (previewElement) {
      return previewElement.textContent || previewElement.innerText;
    }
    
    // 전체 페이지에서 내용 검색
    return document.body.textContent;
  });
  
  console.log('👀 미리보기 내용:', previewContent.substring(0, 200) + '...');
  
  // 결과 확인
  if (previewContent.includes(testValue)) {
    console.log('✅ 성공: 왼쪽 입력이 오른쪽에 실시간 반영됨!');
  } else {
    console.log('❌ 실패: 왼쪽 입력이 오른쪽에 반영되지 않음');
    console.log('🔍 찾은 내용:', previewContent);
  }
  
  // 스크린샷 저장
  await page.screenshot({ path: 'real-time-update-test.png', fullPage: true });
  console.log('📸 스크린샷 저장됨: real-time-update-test.png');
  
  // 테스트 결과 검증
  expect(previewContent).toContain(testValue);
}); 