const negociacionService = require('../services/negociacionService');

class NegociacionController {
  async getAllNegociaciones(req, res) {
    try {
      const negociaciones = await negociacionService.getAllNegociaciones();
      res.json(negociaciones);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getNegociacionById(req, res) {
    try {
      const negociacion = await negociacionService.getNegociacionById(req.params.id);
      res.json(negociacion);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async createNegociacion(req, res) {
    try {
      const negociacion = await negociacionService.createNegociacion(req.body);
      res.status(201).json(negociacion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateNegociacion(req, res) {
    try {
      const negociacion = await negociacionService.updateNegociacion(req.params.id, req.body);
      res.json(negociacion);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async deleteNegociacion(req, res) {
    try {
      await negociacionService.deleteNegociacion(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }

  async getNegociacionesByCliente(req, res) {
    try {
      const negociaciones = await negociacionService.getNegociacionesByCliente(req.params.clienteId);
      res.json(negociaciones);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getNegociacionesByVendedor(req, res) {
    try {
      const negociaciones = await negociacionService.getNegociacionesByVendedor(req.params.vendedorId);
      res.json(negociaciones);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getNegociacionesByEstado(req, res) {
    try {
      const negociaciones = await negociacionService.getNegociacionesByEstado(req.params.estadoId);
      res.json(negociaciones);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateEstadoNegociacion(req, res) {
    try {
      const negociacion = await negociacionService.updateEstadoNegociacion(
        req.params.id,
        req.body.estadoId
      );
      res.json(negociacion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async addProductoToNegociacion(req, res) {
    try {
      const negociacion = await negociacionService.addProductoToNegociacion(
        req.params.id,
        req.body
      );
      res.json(negociacion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async updateProductoInNegociacion(req, res) {
    try {
      const negociacion = await negociacionService.updateProductoInNegociacion(
        req.params.negociacionId,
        req.params.productoId,
        req.body
      );
      res.json(negociacion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async removeProductoFromNegociacion(req, res) {
    try {
      const negociacion = await negociacionService.removeProductoFromNegociacion(
        req.params.negociacionId,
        req.params.productoId
      );
      res.json(negociacion);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  async getProductosByNegociacion(req, res) {
    try {
      const productos = await negociacionService.getProductosByNegociacion(req.params.id);
      res.json(productos);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  }
}

module.exports = new NegociacionController(); 