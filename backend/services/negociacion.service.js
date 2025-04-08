const { sql } = require('../core/database');

const obtenerTodasLasNegociaciones = async () => {
    const result = await sql.query`
        SELECT n.*, e.Descripcion as Estado, v.Nombre as Vendedor, c.Nombre as Cliente
        FROM Negociacion n
        INNER JOIN Estado e ON n.EstadoID = e.ID
        INNER JOIN Vendedor v ON n.VendedorID = v.ID
        INNER JOIN Cliente c ON n.ClienteID = c.ID
    `;
    return result.recordset;
};

const obtenerNegociacionPorId = async (id) => {
    const result = await sql.query`
        SELECT n.*, e.Descripcion as Estado, v.Nombre as Vendedor, c.Nombre as Cliente
        FROM Negociacion n
        INNER JOIN Estado e ON n.EstadoID = e.ID
        INNER JOIN Vendedor v ON n.VendedorID = v.ID
        INNER JOIN Cliente c ON n.ClienteID = c.ID
        WHERE n.ID = ${id}
    `;
    return result.recordset[0];
};

const crearNegociacion = async (negociacion) => {
    const { EstadoID, VendedorID, ClienteID, FechaInicio } = negociacion;
    const result = await sql.query`
        INSERT INTO Negociacion (EstadoID, VendedorID, ClienteID, FechaInicio)
        OUTPUT INSERTED.*
        VALUES (${EstadoID}, ${VendedorID}, ${ClienteID}, ${FechaInicio});
    `;
    return result.recordset[0];
};

const actualizarNegociacion = async (id, negociacion) => {
    const { EstadoID, VendedorID, ClienteID, FechaInicio } = negociacion;
    const result = await sql.query`
        UPDATE Negociacion 
        SET EstadoID = ${EstadoID},
            VendedorID = ${VendedorID},
            ClienteID = ${ClienteID},
            FechaInicio = ${FechaInicio}
        WHERE ID = ${id};
        SELECT * FROM Negociacion WHERE ID = ${id};
    `;
    return result.recordset[0];
};

const eliminarNegociacion = async (id) => {
    const result = await sql.query`DELETE FROM Negociacion WHERE ID = ${id}`;
    return result.rowsAffected[0] > 0;
};

const obtenerVentasMesActual = async () => {
    const result = await sql.query`
        SELECT 
            SUM(n.Total) as TotalVentas
        FROM Negociacion n
        WHERE n.EstadoID = 3
        AND MONTH(n.FechaFin) = MONTH(GETDATE())
        AND YEAR(n.FechaFin) = YEAR(GETDATE())
    `;
    return result.recordset[0]?.TotalVentas || 0;
};

module.exports = {
    obtenerTodasLasNegociaciones,
    obtenerNegociacionPorId,
    crearNegociacion,
    actualizarNegociacion,
    eliminarNegociacion,
    obtenerVentasMesActual
};