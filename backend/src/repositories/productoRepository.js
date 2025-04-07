const { sql } = require('../config/database');

class ProductoRepository {
  async findAll() {
    try {
      const result = await sql.query`SELECT * FROM Producto`;
      return result.recordset;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await sql.query`SELECT * FROM Producto WHERE Id = ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async create(productoData) {
    try {
      const { Nombre, Descripcion, Precio } = productoData;
      const result = await sql.query`
        INSERT INTO Producto (Nombre, Descripcion, Precio)
        OUTPUT INSERTED.*
        VALUES (${Nombre}, ${Descripcion}, ${Precio})
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, productoData) {
    try {
      const { Nombre, Descripcion, Precio } = productoData;
      const result = await sql.query`
        UPDATE Producto
        SET Nombre = ${Nombre}, Descripcion = ${Descripcion}, Precio = ${Precio}
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
      const result = await sql.query`DELETE FROM Producto WHERE Id = ${id}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async updateStock(id, cantidad) {
    return await Producto.findByIdAndUpdate(
      id,
      { $inc: { stock: cantidad } },
      { new: true }
    );
  }
}

module.exports = new ProductoRepository(); 