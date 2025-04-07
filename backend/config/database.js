require('dotenv').config();
const mysql = require('mysql2/promise');

// Actualizar los logs para usar las nuevas variables
console.log('Database Config:', {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const conectarDB = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false // Necesario para conexiones SSL en Render
      }
    });

    console.log('🔌 Conexión exitosa a la base de datos');
    return connection;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);
  }
};

module.exports = { conectarDB };
