const { sql } = require('../core/database');

const agregarProducto = async (productoData) => {
    try {
        const result = await sql.query`
            INSERT INTO NegociacionProductos (IDNegociacion, IDProducto, Cantidad, Precio, Descripcion)
            OUTPUT INSERTED.IDNegociacion, INSERTED.IDProducto, INSERTED.Cantidad, INSERTED.Precio, INSERTED.Descripcion
            VALUES (${productoData.IDNegociacion}, ${productoData.IDProducto}, ${productoData.Cantidad}, ${productoData.PrecioUnitario}, ${productoData.Descripcion});
        `;
        return result.recordset[0];
    } catch (error) {
        console.error('Error al agregar producto:', error);
        throw new Error(`Error al agregar producto a la negociación: ${error.message}`);
    }
};

const validarProductosNegociacion = async (idNegociacion) => {
    try {
        const result = await sql.query`
            SELECT COUNT(*) as count 
            FROM NegociacionProductos 
            WHERE IDNegociacion = ${idNegociacion}
        `;
        
        if (result.recordset[0].count === 0) {
            throw new Error('La negociación debe tener al menos un producto');
        }
    } catch (error) {
        console.error('Error al validar productos:', error);
        throw error;
    }
};

const eliminarProductosDeNegociacion = async (idNegociacion) => {
    try {
        const result = await sql.query`
            DELETE FROM NegociacionProductos 
            WHERE IDNegociacion = ${idNegociacion};
            SELECT @@ROWCOUNT as rowsAffected;
        `;
        return result.recordset[0].rowsAffected > 0;
    } catch (error) {
        console.error('Error al eliminar productos:', error);
        throw new Error(`Error al eliminar productos de la negociación: ${error.message}`);
    }
};

module.exports = {
    agregarProducto,
    validarProductosNegociacion,
    eliminarProductosDeNegociacion
}; 