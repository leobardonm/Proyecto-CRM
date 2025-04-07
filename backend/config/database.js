require('dotenv').config(); // Asegúrate de que esta línea esté al principio
const sql = require('mssql');

console.log('USUARIO_BD:', process.env.USUARIO_BD);
console.log('CONTRASENA_BD:', process.env.CONTRASENA_BD);
console.log('SERVIDOR_BD:', process.env.SERVIDOR_BD);
console.log('NOMBRE_BD:', process.env.NOMBRE_BD);

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
