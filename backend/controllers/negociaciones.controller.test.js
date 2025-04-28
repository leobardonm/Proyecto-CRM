const { 
    obtenerNegociacion, 
    obtenerNegociaciones, 
    crearNegociacion, 
    actualizarNegociacion, 
    eliminarNegociacion 
  } = require('./negociaciones.controller');
  const negociacionService = require('../services/negociacion.service');
  const productoService = require('../services/producto.service');
  
  jest.mock('../services/negociacion.service');
  jest.mock('../services/producto.service');
  
  describe('Negociaciones Controller', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    // Mock data based on your schema
    const mockNegociacion = {
      IDNegociacion: 1,
      FechaInicio: '2023-01-01',
      FechaFin: '2023-12-31',
      Total: 1500.50,
      Estado: 1,
      IdCliente: 1,
      IdVendedor: 1,
      Comision: 150.05
    };
  
    const mockNegociacionProducto = {
      IDNegociacion: 1,
      IDProducto: 1,
      Cantidad: 2,
      Precio: 750.25,
      Descripcion: 'Producto de prueba'
    };
  
    const mockCliente = {
      Id: 1,
      Nombre: 'Cliente Test',
      Direccion: 'Dirección Test',
      Telefono: '123456789',
      Email: 'cliente@test.com'
    };
  
    const mockVendedor = {
      Id: 1,
      Nombre: 'Vendedor Test',
      Telefono: '987654321',
      Email: 'vendedor@test.com',
      IdEmpresa: 1
    };
  
    const mockEstado = {
      Id: 1,
      Descripcion: 'En progreso'
    };
  
    test('obtenerNegociaciones should return all negotiations', async () => {
      negociacionService.obtenerTodasLasNegociaciones.mockResolvedValue([mockNegociacion]);
  
      const req = {};
      const res = { json: jest.fn() };
  
      await obtenerNegociaciones(req, res);
  
      expect(res.json).toHaveBeenCalledWith([mockNegociacion]);
      expect(negociacionService.obtenerTodasLasNegociaciones).toHaveBeenCalled();
    });
  
    test('obtenerNegociacion should return a single negotiation with details', async () => {
      const fullNegociacion = {
        ...mockNegociacion,
        Cliente: mockCliente,
        Vendedor: mockVendedor,
        Estado: mockEstado,
        Productos: [mockNegociacionProducto]
      };
  
      negociacionService.obtenerNegociacionPorId.mockResolvedValue(fullNegociacion);
  
      const req = { params: { id: 1 } };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
  
      await obtenerNegociacion(req, res);
  
      expect(negociacionService.obtenerNegociacionPorId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(fullNegociacion);
    });
  
    test('crearNegociacion should create a new negotiation with products', async () => {
      const newNegociacion = {
        FechaInicio: '2023-01-01',
        FechaFin: '2023-12-31',
        IdCliente: 1,
        IdVendedor: 1,
        Productos: [
          { IDProducto: 1, Cantidad: 2 }
        ]
      };
  
      const createdNegociacion = {
        IDNegociacion: 1,
        ...newNegociacion,
        Total: 1500.50,
        Estado: 1,
        Comision: 150.05
      };
  
      negociacionService.crearNegociacion.mockResolvedValue(createdNegociacion);
      productoService.obtenerProductoPorId.mockResolvedValue({
        IDProducto: 1,
        Precio: 750.25,
        Descripcion: 'Producto de prueba'
      });
  
      const req = { body: newNegociacion };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await crearNegociacion(req, res);
  
      expect(negociacionService.crearNegociacion).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdNegociacion);
    });
  
    test('actualizarNegociacion should update negotiation status', async () => {
      const updatedData = { Estado: 2 }; // Estado cambiado a "Completado"
      const updatedNegociacion = { ...mockNegociacion, Estado: 2 };
  
      negociacionService.actualizarNegociacion.mockResolvedValue(updatedNegociacion);
  
      const req = { params: { id: 1 }, body: updatedData };
      const res = { json: jest.fn() };
  
      await actualizarNegociacion(req, res);
  
      expect(negociacionService.actualizarNegociacion).toHaveBeenCalledWith(1, updatedData);
      expect(res.json).toHaveBeenCalledWith(updatedNegociacion);
    });
  
    test('eliminarNegociacion should delete a negotiation', async () => {
      negociacionService.eliminarNegociacion.mockResolvedValue(true);
  
      const req = { params: { id: 1 } };
      const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  
      await eliminarNegociacion(req, res);
  
      expect(negociacionService.eliminarNegociacion).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  
    test('should return 400 when creating negotiation with invalid products', async () => {
      const invalidNegociacion = {
        FechaInicio: '2023-01-01',
        FechaFin: '2023-12-31',
        IdCliente: 1,
        IdVendedor: 1,
        Productos: [
          { IDProducto: 999, Cantidad: 2 } // Producto no existente
        ]
      };
  
      productoService.obtenerProductoPorId.mockResolvedValue(null);
  
      const req = { body: invalidNegociacion };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await crearNegociacion(req, res);
  
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Uno o más productos no existen' });
    });
  
    test('should return 404 when negotiation is not found', async () => {
      negociacionService.obtenerNegociacionPorId.mockResolvedValue(null);
  
      const req = { params: { id: 999 } };
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  
      await obtenerNegociacion(req, res);
  
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Negociación no encontrada' });
    });
  });