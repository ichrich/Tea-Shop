module.exports = {
  PORT: process.env.PORT || 3000,
  IMAGE_BASE: 'http://localhost:3000/images/',
  JWT_SECRET: process.env.JWT_SECRET || '8fb9bc73fcab141682aca9c8dc2e70a64a8ae267c8cda0a729bfc57a4ea7ff27',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DB_CONFIG: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tea_template',
    port: 3307,
  },
};
