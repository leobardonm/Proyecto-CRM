const empresaService = require('../../src/services/empresaService');
const empresaRepository = require('../../src/repositories/empresaRepository');

// Configurar el mock correctamente
jest.mock('../../src/repositories/empresaRepository', () => ({
  findAll: jest.fn().mockImplementation(() => Promise.resolve()),
  findById: jest.fn().mockImplementation(() => Promise.resolve()),
  findByRuc: jest.fn().mockImplementation(() => Promise.resolve()),
  create: jest.fn().mockImplementation(() => Promise.resolve()),
  update: jest.fn().mockImplementation(() => Promise.resolve()),
  delete: jest.fn().mockImplementation(() => Promise.resolve())
}));

describe('EmpresaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEmpresas', () => {
    it('should return all companies', async () => {
      const mockEmpresas = [
        { id: 1, nombre: 'Empresa 1' },
        { id: 2, nombre: 'Empresa 2' }
      ];
      empresaRepository.findAll.mockResolvedValue(mockEmpresas);

      const result = await empresaService.getAllEmpresas();
      expect(result).toEqual(mockEmpresas);
      expect(empresaRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when repository fails', async () => {
      empresaRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(empresaService.getAllEmpresas()).rejects.toThrow('Error al obtener las empresas');
    });
  });

  describe('createEmpresa', () => {
    it('should create a new company', async () => {
      const empresaData = {
        nombre: 'Nueva Empresa',
        ruc: '12345678901'
      };
      empresaRepository.findByRuc.mockResolvedValue(null);
      empresaRepository.create.mockResolvedValue(empresaData);

      const result = await empresaService.createEmpresa(empresaData);
      expect(result).toEqual(empresaData);
      expect(empresaRepository.create).toHaveBeenCalledWith(empresaData);
    });

    it('should throw an error when RUC already exists', async () => {
      const empresaData = {
        nombre: 'Empresa Existente',
        ruc: '12345678901'
      };
      empresaRepository.findByRuc.mockResolvedValue(empresaData);

      await expect(empresaService.createEmpresa(empresaData)).rejects.toThrow('Ya existe una empresa con este RUC');
    });
  });

  describe('getEmpresaById', () => {
    it('should return a company by id', async () => {
      const mockEmpresa = { id: 1, nombre: 'Empresa 1' };
      empresaRepository.findById.mockResolvedValue(mockEmpresa);

      const result = await empresaService.getEmpresaById(1);
      expect(result).toEqual(mockEmpresa);
      expect(empresaRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an error when company is not found', async () => {
      empresaRepository.findById.mockResolvedValue(null);

      await expect(empresaService.getEmpresaById(1)).rejects.toThrow('Empresa no encontrada');
    });
  });
}); 