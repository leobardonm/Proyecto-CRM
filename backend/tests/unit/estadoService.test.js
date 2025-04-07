const estadoService = require('../../src/services/estadoService');
const estadoRepository = require('../../src/repositories/estadoRepository');

// Configurar el mock correctamente
jest.mock('../../src/repositories/estadoRepository', () => ({
  findAll: jest.fn().mockImplementation(() => Promise.resolve()),
  findById: jest.fn().mockImplementation(() => Promise.resolve()),
  findByNombre: jest.fn().mockImplementation(() => Promise.resolve()),
  create: jest.fn().mockImplementation(() => Promise.resolve()),
  update: jest.fn().mockImplementation(() => Promise.resolve()),
  delete: jest.fn().mockImplementation(() => Promise.resolve()),
  updateOrden: jest.fn().mockImplementation(() => Promise.resolve())
}));

describe('EstadoService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllEstados', () => {
    it('should return all states', async () => {
      const mockEstados = [
        { id: 1, nombre: 'Estado 1' },
        { id: 2, nombre: 'Estado 2' }
      ];
      estadoRepository.findAll.mockResolvedValue(mockEstados);

      const result = await estadoService.getAllEstados();
      expect(result).toEqual(mockEstados);
      expect(estadoRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw an error when repository fails', async () => {
      estadoRepository.findAll.mockRejectedValue(new Error('Database error'));

      await expect(estadoService.getAllEstados()).rejects.toThrow('Error al obtener los estados');
    });
  });

  describe('createEstado', () => {
    it('should create a new state', async () => {
      const estadoData = {
        nombre: 'Nuevo Estado',
        orden: 1
      };
      estadoRepository.findByNombre.mockResolvedValue(null);
      estadoRepository.create.mockResolvedValue(estadoData);

      const result = await estadoService.createEstado(estadoData);
      expect(result).toEqual(estadoData);
      expect(estadoRepository.create).toHaveBeenCalledWith(estadoData);
    });

    it('should throw an error when state name already exists', async () => {
      const estadoData = {
        nombre: 'Estado Existente',
        orden: 1
      };
      estadoRepository.findByNombre.mockResolvedValue(estadoData);

      await expect(estadoService.createEstado(estadoData)).rejects.toThrow('Ya existe un estado con ese nombre');
    });
  });

  describe('getEstadoById', () => {
    it('should return a state by id', async () => {
      const mockEstado = { id: 1, nombre: 'Estado 1' };
      estadoRepository.findById.mockResolvedValue(mockEstado);

      const result = await estadoService.getEstadoById(1);
      expect(result).toEqual(mockEstado);
      expect(estadoRepository.findById).toHaveBeenCalledWith(1);
    });

    it('should throw an error when state is not found', async () => {
      estadoRepository.findById.mockResolvedValue(null);

      await expect(estadoService.getEstadoById(1)).rejects.toThrow('Estado no encontrado');
    });
  });

  describe('updateOrdenEstados', () => {
    it('should update the order of states', async () => {
      const estados = [
        { _id: 1, orden: 1 },
        { _id: 2, orden: 2 }
      ];
      estadoRepository.updateOrden.mockResolvedValue({ modifiedCount: 2 });

      await estadoService.updateOrdenEstados(estados);
      expect(estadoRepository.updateOrden).toHaveBeenCalledWith(estados);
    });

    it('should throw an error when update fails', async () => {
      const estados = [
        { _id: 1, orden: 1 },
        { _id: 2, orden: 2 }
      ];
      estadoRepository.updateOrden.mockRejectedValue(new Error('Update failed'));

      await expect(estadoService.updateOrdenEstados(estados)).rejects.toThrow('Error al actualizar el orden de los estados');
    });
  });
}); 