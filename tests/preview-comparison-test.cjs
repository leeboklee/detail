// iframe vs div 湲곕컲 誘몃━蹂닿린 ?깅뒫 鍮꾧탳 ?뚯뒪??
const fs = require('fs');

// iframe 湲곕컲 誘몃━蹂닿린 (湲곗〈 諛⑹떇)
function generateIframePreview(hotelInfo) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${hotelInfo?.name || '?명뀛 誘몃━蹂닿린'}</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        </style>
      </head>
      <body>
        <h1>${hotelInfo?.name || '?명뀛紐?}</h1>
        <p>${hotelInfo?.address || '二쇱냼'}</p>
        <p>${hotelInfo?.description || '?ㅻ챸'}</p>
      </body>
    </html>
  `;
  
  return `<iframe srcDoc="${html.replace(/"/g, '&quot;')}" style="width:100%;height:100%;border:none;"></iframe>`;
}

// div 湲곕컲 誘몃━蹂닿린 (媛쒖꽑??諛⑹떇)
function generateDivPreview(hotelInfo) {
  return `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1>${hotelInfo?.name || '?명뀛紐?}</h1>
      <p>${hotelInfo?.address || '二쇱냼'}</p>
      <p>${hotelInfo?.description || '?ㅻ챸'}</p>
    </div>
  `;
}

// ?깅뒫 ?뚯뒪??
function performanceComparison() {
  console.log('??iframe vs div ?깅뒫 鍮꾧탳 ?뚯뒪??n');
  
  const testData = {
    name: '?뚯뒪???명뀛',
    address: '?쒖슱??媛뺣궓援??뚯뒪?몃줈 123',
    description: '?뚯뒪?몄슜 ?명뀛?낅땲??'
  };
  
  const iterations = 1000;
  
  // iframe ?깅뒫 ?뚯뒪??
  console.log('?뱤 iframe 湲곕컲 誘몃━蹂닿린 ?깅뒫 ?뚯뒪??..');
  const iframeStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    generateIframePreview(testData);
  }
  const iframeEnd = Date.now();
  const iframeDuration = iframeEnd - iframeStart;
  const iframeAvg = iframeDuration / iterations;
  
  // div ?깅뒫 ?뚯뒪??
  console.log('?뱤 div 湲곕컲 誘몃━蹂닿린 ?깅뒫 ?뚯뒪??..');
  const divStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    generateDivPreview(testData);
  }
  const divEnd = Date.now();
  const divDuration = divEnd - divStart;
  const divAvg = divDuration / iterations;
  
  // 寃곌낵 鍮꾧탳
  console.log('\n?뱢 ?깅뒫 鍮꾧탳 寃곌낵:');
  console.log(`   iframe 湲곕컲:`);
  console.log(`     - 珥??ㅽ뻾 ?쒓컙: ${iframeDuration}ms`);
  console.log(`     - ?됯퇏 ?ㅽ뻾 ?쒓컙: ${iframeAvg.toFixed(3)}ms`);
  console.log(`     - 珥덈떦 泥섎━?? ${Math.round(iterations / (iframeDuration / 1000))}??);
  
  console.log(`   div 湲곕컲:`);
  console.log(`     - 珥??ㅽ뻾 ?쒓컙: ${divDuration}ms`);
  console.log(`     - ?됯퇏 ?ㅽ뻾 ?쒓컙: ${divAvg.toFixed(3)}ms`);
  console.log(`     - 珥덈떦 泥섎━?? ${Math.round(iterations / (divDuration / 1000))}??);
  
  const speedup = iframeAvg / divAvg;
  console.log(`\n?? ?깅뒫 媛쒖꽑: div 湲곕컲??${speedup.toFixed(1)}諛?鍮좊쫫`);
  
  return {
    iframe: { duration: iframeDuration, avg: iframeAvg },
    div: { duration: divDuration, avg: divAvg },
    speedup
  };
}

// ?λ떒??鍮꾧탳
function comparisonAnalysis() {
  console.log('\n?뱥 iframe vs div 湲곕컲 誘몃━蹂닿린 鍮꾧탳 遺꾩꽍\n');
  
  const iframePros = [
    '?꾩쟾??HTML 臾몄꽌 ?뚮뜑留?,
    'CSS/JS 寃⑸━',
    '?낅┰?곸씤 ?ㅽ겕濡?,
    '蹂댁븞 寃⑸━'
  ];
  
  const iframeCons = [
    '?깅뒫 ?ㅻ쾭?ㅻ뱶 (?덈줈??臾몄꽌 而⑦뀓?ㅽ듃)',
    '硫붾え由??ъ슜??利앷?',
    '蹂듭옟???듭떊 (postMessage)',
    'SEO 臾몄젣',
    '?묎렐???댁뒋',
    '紐⑤컮???깅뒫 ???
  ];
  
  const divPros = [
    '鍮좊Ⅸ ?뚮뜑留??깅뒫',
    '??? 硫붾え由??ъ슜??,
    '媛꾨떒??DOM 議곗옉',
    'SEO 移쒗솕??,
    '?묎렐???곗닔',
    '諛섏쓳???붿옄???⑹씠',
    '?ㅼ떆媛??낅뜲?댄듃 ?ъ?'
  ];
  
  const divCons = [
    'CSS/JS 異⑸룎 媛?μ꽦',
    '?ㅽ???寃⑸━ ?대젮?',
    '蹂듭옟???덉씠?꾩썐 ???쒗븳'
  ];
  
  console.log('??iframe ?μ젏:');
  iframePros.forEach(pro => console.log(`   - ${pro}`));
  
  console.log('\n??iframe ?⑥젏:');
  iframeCons.forEach(con => console.log(`   - ${con}`));
  
  console.log('\n??div ?μ젏:');
  divPros.forEach(pro => console.log(`   - ${pro}`));
  
  console.log('\n??div ?⑥젏:');
  divCons.forEach(con => console.log(`   - ${con}`));
  
  console.log('\n?렞 沅뚯옣?ы빆:');
  console.log('   - ?⑥닚??誘몃━蹂닿린: div 湲곕컲 (?꾩옱 ?ъ슜 以?');
  console.log('   - 蹂듭옟???낅┰ ?섏씠吏: iframe 湲곕컲');
  console.log('   - 蹂댁븞??以묒슂??寃쎌슦: iframe 湲곕컲');
}

// ?ㅼ젣 ?ъ슜 ?щ? ?뚯뒪??
function useCaseTest() {
  console.log('\n?뵇 ?ㅼ젣 ?ъ슜 ?щ? ?뚯뒪??n');
  
  const testCases = [
    {
      name: '鍮??명뀛 ?뺣낫',
      data: {}
    },
    {
      name: '湲곕낯 ?명뀛 ?뺣낫',
      data: {
        name: '?뚯뒪???명뀛',
        address: '?쒖슱??媛뺣궓援?,
        description: '?뚯뒪?몄슜 ?명뀛?낅땲??'
      }
    },
    {
      name: '湲??띿뒪??,
      data: {
        name: '留ㅼ슦 湲??명뀛 ?대쫫?낅땲?? ?닿쾬? ?뚯뒪?몃? ?꾪븳 寃껋엯?덈떎.',
        address: '留ㅼ슦 湲?二쇱냼?낅땲?? ?쒖슱??媛뺣궓援??뚯뒪?몃줈 123踰덇만 456??789痢?,
        description: '留ㅼ슦 湲??ㅻ챸?낅땲?? '.repeat(10)
      }
    }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`?뱥 ?뚯뒪??耳?댁뒪 ${index + 1}: ${testCase.name}`);
    
    const iframeResult = generateIframePreview(testCase.data);
    const divResult = generateDivPreview(testCase.data);
    
    console.log(`   iframe ?ш린: ${iframeResult.length} 臾몄옄`);
    console.log(`   div ?ш린: ${divResult.length} 臾몄옄`);
    console.log(`   ?ш린 李⑥씠: ${((iframeResult.length - divResult.length) / iframeResult.length * 100).toFixed(1)}%`);
    console.log('');
  });
}

// 硫붿씤 ?뚯뒪???ㅽ뻾
function runComparisonTests() {
  console.log('?? iframe vs div 湲곕컲 誘몃━蹂닿린 鍮꾧탳 ?뚯뒪???쒖옉...\n');
  
  // ?깅뒫 鍮꾧탳
  const performanceResults = performanceComparison();
  
  // 遺꾩꽍
  comparisonAnalysis();
  
  // ?ъ슜 ?щ? ?뚯뒪??
  useCaseTest();
  
  // 理쒖쥌 寃곕줎
  console.log('\n?룇 理쒖쥌 寃곕줎:');
  if (performanceResults.speedup > 2) {
    console.log(`   ??div 湲곕컲??${performanceResults.speedup.toFixed(1)}諛?鍮좊Ⅴ誘濡??꾩옱 ?좏깮??理쒖쟻`);
  } else {
    console.log('   ?뽳툘 ?깅뒫 李⑥씠媛 ?ъ? ?딆쑝誘濡??ъ슜 ?щ????곕씪 ?좏깮');
  }
  
  console.log('   ?뱷 ?꾩옱 援ы쁽??div 湲곕컲 誘몃━蹂닿린媛 ?명뀛 ?뺣낫 誘몃━蹂닿린??理쒖쟻?붾맖');
  console.log('   ?뵩 ?쒕쾭 ?ㅻ쪟 泥섎━, ?ㅼ떆媛??낅뜲?댄듃, HTML ?ㅼ슫濡쒕뱶 湲곕뒫 ?ы븿');
}

runComparisonTests(); 
