const express = require('express');
const router = express.Router();
const { obtenerClientes } = require('./clientes.controller');

router.get('/clientes', obtenerClientes);

module.exports = router;
