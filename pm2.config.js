module.exports = {
  apps: [
    {
      name: 'vocab-api',
      script: './apps/api/dist/index.js',
      cwd: '.',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'file:./vocab.db',
      },
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
