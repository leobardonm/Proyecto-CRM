const express = require('express');
const router = express.Router();
const { sql } = require('../config/database');

// Obtener todos los vendedores
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT v.*, e.Nombre as EmpresaNombre
            FROM Vendedor v
            INNER JOIN Empresa e ON v.IdEmpresa = e.IDEmpresa
        `;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener un vendedor por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT v.*, e.Nombre as EmpresaNombre
            FROM Vendedor v
            INNER JOIN Empresa e ON v.IdEmpresa = e.IDEmpresa
            WHERE v.Id = ${req.params.id}
        `;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear un nuevo vendedor
router.post('/', async (req, res) => {
    try {
        const { Nombre, Telefono, Email, IdEmpresa } = req.body;
        const result = await sql.query`
            INSERT INTO Vendedor (Nombre, Telefono, Email, IdEmpresa)
            OUTPUT INSERTED.*
            VALUES (${Nombre}, ${Telefono}, ${Email}, ${IdEmpresa});
        `;
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar un vendedor
router.put('/:id', async (req, res) => {
    try {
        const { Nombre, Telefono, Email, IdEmpresa } = req.body;
        const result = await sql.query`
            UPDATE Vendedor 
            SET Nombre = ${Nombre},
                Telefono = ${Telefono},
                Email = ${Email},
                IdEmpresa = ${IdEmpresa}
            WHERE Id = ${req.params.id};
            SELECT v.*, e.Nombre as EmpresaNombre
            FROM Vendedor v
            INNER JOIN Empresa e ON v.IdEmpresa = e.IDEmpresa
            WHERE v.Id = ${req.params.id};
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar un vendedor
router.delete('/:id', async (req, res) => {
    try {
        const result = await sql.query`DELETE FROM Vendedor WHERE Id = ${req.params.id}`;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }
        res.json({ message: 'Vendedor eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;