/**
 * 서버 자동 재시작 기능 테스트
 */

const { checkServerHealth, restartServer } = require('./auto-error-handler.cjs');

async function testServerAutoRestart() {
  console.log('🧪 서버 자동 재시작 기능 테스트 시작\n');
  
  // 1. 현재 서버 상태 확인
  console.log('📋 1단계: 현재 서버 상태 확인');
  const isHealthy = await checkServerHealth();
  console.log(`   서버 상태: ${isHealthy ? '정상' : '비정상'}`);
  
  if (!isHealthy) {
    console.log('❌ 서버가 정상 작동하지 않음 - 테스트 중단');
    return;
  }
  
  // 2. 서버 강제 종료
  console.log('\n📋 2단계: 서버 강제 종료');
  const { exec } = require('child_process');
  
  await new Promise((resolve) => {
    exec('taskkill /F /IM node.exe', (error, stdout, stderr) => {
      if (error) {
        console.log(`   ❌ 서버 종료 실패: ${error.message}`);
      } else {
        console.log('   ✅ 서버 종료 성공');
      }
      resolve();
    });
  });
  
  // 3. 잠시 대기
  console.log('\n📋 3단계: 서버 종료 대기 (5초)');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // 4. 서버 상태 재확인
  console.log('\n📋 4단계: 서버 종료 확인');
  const isStillHealthy = await checkServerHealth();
  console.log(`   서버 상태: ${isStillHealthy ? '정상' : '종료됨'}`);
  
  if (isStillHealthy) {
    console.log('⚠️ 서버가 여전히 실행 중 - 다른 프로세스일 수 있음');
  } else {
    console.log('✅ 서버 종료 확인됨');
  }
  
  // 5. 자동 재시작 테스트
  console.log('\n📋 5단계: 자동 재시작 테스트');
  console.log('   자동 오류 처리 시스템이 15초 내에 서버를 재시작해야 함...');
  
  // 20초 대기
  for (let i = 1; i <= 4; i++) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log(`   ${i * 5}초 경과...`);
    
    const currentHealth = await checkServerHealth();
    if (currentHealth) {
      console.log(`   ✅ 서버 자동 재시작 성공! (${i * 5}초 후)`);
      break;
    }
  }
  
  // 6. 최종 상태 확인
  console.log('\n📋 6단계: 최종 상태 확인');
  const finalHealth = await checkServerHealth();
  console.log(`   최종 서버 상태: ${finalHealth ? '정상' : '비정상'}`);
  
  if (finalHealth) {
    console.log('\n🎉 테스트 성공: 서버 자동 재시작 기능 정상 작동');
  } else {
    console.log('\n❌ 테스트 실패: 서버 자동 재시작 기능 작동하지 않음');
  }
  
  console.log('\n🏁 테스트 완료');
}

testServerAutoRestart().catch(error => {
  console.error('❌ 테스트 실패:', error.message);
}); 