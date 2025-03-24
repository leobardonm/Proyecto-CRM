const express = require('express');
const router = express.Router();
const { obtenerProductos } = require('./productos.controller');

router.get('/productos', obtenerProductos);

module.exports = router;