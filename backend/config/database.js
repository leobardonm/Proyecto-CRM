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
    enableArithAbort: true,
  },
};

const conectarDB = async () => {
  try {
    await sql.connect(configuracionBD);
    console.log('✅ Conectado a la base de datos SQL Server');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
    process.exit(1); // Finaliza la aplicación si no se puede conectar
  }
};

module.exports = { sql, conectarDB };
