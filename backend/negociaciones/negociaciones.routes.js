const express = require('express');
const { sql } = require('../config/database');
const router = express.Router();

// Obtener todas las negociaciones
router.get('/', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT n.*, 
                   c.Nombre as ClienteNombre,
                   v.Nombre as VendedorNombre,
                   e.Descripcion as EstadoDescripcion
            FROM Negociacion n
            INNER JOIN Cliente c ON n.IdCliente = c.Id
            INNER JOIN Vendedor v ON n.IdVendedor = v.Id
            INNER JOIN Estado e ON n.Estado = e.Id
        `;
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener una negociación por ID
router.get('/:id', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT n.*, 
                   c.Nombre as ClienteNombre,
                   v.Nombre as VendedorNombre,
                   e.Descripcion as EstadoDescripcion
            FROM Negociacion n
            INNER JOIN Cliente c ON n.IdCliente = c.Id
            INNER JOIN Vendedor v ON n.IdVendedor = v.Id
            INNER JOIN Estado e ON n.Estado = e.Id
            WHERE n.IDNegociacion = ${req.params.id}
        `;
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Negociación no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Crear una nueva negociación
router.post('/', async (req, res) => {
    try {
        const { FechaInicio, FechaFin, Total, Estado, IdCliente, IdVendedor } = req.body;
        const comision = Total * 0.15; // 15% del total
        
        const result = await sql.query`
            INSERT INTO Negociacion (FechaInicio, FechaFin, Total, Estado, IdCliente, IdVendedor, Comision)
            OUTPUT INSERTED.*
            VALUES (${FechaInicio}, ${FechaFin}, ${Total}, ${Estado}, ${IdCliente}, ${IdVendedor}, ${comision});
        `;
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar una negociación
router.put('/:id', async (req, res) => {
    try {
        const { FechaInicio, FechaFin, Total, Estado, IdCliente, IdVendedor } = req.body;
        const comision = Total * 0.15; // 15% del total
        
        const result = await sql.query`
            UPDATE Negociacion 
            SET FechaInicio = ${FechaInicio},
                FechaFin = ${FechaFin},
                Total = ${Total},
                Estado = ${Estado},
                IdCliente = ${IdCliente},
                IdVendedor = ${IdVendedor},
                Comision = ${comision}
            WHERE IDNegociacion = ${req.params.id};
            SELECT * FROM Negociacion WHERE IDNegociacion = ${req.params.id};
        `;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Negociación no encontrada' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Eliminar una negociación
router.delete('/:id', async (req, res) => {
    try {
        const result = await sql.query`DELETE FROM Negociacion WHERE IDNegociacion = ${req.params.id}`;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Negociación no encontrada' });
        }
        res.json({ message: 'Negociación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obtener comisiones de negociaciones completadas por vendedor
router.get('/comisiones/:idVendedor', async (req, res) => {
    try {
        const result = await sql.query`
            SELECT 
                v.Nombre as VendedorNombre,
                COUNT(n.IDNegociacion) as TotalNegociaciones,
                SUM(n.Total) as TotalVentas,
                SUM(n.Comision) as TotalComision
            FROM Negociacion n
            INNER JOIN Vendedor v ON n.IdVendedor = v.Id
            WHERE n.IdVendedor = ${req.params.idVendedor}
            AND n.Estado = 3 -- Estado Completada
            GROUP BY v.Nombre;
        `;
        
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'No se encontraron comisiones para este vendedor' });
        }
        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;