const express = require('express');
const router = express.Router();
const estadosController = require('../controllers/estados.controller');

router.get('/', estadosController.obtenerEstados);
router.get('/:id', estadosController.obtenerEstado);
router.post('/', estadosController.crearEstado);
router.put('/:id', estadosController.actualizarEstado);
router.delete('/:id', estadosController.eliminarEstado);

module.exports = router;