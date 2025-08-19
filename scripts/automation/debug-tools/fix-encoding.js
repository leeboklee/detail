const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', 'loading.js');

try {
  // 파일 내용을 버퍼로 읽어옵니다.
  const content = fs.readFileSync(filePath);
  
  // 버퍼를 UTF-8 문자열로 변환하여 다시 저장합니다.
  fs.writeFileSync(filePath, content.toString('utf8'), 'utf8');
  
  console.log(`Successfully fixed encoding for: ${filePath}`);
} catch (error) {
  console.error(`Error fixing encoding for ${filePath}:`, error);
  process.exit(1);
} 