const sql = require('mssql');
require('dotenv').config();

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

const conectarDB = async () => {
  try {
    await sql.connect(dbConfig);
    console.log('✅ Conexión a la base de datos establecida');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1); // Finaliza la aplicación si no se puede conectar
  }
};

module.exports = { sql, conectarDB };
