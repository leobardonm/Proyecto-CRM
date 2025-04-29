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
        WHERE n.IDNegociacion = ${id}
    `;
    
    const negociacion = result.recordset[0];

    if (negociacion) {
        // Get productos for the specific negociacion
        const productosResult = await sql.query`
            SELECT 
                np.IDProducto,
                np.Cantidad,
                np.Precio as PrecioUnitario, 
                (np.Cantidad * np.Precio) as Subtotal,
                p.Descripcion -- Get description from Productos table
            FROM NegociacionProductos np
            INNER JOIN Productos p ON np.IDProducto = p.IDProducto
            WHERE np.IDNegociacion = ${negociacion.IDNegociacion}
        `;
        negociacion.Productos = productosResult.recordset;
    }

    return negociacion; // Will return undefined if not found
};

const crearNegociacion = async (negociacion) => {
    // Destructure ALL expected fields, including productos
    const { EstadoID = 2, IdVendedor, IdCliente, FechaInicio = new Date().toISOString().split('T')[0], Total = 0, Comision = 0, productos } = negociacion;

    // Enhanced validation at the service layer
    if (!IdVendedor || !IdCliente) {
        throw new Error('Faltan campos requeridos: IdVendedor e IdCliente son obligatorios');
    }
    if (!productos || !Array.isArray(productos) || productos.length === 0) {
        throw new Error('No se puede crear una negociación sin productos'); // Keep this validation
    }
    // Optional: Add validation for product content (IDProducto, Cantidad, PrecioUnitario) here if needed

    const transaction = new sql.Transaction();
    try {
        await transaction.begin();

        // Insert main negotiation record
        const resultNegociacion = await transaction.request()
            .input('EstadoID', sql.Int, EstadoID)
            .input('IdVendedor', sql.Int, IdVendedor)
            .input('IdCliente', sql.Int, IdCliente)
            .input('FechaInicio', sql.Date, FechaInicio)
            // Use FechaInicio also for FechaFin initially or make it NULL depending on logic
            .input('FechaFin', sql.Date, FechaInicio) 
            .input('Total', sql.Decimal(10, 2), Total)
            .input('Comision', sql.Decimal(10, 2), Comision)
            .query(`
                INSERT INTO Negociacion (Estado, IdVendedor, IdCliente, FechaInicio, FechaFin, Total, Comision)
                OUTPUT INSERTED.IDNegociacion
                VALUES (@EstadoID, @IdVendedor, @IdCliente, @FechaInicio, @FechaFin, @Total, @Comision);
            `);

        const newNegociacionId = resultNegociacion.recordset[0].IDNegociacion;

        // Insert associated products
        for (const producto of productos) {
            // Enhanced validation for each product
            if (!producto.IDProducto || producto.IDProducto <= 0) {
                throw new Error(`Producto inválido: El ID del producto debe ser un número positivo.`);
            }
            if (!producto.Cantidad || producto.Cantidad <= 0) {
                throw new Error(`Producto ${producto.IDProducto}: La cantidad debe ser mayor a 0.`);
            }
            if (producto.PrecioUnitario == null || producto.PrecioUnitario < 0) {
                throw new Error(`Producto ${producto.IDProducto}: El precio unitario no puede ser negativo.`);
            }

            await transaction.request()
                .input('IDNegociacion', sql.Int, newNegociacionId)
                .input('IDProducto', sql.Int, producto.IDProducto)
                .input('Cantidad', sql.Int, producto.Cantidad)
                .input('Precio', sql.Decimal(10, 2), producto.PrecioUnitario)
                .input('Descripcion', sql.NVarChar, producto.Descripcion || '')
                .query(`
                    INSERT INTO NegociacionProductos (IDNegociacion, IDProducto, Cantidad, Precio, Descripcion)
                    VALUES (@IDNegociacion, @IDProducto, @Cantidad, @Precio, @Descripcion);
                `);
        }

        await transaction.commit();

        // Fetch and return the complete new negotiation object
        return await obtenerNegociacionPorId(newNegociacionId); // Reuse existing function if it fetches products

    } catch (error) {
        console.error('Error in crearNegociacion transaction:', error);
        await transaction.rollback(); // Rollback on error
        // Rethrow a more specific error or the original one
        throw new Error(`Error al crear la negociación: ${error.message}`);
    }
};

const actualizarNegociacion = async (id, negociacion) => {
    // Destructure expected fields for update, including products
    const { IdVendedor, IdCliente, Total, Comision, productos } = negociacion;
    
    // Validate required fields for update if necessary (e.g., ensure client/vendor are not removed)
    if (IdVendedor === undefined || IdCliente === undefined) {
        throw new Error('IdVendedor e IdCliente son requeridos para la actualización.');
    }
     // Allow products array to be empty or missing if the intent is to clear products
    if (productos && !Array.isArray(productos)) {
        throw new Error('El campo productos debe ser un array.');
    }

    const transaction = new sql.Transaction();
    try {
        await transaction.begin();

        // 1. Update main negotiation details
        const requestUpdate = transaction.request(); // Use the same request for inputs
        requestUpdate.input('IDNegociacion', sql.Int, id);
        requestUpdate.input('IdVendedor', sql.Int, IdVendedor);
        requestUpdate.input('IdCliente', sql.Int, IdCliente);
        requestUpdate.input('Total', sql.Decimal(10, 2), Total);
        requestUpdate.input('Comision', sql.Decimal(10, 2), Comision);
        
        const updateResult = await requestUpdate.query(`
            UPDATE Negociacion 
            SET 
                IdVendedor = @IdVendedor,
                IdCliente = @IdCliente,
                Total = @Total,
                Comision = @Comision
                -- Do NOT update Estado or FechaFin here; that's handled separately
            WHERE IDNegociacion = @IDNegociacion;
        `);

        if (updateResult.rowsAffected[0] === 0) {
            throw new Error('La negociación no existe o no se pudo actualizar');
        }

        // 2. Delete existing products for this negotiation
        await transaction.request()
            .input('IDNegociacion', sql.Int, id)
            .query('DELETE FROM NegociacionProductos WHERE IDNegociacion = @IDNegociacion');

        // 3. Insert new products if provided
        if (productos && productos.length > 0) {
            for (const producto of productos) {
                // Enhanced validation for each product
                if (!producto.IDProducto || producto.IDProducto <= 0) {
                    throw new Error(`Producto inválido: El ID del producto debe ser un número positivo.`);
                }
                if (!producto.Cantidad || producto.Cantidad <= 0) {
                    throw new Error(`Producto ${producto.IDProducto}: La cantidad debe ser mayor a 0.`);
                }
                if (producto.PrecioUnitario == null || producto.PrecioUnitario < 0) {
                    throw new Error(`Producto ${producto.IDProducto}: El precio unitario no puede ser negativo.`);
                }

                await transaction.request()
                    .input('IDNegociacion', sql.Int, id)
                    .input('IDProducto', sql.Int, producto.IDProducto)
                    .input('Cantidad', sql.Int, producto.Cantidad)
                    .input('Precio', sql.Decimal(10, 2), producto.PrecioUnitario)
                    .input('Descripcion', sql.NVarChar, producto.Descripcion || '')
                    .query(`
                        INSERT INTO NegociacionProductos (IDNegociacion, IDProducto, Cantidad, Precio, Descripcion)
                        VALUES (@IDNegociacion, @IDProducto, @Cantidad, @Precio, @Descripcion);
                    `);
            }
        }

        await transaction.commit();

        // Fetch and return the updated negotiation object
        return await obtenerNegociacionPorId(id);

    } catch (error) {
        console.error('Error in actualizarNegociacion transaction:', error);
        await transaction.rollback();
        throw new Error(`Error al actualizar la negociación: ${error.message}`);
    }
};

// Separate function to specifically handle Estado update (from drag-and-drop)
const actualizarEstadoNegociacion = async (id, estadoId) => {
    // Validate estadoId
    if (![1, 2, 3].includes(estadoId)) {
        throw new Error('Estado inválido. Debe ser 1 (cancelada), 2 (en proceso) o 3 (terminada).');
    }

    const transaction = new sql.Transaction();
    try {
        await transaction.begin();

        // 1. Update negotiation state
        const request = transaction.request();
        request.input('IDNegociacion', sql.Int, id);
        request.input('EstadoID', sql.Int, estadoId);

        let query = `
            UPDATE Negociacion 
            SET Estado = @EstadoID 
            ${estadoId === 3 ? ', FechaFin = GETDATE()' : ''} -- Update FechaFin if moving to Terminada
            WHERE IDNegociacion = @IDNegociacion;
            
            SELECT * FROM Negociacion WHERE IDNegociacion = @IDNegociacion; 
        `;

        const result = await request.query(query);

        if (result.rowsAffected[0] === 0) {
            throw new Error('No se pudo actualizar el estado de la negociación (¿no encontrada?)');
        }

        // 2. If state is 3 (terminada), update product stock
        if (estadoId === 3) {
            // Get all products from the negotiation
            const productosResult = await transaction.request()
                .input('IDNegociacion', sql.Int, id)
                .query(`
                    SELECT np.IDProducto, np.Cantidad, p.Stock
                    FROM NegociacionProductos np
                    INNER JOIN Productos p ON np.IDProducto = p.IDProducto
                    WHERE np.IDNegociacion = @IDNegociacion
                `);

            // Update stock for each product
            for (const producto of productosResult.recordset) {
                const nuevoStock = producto.Stock - producto.Cantidad;
                
                if (nuevoStock < 0) {
                    throw new Error(`No hay suficiente stock para el producto ID: ${producto.IDProducto}`);
                }

                await transaction.request()
                    .input('IDProducto', sql.Int, producto.IDProducto)
                    .input('NuevoStock', sql.Int, nuevoStock)
                    .query(`
                        UPDATE Productos
                        SET Stock = @NuevoStock
                        WHERE IDProducto = @IDProducto
                    `);
            }
        }

        await transaction.commit();

        // Fetch full details including products after state update
        return await obtenerNegociacionPorId(id);

    } catch (error) {
        console.error('Error al actualizar el estado de la negociación:', error);
        await transaction.rollback();
        throw new Error(`Error al actualizar el estado: ${error.message}`);
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
    actualizarNegociacion, // Handles updates from Edit form
    actualizarEstadoNegociacion, // Handles state update from Drag & Drop
    eliminarNegociacion,
    obtenerVentasMesActual
};