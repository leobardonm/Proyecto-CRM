const clienteRepository = require('../repositories/clienteRepository');

class ClienteService {
  async getAllClientes() {
    try {
      return await clienteRepository.findAll();
    } catch (error) {
      throw new Error('Error al obtener los clientes');
    }
  }

  async getClienteById(id) {
    try {
      const cliente = await clienteRepository.findById(id);
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }
      return cliente;
    } catch (error) {
      throw new Error('Error al obtener el cliente');
    }
  }

  async createCliente(clienteData) {
    try {
      return await clienteRepository.create(clienteData);
    } catch (error) {
      throw new Error('Error al crear el cliente');
    }
  }

  async updateCliente(id, clienteData) {
    try {
      const cliente = await clienteRepository.update(id, clienteData);
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }
      return cliente;
    } catch (error) {
      throw new Error('Error al actualizar el cliente');
    }
  }

  async deleteCliente(id) {
    try {
      const cliente = await clienteRepository.delete(id);
      if (!cliente) {
        throw new Error('Cliente no encontrado');
      }
      return cliente;
    } catch (error) {
      throw new Error('Error al eliminar el cliente');
    }
  }
}

module.exports = new ClienteService(); 