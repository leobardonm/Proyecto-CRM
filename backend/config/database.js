const sql = require('mssql');
require('dotenv').config();

const configuracionBD = {
  user: process.env.USUARIO_BD,
  password: process.env.CONTRASENA_BD,
  server: process.env.SERVIDOR_BD,
  database: process.env.NOMBRE_BD,
  options: {
    encrypt: true,
    trustServerCertificate: false
  }
};

const conectarDB = async () => {
  try {
    await sql.connect(configuracionBD);
    console.log('✅ Conectado a la base de datos Azure SQL');
  } catch (error) {
    console.error('❌ Error de conexión:', error);
  }
};

module.exports = { sql, conectarDB };
