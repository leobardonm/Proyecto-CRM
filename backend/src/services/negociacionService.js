const negociacionRepository = require('../repositories/negociacionRepository');
const clienteService = require('./clienteService');
const vendedorService = require('./vendedorService');
const estadoService = require('./estadoService');
const productoService = require('./productoService');

class NegociacionService {
  async getAllNegociaciones() {
    try {
      return await negociacionRepository.findAll();
    } catch (error) {
      throw new Error('Error al obtener las negociaciones');
    }
  }

  async getNegociacionById(id) {
    try {
      const negociacion = await negociacionRepository.findById(id);
      if (!negociacion) {
        throw new Error('Negociación no encontrada');
      }
      return negociacion;
    } catch (error) {
      throw new Error('Error al obtener la negociación');
    }
  }

  async createNegociacion(negociacionData) {
    try {
      // Validar referencias
      await this._validarReferencias(negociacionData);

      // Calcular subtotales y monto total
      const negociacion = await this._calcularMontos(negociacionData);

      return await negociacionRepository.create(negociacion);
    } catch (error) {
      throw new Error(`Error al crear la negociación: ${error.message}`);
    }
  }

  async updateNegociacion(id, negociacionData) {
    try {
      const negociacionExistente = await negociacionRepository.findById(id);
      if (!negociacionExistente) {
        throw new Error('Negociación no encontrada');
      }

      // Validar referencias
      await this._validarReferencias(negociacionData);

      // Calcular subtotales y monto total
      const negociacion = await this._calcularMontos(negociacionData);

      return await negociacionRepository.update(id, negociacion);
    } catch (error) {
      throw new Error(`Error al actualizar la negociación: ${error.message}`);
    }
  }

  async deleteNegociacion(id) {
    try {
      const negociacion = await negociacionRepository.delete(id);
      if (!negociacion) {
        throw new Error('Negociación no encontrada');
      }
      return negociacion;
    } catch (error) {
      throw new Error('Error al eliminar la negociación');
    }
  }

  async getNegociacionesByCliente(clienteId) {
    try {
      return await negociacionRepository.findByCliente(clienteId);
    } catch (error) {
      throw new Error('Error al obtener las negociaciones del cliente');
    }
  }

  async getNegociacionesByVendedor(vendedorId) {
    try {
      return await negociacionRepository.findByVendedor(vendedorId);
    } catch (error) {
      throw new Error('Error al obtener las negociaciones del vendedor');
    }
  }

  async getNegociacionesByEstado(estadoId) {
    try {
      return await negociacionRepository.findByEstado(estadoId);
    } catch (error) {
      throw new Error('Error al obtener las negociaciones por estado');
    }
  }

  async updateEstadoNegociacion(id, estadoId) {
    try {
      const negociacion = await negociacionRepository.updateEstado(id, estadoId);
      if (!negociacion) {
        throw new Error('Negociación no encontrada');
      }
      return negociacion;
    } catch (error) {
      throw new Error('Error al actualizar el estado de la negociación');
    }
  }

  async _validarReferencias(negociacionData) {
    // Validar cliente
    const cliente = await clienteService.getClienteById(negociacionData.cliente);
    if (!cliente) {
      throw new Error('Cliente no encontrado');
    }

    // Validar vendedor
    const vendedor = await vendedorService.getVendedorById(negociacionData.vendedor);
    if (!vendedor) {
      throw new Error('Vendedor no encontrado');
    }

    // Validar estado
    const estado = await estadoService.getEstadoById(negociacionData.estado);
    if (!estado) {
      throw new Error('Estado no encontrado');
    }

    // Validar productos
    for (const item of negociacionData.productos) {
      const producto = await productoService.getProductoById(item.producto);
      if (!producto) {
        throw new Error(`Producto no encontrado: ${item.producto}`);
      }
    }
  }

  async _calcularMontos(negociacionData) {
    // Calcular subtotales y monto total
    const productos = await Promise.all(negociacionData.productos.map(async (item) => {
      const producto = await productoService.getProductoById(item.producto);
      const subtotal = item.cantidad * item.precioUnitario;
      return {
        ...item,
        subtotal
      };
    }));

    const montoTotal = productos.reduce((total, item) => total + item.subtotal, 0);

    return {
      ...negociacionData,
      productos,
      montoTotal
    };
  }

  async addProductoToNegociacion(id, productoData) {
    try {
      // Validar que el producto existe
      const producto = await productoService.getProductoById(productoData.producto);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Calcular subtotal
      const subtotal = productoData.cantidad * productoData.precioUnitario;
      const productoConSubtotal = { ...productoData, subtotal };

      // Agregar producto a la negociación
      const negociacion = await negociacionRepository.addProducto(id, productoConSubtotal);
      if (!negociacion) {
        throw new Error('Negociación no encontrada');
      }

      return negociacion;
    } catch (error) {
      throw new Error(`Error al agregar producto a la negociación: ${error.message}`);
    }
  }

  async updateProductoInNegociacion(negociacionId, productoId, productoData) {
    try {
      // Validar que el producto existe
      const producto = await productoService.getProductoById(productoData.producto);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }

      // Calcular subtotal
      const subtotal = productoData.cantidad * productoData.precioUnitario;
      const productoConSubtotal = { ...productoData, subtotal };

      // Actualizar producto en la negociación
      const negociacion = await negociacionRepository.updateProducto(
        negociacionId,
        productoId,
        productoConSubtotal
      );
      if (!negociacion) {
        throw new Error('Negociación o producto no encontrado');
      }

      return negociacion;
    } catch (error) {
      throw new Error(`Error al actualizar producto en la negociación: ${error.message}`);
    }
  }

  async removeProductoFromNegociacion(negociacionId, productoId) {
    try {
      const negociacion = await negociacionRepository.removeProducto(negociacionId, productoId);
      if (!negociacion) {
        throw new Error('Negociación o producto no encontrado');
      }
      return negociacion;
    } catch (error) {
      throw new Error(`Error al eliminar producto de la negociación: ${error.message}`);
    }
  }

  async getProductosByNegociacion(id) {
    try {
      const productos = await negociacionRepository.getProductosByNegociacion(id);
      if (!productos) {
        throw new Error('Negociación no encontrada');
      }
      return productos;
    } catch (error) {
      throw new Error(`Error al obtener productos de la negociación: ${error.message}`);
    }
  }
}

module.exports = new NegociacionService(); 