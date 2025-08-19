import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { level, message, source, timestamp } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 로그 데이터 구성
    const logEntry = {
      timestamp: timestamp || new Date().toISOString(),
      level: level || 'info',
      message,
      source: source || 'unknown',
      localTime: new Date().toLocaleString('ko-KR', { 
        timeZone: 'Asia/Seoul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    // 로그 파일 경로
    const logsDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logsDir, `detail-logs-${new Date().toISOString().slice(0, 10)}.json`);

    // 로그 디렉토리 생성
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // 기존 로그 읽기
    let logs = [];
    if (fs.existsSync(logFile)) {
      try {
        const fileContent = fs.readFileSync(logFile, 'utf8');
        logs = JSON.parse(fileContent);
      } catch (error) {
        console.error('로그 파일 읽기 오류:', error);
        logs = [];
      }
    }

    // 새 로그 추가
    logs.push(logEntry);

    // 최대 1000개 로그 유지
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }

    // 로그 파일 저장
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

    // 콘솔에도 출력
    console.log(`[${logEntry.localTime}] [${logEntry.level.toUpperCase()}] [${logEntry.source}] ${logEntry.message}`);

    res.status(200).json({ 
      success: true, 
      message: '로그가 성공적으로 저장되었습니다.',
      logEntry 
    });

  } catch (error) {
    console.error('로그 수신 오류:', error);
    res.status(500).json({ 
      error: '로그 저장 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
} 