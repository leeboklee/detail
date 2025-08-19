const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.cwd(), 'data', 'client_debug_logs');
const HTML_DIR = path.join(process.cwd(), 'data', 'html');
const RETENTION_DAYS = 7; // 7일보다 오래된 파일 삭제

function cleanupDirectory(dir, retentionDays) {
    if (!fs.existsSync(dir)) {
        console.log(`디렉터리가 존재하지 않습니다: ${dir}`);
        return;
    }

    const now = new Date();
    const retentionMillis = retentionDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    const files = fs.readdirSync(dir);
    console.log(`${dir} 에서 ${files.length}개의 파일을 찾았습니다.`);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        try {
            const stats = fs.statSync(filePath);
            const fileAge = now.getTime() - stats.mtime.getTime();

            if (fileAge > retentionMillis) {
                fs.unlinkSync(filePath);
                deletedCount++;
                if (deletedCount % 100 === 0) {
                    process.stdout.write(`\r삭제된 파일 수: ${deletedCount}...`);
                }
            }
        } catch (err) {
            console.error(`${file} 파일 처리 중 오류 발생:`, err);
        }
    });
    
    process.stdout.write(`\r삭제된 파일 수: ${deletedCount}... 완료.\n`);
    console.log(`${dir} 에서 ${deletedCount}개의 오래된 파일을 삭제했습니다.`);
}

function main() {
    console.log('오래된 로그 및 HTML 파일 정리를 시작합니다...');
    console.log(`보관 기간: ${RETENTION_DAYS}일`);
    
    console.log('\n--- 클라이언트 로그 정리 ---');
    cleanupDirectory(LOG_DIR, RETENTION_DAYS);
    
    console.log('\n--- HTML 세션 파일 정리 ---');
    cleanupDirectory(HTML_DIR, RETENTION_DAYS);
    
    console.log('\n정리 작업이 완료되었습니다.');
}

main(); 