const mongoose = require('mongoose');

const estadoSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    unique: true
  },
  descripcion: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true,
    default: '#000000'
  },
  orden: {
    type: Number,
    required: true,
    default: 0
  },
  activo: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Estado', estadoSchema); 