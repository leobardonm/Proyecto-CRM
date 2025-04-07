const productoService = require('../../src/services/productoService');
const productoRepository = require('../../src/repositories/productoRepository');

// Configurar el mock correctamente
jest.mock('../../src/repositories/productoRepository', () => ({
  findAll: jest.fn().mockImplementation(() => Promise.resolve()),
  findById: jest.fn().mockImplementation(() => Promise.resolve()),
  create: jest.fn().mockImplementation(() => Promise.resolve()),
  update: jest.fn().mockImplementation(() => Promise.resolve()),
  delete: jest.fn().mockImplementation(() => Promise.resolve()),
  updateStock: jest.fn().mockImplementation(() => Promise.resolve())
}));

describe('ProductoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllProductos', () => {
    it('should return all products', async () => {
      const mockProductos = [
        { id: 1, nombre: 'Producto 1' },
        { id: 2, nombre: 'Producto 2' }
      ];
      productoRepository.findAll.mockResolvedValue(mockProductos);

      const result = await productoService.getAllProductos();
      expect(result).toEqual(mockProductos);
      expect(productoRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when repository fails', async () => {
      productoRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(productoService.getAllProductos()).rejects.toThrow('Error al obtener los productos');
    });
  });

  describe('getProductoById', () => {
    it('should return a product by id', async () => {
      const mockProducto = { id: 1, nombre: 'Producto 1' };
      productoRepository.findById.mockResolvedValue(mockProducto);

      const result = await productoService.getProductoById(1);
      expect(result).toEqual(mockProducto);
      expect(productoRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an error when product is not found', async () => {
      productoRepository.findById.mockResolvedValue(null);

      await expect(productoService.getProductoById(1)).rejects.toThrow('Producto no encontrado');
    });
  });

  describe('updateStock', () => {
    it('should update product stock', async () => {
      const mockProducto = { id: 1, nombre: 'Producto 1', stock: 10 };
      productoRepository.updateStock.mockResolvedValue(mockProducto);

      const result = await productoService.updateStock(1, 5);
      expect(result).toEqual(mockProducto);
      expect(productoRepository.updateStock).toHaveBeenCalledWith(1, 5);
    });

    it('should throw an error when product is not found', async () => {
      productoRepository.updateStock.mockResolvedValue(null);

      await expect(productoService.updateStock(1, 5)).rejects.toThrow('Producto no encontrado');
    });
  });
}); 