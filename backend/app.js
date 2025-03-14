const express = require('express');
const cors = require('cors');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PUERTO = process.env.PUERTO || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de la base de datos
const configuracionBD = {
  user: process.env.USUARIO_BD,
  password: process.env.CONTRASENA_BD,
  server: process.env.SERVIDOR_BD,
  database: process.env.NOMBRE_BD,
  options: {
    encrypt: true, // Necesario para Azure SQL
    trustServerCertificate: false // Validar certificado SSL
  }
};

// Conectar a la base de datos
sql.connect(configuracionBD)
  .then(() => console.log('✅ Conectado a la base de datos Azure SQL'))
  .catch(err => console.error('❌ Error de conexión:', err));

// 📌 Ruta para obtener el número total de clientes
app.get('/api/clientes/count', async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query('SELECT COUNT(*) AS total FROM Cliente');
    
    res.json({ totalClientes: resultado.recordset[0].total });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener el número de clientes: ${error.message}` });
  }
});

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PUERTO}`);
});
