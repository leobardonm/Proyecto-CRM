const { sql } = require('../core/database');

const obtenerTodasLasEmpresas = async () => {
    const result = await sql.query`SELECT * FROM Empresa`;
    return result.recordset;
};

const obtenerEmpresaPorId = async (id) => {
    const result = await sql.query`SELECT * FROM Empresa WHERE IDEmpresa = ${id}`;
    return result.recordset[0];
};

const crearEmpresa = async (empresa) => {
    const { Nombre } = empresa;
    const result = await sql.query`
        INSERT INTO Empresa (Nombre)
        OUTPUT INSERTED.*
        VALUES (${Nombre});
    `;
    return result.recordset[0];
};

const actualizarEmpresa = async (id, empresa) => {
    const { Nombre } = empresa;
    const result = await sql.query`
        UPDATE Empresa 
        SET Nombre = ${Nombre}
        WHERE IDEmpresa = ${id};
        SELECT * FROM Empresa WHERE IDEmpresa = ${id};
    `;
    return result.recordset[0];
};

const eliminarEmpresa = async (id) => {
    const result = await sql.query`DELETE FROM Empresa WHERE IDEmpresa = ${id}`;
    return result.rowsAffected[0] > 0;
};

module.exports = {
    obtenerTodasLasEmpresas,
    obtenerEmpresaPorId,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa,
};