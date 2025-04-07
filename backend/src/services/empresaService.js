const empresaRepository = require('../repositories/empresaRepository');

class EmpresaService {
  async getAllEmpresas() {
    try {
      return await empresaRepository.findAll();
    } catch (error) {
      throw new Error('Error al obtener las empresas');
    }
  }

  async getEmpresaById(id) {
    try {
      const empresa = await empresaRepository.findById(id);
      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }
      return empresa;
    } catch (error) {
      throw new Error('Error al obtener la empresa');
    }
  }

  async createEmpresa(empresaData) {
    try {
      // Verificar si ya existe una empresa con el mismo RUC
      const empresaExistente = await empresaRepository.findByRuc(empresaData.ruc);
      if (empresaExistente) {
        throw new Error('Ya existe una empresa con este RUC');
      }
      return await empresaRepository.create(empresaData);
    } catch (error) {
      throw new Error('Error al crear la empresa');
    }
  }

  async updateEmpresa(id, empresaData) {
    try {
      const empresa = await empresaRepository.update(id, empresaData);
      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }
      return empresa;
    } catch (error) {
      throw new Error('Error al actualizar la empresa');
    }
  }

  async deleteEmpresa(id) {
    try {
      const empresa = await empresaRepository.delete(id);
      if (!empresa) {
        throw new Error('Empresa no encontrada');
      }
      return empresa;
    } catch (error) {
      throw new Error('Error al eliminar la empresa');
    }
  }
}

module.exports = new EmpresaService(); 