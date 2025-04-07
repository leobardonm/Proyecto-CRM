const { sql } = require('../config/database');

class NegociacionRepository {
  async findAll() {
    try {
      const result = await sql.query`
        SELECT n.*, c.Nombre as ClienteNombre, v.Nombre as VendedorNombre, e.Descripcion as EstadoDescripcion
        FROM Negociacion n
        LEFT JOIN Cliente c ON n.ClienteId = c.Id
        LEFT JOIN Vendedor v ON n.VendedorId = v.Id
        LEFT JOIN Estado e ON n.EstadoId = e.Id
      `;
      return result.recordset;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await sql.query`
        SELECT n.*, c.Nombre as ClienteNombre, v.Nombre as VendedorNombre, e.Descripcion as EstadoDescripcion
        FROM Negociacion n
        LEFT JOIN Cliente c ON n.ClienteId = c.Id
        LEFT JOIN Vendedor v ON n.VendedorId = v.Id
        LEFT JOIN Estado e ON n.EstadoId = e.Id
        WHERE n.Id = ${id}
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async create(negociacionData) {
    try {
      const { ClienteId, VendedorId, EstadoId, Monto } = negociacionData;
      const result = await sql.query`
        INSERT INTO Negociacion (ClienteId, VendedorId, EstadoId, Monto)
        OUTPUT INSERTED.*
        VALUES (${ClienteId}, ${VendedorId}, ${EstadoId}, ${Monto})
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, negociacionData) {
    try {
      const { ClienteId, VendedorId, EstadoId, Monto } = negociacionData;
      const result = await sql.query`
        UPDATE Negociacion
        SET ClienteId = ${ClienteId}, VendedorId = ${VendedorId}, EstadoId = ${EstadoId}, Monto = ${Monto}
        OUTPUT INSERTED.*
        WHERE Id = ${id}
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const result = await sql.query`DELETE FROM Negociacion WHERE Id = ${id}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async findByCliente(clienteId) {
    return await Negociacion.find({ cliente: clienteId })
      .populate('cliente')
      .populate('vendedor')
      .populate('estado')
      .populate('productos.producto')
      .sort({ fechaInicio: -1 });
  }

  async findByVendedor(vendedorId) {
    return await Negociacion.find({ vendedor: vendedorId })
      .populate('cliente')
      .populate('vendedor')
      .populate('estado')
      .populate('productos.producto')
      .sort({ fechaInicio: -1 });
  }

  async findByEstado(estadoId) {
    return await Negociacion.find({ estado: estadoId })
      .populate('cliente')
      .populate('vendedor')
      .populate('estado')
      .populate('productos.producto')
      .sort({ fechaInicio: -1 });
  }

  async updateEstado(id, estadoId) {
    return await Negociacion.findByIdAndUpdate(
      id,
      { estado: estadoId },
      { new: true }
    )
      .populate('cliente')
      .populate('vendedor')
      .populate('estado')
      .populate('productos.producto');
  }

  async addProducto(id, productoData) {
    return await Negociacion.findByIdAndUpdate(
      id,
      { $push: { productos: productoData } },
      { new: true }
    )
      .populate('cliente')
      .populate('vendedor')
      .populate('estado')
      .populate('productos.producto');
  }

  async updateProducto(negociacionId, productoId, productoData) {
    return await Negociacion.findOneAndUpdate(
      { _id: negociacionId, 'productos._id': productoId },
      { $set: { 'productos.$': productoData } },
      { new: true }
    )
      .populate('cliente')
      .populate('vendedor')
      .populate('estado')
      .populate('productos.producto');
  }

  async removeProducto(negociacionId, productoId) {
    return await Negociacion.findByIdAndUpdate(
      negociacionId,
      { $pull: { productos: { _id: productoId } } },
      { new: true }
    )
      .populate('cliente')
      .populate('vendedor')
      .populate('estado')
      .populate('productos.producto');
  }

  async getProductosByNegociacion(id) {
    const negociacion = await Negociacion.findById(id)
      .populate('productos.producto');
    return negociacion ? negociacion.productos : null;
  }
}

module.exports = new NegociacionRepository(); 