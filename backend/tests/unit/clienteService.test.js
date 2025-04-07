const clienteService = require('../../src/services/clienteService');
const clienteRepository = require('../../src/repositories/clienteRepository');

// Configurar el mock correctamente
jest.mock('../../src/repositories/clienteRepository', () => ({
  findAll: jest.fn().mockImplementation(() => Promise.resolve()),
  findById: jest.fn().mockImplementation(() => Promise.resolve()),
  create: jest.fn().mockImplementation(() => Promise.resolve()),
  update: jest.fn().mockImplementation(() => Promise.resolve()),
  delete: jest.fn().mockImplementation(() => Promise.resolve())
}));

describe('ClienteService', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('getAllClientes', () => {
    it('should return all clients', async () => {
      const mockClientes = [
        { id: 1, nombre: 'Cliente 1' },
        { id: 2, nombre: 'Cliente 2' }
      ];
      clienteRepository.findAll.mockResolvedValue(mockClientes);

      const result = await clienteService.getAllClientes();
      expect(result).toEqual(mockClientes);
      expect(clienteRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when repository fails', async () => {
      clienteRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(clienteService.getAllClientes()).rejects.toThrow('Error al obtener los clientes');
    });
  });

  describe('getClienteById', () => {
    it('should return a client by id', async () => {
      const mockCliente = { id: 1, nombre: 'Cliente 1' };
      clienteRepository.findById.mockResolvedValue(mockCliente);

      const result = await clienteService.getClienteById(1);
      expect(result).toEqual(mockCliente);
      expect(clienteRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an error when client is not found', async () => {
      clienteRepository.findById.mockResolvedValue(null);

      await expect(clienteService.getClienteById(1)).rejects.toThrow('Cliente no encontrado');
    });
  });

  // Agregar más pruebas para los otros métodos...
}); 