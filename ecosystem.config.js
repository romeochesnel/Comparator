module.exports = {
  apps: [
    {
      name: 'comparator',
      script: 'dist/server.js',
      interpreter: 'node',
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
    {
      name: 'tunnel',
      script: 'cloudflared',
      args: 'tunnel --url http://localhost:3000',
      interpreter: 'none',
      restart_delay: 5000,
      autorestart: true,
    },
  ],
};
