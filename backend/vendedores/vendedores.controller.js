const { sql } = require('../config/database');

const obtenerTotalVendedores = async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query('SELECT * FROM Vendedor');
    res.json({ totalVendedores: resultado.recordset});
    
  } catch (error) {
    res.status(500).json({ error: `Error al obtener el número de vendedores: ${error.message}` });
  }
};

module.exports = { obtenerTotalVendedores };