import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const errorData = req.body;
    
    // 서버 콘솔에 오류 출력
    console.error('🚨 클라이언트 오류 감지:', {
      type: errorData.type,
      message: errorData.message || errorData.reason,
      url: errorData.url,
      timestamp: errorData.timestamp,
      stack: errorData.stack
    });

    // 오류 로그 파일에 저장 (선택사항)
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logFile = path.join(logDir, 'client-errors.log');
    const logEntry = `[${errorData.timestamp}] ${errorData.type}: ${errorData.message || errorData.reason}\nURL: ${errorData.url}\nStack: ${errorData.stack}\n---\n`;
    
    fs.appendFileSync(logFile, logEntry);

    res.status(200).json({ message: 'Error logged successfully' });
  } catch (error) {
    console.error('오류 로그 처리 실패:', error);
    res.status(500).json({ message: 'Failed to log error' });
  }
} 