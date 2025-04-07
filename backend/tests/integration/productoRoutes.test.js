const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

describe('Producto Routes Integration Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
  });

  describe('GET /api/productos', () => {
    it('should return an empty array when no products exist', async () => {
      const response = await request(app)
        .get('/api/productos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all products', async () => {
      const producto = {
        nombre: 'Producto Test',
        descripcion: 'Descripción del producto',
        precio: 100,
        stock: 10,
        categoria: 'Test'
      };

      await request(app)
        .post('/api/productos')
        .send(producto);

      const response = await request(app)
        .get('/api/productos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].nombre).toBe(producto.nombre);
    });
  });

  describe('POST /api/productos', () => {
    it('should create a new product', async () => {
      const producto = {
        nombre: 'Nuevo Producto',
        descripcion: 'Descripción del nuevo producto',
        precio: 200,
        stock: 20,
        categoria: 'Nuevo'
      };

      const response = await request(app)
        .post('/api/productos')
        .send(producto)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.nombre).toBe(producto.nombre);
      expect(response.body.precio).toBe(producto.precio);
    });

    it('should return 400 for invalid data', async () => {
      const invalidProducto = {
        nombre: 'Producto Inválido'
        // faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/productos')
        .send(invalidProducto)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('PATCH /api/productos/:id/stock', () => {
    it('should update product stock', async () => {
      // Primero crear un producto
      const producto = {
        nombre: 'Producto Stock',
        descripcion: 'Producto para prueba de stock',
        precio: 100,
        stock: 10,
        categoria: 'Stock'
      };

      const createResponse = await request(app)
        .post('/api/productos')
        .send(producto);

      const updateResponse = await request(app)
        .patch(`/api/productos/${createResponse.body._id}/stock`)
        .send({ cantidad: 5 })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updateResponse.body.stock).toBe(15); // 10 + 5
    });
  });
}); 