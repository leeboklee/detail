// Node.js: 이미지 파일을 base64로 변환해 .md 문서로 저장
// 사용법: node image-to-md.js [이미지경로] [출력md경로]
// 예시: node image-to-md.js public/screenshot-20250723_154358.png docs/screenshot.md

const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('사용법: node image-to-md.js [이미지경로] [출력md경로]');
  process.exit(1);
}

const imgPath = process.argv[2];
const mdPath = process.argv[3];
const absImgPath = path.resolve(imgPath);
const absMdPath = path.resolve(mdPath);

if (!fs.existsSync(absImgPath)) {
  console.error('이미지 파일이 존재하지 않습니다:', absImgPath);
  process.exit(1);
}

const imgBuffer = fs.readFileSync(absImgPath);
const ext = path.extname(imgPath).replace('.', '') || 'png';
const base64 = imgBuffer.toString('base64');
const base64String = `data:image/${ext};base64,${base64}`;

const mdContent = `# 이미지 분석 문서

- 원본 파일: \\${imgPath}
- 생성일: ${new Date().toLocaleString()}

## 이미지 미리보기

![screenshot](data:image/${ext};base64,${base64})

## Base64 데이터



## 분석/메모

- (여기에 AI 분석 결과, 이슈, 개선점 등 기록)
`;

fs.writeFileSync(absMdPath, mdContent);
console.log('이미지 base64가 포함된 .md 문서가 생성되었습니다:', absMdPath); 