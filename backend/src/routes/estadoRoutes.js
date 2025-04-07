const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');

router.get('/', estadoController.getAllEstados);
router.get('/:id', estadoController.getEstadoById);
router.post('/', estadoController.createEstado);
router.put('/:id', estadoController.updateEstado);
router.delete('/:id', estadoController.deleteEstado);
router.put('/orden/update', estadoController.updateOrdenEstados);

module.exports = router; 