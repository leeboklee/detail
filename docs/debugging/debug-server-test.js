const http = require('http');

// ?쒕쾭 ?곹깭 ?뺤씤 ?⑥닔
function checkServer(port, callback) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`???쒕쾭 ?묐떟: ${res.statusCode}`);
    console.log(`???ㅻ뜑:`, res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      console.log(`???묐떟 ?ш린: ${data.length} bytes`);
      console.log(`??泥?100?? ${data.substring(0, 100)}...`);
      callback(null, { status: res.statusCode, data: data.substring(0, 200) });
    });
  });

  req.on('error', (err) => {
    console.log(`???쒕쾭 ?묒냽 ?ㅽ뙣:`, err.message);
    callback(err, null);
  });

  req.on('timeout', () => {
    console.log(`???쒕쾭 ?묐떟 ??꾩븘??);
    req.destroy();
    callback(new Error('Timeout'), null);
  });

  req.end();
}

// API ?붾뱶?ъ씤???뺤씤
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
      console.log(`??API ${path}: ${res.statusCode}`);
      try {
        const json = JSON.parse(data);
        console.log(`??API ?묐떟:`, json);
        callback(null, json);
      } catch (e) {
        console.log(`??API ?묐떟 ?뚯떛 ?ㅽ뙣:`, e.message);
        callback(e, null);
      }
    });
  });

  req.on('error', (err) => {
    console.log(`??API ${path} ?ㅽ뙣:`, err.message);
    callback(err, null);
  });

  req.on('timeout', () => {
    console.log(`??API ${path} ??꾩븘??);
    req.destroy();
    callback(new Error('Timeout'), null);
  });

  req.end();
}

console.log('?뵇 ?쒕쾭 ?곹깭 ?뺤씤 ?쒖옉...');

// 硫붿씤 ?섏씠吏 ?뺤씤
checkServer( {process.env.PORT || 3900}, (err, result) => {
  if (err) {
    console.log('??硫붿씤 ?쒕쾭 臾몄젣 媛먯?');
  } else {
    console.log('??硫붿씤 ?쒕쾭 ?뺤긽');
    
    // API ?붾뱶?ъ씤?몃뱾 ?뺤씤
    checkAPI( {process.env.PORT || 3900}, '/api/debug-env', (err, result) => {
      if (!err) console.log('??debug-env API ?뺤긽');
    });
    
    checkAPI( {process.env.PORT || 3900}, '/api/hotels', (err, result) => {
      if (!err) console.log('??hotels API ?뺤긽');
    });
  }
}); 
