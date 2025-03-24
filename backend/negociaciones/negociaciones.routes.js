const express = require('express');
const { 
  obtenerTotalNegociacion, 
  obtenerNegociaciones,
  actualizarNegociacion, 
  eliminarNegociacion,
  crearNegociacion 
} = require('./negociaciones.controller');
const router = express.Router();

// Obtener todas las negociaciones
router.get('/', obtenerNegociaciones);

// Obtener el total de negociaciones
router.get('/count', obtenerTotalNegociacion);

// Crear una nueva negociación
router.post('/', crearNegociacion);

// Actualizar una negociación existente
router.put('/:id', actualizarNegociacion);

// Eliminar una negociación
router.delete('/:id', eliminarNegociacion);

module.exports = router;