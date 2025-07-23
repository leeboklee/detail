#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_PORT = 'process.env.PORT || 34343';
const REPLACE_EXPR = 'process.env.PORT || 34343';
const FILE_EXT = '.js';
const EXCLUDE_DIRS = [
  'node_modules', '.next', '.cache', '.git', 'generated', 'playwright-report', 'test-results', 'screenshots', 'videos', '__mocks__',
  '.bak', '.backup', '.temp', '.d.ts', '.map', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.css', '.html', '.md', '.json', '.lock', '.env', '.bat', '.ps1', '.cjs', '.ts', '.tsx'
];

const isVerbose = process.argv.includes('--verbose');

function shouldExclude(filePath) {
  return EXCLUDE_DIRS.some(dir => filePath.includes(dir));
}

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes(TARGET_PORT)) return false;
  const replaced = content.replace(new RegExp(`http://localhost:${TARGET_PORT}`, 'g'), `http://localhost:${REPLACE_EXPR}`)
    .replace(new RegExp(TARGET_PORT, 'g'), REPLACE_EXPR);
  if (content !== replaced) {
    fs.writeFileSync(filePath, replaced, 'utf8');
    return true;
  }
  return false;
}

function walk(dir) {
  let changed = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (shouldExclude(fullPath)) return;
    if (fs.statSync(fullPath).isDirectory()) {
      changed = changed.concat(walk(fullPath));
    } else if (file.endsWith(FILE_EXT)) {
      if (replaceInFile(fullPath)) changed.push(fullPath);
    }
  });
  return changed;
}

function ensureGitRepo(root) {
  if (!fs.existsSync(path.join(root, '.git'))) {
    try {
      execSync('git init', { cwd: root });
      execSync('git config user.email "auto@replace.com"', { cwd: root });
      execSync('git config user.name "auto-replace-bot"', { cwd: root });
      console.log('git 저장소 자동 초기화 완료');
    } catch (e) {
      console.log('git 저장소 초기화 실패');
    }
  }
}

const root = path.resolve(__dirname, '..');
const changedFiles = walk(root);

if (changedFiles.length) {
  console.log('변경된 파일:');
  changedFiles.forEach(f => console.log(f));
  ensureGitRepo(root);
  try {
    execSync('git add .', { cwd: root });
    execSync('git commit -m "auto: 포트 치환 일괄 적용"', { cwd: root });
    console.log('자동 커밋 완료');
  } catch (e) {
    console.log('git add/commit 실패');
  }
  if (isVerbose) {
    try {
      const diff = execSync('git diff HEAD~1', { encoding: 'utf8', cwd: root });
      console.log('\n[git diff 결과]\n');
      console.log(diff);
    } catch (e) {
      console.log('git diff 실행 실패');
    }
  }
} else {
  console.log('변경 사항 없음');
} 