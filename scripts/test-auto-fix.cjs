/**
 * 자동 복구 기능 테스트
 */

const { detectError, fixError } = require('./auto-error-handler.cjs');

async function testAutoFix() {
  console.log('🔧 자동 복구 기능 테스트 시작\n');
  
  // Prisma 오류 테스트
  const prismaError = '@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.';
  
  console.log('📋 Prisma 오류 감지 테스트');
  const detectedError = detectError(prismaError);
  
  if (detectedError) {
    console.log(`✅ 오류 감지됨: ${detectedError.category}`);
    console.log(`   오류 내용: ${detectedError.line}`);
    
    console.log('\n🔧 자동 복구 시도...');
    try {
      const fixResults = await fixError(detectedError);
      
      console.log(`\n📊 복구 결과:`);
      fixResults.forEach((result, index) => {
        if (result.success) {
          console.log(`   ✅ ${index + 1}. ${result.solution} - 성공`);
        } else {
          console.log(`   ❌ ${index + 1}. ${result.solution} - 실패: ${result.error}`);
        }
      });
      
      const successCount = fixResults.filter(r => r.success).length;
      console.log(`\n🎯 총 ${fixResults.length}개 해결책 중 ${successCount}개 성공`);
      
    } catch (error) {
      console.log(`❌ 복구 과정에서 오류: ${error.message}`);
    }
  } else {
    console.log('❌ 오류 감지 실패');
  }
  
  console.log('\n🏁 테스트 완료');
}

testAutoFix().catch(error => {
  console.error('❌ 테스트 실패:', error.message);
}); 