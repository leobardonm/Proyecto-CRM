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

// Configuración del puerto
const PORT = process.env.PORT || 5002;

// Configuración de CORS para producción
const corsOptions = {
  origin: '*', // Temporalmente permitimos todos los orígenes
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middlewares
app.use(cors(corsOptions));
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

// Ruta de prueba
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something broke!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});