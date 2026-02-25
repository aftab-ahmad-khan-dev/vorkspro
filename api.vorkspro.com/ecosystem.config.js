// Single MongoDB for all apps — set MONGODB_URI (and MODE) in .env or here.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://aftabahmadkhandev:unchosen8704@personal.0earg.mongodb.net';

module.exports = {
  apps: [
    {
      name: 'vorkspro-api',
      script: './src/index.js',
      cwd: '/var/www/vorkspro-api',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        MODE: 'production',
        PORT: 4000,
        MONGODB_URI
      }
    },
    {
      name: 'vorkspro-tapi',
      script: './src/index.js',
      cwd: '/var/www/vorkspro-tapi',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'test',
        MODE: 'test',
        PORT: 5000,
        MONGODB_URI
      }
    },
    {
      name: 'vorkspro',
      script: './src/index.js',
      cwd: '/var/www/vorkspro',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',
        MODE: 'production',
        PORT: 3000,
        MONGODB_URI
      }
    }
  ]
};