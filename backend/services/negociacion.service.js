const { sql } = require('../core/database');

const obtenerTodasLasNegociaciones = async () => {
    const result = await sql.query`
        SELECT 
            n.IDNegociacion,
            c.Nombre as ClienteNombre,
            v.Nombre as VendedorNombre,
            n.Total,
            n.Comision,
            n.Estado,
            n.FechaInicio,
            n.FechaFin,
            e.Descripcion as EstadoDescripcion,
            n.Total as Monto,
            n.IdCliente,
            n.IdVendedor
        FROM Negociacion n
        INNER JOIN Estado e ON n.Estado = e.Id
        INNER JOIN Vendedor v ON n.IdVendedor = v.Id
        INNER JOIN Cliente c ON n.IdCliente = c.Id
    `;

    // Get productos for each negociacion
    const negociaciones = result.recordset;
    for (const negociacion of negociaciones) {
        const productosResult = await sql.query`
            SELECT 
                np.IDProducto,
                np.Cantidad,
                np.Precio as PrecioUnitario,
                (np.Cantidad * np.Precio) as Subtotal,
                p.Descripcion
            FROM NegociacionProductos np
            INNER JOIN Productos p ON np.IDProducto = p.IDProducto
            WHERE np.IDNegociacion = ${negociacion.IDNegociacion}
        `;
        negociacion.Productos = productosResult.recordset;
    }

    return negociaciones;
};

const obtenerNegociacionPorId = async (id) => {
    const result = await sql.query`
        SELECT n.*, e.Descripcion as Estado, v.Nombre as Vendedor, c.Nombre as Cliente,
               (SELECT COUNT(np.IDProducto)
                FROM [dbo].[NegociacionProductos] np
                WHERE np.IDNegociacion = n.IDNegociacion) as ProductCount
        FROM [dbo].[Negociacion] n
        INNER JOIN [dbo].[Estado] e ON n.Estado = e.ID
        INNER JOIN [dbo].[Vendedor] v ON n.IdVendedor = v.ID
        INNER JOIN [dbo].[Cliente] c ON n.IdCliente = c.ID
        WHERE n.IDNegociacion = ${id}
    `;
    return result.recordset[0];
};

const crearNegociacion = async (negociacion) => {
    const { EstadoID, IdVendedor, IdCliente, FechaInicio, Total, Comision } = negociacion;
    
    // Add validation
    if (!IdVendedor || !IdCliente || !FechaInicio) {
        throw new Error('Faltan campos requeridos: IdVendedor, IdCliente, y FechaInicio son obligatorios');
    }

    try {
        const result = await sql.query`
            INSERT INTO Negociacion (Estado, IdVendedor, IdCliente, FechaInicio, FechaFin, Total, Comision)
            OUTPUT INSERTED.*
            VALUES (${EstadoID}, ${IdVendedor}, ${IdCliente}, ${FechaInicio}, ${FechaInicio}, ${Total}, ${Comision});
        `;
        return result.recordset[0];
    } catch (error) {
        console.error('Error in crearNegociacion:', error);
        throw new Error(`Error al crear la negociación: ${error.message}`);
    }
};

const actualizarNegociacion = async (id, negociacion) => {
    const { EstadoID } = negociacion;
    
    // Validar que el estado sea válido (1, 2 o 3)
    if (![1, 2, 3].includes(EstadoID)) {
        throw new Error('Estado inválido. Debe ser 1 (cancelada), 2 (en proceso) o 3 (terminada)');
    }

    // Si el estado es 3 (terminada), actualizar también la fecha de fin
    if (EstadoID === 3) {
        const result = await sql.query`
            UPDATE Negociacion 
            SET Estado = ${EstadoID},
                FechaFin = GETDATE()
            WHERE IDNegociacion = ${id};
            SELECT * FROM Negociacion WHERE IDNegociacion = ${id};
        `;
        return result.recordset[0];
    }

    // Para otros estados, solo actualizar el estado
    const result = await sql.query`
        UPDATE Negociacion 
        SET Estado = ${EstadoID}
        WHERE IDNegociacion = ${id};
        SELECT * FROM Negociacion WHERE IDNegociacion = ${id};
    `;
    return result.recordset[0];
};

const eliminarNegociacion = async (id) => {
    const result = await sql.query`DELETE FROM Negociacion WHERE IDNegociacion = ${id}`;
    return result.rowsAffected[0] > 0;
};

const obtenerVentasMesActual = async () => {
    const result = await sql.query`
        SELECT 
            SUM(n.Total) as TotalVentas
        FROM Negociacion n
        WHERE n.Estado = 3
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