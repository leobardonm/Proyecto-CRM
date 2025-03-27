const { sql } = require('../config/database');

const obtenerClientes = async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query('SELECT * FROM Cliente');
    
    res.json({ cliente: resultado.recordset });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener Clientes: ${error.message}` });
  }
};

module.exports = { obtenerClientes };