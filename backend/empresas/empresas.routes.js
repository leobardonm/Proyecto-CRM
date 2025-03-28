const express = require('express');
const router = express.Router();
const { sql } = require('../config/database');

// Obtener todas las empresas
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Empresa`;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una empresa por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await sql.query`SELECT * FROM Empresa WHERE IDEmpresa = ${req.params.id}`;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva empresa
router.post('/', async (req, res) => {
    try {
        const { Nombre } = req.body;
        const result = await sql.query`
            INSERT INTO Empresa (Nombre)
            OUTPUT INSERTED.*
            VALUES (${Nombre});
        `;
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una empresa
router.put('/:id', async (req, res) => {
    try {
        const { Nombre } = req.body;
        const result = await sql.query`
            UPDATE Empresa 
            SET Nombre = ${Nombre}
            WHERE IDEmpresa = ${req.params.id};
            SELECT * FROM Empresa WHERE IDEmpresa = ${req.params.id};
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una empresa
router.delete('/:id', async (req, res) => {
    try {
        const result = await sql.query`DELETE FROM Empresa WHERE IDEmpresa = ${req.params.id}`;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.json({ message: 'Empresa eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 