// ?쒕쾭 ?ㅻ쪟 API ?뚯뒪??
const fetch = require('node-fetch');

async function testServerErrors() {
  console.log('?? ?쒕쾭 ?ㅻ쪟 API ?뚯뒪???쒖옉...\n');
  
  const baseUrl = 'http://localhost:3900/api/test-error';
  
  const testCases = [
    { name: '?쇰컲 ?ㅻ쪟', url: baseUrl },
    { name: '500 ?ㅻ쪟', url: `${baseUrl}?type=500` },
    { name: '??꾩븘???ㅻ쪟', url: `${baseUrl}?type=timeout` },
    { name: '?곗씠?곕쿋?댁뒪 ?ㅻ쪟', url: `${baseUrl}?type=database` }
  ];
  
  for (const testCase of testCases) {
    console.log(`?뱥 ?뚯뒪?? ${testCase.name}`);
    
    try {
      const startTime = Date.now();
      const response = await fetch(testCase.url, {
        method: 'GET',
        timeout: testCase.name.includes('??꾩븘??) ? 5000 : 3000
      });
      const endTime = Date.now();
      
      console.log(`   ?곹깭 肄붾뱶: ${response.status}`);
      console.log(`   ?묐떟 ?쒓컙: ${endTime - startTime}ms`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ?묐떟: ${JSON.stringify(data, null, 2)}`);
      } else {
        console.log(`   ?ㅻ쪟 ?묐떟: ${response.statusText}`);
      }
      
    } catch (error) {
      console.log(`   ???ㅻ쪟 諛쒖깮: ${error.message}`);
    }
    
    console.log('');
  }
  
  // POST ?붿껌 ?뚯뒪??
  console.log('?뱥 POST ?붿껌 ?뚯뒪??);
  try {
    const response = await fetch(baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '?뚯뒪?몄슜 POST ?ㅻ쪟' })
    });
    
    console.log(`   ?곹깭 肄붾뱶: ${response.status}`);
    const data = await response.json();
    console.log(`   ?묐떟: ${JSON.stringify(data, null, 2)}`);
    
  } catch (error) {
    console.log(`   ??POST ?ㅻ쪟: ${error.message}`);
  }
  
  console.log('\n?뢾 ?쒕쾭 ?ㅻ쪟 ?뚯뒪???꾨즺');
}

// 硫붿씤 ?ㅽ뻾
testServerErrors(); 
