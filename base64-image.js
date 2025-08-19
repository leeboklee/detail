// Node.js: 이미지 파일을 base64로 변환해 클립보드에 복사
// 사용법: node base64-image.js [이미지경로]
// 예시: node base64-image.js public/screenshot-20250723_154358.png

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (process.argv.length < 3) {
  console.error('이미지 경로를 입력하세요. 예: node base64-image.js public/파일.png');
  process.exit(1);
}

const imgPath = process.argv[2];
const absPath = path.resolve(imgPath);

if (!fs.existsSync(absPath)) {
  console.error('파일이 존재하지 않습니다:', absPath);
  process.exit(1);
}

const imgBuffer = fs.readFileSync(absPath);
const base64 = imgBuffer.toString('base64');
const ext = path.extname(imgPath).replace('.', '') || 'png';
const base64String = `data:image/${ext};base64,${base64}`;

// 클립보드 복사 (윈도우/맥/리눅스 지원)
function copyToClipboard(str) {
  try {
    if (process.platform === 'win32') {
      const temp = path.join(require('os').tmpdir(), 'img64.txt');
      fs.writeFileSync(temp, str);
      execSync(`type ${temp} | clip`);
      fs.unlinkSync(temp);
    } else if (process.platform === 'darwin') {
      execSync(`echo "${str.replace(/"/g, '\"')}" | pbcopy`);
    } else {
      execSync(`echo "${str.replace(/"/g, '\"')}" | xclip -selection clipboard`);
    }
    console.log('base64 문자열이 클립보드에 복사되었습니다!');
  } catch (e) {
    console.error('클립보드 복사 실패:', e.message);
    console.log('아래 base64 문자열을 직접 복사하세요:');
    console.log(base64String);
  }
}

copyToClipboard(base64String); 