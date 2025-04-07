const productoService = require('../services/productoService');

class ProductoController {
  async getAllProductos(req, res) {
    try {
      const productos = await productoService.getAllProductos();
      res.json(productos);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getProductoById(req, res) {
    try {
      const producto = await productoService.getProductoById(req.params.id);
      res.json(producto);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createProducto(req, res) {
    try {
      const producto = await productoService.createProducto(req.body);
      res.status(201).json(producto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateProducto(req, res) {
    try {
      const producto = await productoService.updateProducto(req.params.id, req.body);
      res.json(producto);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteProducto(req, res) {
    try {
      await productoService.deleteProducto(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateStock(req, res) {
    try {
      const { cantidad } = req.body;
      const producto = await productoService.updateStock(req.params.id, cantidad);
      res.json(producto);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ProductoController(); 