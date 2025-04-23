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
    const { EstadoID, Total, Comision } = negociacion;
    
    try {
        // Verificar que la negociación exista
        const negociacionExistente = await obtenerNegociacionPorId(id);
        if (!negociacionExistente) {
            throw new Error('La negociación no existe');
        }

        // Validar que el estado sea válido (1, 2 o 3)
        if (EstadoID && ![1, 2, 3].includes(EstadoID)) {
            throw new Error('Estado inválido. Debe ser 1 (cancelada), 2 (en proceso) o 3 (terminada)');
        }

        // Validar que Total y Comision sean números positivos si se proporcionan
        if (Total !== undefined && (isNaN(Total) || Total < 0)) {
            throw new Error('El total debe ser un número positivo');
        }
        if (Comision !== undefined && (isNaN(Comision) || Comision < 0)) {
            throw new Error('La comisión debe ser un número positivo');
        }

        let query = 'UPDATE Negociacion SET ';
        const params = [];
        
        // Construir la consulta dinámicamente basada en los campos proporcionados
        if (EstadoID !== undefined) {
            query += 'Estado = @EstadoID, ';
            params.push({ name: 'EstadoID', value: EstadoID });
        }
        if (Total !== undefined) {
            query += 'Total = @Total, ';
            params.push({ name: 'Total', value: Total });
        }
        if (Comision !== undefined) {
            query += 'Comision = @Comision, ';
            params.push({ name: 'Comision', value: Comision });
        }

        // Si el estado es 3 (terminada) y es diferente al estado actual, actualizar la fecha de fin
        if (EstadoID === 3 && negociacionExistente.Estado !== 3) {
            query += 'FechaFin = GETDATE(), ';
        }

        // Eliminar la última coma y espacio
        query = query.slice(0, -2);
        
        // Agregar la condición WHERE
        query += ' WHERE IDNegociacion = @IDNegociacion; SELECT * FROM Negociacion WHERE IDNegociacion = @IDNegociacion;';
        params.push({ name: 'IDNegociacion', value: id });

        const result = await sql.query(query, params);
        
        if (result.rowsAffected[0] === 0) {
            throw new Error('No se pudo actualizar la negociación');
        }

        return result.recordset[0];
    } catch (error) {
        console.error('Error al actualizar la negociación:', error);
        throw new Error(`Error al actualizar la negociación: ${error.message}`);
    }
};

const eliminarNegociacion = async (id) => {
    try {
        // Primero eliminamos los registros relacionados en NegociacionProductos
        await sql.query`DELETE FROM NegociacionProductos WHERE IDNegociacion = ${id}`;
        
        // Luego eliminamos la negociación
        const result = await sql.query`DELETE FROM Negociacion WHERE IDNegociacion = ${id}`;
        return result.rowsAffected[0] > 0;
    } catch (error) {
        console.error('Error al eliminar la negociación:', error);
        throw new Error(`Error al eliminar la negociación: ${error.message}`);
    }
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