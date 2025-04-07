const productoRepository = require('../repositories/productoRepository');

class ProductoService {
  async getAllProductos() {
    try {
      return await productoRepository.findAll();
    } catch (error) {
      throw new Error('Error al obtener los productos');
    }
  }

  async getProductoById(id) {
    try {
      const producto = await productoRepository.findById(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      return producto;
    } catch (error) {
      throw new Error('Error al obtener el producto');
    }
  }

  async createProducto(productoData) {
    try {
      return await productoRepository.create(productoData);
    } catch (error) {
      throw new Error('Error al crear el producto');
    }
  }

  async updateProducto(id, productoData) {
    try {
      const producto = await productoRepository.update(id, productoData);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      return producto;
    } catch (error) {
      throw new Error('Error al actualizar el producto');
    }
  }

  async deleteProducto(id) {
    try {
      const producto = await productoRepository.delete(id);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      return producto;
    } catch (error) {
      throw new Error('Error al eliminar el producto');
    }
  }

  async updateStock(id, cantidad) {
    try {
      const producto = await productoRepository.updateStock(id, cantidad);
      if (!producto) {
        throw new Error('Producto no encontrado');
      }
      return producto;
    } catch (error) {
      throw new Error('Error al actualizar el stock');
    }
  }
}

module.exports = new ProductoService(); 