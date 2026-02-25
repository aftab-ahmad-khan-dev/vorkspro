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
        PORT: 4000,
        DB_PATH: 'mongodb+srv://user:password@cluster.mongodb.net'  // Replace with your MongoDB URI
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
        PORT: 5000,
        DB_PATH: 'mongodb+srv://user:password@cluster.mongodb.net'  // Replace with your MongoDB URI
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
        PORT: 3000,
        DB_PATH: 'mongodb+srv://user:password@cluster.mongodb.net'  // Replace with your MongoDB URI
      }
    }
  ]
};