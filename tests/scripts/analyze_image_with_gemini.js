require('dotenv').config({ path: '.env.local' }); // .env.local ?�일 로드

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// --- ?�정 --- 
// API ?? ?�경 변??GEMINI_API_KEY ?�서 ?�어??(dotenv�?로드)
const API_KEY = process.env.GEMINI_API_KEY;
// 결과 ?�??경로
const outputDir = path.join(__dirname, 'analysis');
const outputFilePath = path.join(outputDir, 'vision_analysis.txt');
// 분석???��?지 ?�일 경로 (명령�??�수�?받음)
const imagePath = process.argv[2]; 
// --- ?�정 ??---

// ?�일 경로 ?�효??검??
if (!imagePath) {
  console.error('?�류: 분석???��?지 ?�일 경로�?명령�??�수�??�공?�야 ?�니??');
  console.error('?�시: node analyze_image_with_gemini.js screenshots/main-page.png');
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error(`?�류: ?��?지 ?�일??찾을 ???�습?�다 - ${imagePath}`);
  process.exit(1);
}

// API ???�인
if (!API_KEY) {
  console.error('?�류: GEMINI_API_KEY ?�경 변?��? .env.local ?�일?�서 ?�어?��? 못했거나 ?�정?��? ?�았?�니??');
  console.error('API ?��? ?�인?�고 ?�시 ?�도?�세??');
  process.exit(1);
}

// 결과 ?�렉?�리 ?�성 (?�으�?
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ?��?지 ?�일??Base64�??�코?�하???�수
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function runAnalysis() {
  console.log(`?��?지 분석 ?�작: ${imagePath}`);
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ?�롬?�트 ?�정: ?�이?�웃, 미리보기 ?�널 ?�치/?�두�? ?�류 메시지 ?�무�?명확??질문
    const prompt = `?�음 질문???�해주세??
1. ?????�이지???�체?�인 ?�이?�웃 구조??무엇?��??? (?? 좌우 분할, ?�하 분할, ?�일 ?�역 ??
2. ?�이지 ?�른�??�단 근처??주황???�두리�? ?�는 별도??미리보기 ?�널??보이?�요? 만약 보인?�면, �??�치?� ?�기�??�?�적?�로 ?�명?�주?�요.
3. ?�이지???�에 ?�는 ?�류 메시지??모달 창이 ?�시?�어 ?�나??
4. ?��????�소가 ?�다�?구체?�으�??�떤 ?�태?� ?�치?��???`;

    const imageParts = [fileToGenerativePart(imagePath, "image/png")];

    console.log('Gemini Vision API ?�출 �?..');
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const analysisText = response.text();

    console.log('API 분석 ?�료.');
    fs.writeFileSync(outputFilePath, analysisText);
    console.log(`분석 결과 ?�???�료: ${outputFilePath}`);
    console.log('--- 분석 결과 미리보기 ---');
    console.log(analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : '')); // 미리보기 길이 ?�한
    console.log('------------------------');

  } catch (error) {
    console.error('Gemini Vision API 분석 �??�류 발생:', error);
    // ?�류 발생 ??결과 ?�일?�도 기록
    const errorMessage = `Error during analysis: ${error.message}\n${error.stack || ''}`;
    fs.writeFileSync(outputFilePath, errorMessage);
    console.log(`?�류 ?�보 ?�???�료: ${outputFilePath}`);
  }
}

runAnalysis(); 
