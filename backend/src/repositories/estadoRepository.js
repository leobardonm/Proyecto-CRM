const { sql } = require('../config/database');

class EstadoRepository {
  async findAll() {
    try {
      const result = await sql.query`SELECT * FROM Estado ORDER BY Orden`;
      return result.recordset;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await sql.query`SELECT * FROM Estado WHERE Id = ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async create(estadoData) {
    try {
      const { Descripcion, Orden } = estadoData;
      const result = await sql.query`
        INSERT INTO Estado (Descripcion, Orden)
        OUTPUT INSERTED.*
        VALUES (${Descripcion}, ${Orden})
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, estadoData) {
    try {
      const { Descripcion, Orden } = estadoData;
      const result = await sql.query`
        UPDATE Estado
        SET Descripcion = ${Descripcion}, Orden = ${Orden}
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
      const result = await sql.query`DELETE FROM Estado WHERE Id = ${id}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async findByNombre(nombre) {
    return await Estado.findOne({ nombre });
  }

  async updateOrden(estados) {
    const bulkOps = estados.map(estado => ({
      updateOne: {
        filter: { _id: estado._id },
        update: { $set: { orden: estado.orden } }
      }
    }));
    return await Estado.bulkWrite(bulkOps);
  }
}

module.exports = new EstadoRepository(); 