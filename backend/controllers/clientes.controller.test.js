const {
    obtenerCliente,
    obtenerClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente
  } = require('./clientes.controller');
  const clienteService = require('../services/cliente.service');
  
  jest.mock('../services/cliente.service');
  
  describe('Clientes Controller', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Mock data based on your Cliente table schema
    const mockCliente = {
      Id: 1,
      Nombre: 'Cliente Ejemplo',
      Direccion: 'Calle Falsa 123',
      Telefono: '555-1234',
      Email: 'cliente@ejemplo.com'
    };
  
    const mockClientes = [
      mockCliente,
      {
        Id: 2,
        Nombre: 'Otro Cliente',
        Direccion: 'Avenida Siempre Viva 742',
        Telefono: '555-5678',
        Email: 'otro@cliente.com'
      }
    ];
  
    test('obtenerClientes should return all clients', async () => {
      clienteService.obtenerTodosLosClientes.mockResolvedValue(mockClientes);
  
      const req = {};
      const res = { json: jest.fn() };
  
      await obtenerClientes(req, res);
  
      expect(res.json).toHaveBeenCalledWith(mockClientes);
      expect(clienteService.obtenerTodosLosClientes).toHaveBeenCalled();
    });
  
    test('obtenerCliente should return a single client', async () => {
      clienteService.obtenerClientePorId.mockResolvedValue(mockCliente);
  
      const req = { params: { id: 1 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  
      await obtenerCliente(req, res);
  
      expect(clienteService.obtenerClientePorId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(mockCliente);
    });
  
    test('crearCliente should create a new client', async () => {
      const newCliente = {
        Nombre: 'Nuevo Cliente',
        Direccion: 'Nueva Dirección 456',
        Telefono: '555-9876',
        Email: 'nuevo@cliente.com'
      };
  
      const createdCliente = { Id: 3, ...newCliente };
      clienteService.crearCliente.mockResolvedValue(createdCliente);
  
      const req = { body: newCliente };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await crearCliente(req, res);
  
      expect(clienteService.crearCliente).toHaveBeenCalledWith(newCliente);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdCliente);
    });
  
    test('actualizarCliente should update an existing client', async () => {
      const updatedData = {
        Nombre: 'Cliente Actualizado',
        Telefono: '555-0000'
      };
  
      const updatedCliente = { ...mockCliente, ...updatedData };
      clienteService.actualizarCliente.mockResolvedValue(updatedCliente);
  
      const req = { params: { id: 1 }, body: updatedData };
      const res = { json: jest.fn() };
  
      await actualizarCliente(req, res);
  
      expect(clienteService.actualizarCliente).toHaveBeenCalledWith(1, updatedData);
      expect(res.json).toHaveBeenCalledWith(updatedCliente);
    });
  
    test('eliminarCliente should delete a client', async () => {
      clienteService.eliminarCliente.mockResolvedValue(true);
  
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
      await eliminarCliente(req, res);
  
      expect(clienteService.eliminarCliente).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  
    test('should return 404 when client is not found', async () => {
      clienteService.obtenerClientePorId.mockResolvedValue(null);
  
      const req = { params: { id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await obtenerCliente(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cliente no encontrado' });
    });
  
    test('should return 400 when creating client with invalid email', async () => {
      const invalidCliente = {
        Nombre: 'Cliente Inválido',
        Direccion: 'Dirección Válida 123',
        Telefono: '555-1234',
        Email: 'email-invalido'
      };
  
      const req = { body: invalidCliente };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await crearCliente(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email no válido' });
    });
  
    test('should return 409 when email already exists', async () => {
      const duplicateCliente = {
        Nombre: 'Cliente Duplicado',
        Direccion: 'Dirección 456',
        Telefono: '555-5555',
        Email: 'cliente@ejemplo.com' // Same email as mockCliente
      };
  
      clienteService.crearCliente.mockRejectedValue({ code: '23505' }); // PostgreSQL duplicate key error code
  
      const req = { body: duplicateCliente };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await crearCliente(req, res);
  
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ message: 'El email ya está registrado' });
    });
  });