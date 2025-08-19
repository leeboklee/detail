import os from 'os';

// 간단한 서버 정보 수집
function getBasicServerInfo() {
  return {
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    memory: {
      rss: process.memoryUsage().rss,
      heapTotal: process.memoryUsage().heapTotal,
      heapUsed: process.memoryUsage().heapUsed
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version
    }
  };
}

export default async function handler(req, res) {
    const { method } = req;

    switch (method) {
        case 'GET':
            try {
                const serverInfo = getBasicServerInfo();
                
                const requestInfo = {
                    url: req.url,
                    method: req.method,
                    userAgent: req.headers['user-agent'] || 'Unknown'
                };
                
                res.status(200).json({
                    success: true,
                    message: 'Server debug information',
                    data: {
                        server: serverInfo,
                        request: requestInfo,
                        env: {
                        DATABASE_URL: !!process.env.DATABASE_URL,
                        NODE_ENV: process.env.NODE_ENV || 'development'
                        }
                    }
                });
            } catch (error) {
                console.error('Error in debug-env API:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
            break;

        case 'POST':
            try {
                const { command } = req.body;
                
                console.log('Debug command received:', command);
                
                res.status(200).json({
                    success: true,
                    message: 'Command received',
                    command
                });
            } catch (error) {
                console.error('Error in debug-env POST API:', error);
                res.status(500).json({ 
                    success: false, 
                    error: error.message 
                });
            }
            break;

        default:
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end(`Method ${method} Not Allowed`);
            break;
    }
} 