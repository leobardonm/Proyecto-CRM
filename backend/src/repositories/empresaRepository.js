const { sql } = require('../config/database');

class EmpresaRepository {
  async findAll() {
    try {
      const result = await sql.query`SELECT * FROM Empresa`;
      return result.recordset;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await sql.query`SELECT * FROM Empresa WHERE Id = ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async create(empresaData) {
    try {
      const { Nombre } = empresaData;
      const result = await sql.query`
        INSERT INTO Empresa (Nombre)
        OUTPUT INSERTED.*
        VALUES (${Nombre})
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, empresaData) {
    try {
      const { Nombre } = empresaData;
      const result = await sql.query`
        UPDATE Empresa
        SET Nombre = ${Nombre}
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
      const result = await sql.query`DELETE FROM Empresa WHERE Id = ${id}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async findByRuc(ruc) {
    return await Empresa.findOne({ ruc });
  }
}

module.exports = new EmpresaRepository(); 