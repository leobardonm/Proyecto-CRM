const express = require('express');
const router = express.Router();
const empresasController = require('../controllers/empresas.controller');

router.get('/', empresasController.obtenerEmpresas);
router.get('/:id', empresasController.obtenerEmpresa);
router.post('/', empresasController.crearEmpresa);
router.put('/:id', empresasController.actualizarEmpresa);
router.delete('/:id', empresasController.eliminarEmpresa);

module.exports = router;