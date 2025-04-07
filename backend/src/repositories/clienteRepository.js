const { sql } = require('../config/database');

class ClienteRepository {
  async findAll() {
    try {
      const result = await sql.query`SELECT * FROM Cliente`;
      return result.recordset;
    } catch (error) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const result = await sql.query`SELECT * FROM Cliente WHERE Id = ${id}`;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en findById:', error);
      throw error;
    }
  }

  async create(clienteData) {
    try {
      const { Nombre, Direccion, Telefono, Email } = clienteData;
      const result = await sql.query`
        INSERT INTO Cliente (Nombre, Direccion, Telefono, Email)
        OUTPUT INSERTED.*
        VALUES (${Nombre}, ${Direccion}, ${Telefono}, ${Email})
      `;
      return result.recordset[0];
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  async update(id, clienteData) {
    try {
      const { Nombre, Direccion, Telefono, Email } = clienteData;
      const result = await sql.query`
        UPDATE Cliente
        SET Nombre = ${Nombre}, Direccion = ${Direccion}, Telefono = ${Telefono}, Email = ${Email}
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
      const result = await sql.query`DELETE FROM Cliente WHERE Id = ${id}`;
      return result.rowsAffected[0] > 0;
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }
}

module.exports = new ClienteRepository(); 