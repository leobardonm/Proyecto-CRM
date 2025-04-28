const { obtenerVendedores, obtenerVendedor, crearVendedor, actualizarVendedor, eliminarVendedor } = require('./vendedores.controller');
const vendedorService = require('../services/vendedor.service');

jest.mock('../services/vendedor.service');

describe('Vendedores Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('obtenerVendedores should return all vendors', async () => {
    const mockVendedores = [
      { Id: 1, Nombre: 'Juan', Telefono: '123456789', Email: 'juan@example.com', IdEmpresa: 1 },
    ];
    vendedorService.obtenerTodosLosVendedores.mockResolvedValue(mockVendedores);

    const req = {};
    const res = { json: jest.fn() };

    await obtenerVendedores(req, res);

    expect(res.json).toHaveBeenCalledWith(mockVendedores);
    expect(vendedorService.obtenerTodosLosVendedores).toHaveBeenCalled();
  });

  test('crearVendedor should create a new vendor', async () => {
    const mockVendedor = { Nombre: 'Pedro', Telefono: '987654321', Email: 'pedro@example.com', IdEmpresa: 1 };
    vendedorService.crearVendedor.mockResolvedValue(mockVendedor);

    const req = { body: { Nombre: 'Pedro', Telefono: '987654321', Email: 'pedro@example.com', IdEmpresa: 1 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearVendedor(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockVendedor);
    expect(vendedorService.crearVendedor).toHaveBeenCalledWith(req.body);
  });
});