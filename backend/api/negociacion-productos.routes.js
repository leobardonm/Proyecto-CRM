const express = require('express');
const router = express.Router();
const negociacionProductosController = require('../controllers/negociacion-productos.controller');

// Asegúrate de que estas funciones estén definidas en el controlador
router.get('/negociacion/:idNegociacion', negociacionProductosController.obtenerProductosDeNegociacion);
router.post('/', negociacionProductosController.agregarProductoANegociacion);
router.put('/:idNegociacion/:idProducto', negociacionProductosController.actualizarProductoEnNegociacion);
router.delete('/:idNegociacion/:idProducto', negociacionProductosController.eliminarProductoDeNegociacion);

module.exports = router;