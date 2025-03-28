const express = require('express');
const router = express.Router();
const { sql } = require('../config/database');

// Obtener todos los productos de una negociación
router.get('/negociacion/:idNegociacion', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT np.*, p.Descripcion as ProductoDescripcion
            FROM NegociacionProductos np
            INNER JOIN Productos p ON np.IDProducto = p.IDProducto
            WHERE np.IDNegociacion = ${req.params.idNegociacion}
        `;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una relación específica
router.get('/:idNegociacion/:idProducto', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT np.*, p.Descripcion as ProductoDescripcion
            FROM NegociacionProductos np
            INNER JOIN Productos p ON np.IDProducto = p.IDProducto
            WHERE np.IDNegociacion = ${req.params.idNegociacion}
            AND np.IDProducto = ${req.params.idProducto}
        `;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Agregar un producto a una negociación
router.post('/', async (req, res) => {
    try {
        const { IDNegociacion, IDProducto, Cantidad, Precio, Descripcion } = req.body;
        const result = await sql.query`
            INSERT INTO NegociacionProductos (IDNegociacion, IDProducto, Cantidad, Precio, Descripcion)
            VALUES (${IDNegociacion}, ${IDProducto}, ${Cantidad}, ${Precio}, ${Descripcion});
            SELECT * FROM NegociacionProductos 
            WHERE IDNegociacion = ${IDNegociacion} AND IDProducto = ${IDProducto};
        `;
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un producto en una negociación
router.put('/:idNegociacion/:idProducto', async (req, res) => {
    try {
        const { Cantidad, Precio, Descripcion } = req.body;
        const result = await sql.query`
            UPDATE NegociacionProductos 
            SET Cantidad = ${Cantidad},
                Precio = ${Precio},
                Descripcion = ${Descripcion}
            WHERE IDNegociacion = ${req.params.idNegociacion}
            AND IDProducto = ${req.params.idProducto};
            SELECT * FROM NegociacionProductos 
            WHERE IDNegociacion = ${req.params.idNegociacion} 
            AND IDProducto = ${req.params.idProducto};
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto de una negociación
router.delete('/:idNegociacion/:idProducto', async (req, res) => {
    try {
        const result = await sql.query`
            DELETE FROM NegociacionProductos 
            WHERE IDNegociacion = ${req.params.idNegociacion}
            AND IDProducto = ${req.params.idProducto}
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Relación no encontrada' });
        }
        res.json({ message: 'Producto eliminado de la negociación exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 