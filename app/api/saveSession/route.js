import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'GET') {
        res.setHeader('Allow', ['POST', 'GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    if (req.method === 'GET') {
        return handleGetSession(req, res);
    }

    console.log('[saveSession API] POST 요청 시작');
    try {
        const data = req.body;

        if (!data || Object.keys(data).length === 0) {
            console.error('[saveSession API] 비어있는 요청 데이터');
            return res.status(400).json({
                status: 'error',
                message: 'Empty request data',
            });
        }
        
        console.log(`[saveSession API] 데이터 수신, 데이터 키: ${Object.keys(data).join(', ')}`);
        
        const sessionId = Date.now().toString();
        const sessionData = JSON.stringify({ id: sessionId, ...data });
        
        const dataDir = path.join(process.cwd(), 'data', 'html');
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log(`[saveSession API] 데이터 디렉토리 생성: ${dataDir}`);
        }
        
        const filePath = path.join(dataDir, `session-${sessionId}.json`);
        fs.writeFileSync(filePath, sessionData);
        console.log(`[saveSession API] 세션 파일 저장됨: ${filePath}`);
        
        res.status(200).json({
            status: 'success',
            message: 'Session saved successfully',
            sessionId
        });

    } catch (error) {
        console.error('[saveSession API] 오류 발생:', error);
        
        const errorType = error.name || 'UnknownError';
        const statusCode = error.code === 'ENOENT' ? 404 : 500;
        
        res.status(statusCode).json({
            status: 'error',
            message: 'Failed to save session',
            error: error.message,
            type: errorType
        });
    }
}

async function handleGetSession(req, res) {
    console.log('[saveSession API] GET 요청 시작');
    try {
        const dataDir = path.join(process.cwd(), 'data', 'html');
        
        if (!fs.existsSync(dataDir)) {
            console.log('[saveSession API] 데이터 디렉토리가 존재하지 않음');
            return res.status(404).json({
                status: 'error',
                message: 'No saved sessions found',
            });
        }
        
        const files = fs.readdirSync(dataDir)
            .filter(file => file.endsWith('.json'))
            .sort((a, b) => {
                const aTime = fs.statSync(path.join(dataDir, a)).mtime.getTime();
                const bTime = fs.statSync(path.join(dataDir, b)).mtime.getTime();
                return bTime - aTime; // 최신 파일 먼저
            });
        
        if (files.length === 0) {
            console.log('[saveSession API] 저장된 세션 파일 없음');
            return res.status(404).json({
                status: 'error',
                message: 'No saved sessions found',
            });
        }
        
        // 가장 최근 파일 로드
        const latestFile = files[0];
        const filePath = path.join(dataDir, latestFile);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const sessionData = JSON.parse(fileContent);
        
        console.log(`[saveSession API] 세션 파일 로드됨: ${filePath}`);
        
        res.status(200).json({
            status: 'success',
            message: 'Session loaded successfully',
            sessionId: sessionData.id,
            data: sessionData
        });

    } catch (error) {
        console.error('[saveSession API] GET 오류 발생:', error);
        
        res.status(500).json({
            status: 'error',
            message: 'Failed to load session',
            error: error.message
        });
    }
} 