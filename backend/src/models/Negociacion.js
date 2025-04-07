const mongoose = require('mongoose');

const negociacionSchema = new mongoose.Schema({
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente',
    required: true
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendedor',
    required: true
  },
  estado: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Estado',
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true,
    default: Date.now
  },
  fechaCierre: {
    type: Date
  },
  montoTotal: {
    type: Number,
    required: true,
    default: 0
  },
  productos: [{
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Producto',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  notas: {
    type: String
  },
  activo: {
    type: Boolean,
    required: true,
    default: true
  }
}, {
  timestamps: true
});

// Middleware para calcular el monto total antes de guardar
negociacionSchema.pre('save', function(next) {
  this.montoTotal = this.productos.reduce((total, producto) => {
    return total + (producto.cantidad * producto.precioUnitario);
  }, 0);
  next();
});

module.exports = mongoose.model('Negociacion', negociacionSchema); 