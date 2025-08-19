/**
 * 오류 감지 시스템 테스트
 */

const { detectError, fixError } = require('./auto-error-handler.cjs');

// 테스트용 오류 메시지들
const testErrors = [
  '@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.',
  'Error: listen EADDRINUSE: address already in use :::3900',
  'JavaScript heap out of memory',
  'Cannot find module \'@prisma/client\'',
  'SyntaxError: Unexpected token',
  'ReferenceError: require is not defined in ES module scope'
];

console.log('🧪 오류 감지 시스템 테스트 시작\n');

testErrors.forEach((errorMessage, index) => {
  console.log(`📋 테스트 ${index + 1}: ${errorMessage.substring(0, 50)}...`);
  
  const detectedError = detectError(errorMessage);
  
  if (detectedError) {
    console.log(`✅ 오류 감지됨: ${detectedError.category}`);
    console.log(`   패턴: ${detectedError.pattern}`);
    console.log(`   해결책: ${detectedError.solutions.length}개`);
  } else {
    console.log(`❌ 오류 감지 실패`);
  }
  
  console.log('');
});

console.log('🏁 테스트 완료'); 