const mysql = require('mysql2/promise');
const { DATABASE_ENABLED, DB_CONFIG } = require('./config');

let pool = null;
let databaseStatus = DATABASE_ENABLED ? 'pending' : 'disabled';

async function initPool() {
  if (!DATABASE_ENABLED) {
    console.log('Database connection is disabled');
    return false;
  }

  pool = mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
    connectTimeout: 10000,
  });

  try {
    await pool.query('SELECT 1');
    databaseStatus = 'connected';
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    databaseStatus = 'unavailable';
    await pool.end().catch(() => {});
    pool = null;
    console.error(`Database is unavailable: ${error.message}`);
    return false;
  }
}

async function query(sql, params) {
  if (!pool) {
    const error = new Error('Database is unavailable');
    error.status = 503;
    throw error;
  }

  const [rows] = await pool.execute(sql, params);
  return rows;
}

function getDatabaseStatus() {
  return databaseStatus;
}

module.exports = { initPool, query, getDatabaseStatus };
