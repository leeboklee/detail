// 怨좉툒 誘몃━蹂닿린 ?뚯뒪???쒖뒪??
const fs = require('fs');
const path = require('path');

// 誘몃━蹂닿린 HTML ?앹꽦 ?⑥닔 (媛쒖꽑??踰꾩쟾)
function generatePreviewHTML(hotelInfo, selectedTemplate, templates) {
  if (!hotelInfo || !hotelInfo.name) {
    return '<div style="padding: 20px; color: #666; text-align: center; font-size: 16px;">誘몃━蹂닿린 ?댁슜???놁뒿?덈떎.<br><small>?명뀛 ?뺣낫瑜??낅젰?댁＜?몄슂.</small></div>';
  }
  
  // ?좏깮???쒗뵆由우뿉 ?곕씪 HTML ?앹꽦
  const template = templates[selectedTemplate];
  if (template) {
    return template
      .replace(/{{hotelName}}/g, hotelInfo.name || '')
      .replace(/{{hotelSubtitle}}/g, hotelInfo.subtitle || '')
      .replace(/{{hotelAddress}}/g, hotelInfo.address || '')
      .replace(/{{hotelDescription}}/g, hotelInfo.description || '');
  }
  
  // 湲곕낯 HTML ?앹꽦 (媛쒖꽑???붿옄??
  return `
    <div style="padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="margin: 0 0 10px 0; font-size: 2.5em; font-weight: 300;">${hotelInfo.name || '?명뀛紐?}</h1>
        ${hotelInfo.subtitle ? `<h2 style="margin: 0; font-size: 1.2em; font-weight: 300; opacity: 0.9;">${hotelInfo.subtitle}</h2>` : ''}
      </div>
      
      <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        ${hotelInfo.address ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin: 0 0 10px 0; font-size: 1.1em;">?뱧 二쇱냼</h3>
            <p style="color: #666; margin: 0; font-size: 1em;">${hotelInfo.address}</p>
          </div>
        ` : ''}
        
        ${hotelInfo.description ? `
          <div>
            <h3 style="color: #333; margin: 0 0 10px 0; font-size: 1.1em;">?뱷 ?뚭컻</h3>
            <p style="color: #555; margin: 0; line-height: 1.6; font-size: 1em;">${hotelInfo.description}</p>
          </div>
        ` : ''}
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 0.9em;">
        留덉?留??낅뜲?댄듃: ${new Date().toLocaleString('ko-KR')}
      </div>
    </div>
  `;
}

function generateFullHTML(previewContent, hotelInfo) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${hotelInfo?.name || '?명뀛 誘몃━蹂닿린'}</title>
        <style>
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            padding: 0; 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
          }
          .hotel-container { padding: 20px; }
          .hotel-header { margin-bottom: 20px; }
          .hotel-modern { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 10px;
          }
          .hotel-classic { 
            background: #f8f9fa; 
            border: 2px solid #dee2e6; 
            padding: 25px; 
            border-radius: 8px;
          }
          .hotel-minimal { 
            padding: 20px; 
            background: white; 
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
        </style>
      </head>
      <body>
        ${previewContent}
      </body>
    </html>
  `;
}

// 怨좉툒 ?뚯뒪??耳?댁뒪??
const advancedTestCases = [
  {
    name: '湲곕낯 ?명뀛 ?뺣낫 (媛쒖꽑???붿옄??',
    hotelInfo: {
      name: '?뚯뒪???명뀛',
      address: '?쒖슱??媛뺣궓援??뚯뒪?몃줈 123',
      description: '?뚯뒪?몄슜 ?명뀛?낅땲??'
    },
    selectedTemplate: 'default',
    templates: {
      default: `
        <div style="padding: 30px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h1 style="margin: 0 0 10px 0; font-size: 2.5em; font-weight: 300;">{{hotelName}}</h1>
          </div>
          <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 1.1em;">?뱧 二쇱냼</h3>
              <p style="color: #666; margin: 0; font-size: 1em;">{{hotelAddress}}</p>
            </div>
            <div>
              <h3 style="color: #333; margin: 0 0 10px 0; font-size: 1.1em;">?뱷 ?뚭컻</h3>
              <p style="color: #555; margin: 0; line-height: 1.6; font-size: 1em;">{{hotelDescription}}</p>
            </div>
          </div>
        </div>
      `
    }
  },
  {
    name: '鍮??명뀛 ?뺣낫 (媛쒖꽑??硫붿떆吏)',
    hotelInfo: {},
    selectedTemplate: 'default',
    templates: {}
  },
  {
    name: '??뀛由??명뀛 (怨좉툒 ?쒗뵆由?',
    hotelInfo: {
      name: '??뀛由??명뀛',
      subtitle: '理쒓퀬湲??명뀛',
      address: '?쒖슱??媛뺣궓援???뀛由щ줈 456',
      description: '理쒓퀬湲??쒕퉬?ㅻ? ?쒓났?섎뒗 ??뀛由??명뀛?낅땲?? ?몄븞?섍퀬 ?덈씫???댁떇??寃쏀뿕?섏꽭??'
    },
    selectedTemplate: 'luxury',
    templates: {
      luxury: `
        <div class="hotel-modern">
          <h1 style="margin: 0 0 10px 0; font-size: 3em; font-weight: 300;">{{hotelName}}</h1>
          <h2 style="margin: 0; font-size: 1.5em; font-weight: 300; opacity: 0.9;">{{hotelSubtitle}}</h2>
          <div style="margin-top: 20px;">
            <p style="margin: 5px 0; font-size: 1.1em;">?뱧 {{hotelAddress}}</p>
            <p style="margin: 15px 0 0 0; line-height: 1.6; font-size: 1.1em;">{{hotelDescription}}</p>
          </div>
        </div>
      `
    }
  },
  {
    name: '誘몃땲硫 ?명뀛 (?ы뵆 ?쒗뵆由?',
    hotelInfo: {
      name: '誘몃땲硫 ?명뀛',
      address: '?쒖슱??媛뺣궓援?誘몃땲硫濡?789',
      description: '?ы뵆?섍퀬 源붾걫??誘몃땲硫 ?명뀛?낅땲??'
    },
    selectedTemplate: 'minimal',
    templates: {
      minimal: `
        <div class="hotel-minimal">
          <h1 style="margin: 0 0 20px 0; font-size: 2em; color: #333;">{{hotelName}}</h1>
          <p style="color: #666; margin: 10px 0;">?뱧 {{hotelAddress}}</p>
          <p style="color: #555; line-height: 1.6;">{{hotelDescription}}</p>
        </div>
      `
    }
  },
  {
    name: '湲곕낯 HTML ?ъ슜 (?쒗뵆由??놁쓬)',
    hotelInfo: {
      name: '湲곕낯 ?명뀛',
      address: '?쒖슱??媛뺣궓援?湲곕낯濡?999',
      description: '湲곕낯 HTML???ъ슜?섎뒗 ?명뀛?낅땲??'
    },
    selectedTemplate: 'nonexistent',
    templates: {}
  }
];

// ?깅뒫 ?뚯뒪??
function performanceTest() {
  console.log('???깅뒫 ?뚯뒪???쒖옉...');
  
  const startTime = Date.now();
  let iterations = 1000;
  
  for (let i = 0; i < iterations; i++) {
    const testCase = advancedTestCases[0];
    generatePreviewHTML(testCase.hotelInfo, testCase.selectedTemplate, testCase.templates);
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  const avgTime = duration / iterations;
  
  console.log(`?뱤 ?깅뒫 寃곌낵:`);
  console.log(`   - 珥??ㅽ뻾 ?쒓컙: ${duration}ms`);
  console.log(`   - 諛섎났 ?잛닔: ${iterations}`);
  console.log(`   - ?됯퇏 ?ㅽ뻾 ?쒓컙: ${avgTime.toFixed(3)}ms`);
  console.log(`   - 珥덈떦 泥섎━?? ${Math.round(iterations / (duration / 1000))}??);
  
  return avgTime < 1; // 1ms 誘몃쭔?대㈃ ?깅뒫 ?뚯뒪???듦낵
}

// ?묎렐???뚯뒪??
function accessibilityTest(html) {
  const issues = [];
  
  // ?쒕ぉ ?쒓렇 ?뺤씤
  if (!html.includes('<h1>') && !html.includes('<h2>')) {
    issues.push('?쒕ぉ ?쒓렇(h1, h2)媛 ?놁쓬');
  }
  
  // ?됱긽 ?鍮??뺤씤 (媛꾨떒??寃??
  if (html.includes('color: #666') && html.includes('background: #f5f5f5')) {
    issues.push('?됱긽 ?鍮꾧? 遺議깊븷 ???덉쓬');
  }
  
  // 諛섏쓳???붿옄???뺤씤
  if (!html.includes('viewport')) {
    issues.push('viewport 硫뷀? ?쒓렇媛 ?놁쓬');
  }
  
  return issues;
}

// 怨좉툒 ?뚯뒪???ㅽ뻾
function runAdvancedTests() {
  console.log('?? 怨좉툒 誘몃━蹂닿린 ?뚯뒪???쒖옉...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  let performancePassed = false;
  let accessibilityIssues = [];
  
  // ?깅뒫 ?뚯뒪??
  console.log('?뱥 ?깅뒫 ?뚯뒪??);
  performancePassed = performanceTest();
  console.log(performancePassed ? '???깅뒫 ?뚯뒪???듦낵' : '???깅뒫 ?뚯뒪???ㅽ뙣');
  console.log('');
  
  // 湲곕뒫 ?뚯뒪??
  advancedTestCases.forEach((testCase, index) => {
    totalTests++;
    console.log(`?뱥 ?뚯뒪??${index + 1}: ${testCase.name}`);
    
    try {
      // 誘몃━蹂닿린 HTML ?앹꽦
      const previewContent = generatePreviewHTML(
        testCase.hotelInfo, 
        testCase.selectedTemplate, 
        testCase.templates
      );
      
      // ?꾩껜 HTML ?앹꽦
      const fullHTML = generateFullHTML(previewContent, testCase.hotelInfo);
      
      // ?묎렐???뚯뒪??
      const a11yIssues = accessibilityTest(fullHTML);
      accessibilityIssues.push(...a11yIssues.map(issue => `${testCase.name}: ${issue}`));
      
      // ?뚯뒪??寃곌낵 寃利?
      let testPassed = true;
      let issues = [];
      
      // ?명뀛 ?대쫫???덈뒗 寃쎌슦 ?대떦 ?대쫫??HTML???ы븿?섏뼱????
      if (testCase.hotelInfo.name && !fullHTML.includes(testCase.hotelInfo.name)) {
        testPassed = false;
        issues.push('?명뀛 ?대쫫??HTML???ы븿?섏? ?딆쓬');
      }
      
      // ?명뀛 二쇱냼媛 ?덈뒗 寃쎌슦 ?대떦 二쇱냼媛 HTML???ы븿?섏뼱????
      if (testCase.hotelInfo.address && !fullHTML.includes(testCase.hotelInfo.address)) {
        testPassed = false;
        issues.push('?명뀛 二쇱냼媛 HTML???ы븿?섏? ?딆쓬');
      }
      
      // ?명뀛 ?ㅻ챸???덈뒗 寃쎌슦 ?대떦 ?ㅻ챸??HTML???ы븿?섏뼱????
      if (testCase.hotelInfo.description && !fullHTML.includes(testCase.hotelInfo.description)) {
        testPassed = false;
        issues.push('?명뀛 ?ㅻ챸??HTML???ы븿?섏? ?딆쓬');
      }
      
      // 鍮??명뀛 ?뺣낫??寃쎌슦 湲곕낯 硫붿떆吏媛 ?ы븿?섏뼱????
      if (!testCase.hotelInfo.name && !fullHTML.includes('誘몃━蹂닿린 ?댁슜???놁뒿?덈떎')) {
        testPassed = false;
        issues.push('鍮??뺣낫 ??湲곕낯 硫붿떆吏媛 ?쒖떆?섏? ?딆쓬');
      }
      
      if (testPassed) {
        console.log('???뚯뒪???듦낵');
        passedTests++;
      } else {
        console.log('???뚯뒪???ㅽ뙣:', issues.join(', '));
      }
      
      // HTML ?뚯씪濡????
      const filename = `preview-advanced-test-${index + 1}.html`;
      fs.writeFileSync(filename, fullHTML);
      console.log(`?뱞 HTML ?뚯씪 ??λ맖: ${filename}`);
      
    } catch (error) {
      console.log('???뚯뒪???ㅻ쪟:', error.message);
    }
    
    console.log('');
  });
  
  // 理쒖쥌 寃곌낵 ?붿빟
  console.log('?뱤 理쒖쥌 ?뚯뒪??寃곌낵');
  console.log(`   - 湲곕뒫 ?뚯뒪?? ${passedTests}/${totalTests} ?듦낵`);
  console.log(`   - ?깅뒫 ?뚯뒪?? ${performancePassed ? '?듦낵' : '?ㅽ뙣'}`);
  
  if (accessibilityIssues.length > 0) {
    console.log('?좑툘 ?묎렐???댁뒋:');
    accessibilityIssues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log('???묎렐???뚯뒪???듦낵');
  }
  
  const overallPassed = passedTests === totalTests && performancePassed;
  console.log(`\n${overallPassed ? '?럦 紐⑤뱺 ?뚯뒪???듦낵!' : '?좑툘 ?쇰? ?뚯뒪???ㅽ뙣'}`);
  
  return overallPassed;
}

runAdvancedTests(); 
