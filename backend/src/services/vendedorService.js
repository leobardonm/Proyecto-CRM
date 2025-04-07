const vendedorRepository = require('../repositories/vendedorRepository');

class VendedorService {
  async getAllVendedores() {
    try {
      return await vendedorRepository.findAll();
    } catch (error) {
      throw new Error('Error al obtener los vendedores');
    }
  }

  async getVendedorById(id) {
    try {
      const vendedor = await vendedorRepository.findById(id);
      if (!vendedor) {
        throw new Error('Vendedor no encontrado');
      }
      return vendedor;
    } catch (error) {
      throw new Error('Error al obtener el vendedor');
    }
  }

  async createVendedor(vendedorData) {
    try {
      return await vendedorRepository.create(vendedorData);
    } catch (error) {
      throw new Error('Error al crear el vendedor');
    }
  }

  async updateVendedor(id, vendedorData) {
    try {
      const vendedor = await vendedorRepository.update(id, vendedorData);
      if (!vendedor) {
        throw new Error('Vendedor no encontrado');
      }
      return vendedor;
    } catch (error) {
      throw new Error('Error al actualizar el vendedor');
    }
  }

  async deleteVendedor(id) {
    try {
      const vendedor = await vendedorRepository.delete(id);
      if (!vendedor) {
        throw new Error('Vendedor no encontrado');
      }
      return vendedor;
    } catch (error) {
      throw new Error('Error al eliminar el vendedor');
    }
  }

  async getVendedoresByEmpresa(empresaId) {
    try {
      return await vendedorRepository.findByEmpresa(empresaId);
    } catch (error) {
      throw new Error('Error al obtener los vendedores de la empresa');
    }
  }
}

module.exports = new VendedorService(); 