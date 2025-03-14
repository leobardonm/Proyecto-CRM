const express = require('express');
const { obtenerTotalClientes } = require('./clientes.controller');
const router = express.Router();

router.get('/count', obtenerTotalClientes);

module.exports = router;
