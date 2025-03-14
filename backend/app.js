// index.js
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
  .then(() => console.log('Conectado a la base de datos Azure SQL'))
  .catch(err => console.error('Error de conexión:', err));

// Ruta para obtener todas las notas
app.get('/api/notas', async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query('SELECT * FROM Ejemplo');
    res.json(resultado.recordset);
  } catch (error) {
    res.status(500).json({ error: `Error al obtener notas: ${error.message}` });
  }
});

// Ruta para agregar una nueva nota
app.post('/api/notas', async (req, res) => {
  const { nuevaNota } = req.body;
  
  if (!nuevaNota) {
    return res.status(400).json({ error: 'El campo "nuevaNota" es requerido' });
  }

  try {
    const solicitud = new sql.Request();
    await solicitud
      .input('nuevaNota', sql.VarChar, nuevaNota)
      .query('INSERT INTO Ejemplo (nota) VALUES (@nuevaNota)');
    
    res.json({ mensaje: 'Nota agregada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: `Error al agregar nota: ${error.message}` });
  }
});

// Ruta para eliminar una nota
app.delete('/api/notas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const solicitud = new sql.Request();
    await solicitud
      .input('id', sql.Int, id)
      .query('DELETE FROM Ejemplo WHERE id = @id');
    
    res.json({ mensaje: 'Nota eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar nota: ${error.message}` });
  }
});

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PUERTO}`);
});