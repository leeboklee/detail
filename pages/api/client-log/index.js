import fs from 'fs';
import path from 'path';

const MAX_LOG_FILES = 50; // 최대 로그 파일 수 제한

// 오래된 로그 파일 정리 함수
function cleanupOldLogs(logDir) {
  try {
    const files = fs.readdirSync(logDir)
      .filter(file => file.startsWith('client-log_'))
      .map(file => ({
        name: file,
        path: path.join(logDir, file),
        time: fs.statSync(path.join(logDir, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // 최신 파일 순으로 정렬

    // 최대 개수를 초과하는 오래된 파일 삭제
    if (files.length > MAX_LOG_FILES) {
      files.slice(MAX_LOG_FILES).forEach(file => {
        try {
          fs.unlinkSync(file.path);
          console.log(`Deleted old log file: ${file.name}`);
        } catch (err) {
          console.error(`Failed to delete log file ${file.name}:`, err);
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up old logs:', error);
  }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const logData = req.body;
        const logDir = path.join(process.cwd(), 'data', 'client_debug_logs');

        // Ensure the directory exists
        if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        }

        // 로그 데이터에 타임스탬프와 사용자 에이전트 추가
        const enhancedLogData = {
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'] || 'Unknown',
        clientIP: req.headers['x-forwarded-for'] || 'Unknown',
        ...logData
        };

        const timestamp = new Date().toISOString().replace(/:/g, '-');
        const filename = `client-log_${timestamp}.json`;
        const filePath = path.join(logDir, filename);

        fs.writeFileSync(filePath, JSON.stringify(enhancedLogData, null, 2));
        
        // 오래된 로그 파일 정리
        cleanupOldLogs(logDir);

        res.status(200).json({ 
            success: true, 
            message: `Log saved to ${filename}`,
            timestamp
        });
    } catch (error) {
        console.error('Failed to write client log:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal Server Error',
            error: error.message 
        });
    }
} 