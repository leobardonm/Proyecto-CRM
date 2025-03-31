const { sql } = require('../config/database');

const obtenerTotalVendedores = async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query(`
      SELECT v.*, e.Nombre as EmpresaNombre
      FROM Vendedor v
      INNER JOIN Empresa e ON v.IdEmpresa = e.IDEmpresa
    `);
    res.json(resultado.recordset);
    
  } catch (error) {
    res.status(500).json({ error: `Error al obtener los vendedores: ${error.message}` });
  }
};

module.exports = { obtenerTotalVendedores };