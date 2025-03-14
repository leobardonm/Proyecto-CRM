const { sql } = require('../config/database');

const obtenerTotalNegociacion = async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query('SELECT COUNT(*) AS total FROM Negociacion');
    
    res.json({ totalNegociacion: resultado.recordset[0].total });
  } catch (error) {
    res.status(500).json({ error: `Error al obtener el número de negociaciones: ${error.message}` });
  }
};

module.exports = { obtenerTotalNegociacion };
