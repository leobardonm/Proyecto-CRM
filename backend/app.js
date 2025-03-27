const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { conectarDB } = require('./config/database');

// Importar rutas
const clientesRoutes = require('./clientes/clientes.routes');
const negociacionesRoutes = require('./negociaciones/negociaciones.routes');
const productosRoutes = require('./productos/productos.routes');
const vendedoresRoutes = require('./vendedores/vendedores.routes');

dotenv.config();
const app = express();
const PUERTO = 5002;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a la base de datos
conectarDB();

// Rutas principales
app.use('/api/clientes', clientesRoutes);
app.use('/api/negociaciones', negociacionesRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/vendedores', vendedoresRoutes);

// Iniciar servidor
app.listen(PUERTO, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PUERTO}`);
});