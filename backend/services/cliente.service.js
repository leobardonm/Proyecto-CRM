const { sql } = require('../core/database');

const obtenerTodosLosClientes = async () => {
    const result = await sql.query`SELECT * FROM Cliente`;
    return result.recordset;
};

const obtenerClientePorId = async (id) => {
    const result = await sql.query`SELECT * FROM Cliente WHERE Id = ${id}`;
    return result.recordset[0];
};

const crearCliente = async (cliente) => {
    const { Nombre, Direccion, Telefono, Email } = cliente;
    const result = await sql.query`
        INSERT INTO Cliente (Nombre, Direccion, Telefono, Email)
        OUTPUT INSERTED.*
        VALUES (${Nombre}, ${Direccion}, ${Telefono}, ${Email});
    `;
    return result.recordset[0];
};

const actualizarCliente = async (id, cliente) => {
    const { Nombre, Direccion, Telefono, Email } = cliente;
    const result = await sql.query`
        UPDATE Cliente 
        SET Nombre = ${Nombre},
            Direccion = ${Direccion},
            Telefono = ${Telefono},
            Email = ${Email}
        WHERE Id = ${id};
        SELECT * FROM Cliente WHERE Id = ${id};
    `;
    return result.recordset[0];
};

const eliminarCliente = async (id) => {
    const result = await sql.query`DELETE FROM Cliente WHERE Id = ${id}`;
    return result.rowsAffected[0] > 0;
};

module.exports = {
    obtenerTodosLosClientes,
    obtenerClientePorId,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
};