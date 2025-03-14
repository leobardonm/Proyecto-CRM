const express = require('express');
const { obtenerTotalNegociacion } = require('./negociaciones.controller');
const router = express.Router();

router.get('/count', obtenerTotalNegociacion);

module.exports = router;