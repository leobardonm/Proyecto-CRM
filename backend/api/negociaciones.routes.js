const express = require('express');
const router = express.Router();
const negociacionesController = require('../controllers/negociaciones.controller');

router.get('/', negociacionesController.obtenerNegociaciones);
router.get('/:id', negociacionesController.obtenerNegociacion);
router.post('/', negociacionesController.crearNegociacion);
router.put('/:id', negociacionesController.actualizarNegociacion);
router.delete('/:id', negociacionesController.eliminarNegociacion);

module.exports = router;