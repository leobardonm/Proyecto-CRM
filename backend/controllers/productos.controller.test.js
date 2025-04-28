const { obtenerProducto, obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } = require('./productos.controller');
const productoService = require('../services/producto.service');

jest.mock('../services/producto.service');

describe('Productos Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('obtenerProductos should return all products', async () => {
    const mockProductos = [
      { IDProducto: 1, Stock: 10, Descripcion: 'Producto 1', Precio: 100.50 },
      { IDProducto: 2, Stock: 5, Descripcion: 'Producto 2', Precio: 200.75 }
    ];
    productoService.obtenerTodosLosProductos.mockResolvedValue(mockProductos);

    const req = {};
    const res = { json: jest.fn() };

    await obtenerProductos(req, res);

    expect(res.json).toHaveBeenCalledWith(mockProductos);
    expect(productoService.obtenerTodosLosProductos).toHaveBeenCalled();
  });

  test('obtenerProducto should return a single product', async () => {
    const mockProducto = { IDProducto: 1, Stock: 10, Descripcion: 'Producto 1', Precio: 100.50 };
    productoService.obtenerProductoPorId.mockResolvedValue(mockProducto);

    const req = { params: { id: 1 } };
    const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

    await obtenerProducto(req, res);

    expect(productoService.obtenerProductoPorId).toHaveBeenCalledWith(1);
    expect(res.json).toHaveBeenCalledWith(mockProducto);
  });

  test('crearProducto should create a new product', async () => {
    const newProduct = { Stock: 15, Descripcion: 'Nuevo Producto', Precio: 150.00 };
    const createdProduct = { IDProducto: 3, ...newProduct };
    productoService.crearProducto.mockResolvedValue(createdProduct);

    const req = { body: newProduct };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await crearProducto(req, res);

    expect(productoService.crearProducto).toHaveBeenCalledWith(newProduct);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(createdProduct);
  });

  test('actualizarProducto should update an existing product', async () => {
    const updatedData = { Stock: 20, Descripcion: 'Producto Actualizado', Precio: 180.00 };
    const updatedProduct = { IDProducto: 1, ...updatedData };
    productoService.actualizarProducto.mockResolvedValue(updatedProduct);

    const req = { params: { id: 1 }, body: updatedData };
    const res = { json: jest.fn() };

    await actualizarProducto(req, res);

    expect(productoService.actualizarProducto).toHaveBeenCalledWith(1, updatedData);
    expect(res.json).toHaveBeenCalledWith(updatedProduct);
  });

  test('eliminarProducto should delete a product', async () => {
    productoService.eliminarProducto.mockResolvedValue(true);

    const req = { params: { id: 1 } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };

    await eliminarProducto(req, res);

    expect(productoService.eliminarProducto).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  test('should return 404 when product is not found', async () => {
    productoService.obtenerProductoPorId.mockResolvedValue(null);

    const req = { params: { id: 999 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    await obtenerProducto(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Producto no encontrado' });
  });
});