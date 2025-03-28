const express = require('express');
const router = express.Router();
const { sql } = require('../config/database');

// Obtener todos los clientes
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Cliente`;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un cliente por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Cliente WHERE Id = ${req.params.id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo cliente
router.post('/', async (req, res) => {
    try {
        const { Nombre, Direccion, Telefono, Email } = req.body;
        const result = await sql.query`
            INSERT INTO Cliente (Nombre, Direccion, Telefono, Email)
            OUTPUT INSERTED.*
            VALUES (${Nombre}, ${Direccion}, ${Telefono}, ${Email});
        `;
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un cliente
router.put('/:id', async (req, res) => {
    try {
        const { Nombre, Direccion, Telefono, Email } = req.body;
        const result = await sql.query`
            UPDATE Cliente 
            SET Nombre = ${Nombre},
                Direccion = ${Direccion},
                Telefono = ${Telefono},
                Email = ${Email}
            WHERE Id = ${req.params.id};
            SELECT * FROM Cliente WHERE Id = ${req.params.id};
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un cliente
router.delete('/:id', async (req, res) => {
    try {
        const result = await sql.query`DELETE FROM Cliente WHERE Id = ${req.params.id}`;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;