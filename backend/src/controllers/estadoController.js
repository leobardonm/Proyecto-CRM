const estadoService = require('../services/estadoService');

class EstadoController {
  async getAllEstados(req, res) {
    try {
      const estados = await estadoService.getAllEstados();
      res.json(estados);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getEstadoById(req, res) {
    try {
      const estado = await estadoService.getEstadoById(req.params.id);
      res.json(estado);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createEstado(req, res) {
    try {
      const estado = await estadoService.createEstado(req.body);
      res.status(201).json(estado);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateEstado(req, res) {
    try {
      const estado = await estadoService.updateEstado(req.params.id, req.body);
      res.json(estado);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteEstado(req, res) {
    try {
      await estadoService.deleteEstado(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async updateOrdenEstados(req, res) {
    try {
      await estadoService.updateOrdenEstados(req.body);
      res.status(200).json({ message: 'Orden actualizado correctamente' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new EstadoController(); 