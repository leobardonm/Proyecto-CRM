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
    const { IdNegociacion, IdProducto, Cantidad, Precio, Descripcion } = producto;
    const result = await sql.query`
        INSERT INTO NegociacionProductos (IDNegociacion, IDProducto, Cantidad, Precio, Descripcion)
        OUTPUT INSERTED.*
        VALUES (${IdNegociacion}, ${IdProducto}, ${Cantidad}, ${Precio}, ${Descripcion});
    `;
    return result.recordset[0];
};

const actualizarProducto = async (idNegociacion, idProducto, producto) => {
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

module.exports = {
    obtenerProductosPorNegociacion,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
};