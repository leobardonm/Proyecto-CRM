const express = require('express');
const router = express.Router();
const vendedoresController = require('../controllers/vendedores.controller');

router.get('/', vendedoresController.obtenerVendedores);
router.get('/:id', vendedoresController.obtenerVendedor);
router.post('/', vendedoresController.crearVendedor);
router.put('/:id', vendedoresController.actualizarVendedor);
router.delete('/:id', vendedoresController.eliminarVendedor);

module.exports = router;