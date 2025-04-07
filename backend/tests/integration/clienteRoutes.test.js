const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

describe('Cliente Routes Integration Tests', () => {
  beforeAll(async () => {
    // Conectar a una base de datos de prueba
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Cerrar la conexión después de las pruebas
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Limpiar la base de datos antes de cada prueba
    await mongoose.connection.dropDatabase();
  });

  describe('GET /api/clientes', () => {
    it('should return an empty array when no clients exist', async () => {
      const response = await request(app)
        .get('/api/clientes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all clients', async () => {
      // Crear un cliente de prueba
      const cliente = {
        nombre: 'Cliente Test',
        email: 'test@example.com',
        telefono: '1234567890'
      };

      await request(app)
        .post('/api/clientes')
        .send(cliente);

      const response = await request(app)
        .get('/api/clientes')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].nombre).toBe(cliente.nombre);
    });
  });

  describe('POST /api/clientes', () => {
    it('should create a new client', async () => {
      const cliente = {
        nombre: 'Nuevo Cliente',
        email: 'nuevo@example.com',
        telefono: '1234567890'
      };

      const response = await request(app)
        .post('/api/clientes')
        .send(cliente)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.nombre).toBe(cliente.nombre);
      expect(response.body.email).toBe(cliente.email);
    });

    it('should return 400 for invalid data', async () => {
      const invalidCliente = {
        nombre: 'Cliente Inválido'
        // email y teléfono faltantes
      };

      const response = await request(app)
        .post('/api/clientes')
        .send(invalidCliente)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
}); 