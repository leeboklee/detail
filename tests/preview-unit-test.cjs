// 誘몃━蹂닿린 湲곕뒫 ?⑥쐞 ?뚯뒪??
const fs = require('fs');
const path = require('path');

// 誘몃━蹂닿린 HTML ?앹꽦 ?⑥닔 (Preview 而댄룷?뚰듃 濡쒖쭅 蹂듭궗)
function generatePreviewHTML(hotelInfo, selectedTemplate, templates) {
  if (!hotelInfo || !hotelInfo.name) {
    return '<div style="padding: 20px; color: #666;">誘몃━蹂닿린 ?댁슜???놁뒿?덈떎.</div>';
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
  
  // 湲곕낯 HTML ?앹꽦
  return `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: #333; margin-bottom: 10px;">${hotelInfo.name || '?명뀛紐?}</h1>
      ${hotelInfo.subtitle ? `<h2 style="color: #666; margin-bottom: 10px;">${hotelInfo.subtitle}</h2>` : ''}
      ${hotelInfo.address ? `<p style="color: #888; margin-bottom: 15px;">${hotelInfo.address}</p>` : ''}
      ${hotelInfo.description ? `<p style="line-height: 1.6;">${hotelInfo.description}</p>` : ''}
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
          body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .hotel-container { padding: 20px; }
          .hotel-header { margin-bottom: 20px; }
          .hotel-modern { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; }
          .hotel-classic { background: #f8f9fa; border: 2px solid #dee2e6; padding: 25px; }
          .hotel-minimal { padding: 20px; background: white; }
        </style>
      </head>
      <body>
        ${previewContent}
      </body>
    </html>
  `;
}

// ?뚯뒪??耳?댁뒪??
const testCases = [
  {
    name: '湲곕낯 ?명뀛 ?뺣낫 (?쒗뵆由??ъ슜)',
    hotelInfo: {
      name: '?뚯뒪???명뀛',
      address: '?쒖슱??媛뺣궓援??뚯뒪?몃줈 123',
      description: '?뚯뒪?몄슜 ?명뀛?낅땲??'
    },
    selectedTemplate: 'default',
    templates: {
      default: `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #333; margin-bottom: 10px;">{{hotelName}}</h1>
          <p style="color: #888; margin-bottom: 15px;">{{hotelAddress}}</p>
          <p style="line-height: 1.6;">{{hotelDescription}}</p>
        </div>
      `
    }
  },
  {
    name: '鍮??명뀛 ?뺣낫',
    hotelInfo: {},
    selectedTemplate: 'default',
    templates: {}
  },
  {
    name: '?쒗뵆由??ъ슜 (??뀛由?',
    hotelInfo: {
      name: '??뀛由??명뀛',
      subtitle: '理쒓퀬湲??명뀛',
      address: '?쒖슱??媛뺣궓援???뀛由щ줈 456',
      description: '理쒓퀬湲??쒕퉬?ㅻ? ?쒓났?섎뒗 ??뀛由??명뀛?낅땲??'
    },
    selectedTemplate: 'luxury',
    templates: {
      luxury: `
        <div class="hotel-modern">
          <h1>{{hotelName}}</h1>
          <h2>{{hotelSubtitle}}</h2>
          <p>{{hotelAddress}}</p>
          <p>{{hotelDescription}}</p>
        </div>
      `
    }
  },
  {
    name: '湲곕낯 ?명뀛 ?뺣낫 (湲곕낯 HTML ?ъ슜)',
    hotelInfo: {
      name: '湲곕낯 ?명뀛',
      address: '?쒖슱??媛뺣궓援?湲곕낯濡?789',
      description: '湲곕낯 HTML???ъ슜?섎뒗 ?명뀛?낅땲??'
    },
    selectedTemplate: 'nonexistent',
    templates: {}
  }
];

// ?뚯뒪???ㅽ뻾
function runTests() {
  console.log('?? 誘몃━蹂닿린 ?⑥쐞 ?뚯뒪???쒖옉...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  testCases.forEach((testCase, index) => {
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
      const filename = `preview-test-${index + 1}.html`;
      fs.writeFileSync(filename, fullHTML);
      console.log(`?뱞 HTML ?뚯씪 ??λ맖: ${filename}`);
      
    } catch (error) {
      console.log('???뚯뒪???ㅻ쪟:', error.message);
    }
    
    console.log('');
  });
  
  console.log(`?뱤 ?뚯뒪??寃곌낵: ${passedTests}/${totalTests} ?듦낵`);
  
  if (passedTests === totalTests) {
    console.log('?럦 紐⑤뱺 ?뚯뒪???듦낵!');
  } else {
    console.log('?좑툘 ?쇰? ?뚯뒪???ㅽ뙣');
  }
}

runTests(); 
