const { sql } = require('../config/database');

const obtenerProductos = async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query('SELECT * FROM Producto');
    
    res.json({ productos: resultado.recordset });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener productos: ${error.message}` });
  }
};

module.exports = { obtenerProductos };
