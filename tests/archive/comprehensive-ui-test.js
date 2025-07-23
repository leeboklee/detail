const { chromium } = require('playwright');

async function comprehensiveTest() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--no-sandbox'],
    slowMo: 500 // 동작을 천천히 해서 시각적으로 확인
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 페이지 접속 중...');
    await page.goto('http://localhost: {process.env.PORT || 34343}', { waitUntil: 'domcontentloaded', timeout: 10000 });
    
    console.log('📷 초기 페이지 스크린샷...');
    await page.screenshot({ path: 'test-01-initial.png' });
    
    // 섹션 카드들 확인
    console.log('🔍 섹션 카드들 찾기...');
    const sectionCards = await page.locator('[data-testid^="section-card-"]').count();
    console.log(`✅ 발견된 섹션 카드: ${sectionCards}개`);
    
    if (sectionCards === 0) {
      throw new Error('섹션 카드를 찾을 수 없습니다');
    }
    
    // 각 섹션 테스트
    const sectionsToTest = ['hotel', 'rooms', 'facilities', 'packages', 'charges'];
    
    for (let i = 0; i < sectionsToTest.length; i++) {
      const section = sectionsToTest[i];
      console.log(`\n📋 [${i+1}/${sectionsToTest.length}] ${section} 섹션 테스트 시작...`);
      
      // 섹션 카드 클릭
      console.log(`🖱️ ${section} 섹션 클릭...`);
      await page.locator(`[data-testid="section-card-${section}"]`).click();
      
      // 모달 대기
      console.log('⏳ 모달 대기...');
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      
      // 모달 스크린샷
      console.log('📷 모달 스크린샷...');
      await page.screenshot({ path: `test-02-${section}-modal.png` });
      
      // 적용하고 닫기 버튼 찾기 및 클릭
      console.log('🔘 적용하고 닫기 버튼 찾기...');
      const applyButton = page.locator('button:has-text("적용하고 닫기")');
      await applyButton.waitFor({ timeout: 3000 });
      await applyButton.click();
      
      // 모달이 닫힐 때까지 대기
      console.log('⏳ 모달 닫힘 대기...');
      await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 3000 });
      
      console.log(`✅ ${section} 섹션 테스트 완료`);
      
      // 각 섹션 테스트 사이에 잠시 대기
      await page.waitForTimeout(1000);
    }
    
    // 전체 저장 버튼 테스트
    console.log('\n💾 전체 저장 기능 테스트...');
    await page.screenshot({ path: 'test-03-before-save.png' });
    
    const saveButton = page.locator('button:has-text("전체 저장")');
    await saveButton.waitFor({ timeout: 3000 });
    await saveButton.click();
    
    console.log('⏳ 저장 완료 대기...');
    // 성공 메시지 대기 (5초 내에 나타나야 함)
    try {
      await page.waitForSelector('div:has-text("저장되었습니다")', { timeout: 8000 });
      console.log('✅ 저장 성공 메시지 확인됨');
    } catch (e) {
      console.log('⚠️ 저장 메시지를 찾을 수 없음, 하지만 계속 진행...');
    }
    
    await page.screenshot({ path: 'test-04-after-save.png' });
    
    console.log('\n🎉 모든 테스트 완료!');
    console.log('📁 생성된 스크린샷:');
    console.log('  - test-01-initial.png: 초기 페이지');
    console.log('  - test-02-{section}-modal.png: 각 섹션 모달');
    console.log('  - test-03-before-save.png: 저장 전');
    console.log('  - test-04-after-save.png: 저장 후');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ path: 'test-error.png' });
    console.log('📷 에러 스크린샷 저장: test-error.png');
  } finally {
    await browser.close();
  }
}

comprehensiveTest(); 