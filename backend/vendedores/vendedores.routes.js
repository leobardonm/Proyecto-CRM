const express = require('express');
const router = express.Router();
const { obtenerTotalVendedores } = require('./vendedores.controller'); // Asegúrate de que esta importación sea correcta

router.get('/', obtenerTotalVendedores); // Aquí es donde ocurre el error si obtenerVendedores es undefined

module.exports = router;