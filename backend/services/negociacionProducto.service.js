const db = require('../config/database');

const agregarProducto = async (productoData) => {
    try {
        const [result] = await db.query(
            'INSERT INTO NegociacionProducto (IDNegociacion, IDProducto, Cantidad, PrecioUnitario) VALUES (?, ?, ?, ?)',
            [productoData.IDNegociacion, productoData.IDProducto, productoData.Cantidad, productoData.PrecioUnitario]
        );
        return result.insertId;
    } catch (error) {
        throw new Error(`Error al agregar producto a la negociación: ${error.message}`);
    }
};

const validarProductosNegociacion = async (idNegociacion) => {
    try {
        const [productos] = await db.query(
            'SELECT COUNT(*) as count FROM NegociacionProducto WHERE IDNegociacion = ?',
            [idNegociacion]
        );
        
        if (productos[0].count === 0) {
            throw new Error('La negociación debe tener al menos un producto');
        }
    } catch (error) {
        throw error;
    }
};

const eliminarProductosDeNegociacion = async (idNegociacion) => {
    try {
        await db.query(
            'DELETE FROM NegociacionProducto WHERE IDNegociacion = ?',
            [idNegociacion]
        );
    } catch (error) {
        throw new Error(`Error al eliminar productos de la negociación: ${error.message}`);
    }
};

module.exports = {
    agregarProducto,
    validarProductosNegociacion,
    eliminarProductosDeNegociacion
}; 