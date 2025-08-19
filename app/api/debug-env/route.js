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
			heapUsed: process.memoryUsage().heapUsed,
		},
		system: {
			platform: os.platform(),
			arch: os.arch(),
			nodeVersion: process.version,
		},
	};
}

export async function GET(request) {
	try {
		const serverInfo = getBasicServerInfo();
		const { headers, url, method } = request;
		const requestInfo = {
			url,
			method,
			userAgent: headers.get('user-agent') || 'Unknown',
		};
		return Response.json({
			success: true,
			message: 'Server debug information',
			data: {
				server: serverInfo,
				request: requestInfo,
				env: {
					DATABASE_URL: !!process.env.DATABASE_URL,
					NODE_ENV: process.env.NODE_ENV || 'development',
				},
			},
		});
	} catch (error) {
		console.error('Error in debug-env API:', error);
		return Response.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		const { command } = await request.json();
		console.log('Debug command received:', command);
		return Response.json({ success: true, message: 'Command received', command });
	} catch (error) {
		console.error('Error in debug-env POST API:', error);
		return Response.json({ success: false, error: error.message }, { status: 500 });
	}
} 