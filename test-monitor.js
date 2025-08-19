const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.url === '/api/status') {
    res.end(JSON.stringify({
      connectedClients: 0,
      errorCount: 0,
      status: 'running'
    }));
  } else {
    res.end(JSON.stringify({ message: 'Test monitor server running' }));
  }
});

server.listen(3901, () => {
  console.log('🚀 테스트 모니터링 서버 시작: http://localhost:3901');
});
