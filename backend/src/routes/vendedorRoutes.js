const express = require('express');
const router = express.Router();
const vendedorController = require('../controllers/vendedorController');

router.get('/', vendedorController.getAllVendedores);
router.get('/:id', vendedorController.getVendedorById);
router.post('/', vendedorController.createVendedor);
router.put('/:id', vendedorController.updateVendedor);
router.delete('/:id', vendedorController.deleteVendedor);
router.get('/empresa/:empresaId', vendedorController.getVendedoresByEmpresa);

module.exports = router; 