const { sql } = require('../core/database');

const obtenerProductosPorNegociacion = async (idNegociacion) => {
    const result = await sql.query`
        SELECT np.*, p.Descripcion as ProductoDescripcion
        FROM NegociacionProductos np
        INNER JOIN Productos p ON np.IDProducto = p.IDProducto
        WHERE np.IDNegociacion = ${idNegociacion}
    `;
    return result.recordset;
};

const agregarProducto = async (producto) => {
    const { IDNegociacion, IDProducto, Cantidad, Precio, Descripcion } = producto;
    
    // Validar campos requeridos
    if (!IDNegociacion || !IDProducto || !Cantidad || !Precio) {
        throw new Error('Faltan campos requeridos: IDNegociacion, IDProducto, Cantidad y Precio son obligatorios');
    }

    // Validar que la cantidad y precio sean positivos
    if (Cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0');
    }
    if (Precio <= 0) {
        throw new Error('El precio debe ser mayor a 0');
    }

    try {
        const result = await sql.query`
            INSERT INTO NegociacionProductos (IDNegociacion, IDProducto, Cantidad, Precio, Descripcion)
            OUTPUT INSERTED.*
            VALUES (${IDNegociacion}, ${IDProducto}, ${Cantidad}, ${Precio}, ${Descripcion});
        `;
        return result.recordset[0];
    } catch (error) {
        console.error('Error al agregar producto a la negociación:', error);
        throw new Error(`Error al agregar producto a la negociación: ${error.message}`);
    }
};

const actualizarProducto = async (IDNegociacion, IDProducto, producto) => {
    const { Cantidad, Precio, Descripcion } = producto;
    const result = await sql.query`
        UPDATE NegociacionProductos 
        SET Cantidad = ${Cantidad},
            Precio = ${Precio},
            Descripcion = ${Descripcion}
        WHERE IDNegociacion = ${idNegociacion} AND IDProducto = ${idProducto};
        SELECT * FROM NegociacionProductos 
        WHERE IDNegociacion = ${idNegociacion} AND IDProducto = ${idProducto};
    `;
    return result.recordset[0];
};

const eliminarProducto = async (idNegociacion, idProducto) => {
    const result = await sql.query`
        DELETE FROM NegociacionProductos 
        WHERE IDNegociacion = ${idNegociacion} AND IDProducto = ${idProducto};
    `;
    return result.rowsAffected[0] > 0;
};

const eliminarProductosDeNegociacion = async (idNegociacion) => {
    const result = await sql.query`
        DELETE FROM NegociacionProductos 
        WHERE IDNegociacion = ${idNegociacion};
    `;
    return result.rowsAffected[0] > 0;
};

const validarProductosNegociacion = async (idNegociacion) => {
    const productos = await obtenerProductosPorNegociacion(idNegociacion);
    if (!productos || productos.length === 0) {
        throw new Error('La negociación debe tener al menos un producto');
    }
    return productos;
};

module.exports = {
    obtenerProductosPorNegociacion,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    eliminarProductosDeNegociacion,
    validarProductosNegociacion
};