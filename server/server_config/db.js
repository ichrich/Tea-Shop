const mysql = require('mysql2/promise');
const { DB_CONFIG } = require('./config');

let pool;
async function initPool() {
  pool = await mysql.createPool({
    ...DB_CONFIG,
    waitForConnections: true,
    connectionLimit: 10,
  });
    console.log('БД подключена');
}
async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    console.error('Ошибка SQL:', err);
    throw err;
  }
}


module.exports = { initPool, query };