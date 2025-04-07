const clienteController = require('../../src/controllers/clienteController');
const clienteService = require('../../src/services/clienteService');

// Configurar el mock correctamente
jest.mock('../../src/services/clienteService', () => ({
  getAllClientes: jest.fn().mockImplementation(() => Promise.resolve()),
  getClienteById: jest.fn().mockImplementation(() => Promise.resolve()),
  createCliente: jest.fn().mockImplementation(() => Promise.resolve()),
  updateCliente: jest.fn().mockImplementation(() => Promise.resolve()),
  deleteCliente: jest.fn().mockImplementation(() => Promise.resolve())
}));

describe('ClienteController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      params: {},
      body: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getAllClientes', () => {
    it('should return all clients with status 200', async () => {
      const mockClientes = [{ id: 1, nombre: 'Cliente 1' }];
      clienteService.getAllClientes.mockResolvedValue(mockClientes);

      await clienteController.getAllClientes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockClientes);
    });

    it('should handle errors with status 500', async () => {
      const error = new Error('Error de base de datos');
      clienteService.getAllClientes.mockRejectedValue(error);

      await clienteController.getAllClientes(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Error al obtener los clientes' });
    });
  });

  describe('getClienteById', () => {
    it('should return a client with status 200', async () => {
      const mockCliente = { id: 1, nombre: 'Cliente 1' };
      mockReq.params.id = '1';
      clienteService.getClienteById.mockResolvedValue(mockCliente);

      await clienteController.getClienteById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockCliente);
    });

    it('should handle not found with status 404', async () => {
      const error = new Error('Cliente no encontrado');
      mockReq.params.id = '1';
      clienteService.getClienteById.mockRejectedValue(error);

      await clienteController.getClienteById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Cliente no encontrado' });
    });
  });

  describe('createCliente', () => {
    it('should create a client and return it with status 201', async () => {
      const mockCliente = { nombre: 'Nuevo Cliente' };
      mockReq.body = mockCliente;
      clienteService.createCliente.mockResolvedValue(mockCliente);

      await clienteController.createCliente(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockCliente);
    });

    it('should handle validation errors with status 400', async () => {
      const error = new Error('Datos inválidos');
      mockReq.body = {};
      clienteService.createCliente.mockRejectedValue(error);

      await clienteController.createCliente(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: 'Datos inválidos' });
    });
  });
}); 