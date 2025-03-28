const sql = require('mssql');
require('dotenv').config();

const configuracionBD = {
  user: process.env.USUARIO_BD,
  password: process.env.CONTRASENA_BD,
  server: process.env.SERVIDOR_BD,
  database: process.env.NOMBRE_BD,
  port: 1433,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const conectarDB = async () => {
  try {
    await sql.connect(configuracionBD);
    console.log('✅ Conectado a la base de datos SQL Server');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

module.exports = { sql, conectarDB };
