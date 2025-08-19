const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('?뵇 API ?뚯뒪???쒖옉...');
    
    // POST ?붿껌 ?뚯뒪??
    console.log('?뱾 POST ?붿껌 ?뚯뒪??..');
    const postResponse = await fetch('http://localhost: {process.env.PORT || 3900}/api/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: '?뚯뒪???명뀛 ' + Date.now(),
        address: '?쒖슱??媛뺣궓援??뚯뒪?몃줈 123',
        description: '吏곸젒 API ?뚯뒪?몄슜 ?명뀛',
        isTemplate: true
      })
    });
    
    if (postResponse.ok) {
      const postResult = await postResponse.json();
      console.log('??POST ?붿껌 ?깃났:', postResult);
    } else {
      console.log('??POST ?붿껌 ?ㅽ뙣:', postResponse.status, postResponse.statusText);
      const errorText = await postResponse.text();
      console.log('?ㅻ쪟 ?댁슜:', errorText);
    }
    
    // GET ?붿껌 ?뚯뒪??
    console.log('?뱿 GET ?붿껌 ?뚯뒪??..');
    const getResponse = await fetch('http://localhost: {process.env.PORT || 3900}/api/hotels?templates=true');
    
    if (getResponse.ok) {
      const getResult = await getResponse.json();
      console.log('??GET ?붿껌 ?깃났:', getResult);
      
      if (getResult.hotels && getResult.hotels.length > 0) {
        console.log(`?뱤 ??λ맂 ?명뀛 ${getResult.hotels.length}媛?`);
        getResult.hotels.forEach((hotel, index) => {
          console.log(`  ${index + 1}. ${hotel.name} - ${hotel.address}`);
        });
      } else {
        console.log('?뱤 ??λ맂 ?명뀛???놁뒿?덈떎.');
      }
    } else {
      console.log('??GET ?붿껌 ?ㅽ뙣:', getResponse.status, getResponse.statusText);
    }
    
  } catch (error) {
    console.error('??API ?뚯뒪???ㅻ쪟:', error);
  }
}

testAPI(); 
