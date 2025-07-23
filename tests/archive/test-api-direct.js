const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('🔍 API 테스트 시작...');
    
    // POST 요청 테스트
    console.log('📤 POST 요청 테스트...');
    const postResponse = await fetch('http://localhost: {process.env.PORT || 34343}/api/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '테스트 호텔 ' + Date.now(),
        address: '서울시 강남구 테스트로 123',
        description: '직접 API 테스트용 호텔',
        isTemplate: true
      })
    });
    
    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('✅ POST 요청 성공:', postResult);
    } else {
      console.log('❌ POST 요청 실패:', postResponse.status, postResponse.statusText);
      const errorText = await postResponse.text();
      console.log('오류 내용:', errorText);
    }
    
    // GET 요청 테스트
    console.log('📥 GET 요청 테스트...');
    const getResponse = await fetch('http://localhost: {process.env.PORT || 34343}/api/hotels?templates=true');
    
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('✅ GET 요청 성공:', getResult);
      
      if (getResult.hotels && getResult.hotels.length > 0) {
        console.log(`📊 저장된 호텔 ${getResult.hotels.length}개:`);
        getResult.hotels.forEach((hotel, index) => {
          console.log(`  ${index + 1}. ${hotel.name} - ${hotel.address}`);
        });
      } else {
        console.log('📊 저장된 호텔이 없습니다.');
      }
    } else {
      console.log('❌ GET 요청 실패:', getResponse.status, getResponse.statusText);
    }
    
  } catch (error) {
    console.error('❌ API 테스트 오류:', error);
  }
}

testAPI(); 