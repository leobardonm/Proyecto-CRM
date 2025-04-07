const empresaService = require('../services/empresaService');

class EmpresaController {
  async getAllEmpresas(req, res) {
    try {
      const empresas = await empresaService.getAllEmpresas();
      res.json(empresas);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getEmpresaById(req, res) {
    try {
      const empresa = await empresaService.getEmpresaById(req.params.id);
      res.json(empresa);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createEmpresa(req, res) {
    try {
      const empresa = await empresaService.createEmpresa(req.body);
      res.status(201).json(empresa);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateEmpresa(req, res) {
    try {
      const empresa = await empresaService.updateEmpresa(req.params.id, req.body);
      res.json(empresa);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteEmpresa(req, res) {
    try {
      await empresaService.deleteEmpresa(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new EmpresaController(); 