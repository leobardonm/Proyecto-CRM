const { sql } = require('../config/database');

const obtenerTotalClientes = async (req, res) => {
  try {
    const solicitud = new sql.Request(); // Create a new Request instance
    const resultado = await solicitud.query('SELECT COUNT(*) as total FROM Cliente');
    res.status(200).json({ totalClientes: resultado.recordset[0].total });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener el número de clientes: ${error.message}` });
  }
};

module.exports = { obtenerTotalClientes };