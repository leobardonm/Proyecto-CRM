const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { conectarDB } = require('./config/database');

// Importar rutas
const clientesRoutes = require('./api/clientes.routes');
const negociacionesRoutes = require('./api/negociaciones.routes');
const productosRoutes = require('./api/productos.routes');
const vendedoresRoutes = require('./api/vendedores.routes');
const empresasRoutes = require('./api/empresas.routes');
const estadosRoutes = require('./api/estados.routes');
const negociacionProductosRoutes = require('./api/negociacion-productos.routes');

dotenv.config();
const app = express();
// Asegúrate de que estás usando el puerto de Render correctamente
const PORT = process.env.PORT || 5002;

// Middlewares
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
app.use('/api/empresas', empresasRoutes);
app.use('/api/estados', estadosRoutes);
app.use('/api/negociacion-productos', negociacionProductosRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});