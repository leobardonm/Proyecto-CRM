const clienteService = require('../services/clienteService');

class ClienteController {
  async getAllClientes(req, res) {
    try {
      const clientes = await clienteService.getAllClientes();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getClienteById(req, res) {
    try {
      const cliente = await clienteService.getClienteById(req.params.id);
      res.json(cliente);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createCliente(req, res) {
    try {
      const cliente = await clienteService.createCliente(req.body);
      res.status(201).json(cliente);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateCliente(req, res) {
    try {
      const cliente = await clienteService.updateCliente(req.params.id, req.body);
      res.json(cliente);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteCliente(req, res) {
    try {
      await clienteService.deleteCliente(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new ClienteController(); 