import fetch from 'node-fetch';

async function testPreviewAPI() {
  console.log('?봽 API 湲곕컲 誘몃━蹂닿린 ?뚯뒪???쒖옉...');
  
  try {
    // 1. ?ъ뒪泥댄겕
    console.log('?룯 ?쒕쾭 ?ъ뒪泥댄겕 以?..');
    const healthResponse = await fetch('http://localhost:3900/api/health');
    const healthData = await healthResponse.json();
    console.log('?뱤 ?쒕쾭 ?곹깭:', healthData.status);
    
    if (healthData.status !== 'ok') {
      console.log('???쒕쾭 ?곹깭 遺덈웾');
      return false;
    }
    
    // 2. ?명뀛 ?곗씠???앹꽦
    console.log('?뱷 ?뚯뒪???명뀛 ?곗씠???앹꽦 以?..');
    const testHotelData = {
      name: '?대퀎媛 ?명뀛',
      description: '?대퀎媛?먯꽌 留뚮굹???밸퀎???명뀛?낅땲??',
      address: '?쒖슱??媛뺣궓援??대퀎媛濡?123',
      phone: '02-1234-5678'
    };
    
    // 3. ?명뀛 ?곗씠?????
    const saveResponse = await fetch('http://localhost:3900/api/hotels', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testHotelData)
    });
    
    if (saveResponse.ok) {
      console.log('???명뀛 ?곗씠??????깃났');
      
      // 4. ??λ맂 ?곗씠???뺤씤
      const getResponse = await fetch('http://localhost:3900/api/hotels');
      if (getResponse.ok) {
        const hotels = await getResponse.json();
        console.log('?뱥 ??λ맂 ?명뀛 媛쒖닔:', hotels.data?.length || 0);
        
        // 5. 誘몃━蹂닿린 ?곗씠???뺤씤
        const savedHotel = hotels.data?.find(h => h.name === '?대퀎媛 ?명뀛');
        if (savedHotel) {
          console.log('????λ맂 ?명뀛 ?곗씠???뺤씤:', {
            name: savedHotel.name,
            description: savedHotel.description?.substring(0, 50)
          });
          console.log('?럦 誘몃━蹂닿린 ?곗씠???뺤긽 ???');
          return true;
        } else {
          console.log('????λ맂 ?명뀛??李얠쓣 ???놁쓬');
          return false;
        }
      } else {
        console.log('???명뀛 ?곗씠??議고쉶 ?ㅽ뙣');
        return false;
      }
    } else {
      console.log('???명뀛 ?곗씠??????ㅽ뙣');
      return false;
    }
    
  } catch (error) {
    console.error('??API ?뚯뒪??以??ㅻ쪟 諛쒖깮:', error.message);
    return false;
  }
}

// ?뚯뒪???ㅽ뻾
testPreviewAPI().then(result => {
  console.log('\n?뱤 API ?뚯뒪??寃곌낵:', result ? '?깃났' : '?ㅽ뙣');
  process.exit(result ? 0 : 1);
}); 
