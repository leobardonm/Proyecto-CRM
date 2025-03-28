const express = require('express');
const router = express.Router();
const { sql } = require('../config/database');

// Obtener todos los estados
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Estado`;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un estado por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Estado WHERE Id = ${req.params.id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo estado
router.post('/', async (req, res) => {
    try {
        const { Id, Descripcion } = req.body;
        const result = await sql.query`
            INSERT INTO Estado (Id, Descripcion)
            VALUES (${Id}, ${Descripcion});
            SELECT * FROM Estado WHERE Id = ${Id};
        `;
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un estado
router.put('/:id', async (req, res) => {
    try {
        const { Descripcion } = req.body;
        const result = await sql.query`
            UPDATE Estado 
            SET Descripcion = ${Descripcion}
            WHERE Id = ${req.params.id};
            SELECT * FROM Estado WHERE Id = ${req.params.id};
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un estado
router.delete('/:id', async (req, res) => {
    try {
        const result = await sql.query`DELETE FROM Estado WHERE Id = ${req.params.id}`;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.json({ message: 'Estado eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 