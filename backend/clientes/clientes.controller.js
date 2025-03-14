const { sql } = require('../config/database');

const obtenerTotalClientes = async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query('SELECT COUNT(*) AS total FROM Cliente');
    
    res.json({ totalClientes: resultado.recordset[0].total });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener el número de clientes: ${error.message}` });
  }
};

module.exports = { obtenerTotalClientes };
