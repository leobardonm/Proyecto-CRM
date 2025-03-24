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

const obtenerNegociaciones = async (req, res) => {
  try {
    const solicitud = new sql.Request();
    const resultado = await solicitud.query(`
      SELECT 
        n.ID,
        n.FechaInicio,
        e.Descripcion as Estado,
        v.Nombre as Vendedor,
        c.Nombre as Cliente,
        p.Descripcion as Producto,
        p.Precio as PrecioProducto
      FROM Negociacion n
      INNER JOIN Estado e ON n.EstadoID = e.ID
      INNER JOIN Vendedor v ON n.VendedorID = v.ID
      LEFT JOIN NegociacionProducto np ON n.ID = np.NegociacionID
      LEFT JOIN Producto p ON np.ProductoID = p.ID
      LEFT JOIN ClienteVendedor cv ON v.ID = cv.VendedorID
      LEFT JOIN Cliente c ON cv.ClienteID = c.ID
      ORDER BY n.FechaInicio DESC
    `);
    
    res.json(resultado.recordset);
  } catch (error) {
    res.status(500).json({ error: `Error al obtener las negociaciones: ${error.message}` });
  }
};

const actualizarNegociacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { estadoId, vendedorId, fechaInicio } = req.body;

    const solicitud = new sql.Request();
    const resultado = await solicitud
      .input('id', sql.Int, id)
      .input('estadoId', sql.Int, estadoId)
      .input('vendedorId', sql.Int, vendedorId)
      .input('fechaInicio', sql.Date, fechaInicio)
      .query(`
        UPDATE Negociacion 
        SET EstadoID = @estadoId,
            VendedorID = @vendedorId,
            FechaInicio = @fechaInicio
        WHERE ID = @id
      `);

    if (resultado.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Negociación no encontrada' });
    }

    res.json({ message: 'Negociación actualizada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: `Error al actualizar la negociación: ${error.message}` });
  }
};

const eliminarNegociacion = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero eliminar los registros relacionados en NegociacionProducto
    const solicitudProductos = new sql.Request();
    await solicitudProductos
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM NegociacionProducto
        WHERE NegociacionID = @id
      `);

    // Luego eliminar la negociación
    const solicitud = new sql.Request();
    const resultado = await solicitud
      .input('id', sql.Int, id)
      .query(`
        DELETE FROM Negociacion
        WHERE ID = @id
      `);

    if (resultado.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Negociación no encontrada' });
    }

    res.json({ message: 'Negociación eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ error: `Error al eliminar la negociación: ${error.message}` });
  }
};

const crearNegociacion = async (req, res) => {
  try {
    const { estadoId, vendedorId, fechaInicio, productos } = req.body;

    const solicitud = new sql.Request();
    const resultado = await solicitud
      .input('estadoId', sql.Int, estadoId)
      .input('vendedorId', sql.Int, vendedorId)
      .input('fechaInicio', sql.Date, fechaInicio)
      .query(`
        INSERT INTO Negociacion (EstadoID, VendedorID, FechaInicio)
        OUTPUT INSERTED.ID
        VALUES (@estadoId, @vendedorId, @fechaInicio)
      `);

    const negociacionId = resultado.recordset[0].ID;

    // Insertar productos asociados
    if (productos && productos.length > 0) {
      const solicitudProductos = new sql.Request();
      for (const productoId of productos) {
        await solicitudProductos
          .input('negociacionId', sql.Int, negociacionId)
          .input('productoId', sql.Int, productoId)
          .query(`
            INSERT INTO NegociacionProducto (NegociacionID, ProductoID)
            VALUES (@negociacionId, @productoId)
          `);
      }
    }

    res.status(201).json({ 
      message: 'Negociación creada exitosamente',
      id: negociacionId 
    });
  } catch (error) {
    res.status(500).json({ error: `Error al crear la negociación: ${error.message}` });
  }
};

module.exports = { 
  obtenerTotalNegociacion,
  obtenerNegociaciones,
  actualizarNegociacion,
  eliminarNegociacion,
  crearNegociacion
};
