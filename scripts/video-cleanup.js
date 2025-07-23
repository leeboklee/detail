#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧹 비디오 파일 자동 정리 시작...');

// 설정
const VIDEO_DIR = 'test-results';
const MAX_AGE_HOURS = 3; // 3시간 이상 된 파일 삭제
const MAX_FILES = 50; // 최대 50개 파일 유지

function cleanupVideos() {
  try {
    if (!fs.existsSync(VIDEO_DIR)) {
      console.log('📁 test-results 폴더가 없습니다.');
      return;
    }

    const files = fs.readdirSync(VIDEO_DIR)
      .filter(file => file.endsWith('.webm') || file.endsWith('.mp4'))
      .map(file => {
        const filePath = path.join(VIDEO_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          created: stats.birthtime,
          size: stats.size
        };
      })
      .sort((a, b) => b.created - a.created); // 최신 파일부터 정렬

    console.log(`📹 발견된 비디오 파일: ${files.length}개`);

    let deletedCount = 0;
    const now = new Date();

    // 1. 오래된 파일 삭제 (24시간 이상)
    files.forEach(file => {
      const ageHours = (now - file.created) / (1000 * 60 * 60);
      if (ageHours > MAX_AGE_HOURS) {
        fs.unlinkSync(file.path);
        console.log(`🗑️ 삭제됨 (오래됨): ${file.name} (${ageHours.toFixed(1)}시간 전)`);
        deletedCount++;
      }
    });

    // 2. 파일 개수 제한 (최신 50개만 유지)
    if (files.length - deletedCount > MAX_FILES) {
      const filesToDelete = files.slice(MAX_FILES);
      filesToDelete.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`🗑️ 삭제됨 (개수 제한): ${file.name}`);
          deletedCount++;
        }
      });
    }

    // 3. 용량 정보 출력
    const remainingFiles = fs.readdirSync(VIDEO_DIR)
      .filter(file => file.endsWith('.webm') || file.endsWith('.mp4'));
    
    const totalSize = remainingFiles.reduce((total, file) => {
      const stats = fs.statSync(path.join(VIDEO_DIR, file));
      return total + stats.size;
    }, 0);

    console.log(`✅ 정리 완료!`);
    console.log(`📊 남은 파일: ${remainingFiles.length}개`);
    console.log(`💾 총 용량: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ 정리 중 오류:', error.message);
  }
}

// 스케줄러 설정 (선택사항)
function setupScheduler() {
  console.log('⏰ 자동 정리 스케줄러 설정...');
  
  // 매일 자정에 실행하는 스케줄 설정
  const schedule = require('node-cron');
  
  schedule.schedule('0 0 * * *', () => {
    console.log('🕛 자동 정리 실행 중...');
    cleanupVideos();
  });
  
  console.log('✅ 매일 자정에 자동 정리 설정됨');
}

// 메인 실행
if (require.main === module) {
  cleanupVideos();
  
  // 스케줄러 설정 (선택사항)
  if (process.argv.includes('--schedule')) {
    setupScheduler();
  }
}

module.exports = { cleanupVideos }; 