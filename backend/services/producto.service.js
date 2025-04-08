const { sql } = require('../core/database');

const obtenerTodosLosProductos = async () => {
    const result = await sql.query`
        SELECT 
            IDProducto,
            Descripcion,
            Precio,
            Stock
        FROM Productos
    `;
    return result.recordset;
};

const obtenerProductoPorId = async (id) => {
    const result = await sql.query`
        SELECT 
            IDProducto,
            Descripcion,
            Precio,
            Stock
        FROM Productos 
        WHERE IDProducto = ${id}
    `;
    return result.recordset[0];
};

const crearProducto = async (producto) => {
    const { Descripcion, Precio, Stock } = producto;
    const result = await sql.query`
        INSERT INTO Productos (Descripcion, Precio, Stock)
        OUTPUT 
            INSERTED.IDProducto,
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
        UPDATE Productos
            SET Descripcion = ${Descripcion},
            Precio = ${Precio},
            Stock = ${Stock}
        WHERE IDProducto = ${id};
        SELECT 
            IDProducto,
            Descripcion,
            Precio,
            Stock
        FROM Productos
        WHERE IDProducto = ${id};
    `;
    return result.recordset[0];
};

const eliminarProducto = async (id) => {
    const result = await sql.query`DELETE FROM Productos WHERE IDProducto = ${id}`;
    return result.rowsAffected[0] > 0;
};

module.exports = {
    obtenerTodosLosProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
};