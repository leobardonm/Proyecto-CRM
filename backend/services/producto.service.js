const { sql } = require('../core/database');

const obtenerTodosLosProductos = async () => {
    const result = await sql.query`
        SELECT 
            Id as IDProducto,
            Descripcion,
            Precio,
            Stock
        FROM Producto
    `;
    return result.recordset;
};

const obtenerProductoPorId = async (id) => {
    const result = await sql.query`
        SELECT 
            Id as IDProducto,
            Descripcion,
            Precio,
            Stock
        FROM Producto 
        WHERE Id = ${id}
    `;
    return result.recordset[0];
};

const crearProducto = async (producto) => {
    const { Descripcion, Precio, Stock } = producto;
    const result = await sql.query`
        INSERT INTO Producto (Descripcion, Precio, Stock)
        OUTPUT 
            INSERTED.Id as IDProducto,
            INSERTED.Descripcion,
            INSERTED.Precio,
            INSERTED.Stock
        VALUES (${Descripcion}, ${Precio}, ${Stock});
    `;
    return result.recordset[0];
};

const actualizarProducto = async (id, producto) => {
    const { Descripcion, Precio, Stock } = producto;
    const result = await sql.query`
        UPDATE Producto 
        SET Descripcion = ${Descripcion},
            Precio = ${Precio},
            Stock = ${Stock}
        WHERE Id = ${id};
        SELECT 
            Id as IDProducto,
            Descripcion,
            Precio,
            Stock
        FROM Producto 
        WHERE Id = ${id};
    `;
    return result.recordset[0];
};

const eliminarProducto = async (id) => {
    const result = await sql.query`DELETE FROM Producto WHERE Id = ${id}`;
    return result.rowsAffected[0] > 0;
};

module.exports = {
    obtenerTodosLosProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
};