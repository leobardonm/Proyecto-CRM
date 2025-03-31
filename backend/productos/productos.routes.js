const express = require('express');
const router = express.Router();
const { sql } = require('../config/database');

// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Productos`;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Productos WHERE IDProducto = ${req.params.id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { Stock, Descripcion, Precio } = req.body;
        const result = await sql.query`
            INSERT INTO Productos (Stock, Descripcion, Precio)
            OUTPUT INSERTED.*
            VALUES (${parseInt(Stock)}, ${Descripcion}, ${parseFloat(Precio)});
        `;
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const { Stock, Descripcion, Precio } = req.body;
        const result = await sql.query`
            UPDATE Productos 
            SET Stock = ${parseInt(Stock)},
                Descripcion = ${Descripcion},
                Precio = ${parseFloat(Precio)}
            WHERE IDProducto = ${req.params.id};
            SELECT * FROM Productos WHERE IDProducto = ${req.params.id};
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const result = await sql.query`DELETE FROM Productos WHERE IDProducto = ${req.params.id}`;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;