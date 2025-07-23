const http = require('http');

// 서버 상태 확인 함수
function checkServer(port, callback) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✓ 서버 응답: ${res.statusCode}`);
    console.log(`✓ 헤더:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✓ 응답 크기: ${data.length} bytes`);
      console.log(`✓ 첫 100자: ${data.substring(0, 100)}...`);
      callback(null, { status: res.statusCode, data: data.substring(0, 200) });
    });
  });

  req.on('error', (err) => {
    console.log(`✗ 서버 접속 실패:`, err.message);
    callback(err, null);
  });

  req.on('timeout', () => {
    console.log(`✗ 서버 응답 타임아웃`);
    req.destroy();
    callback(new Error('Timeout'), null);
  });

  req.end();
}

// API 엔드포인트 확인
function checkAPI(port, path, callback) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: path,
    method: 'GET',
    timeout: 3000
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`✓ API ${path}: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log(`✓ API 응답:`, json);
        callback(null, json);
      } catch (e) {
        console.log(`✗ API 응답 파싱 실패:`, e.message);
        callback(e, null);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`✗ API ${path} 실패:`, err.message);
    callback(err, null);
  });

  req.on('timeout', () => {
    console.log(`✗ API ${path} 타임아웃`);
    req.destroy();
    callback(new Error('Timeout'), null);
  });

  req.end();
}

console.log('🔍 서버 상태 확인 시작...');

// 메인 페이지 확인
checkServer( {process.env.PORT || 34343}, (err, result) => {
  if (err) {
    console.log('❌ 메인 서버 문제 감지');
  } else {
    console.log('✅ 메인 서버 정상');
    
    // API 엔드포인트들 확인
    checkAPI( {process.env.PORT || 34343}, '/api/debug-env', (err, result) => {
      if (!err) console.log('✅ debug-env API 정상');
    });
    
    checkAPI( {process.env.PORT || 34343}, '/api/hotels', (err, result) => {
      if (!err) console.log('✅ hotels API 정상');
    });
  }
}); 