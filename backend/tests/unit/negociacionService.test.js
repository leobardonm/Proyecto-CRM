const negociacionService = require('../../src/services/negociacionService');
const negociacionRepository = require('../../src/repositories/negociacionRepository');
const clienteService = require('../../src/services/clienteService');
const vendedorService = require('../../src/services/vendedorService');
const estadoService = require('../../src/services/estadoService');
const productoService = require('../../src/services/productoService');

// Configurar los mocks correctamente
jest.mock('../../src/repositories/negociacionRepository', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  findByCliente: jest.fn(),
  updateEstado: jest.fn(),
  addProducto: jest.fn(),
  updateProducto: jest.fn(),
  getProductosByNegociacion: jest.fn()
}));

jest.mock('../../src/services/clienteService', () => ({
  getClienteById: jest.fn()
}));

jest.mock('../../src/services/vendedorService', () => ({
  getVendedorById: jest.fn()
}));

jest.mock('../../src/services/estadoService', () => ({
  getEstadoById: jest.fn()
}));

jest.mock('../../src/services/productoService', () => ({
  getProductoById: jest.fn()
}));

describe('NegociacionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllNegociaciones', () => {
    it('should return all negotiations', async () => {
      const mockNegociaciones = [
        { id: 1, cliente: 'cliente1', vendedor: 'vendedor1' },
        { id: 2, cliente: 'cliente2', vendedor: 'vendedor2' }
      ];
      negociacionRepository.findAll.mockResolvedValue(mockNegociaciones);

      const result = await negociacionService.getAllNegociaciones();
      expect(result).toEqual(mockNegociaciones);
      expect(negociacionRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when repository fails', async () => {
      negociacionRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(negociacionService.getAllNegociaciones()).rejects.toThrow('Error al obtener las negociaciones');
    });
  });

  describe('createNegociacion', () => {
    it('should create a new negotiation', async () => {
      const negociacionData = {
        cliente: 'cliente1',
        vendedor: 'vendedor1',
        estado: 'estado1',
        productos: [{ producto: 'producto1', cantidad: 1 }]
      };

      clienteService.getClienteById.mockResolvedValue({ id: 'cliente1' });
      vendedorService.getVendedorById.mockResolvedValue({ id: 'vendedor1' });
      estadoService.getEstadoById.mockResolvedValue({ id: 'estado1' });
      productoService.getProductoById.mockResolvedValue({ id: 'producto1' });
      negociacionRepository.create.mockResolvedValue(negociacionData);

      const result = await negociacionService.createNegociacion(negociacionData);
      expect(result).toEqual(negociacionData);
      expect(negociacionRepository.create).toHaveBeenCalledWith(negociacionData);
    });

    it('should throw an error when client does not exist', async () => {
      const negociacionData = {
        cliente: 'cliente1',
        vendedor: 'vendedor1',
        estado: 'estado1'
      };

      clienteService.getClienteById.mockResolvedValue(null);

      await expect(negociacionService.createNegociacion(negociacionData))
        .rejects.toThrow('Cliente no encontrado');
    });
  });

  describe('updateEstadoNegociacion', () => {
    it('should update the state of a negotiation', async () => {
      const mockNegociacion = { id: 1, estado: 'nuevoEstado' };
      negociacionRepository.updateEstado.mockResolvedValue(mockNegociacion);

      const result = await negociacionService.updateEstadoNegociacion(1, 'nuevoEstado');
      expect(result).toEqual(mockNegociacion);
      expect(negociacionRepository.updateEstado).toHaveBeenCalledWith(1, 'nuevoEstado');
    });

    it('should throw an error when negotiation is not found', async () => {
      negociacionRepository.updateEstado.mockResolvedValue(null);

      await expect(negociacionService.updateEstadoNegociacion(1, 'nuevoEstado'))
        .rejects.toThrow('Negociación no encontrada');
    });
  });

  describe('getNegociacionesByCliente', () => {
    it('should return negotiations by client', async () => {
      const mockNegociaciones = [
        { id: 1, cliente: 'cliente1' },
        { id: 2, cliente: 'cliente1' }
      ];
      negociacionRepository.findByCliente.mockResolvedValue(mockNegociaciones);

      const result = await negociacionService.getNegociacionesByCliente('cliente1');
      expect(result).toEqual(mockNegociaciones);
      expect(negociacionRepository.findByCliente).toHaveBeenCalledWith('cliente1');
    });

    it('should throw an error when repository fails', async () => {
      negociacionRepository.findByCliente.mockRejectedValue(new Error('Database error'));

      await expect(negociacionService.getNegociacionesByCliente('cliente1'))
        .rejects.toThrow('Error al obtener las negociaciones del cliente');
    });
  });

  describe('addProductoToNegociacion', () => {
    it('should add a product to a negotiation', async () => {
      const productoData = {
        producto: 'producto1',
        cantidad: 1,
        precio: 100
      };

      productoService.getProductoById.mockResolvedValue({ id: 'producto1' });
      negociacionRepository.addProducto.mockResolvedValue({
        id: 1,
        productos: [productoData]
      });

      const result = await negociacionService.addProductoToNegociacion(1, productoData);
      expect(result.productos).toContainEqual(productoData);
      expect(negociacionRepository.addProducto).toHaveBeenCalledWith(1, productoData);
    });

    it('should throw an error when product does not exist', async () => {
      const productoData = {
        producto: 'producto1',
        cantidad: 1,
        precio: 100
      };

      productoService.getProductoById.mockResolvedValue(null);

      await expect(negociacionService.addProductoToNegociacion(1, productoData))
        .rejects.toThrow('Producto no encontrado');
    });
  });

  describe('updateProductoInNegociacion', () => {
    it('should update a product in a negotiation', async () => {
      const productoData = {
        cantidad: 2,
        precio: 200
      };

      productoService.getProductoById.mockResolvedValue({ id: 'producto1' });
      negociacionRepository.updateProducto.mockResolvedValue({
        id: 1,
        productos: [productoData]
      });

      const result = await negociacionService.updateProductoInNegociacion(1, 'producto1', productoData);
      expect(result.productos).toContainEqual(productoData);
      expect(negociacionRepository.updateProducto).toHaveBeenCalledWith(1, 'producto1', productoData);
    });

    it('should throw an error when negotiation or product is not found', async () => {
      const productoData = {
        cantidad: 2,
        precio: 200
      };

      productoService.getProductoById.mockResolvedValue({ id: 'producto1' });
      negociacionRepository.updateProducto.mockResolvedValue(null);

      await expect(negociacionService.updateProductoInNegociacion(1, 'producto1', productoData))
        .rejects.toThrow('Negociación o producto no encontrado');
    });
  });

  describe('getProductosByNegociacion', () => {
    it('should return products from a negotiation', async () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1' },
        { id: 2, nombre: 'Producto 2' }
      ];
      negociacionRepository.getProductosByNegociacion.mockResolvedValue(mockProductos);

      const result = await negociacionService.getProductosByNegociacion(1);
      expect(result).toEqual(mockProductos);
      expect(negociacionRepository.getProductosByNegociacion).toHaveBeenCalledWith(1);
    });

    it('should throw an error when negotiation is not found', async () => {
      negociacionRepository.getProductosByNegociacion.mockResolvedValue(null);

      await expect(negociacionService.getProductosByNegociacion(1))
        .rejects.toThrow('Negociación no encontrada');
    });
  });
}); 