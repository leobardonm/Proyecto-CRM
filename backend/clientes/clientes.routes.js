const express = require('express');
const router = express.Router();
const { obtenerTotalClientes } = require('./clientes.controller');

router.get('/count', obtenerTotalClientes);

module.exports = router;