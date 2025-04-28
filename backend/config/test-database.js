const sql = require('mssql');
require('dotenv').config({ path: '../backend/.env' });

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// Create a test database connection pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

// Export the pool and a function to get a request
module.exports = {
  pool,
  poolConnect,
  getRequest: async () => {
    await poolConnect;
    return pool.request();
  },
  close: async () => {
    await pool.close();
  }
}; 