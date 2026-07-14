const isProduction = process.env.NODE_ENV === 'production';
const hasRemoteDatabase = Boolean(process.env.DB_HOST);

module.exports = {
  PORT: Number(process.env.PORT) || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  JWT_SECRET: process.env.JWT_SECRET || 'local-development-secret-change-me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  DATABASE_ENABLED:
    process.env.DATABASE_ENABLED === 'true' ||
    (process.env.DATABASE_ENABLED !== 'false' && (!isProduction || hasRemoteDatabase)),
  DB_CONFIG: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'tea_template',
    port: Number(process.env.DB_PORT) || 3307,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  },
};
