const { sql } = require('../core/database');

const obtenerTodosLosVendedores = async () => {
    const result = await sql.query`
        SELECT 
            v.Id,
            v.Nombre,
            v.Telefono,
            v.Email,
            v.IdEmpresa,
            e.Nombre as EmpresaNombre,
            ISNULL((
                SELECT SUM(n.Comision)
                FROM Negociacion n
                WHERE n.IdVendedor = v.Id
                AND n.Estado = 3
            ), 0) as ComisionTotal
        FROM Vendedor v
        LEFT JOIN Empresa e ON v.IdEmpresa = e.IDEmpresa
    `;
    return result.recordset;
};

const obtenerVendedorPorId = async (id) => {
    const result = await sql.query`
        SELECT 
            v.Id,
            v.Nombre,
            v.Telefono,
            v.Email,
            v.IdEmpresa,
            e.Nombre as EmpresaNombre,
            ISNULL((
                SELECT SUM(n.Comision)
                FROM Negociacion n
                WHERE n.IdVendedor = v.Id
                AND n.Estado = 3
            ), 0) as ComisionTotal
        FROM Vendedor v
        LEFT JOIN Empresa e ON v.IdEmpresa = e.IDEmpresa
        WHERE v.Id = ${id}
    `;
    return result.recordset[0];
};

const crearVendedor = async (vendedor) => {
    const { Nombre, Telefono, Email, IdEmpresa } = vendedor;
    const result = await sql.query`
        INSERT INTO Vendedor (Nombre, Telefono, Email, IdEmpresa)
        OUTPUT INSERTED.*
        VALUES (${Nombre}, ${Telefono}, ${Email}, ${IdEmpresa});
    `;
    return result.recordset[0];
};

const actualizarVendedor = async (id, vendedor) => {
    const { Nombre, Telefono, Email, IdEmpresa } = vendedor;
    const result = await sql.query`
        UPDATE Vendedor 
        SET Nombre = ${Nombre},
            Telefono = ${Telefono},
            Email = ${Email},
            IdEmpresa = ${IdEmpresa}
        WHERE Id = ${id};
        SELECT 
            v.Id,
            v.Nombre,
            v.Telefono,
            v.Email,
            v.IdEmpresa,
            e.Nombre as EmpresaNombre,
            ISNULL((
                SELECT SUM(n.Comision)
                FROM Negociacion n
                WHERE n.IdVendedor = v.Id
                AND n.Estado = 3
            ), 0) as ComisionTotal
        FROM Vendedor v
        LEFT JOIN Empresa e ON v.IdEmpresa = e.IDEmpresa
        WHERE v.Id = ${id};
    `;
    return result.recordset[0];
};

const eliminarVendedor = async (id) => {
    const result = await sql.query`DELETE FROM Vendedor WHERE Id = ${id}`;
    return result.rowsAffected[0] > 0;
};

module.exports = {
    obtenerTodosLosVendedores,
    obtenerVendedorPorId,
    crearVendedor,
    actualizarVendedor,
    eliminarVendedor,
};