const { sql } = require('../core/database');

const obtenerProductosPorNegociacion = async (idNegociacion) => {
    const result = await sql.query`
        SELECT np.*, p.Descripcion as ProductoDescripcion
        FROM NegociacionProducto np
        INNER JOIN Producto p ON np.IdProducto = p.Id
        WHERE np.IdNegociacion = ${idNegociacion}
    `;
    return result.recordset;
};

const agregarProducto = async (producto) => {
    const { IdNegociacion, IdProducto, Cantidad, Precio, Descripcion } = producto;
    const result = await sql.query`
        INSERT INTO NegociacionProducto (IdNegociacion, IdProducto, Cantidad, Precio, Descripcion)
        OUTPUT INSERTED.*
        VALUES (${IdNegociacion}, ${IdProducto}, ${Cantidad}, ${Precio}, ${Descripcion});
    `;
    return result.recordset[0];
};

const actualizarProducto = async (idNegociacion, idProducto, producto) => {
    const { Cantidad, Precio, Descripcion } = producto;
    const result = await sql.query`
        UPDATE NegociacionProducto 
        SET Cantidad = ${Cantidad},
            Precio = ${Precio},
            Descripcion = ${Descripcion}
        WHERE IdNegociacion = ${idNegociacion} AND IdProducto = ${idProducto};
        SELECT * FROM NegociacionProducto 
        WHERE IdNegociacion = ${idNegociacion} AND IdProducto = ${idProducto};
    `;
    return result.recordset[0];
};

const eliminarProducto = async (idNegociacion, idProducto) => {
    const result = await sql.query`
        DELETE FROM NegociacionProducto 
        WHERE IdNegociacion = ${idNegociacion} AND IdProducto = ${idProducto};
    `;
    return result.rowsAffected[0] > 0;
};

module.exports = {
    obtenerProductosPorNegociacion,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
};