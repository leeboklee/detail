require('dotenv').config({ path: '.env.local' }); // .env.local ?뚯씪 濡쒕뱶

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// --- ?ㅼ젙 --- 
// API ?? ?섍꼍 蹂??GEMINI_API_KEY ?먯꽌 ?쎌뼱??(dotenv濡?濡쒕뱶)
const API_KEY = process.env.GEMINI_API_KEY;
// 寃곌낵 ???寃쎈줈
const outputDir = path.join(__dirname, 'analysis');
const outputFilePath = path.join(outputDir, 'vision_analysis.txt');
// 遺꾩꽍???대?吏 ?뚯씪 寃쎈줈 (紐낅졊以??몄닔濡?諛쏆쓬)
const imagePath = process.argv[2]; 
// --- ?ㅼ젙 ??---

// ?뚯씪 寃쎈줈 ?좏슚??寃??
if (!imagePath) {
  console.error('?ㅻ쪟: 遺꾩꽍???대?吏 ?뚯씪 寃쎈줈瑜?紐낅졊以??몄닔濡??쒓났?댁빞 ?⑸땲??');
  console.error('?덉떆: node analyze_image_with_gemini.js screenshots/main-page.png');
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error(`?ㅻ쪟: ?대?吏 ?뚯씪??李얠쓣 ???놁뒿?덈떎 - ${imagePath}`);
  process.exit(1);
}

// API ???뺤씤
if (!API_KEY) {
  console.error('?ㅻ쪟: GEMINI_API_KEY ?섍꼍 蹂?섎? .env.local ?뚯씪?먯꽌 ?쎌뼱?ㅼ? 紐삵뻽嫄곕굹 ?ㅼ젙?섏? ?딆븯?듬땲??');
  console.error('API ?ㅻ? ?뺤씤?섍퀬 ?ㅼ떆 ?쒕룄?섏꽭??');
  process.exit(1);
}

// 寃곌낵 ?붾젆?좊━ ?앹꽦 (?놁쑝硫?
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ?대?吏 ?뚯씪??Base64濡??몄퐫?⑺븯???⑥닔
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function runAnalysis() {
  console.log(`?대?吏 遺꾩꽍 ?쒖옉: ${imagePath}`);
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ?꾨＼?꾪듃 ?섏젙: ?덉씠?꾩썐, 誘몃━蹂닿린 ?⑤꼸 ?꾩튂/?뚮몢由? ?ㅻ쪟 硫붿떆吏 ?좊Т瑜?紐낇솗??吏덈Ц
    const prompt = `?ㅼ쓬 吏덈Ц???듯빐二쇱꽭??
1. ?????섏씠吏???꾩껜?곸씤 ?덉씠?꾩썐 援ъ“??臾댁뾿?멸??? (?? 醫뚯슦 遺꾪븷, ?곹븯 遺꾪븷, ?⑥씪 ?곸뿭 ??
2. ?섏씠吏 ?ㅻⅨ履??곷떒 洹쇱쿂??二쇳솴???뚮몢由ш? ?덈뒗 蹂꾨룄??誘몃━蹂닿린 ?⑤꼸??蹂댁씠?섏슂? 留뚯빟 蹂댁씤?ㅻ㈃, 洹??꾩튂? ?ш린瑜???듭쟻?쇰줈 ?ㅻ챸?댁＜?몄슂.
3. ?섏씠吏???덉뿉 ?꾨뒗 ?ㅻ쪟 硫붿떆吏??紐⑤떖 李쎌씠 ?쒖떆?섏뼱 ?덈굹??
4. ?뚮????붿냼媛 ?덈떎硫?援ъ껜?곸쑝濡??대뼡 ?뺥깭? ?꾩튂?멸???`;

    const imageParts = [fileToGenerativePart(imagePath, "image/png")];

    console.log('Gemini Vision API ?몄텧 以?..');
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const analysisText = response.text();

    console.log('API 遺꾩꽍 ?꾨즺.');
    fs.writeFileSync(outputFilePath, analysisText);
    console.log(`遺꾩꽍 寃곌낵 ????꾨즺: ${outputFilePath}`);
    console.log('--- 遺꾩꽍 寃곌낵 誘몃━蹂닿린 ---');
    console.log(analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : '')); // 誘몃━蹂닿린 湲몄씠 ?쒗븳
    console.log('------------------------');

  } catch (error) {
    console.error('Gemini Vision API 遺꾩꽍 以??ㅻ쪟 諛쒖깮:', error);
    // ?ㅻ쪟 諛쒖깮 ??寃곌낵 ?뚯씪?먮룄 湲곕줉
    const errorMessage = `Error during analysis: ${error.message}\n${error.stack || ''}`;
    fs.writeFileSync(outputFilePath, errorMessage);
    console.log(`?ㅻ쪟 ?뺣낫 ????꾨즺: ${outputFilePath}`);
  }
}

runAnalysis(); 
