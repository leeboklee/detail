require('dotenv').config({ path: '.env.local' }); // .env.local ?Œì¼ ë¡œë“œ

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// --- ?¤ì • --- 
// API ?? ?˜ê²½ ë³€??GEMINI_API_KEY ?ì„œ ?½ì–´??(dotenvë¡?ë¡œë“œ)
const API_KEY = process.env.GEMINI_API_KEY;
// ê²°ê³¼ ?€??ê²½ë¡œ
const outputDir = path.join(__dirname, 'analysis');
const outputFilePath = path.join(outputDir, 'vision_analysis.txt');
// ë¶„ì„???´ë?ì§€ ?Œì¼ ê²½ë¡œ (ëª…ë ¹ì¤??¸ìˆ˜ë¡?ë°›ìŒ)
const imagePath = process.argv[2]; 
// --- ?¤ì • ??---

// ?Œì¼ ê²½ë¡œ ? íš¨??ê²€??
if (!imagePath) {
  console.error('?¤ë¥˜: ë¶„ì„???´ë?ì§€ ?Œì¼ ê²½ë¡œë¥?ëª…ë ¹ì¤??¸ìˆ˜ë¡??œê³µ?´ì•¼ ?©ë‹ˆ??');
  console.error('?ˆì‹œ: node analyze_image_with_gemini.js screenshots/main-page.png');
  process.exit(1);
}

if (!fs.existsSync(imagePath)) {
  console.error(`?¤ë¥˜: ?´ë?ì§€ ?Œì¼??ì°¾ì„ ???†ìŠµ?ˆë‹¤ - ${imagePath}`);
  process.exit(1);
}

// API ???•ì¸
if (!API_KEY) {
  console.error('?¤ë¥˜: GEMINI_API_KEY ?˜ê²½ ë³€?˜ë? .env.local ?Œì¼?ì„œ ?½ì–´?¤ì? ëª»í–ˆê±°ë‚˜ ?¤ì •?˜ì? ?Šì•˜?µë‹ˆ??');
  console.error('API ?¤ë? ?•ì¸?˜ê³  ?¤ì‹œ ?œë„?˜ì„¸??');
  process.exit(1);
}

// ê²°ê³¼ ?”ë ‰? ë¦¬ ?ì„± (?†ìœ¼ë©?
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ?´ë?ì§€ ?Œì¼??Base64ë¡??¸ì½”?©í•˜???¨ìˆ˜
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function runAnalysis() {
  console.log(`?´ë?ì§€ ë¶„ì„ ?œì‘: ${imagePath}`);
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // ?„ë¡¬?„íŠ¸ ?˜ì •: ?ˆì´?„ì›ƒ, ë¯¸ë¦¬ë³´ê¸° ?¨ë„ ?„ì¹˜/?Œë‘ë¦? ?¤ë¥˜ ë©”ì‹œì§€ ? ë¬´ë¥?ëª…í™•??ì§ˆë¬¸
    const prompt = `?¤ìŒ ì§ˆë¬¸???µí•´ì£¼ì„¸??
1. ?????˜ì´ì§€???„ì²´?ì¸ ?ˆì´?„ì›ƒ êµ¬ì¡°??ë¬´ì—‡?¸ê??? (?? ì¢Œìš° ë¶„í• , ?í•˜ ë¶„í• , ?¨ì¼ ?ì—­ ??
2. ?˜ì´ì§€ ?¤ë¥¸ìª??ë‹¨ ê·¼ì²˜??ì£¼í™©???Œë‘ë¦¬ê? ?ˆëŠ” ë³„ë„??ë¯¸ë¦¬ë³´ê¸° ?¨ë„??ë³´ì´?˜ìš”? ë§Œì•½ ë³´ì¸?¤ë©´, ê·??„ì¹˜?€ ?¬ê¸°ë¥??€?µì ?¼ë¡œ ?¤ëª…?´ì£¼?¸ìš”.
3. ?˜ì´ì§€???ˆì— ?„ëŠ” ?¤ë¥˜ ë©”ì‹œì§€??ëª¨ë‹¬ ì°½ì´ ?œì‹œ?˜ì–´ ?ˆë‚˜??
4. ?Œë????”ì†Œê°€ ?ˆë‹¤ë©?êµ¬ì²´?ìœ¼ë¡??´ë–¤ ?•íƒœ?€ ?„ì¹˜?¸ê???`;

    const imageParts = [fileToGenerativePart(imagePath, "image/png")];

    console.log('Gemini Vision API ?¸ì¶œ ì¤?..');
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const analysisText = response.text();

    console.log('API ë¶„ì„ ?„ë£Œ.');
    fs.writeFileSync(outputFilePath, analysisText);
    console.log(`ë¶„ì„ ê²°ê³¼ ?€???„ë£Œ: ${outputFilePath}`);
    console.log('--- ë¶„ì„ ê²°ê³¼ ë¯¸ë¦¬ë³´ê¸° ---');
    console.log(analysisText.substring(0, 500) + (analysisText.length > 500 ? '...' : '')); // ë¯¸ë¦¬ë³´ê¸° ê¸¸ì´ ?œí•œ
    console.log('------------------------');

  } catch (error) {
    console.error('Gemini Vision API ë¶„ì„ ì¤??¤ë¥˜ ë°œìƒ:', error);
    // ?¤ë¥˜ ë°œìƒ ??ê²°ê³¼ ?Œì¼?ë„ ê¸°ë¡
    const errorMessage = `Error during analysis: ${error.message}\n${error.stack || ''}`;
    fs.writeFileSync(outputFilePath, errorMessage);
    console.log(`?¤ë¥˜ ?•ë³´ ?€???„ë£Œ: ${outputFilePath}`);
  }
}

runAnalysis(); 
