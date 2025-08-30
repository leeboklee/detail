module.exports = {
  apps: [
    {
      name: 'detail-dev',
      script: 'npm',
      args: 'run dev',
      cwd: '/home/rsvshop/projects/detail',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 3900
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true
    }
  ]
};
