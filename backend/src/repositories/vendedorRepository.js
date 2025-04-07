const { sql } = require('../config/database');

class VendedorRepository {
  async findAll() {
    try {
      const result = await sql.query`
        SELECT v.*, e.Nombre as EmpresaNombre 
        FROM Vendedor v
        LEFT JOIN Empresa e ON v.EmpresaId = e.Id
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
        SELECT v.*, e.Nombre as EmpresaNombre 
        FROM Vendedor v
        LEFT JOIN Empresa e ON v.EmpresaId = e.Id
        WHERE v.Id = ${id}
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async create(vendedorData) {
    try {
      const { Nombre, Telefono, Email, EmpresaId } = vendedorData;
      const result = await sql.query`
        INSERT INTO Vendedor (Nombre, Telefono, Email, EmpresaId)
        OUTPUT INSERTED.*
        VALUES (${Nombre}, ${Telefono}, ${Email}, ${EmpresaId})
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, vendedorData) {
    try {
      const { Nombre, Telefono, Email, EmpresaId } = vendedorData;
      const result = await sql.query`
        UPDATE Vendedor
        SET Nombre = ${Nombre}, Telefono = ${Telefono}, Email = ${Email}, EmpresaId = ${EmpresaId}
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
      const result = await sql.query`DELETE FROM Vendedor WHERE Id = ${id}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  async findByEmpresa(empresaId) {
    return await Vendedor.find({ empresa: empresaId });
  }
}

module.exports = new VendedorRepository(); 