const express = require('express');
const router = express.Router();
const negociacionController = require('../controllers/negociacionController');

// Rutas básicas CRUD
router.get('/', negociacionController.getAllNegociaciones);
router.get('/:id', negociacionController.getNegociacionById);
router.post('/', negociacionController.createNegociacion);
router.put('/:id', negociacionController.updateNegociacion);
router.delete('/:id', negociacionController.deleteNegociacion);

// Rutas específicas
router.get('/cliente/:clienteId', negociacionController.getNegociacionesByCliente);
router.get('/vendedor/:vendedorId', negociacionController.getNegociacionesByVendedor);
router.get('/estado/:estadoId', negociacionController.getNegociacionesByEstado);
router.put('/:id/estado', negociacionController.updateEstadoNegociacion);

// Rutas para productos
router.post('/:id/productos', negociacionController.addProductoToNegociacion);
router.get('/:id/productos', negociacionController.getProductosByNegociacion);
router.put('/:negociacionId/productos/:productoId', negociacionController.updateProductoInNegociacion);
router.delete('/:negociacionId/productos/:productoId', negociacionController.removeProductoFromNegociacion);

module.exports = router; 