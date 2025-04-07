const { sql } = require('../core/database');

const obtenerTodosLosEstados = async () => {
    const result = await sql.query`SELECT * FROM Estado`;
    return result.recordset;
};

const obtenerEstadoPorId = async (id) => {
    const result = await sql.query`SELECT * FROM Estado WHERE Id = ${id}`;
    return result.recordset[0];
};

const crearEstado = async (estado) => {
    const { Descripcion } = estado;
    const result = await sql.query`
        INSERT INTO Estado (Descripcion)
        OUTPUT INSERTED.*
        VALUES (${Descripcion});
    `;
    return result.recordset[0];
};

const actualizarEstado = async (id, estado) => {
    const { Descripcion } = estado;
    const result = await sql.query`
        UPDATE Estado 
        SET Descripcion = ${Descripcion}
        WHERE Id = ${id};
        SELECT * FROM Estado WHERE Id = ${id};
    `;
    return result.recordset[0];
};

const eliminarEstado = async (id) => {
    const result = await sql.query`DELETE FROM Estado WHERE Id = ${id}`;
    return result.rowsAffected[0] > 0;
};

module.exports = {
    obtenerTodosLosEstados,
    obtenerEstadoPorId,
    crearEstado,
    actualizarEstado,
    eliminarEstado,
};