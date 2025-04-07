const vendedorService = require('../services/vendedorService');

class VendedorController {
  async getAllVendedores(req, res) {
    try {
      const vendedores = await vendedorService.getAllVendedores();
      res.json(vendedores);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getVendedorById(req, res) {
    try {
      const vendedor = await vendedorService.getVendedorById(req.params.id);
      res.json(vendedor);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createVendedor(req, res) {
    try {
      const vendedor = await vendedorService.createVendedor(req.body);
      res.status(201).json(vendedor);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateVendedor(req, res) {
    try {
      const vendedor = await vendedorService.updateVendedor(req.params.id, req.body);
      res.json(vendedor);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteVendedor(req, res) {
    try {
      await vendedorService.deleteVendedor(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getVendedoresByEmpresa(req, res) {
    try {
      const vendedores = await vendedorService.getVendedoresByEmpresa(req.params.empresaId);
      res.json(vendedores);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new VendedorController(); 