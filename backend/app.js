const express = require('express');
const cors = require('cors');
const mysql = require('mysql2'); // O usa pg para PostgreSQL

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Conexión a la base de datos (modifica según la que uses)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Cambia según tu configuración
    password: '', // Tu contraseña
    database: 'mi_base_de_datos' // Nombre de tu DB
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conectado a la base de datos');
});

// Obtener estadísticas generales
app.get('/stats', (req, res) => {
    const query = `SELECT 
        (SELECT COUNT(*) FROM clientes) AS totalClientes, 
        (SELECT COUNT(*) FROM negociaciones) AS totalNegociaciones, 
        (SELECT SUM(comision) FROM comisiones) AS totalComisiones, 
        (SELECT COUNT(*) FROM vendedores) AS totalVendedores`;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results[0]);
    });
});

// Obtener clientes recientes
app.get('/recent-clients', (req, res) => {
    const query = `SELECT c.nombre, c.correo, c.telefono, v.nombre AS vendedor 
                   FROM clientes c 
                   JOIN vendedores v ON c.vendedor_id = v.id 
                   ORDER BY c.fecha_registro DESC LIMIT 3`;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Obtener negociaciones categorizadas por estado
app.get('/negotiations', (req, res) => {
    const query = `SELECT id, cliente, monto, estado FROM negociaciones`;
    
    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const negotiations = {
            "En Proceso": [],
            "Cancelada": [],
            "Terminada": []
        };
        
        results.forEach(negotiation => {
            negotiations[negotiation.estado].push(negotiation);
        });
        
        res.json(negotiations);
    });
});

// Actualizar el estado de una negociación
app.put('/negotiations/:id', (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!["En Proceso", "Cancelada", "Terminada"].includes(estado)) {
        return res.status(400).json({ error: "Estado no válido" });
    }
    
    const query = `UPDATE negociaciones SET estado = ? WHERE id = ?`;
    
    db.query(query, [estado, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Negociación actualizada correctamente" });
    });
});

// Crear una nueva negociación
app.post('/negotiations', (req, res) => {
    const { cliente, monto, estado } = req.body;
    
    if (!cliente || !monto || !estado) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    
    if (!["En Proceso", "Cancelada", "Terminada"].includes(estado)) {
        return res.status(400).json({ error: "Estado no válido" });
    }
    
    const query = `INSERT INTO negociaciones (cliente, monto, estado) VALUES (?, ?, ?)`;
    
    db.query(query, [cliente, monto, estado], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Negociación creada exitosamente", id: results.insertId });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
