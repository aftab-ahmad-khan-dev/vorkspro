module.exports = {
  apps: [
    {
      name: 'portal-api',
      script: './src/index.js',              // adjust if entry file is different
      cwd: '/var/www/portal-api',
      exec_mode: 'fork',                     // your current mode
      instances: 1,
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        DB_PATH: 'mongodb+srv://chandabdullahnls_db_user:B6TgK7xMTja7vJZH@cluster0.yhks5yj.mongodb.net' 
      }
    },
    {
      name: 'portal-tapi',
      script: './src/index.js',
      cwd: '/var/www/portal-tapi',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'test',                    // or 'production' if needed
        PORT: 5000,                          // different port!
        DB_PATH: 'mongodb+srv://chandabdullahnls_db_user:B6TgK7xMTja7vJZH@cluster0.yhks5yj.mongodb.net'
      }
    },
    {
      name: 'api',
      script: './src/index.js',
      cwd: '/var/www/api',
      exec_mode: 'fork',
      instances: 1,
      env: {
        NODE_ENV: 'production',                    // or 'production' if needed
        PORT: 3000,                          // different port!
        DB_PATH: 'mongodb+srv://nextlevelsoftwaretesting:yAUh61uwVT7sWxa0@nlstesting.ocn6l.mongodb.net' 
      }
    }
  ]
};