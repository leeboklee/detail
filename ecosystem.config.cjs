module.exports = {
  apps: [
    {
      name: 'detail-app',
      script: 'node_modules/.bin/next',
      args: 'dev -p 3900',
      cwd: './',
      instances: 1,
      // 백그라운드 실행 방지
      // autorestart: true,
      watch: false,
      // 메모리 제한을 적절한 크기로 설정
      max_memory_restart: '2G',
      env: {
        NODE_ENV: 'development',
        PORT: 3900,
        NODE_OPTIONS: '--max-old-space-size=4096'
      },
      // 로그 파일 경로 제거 (포그라운드 출력)
      // error_file: './logs/err.log',
      // out_file: './logs/out.log',
      // log_file: './logs/combined.log',
      time: true,
      // 종료 타임아웃 제거 (포그라운드 실행)
      // kill_timeout: 5000,
      // wait_ready: true,
      // listen_timeout: 10000
    }
  ]
}; 