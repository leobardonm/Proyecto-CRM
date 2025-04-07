const estadoRepository = require('../repositories/estadoRepository');

class EstadoService {
  async getAllEstados() {
    try {
      return await estadoRepository.findAll();
    } catch (error) {
      throw new Error('Error al obtener los estados');
    }
  }

  async getEstadoById(id) {
    try {
      const estado = await estadoRepository.findById(id);
      if (!estado) {
        throw new Error('Estado no encontrado');
      }
      return estado;
    } catch (error) {
      throw new Error('Error al obtener el estado');
    }
  }

  async createEstado(estadoData) {
    try {
      const estadoExistente = await estadoRepository.findByNombre(estadoData.nombre);
      if (estadoExistente) {
        throw new Error('Ya existe un estado con ese nombre');
      }
      return await estadoRepository.create(estadoData);
    } catch (error) {
      throw new Error('Error al crear el estado');
    }
  }

  async updateEstado(id, estadoData) {
    try {
      const estado = await estadoRepository.update(id, estadoData);
      if (!estado) {
        throw new Error('Estado no encontrado');
      }
      return estado;
    } catch (error) {
      throw new Error('Error al actualizar el estado');
    }
  }

  async deleteEstado(id) {
    try {
      const estado = await estadoRepository.delete(id);
      if (!estado) {
        throw new Error('Estado no encontrado');
      }
      return estado;
    } catch (error) {
      throw new Error('Error al eliminar el estado');
    }
  }

  async updateOrdenEstados(estados) {
    try {
      return await estadoRepository.updateOrden(estados);
    } catch (error) {
      throw new Error('Error al actualizar el orden de los estados');
    }
  }
}

module.exports = new EstadoService(); 