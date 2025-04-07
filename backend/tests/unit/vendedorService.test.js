const vendedorService = require('../../src/services/vendedorService');
const vendedorRepository = require('../../src/repositories/vendedorRepository');

// Configurar el mock correctamente
jest.mock('../../src/repositories/vendedorRepository', () => ({
  findAll: jest.fn().mockImplementation(() => Promise.resolve()),
  findById: jest.fn().mockImplementation(() => Promise.resolve()),
  findByEmpresa: jest.fn().mockImplementation(() => Promise.resolve()),
  create: jest.fn().mockImplementation(() => Promise.resolve()),
  update: jest.fn().mockImplementation(() => Promise.resolve()),
  delete: jest.fn().mockImplementation(() => Promise.resolve())
}));

describe('VendedorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllVendedores', () => {
    it('should return all sellers', async () => {
      const mockVendedores = [
        { id: 1, nombre: 'Vendedor 1' },
        { id: 2, nombre: 'Vendedor 2' }
      ];
      vendedorRepository.findAll.mockResolvedValue(mockVendedores);

      const result = await vendedorService.getAllVendedores();
      expect(result).toEqual(mockVendedores);
      expect(vendedorRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when repository fails', async () => {
      vendedorRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(vendedorService.getAllVendedores()).rejects.toThrow('Error al obtener los vendedores');
    });
  });

  describe('getVendedorById', () => {
    it('should return a seller by id', async () => {
      const mockVendedor = { id: 1, nombre: 'Vendedor 1' };
      vendedorRepository.findById.mockResolvedValue(mockVendedor);

      const result = await vendedorService.getVendedorById(1);
      expect(result).toEqual(mockVendedor);
      expect(vendedorRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an error when seller is not found', async () => {
      vendedorRepository.findById.mockResolvedValue(null);

      await expect(vendedorService.getVendedorById(1)).rejects.toThrow('Vendedor no encontrado');
    });
  });

  describe('getVendedoresByEmpresa', () => {
    it('should return sellers by company', async () => {
      const mockVendedores = [
        { id: 1, nombre: 'Vendedor 1', empresa: '123' },
        { id: 2, nombre: 'Vendedor 2', empresa: '123' }
      ];
      vendedorRepository.findByEmpresa.mockResolvedValue(mockVendedores);

      const result = await vendedorService.getVendedoresByEmpresa('123');
      expect(result).toEqual(mockVendedores);
      expect(vendedorRepository.findByEmpresa).toHaveBeenCalledWith('123');
    });

    it('should throw an error when repository fails', async () => {
      vendedorRepository.findByEmpresa.mockRejectedValue(new Error('Database error'));

      await expect(vendedorService.getVendedoresByEmpresa('123')).rejects.toThrow('Error al obtener los vendedores de la empresa');
    });
  });
}); 