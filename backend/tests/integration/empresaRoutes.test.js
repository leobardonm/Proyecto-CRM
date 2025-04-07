const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

describe('Empresa Routes Integration Tests', () => {
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

  describe('GET /api/empresas', () => {
    it('should return an empty array when no companies exist', async () => {
      const response = await request(app)
        .get('/api/empresas')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all companies', async () => {
      const empresa = {
        nombre: 'Empresa Test',
        direccion: 'Dirección Test',
        telefono: '1234567890',
        email: 'test@empresa.com',
        ruc: '12345678901'
      };

      await request(app)
        .post('/api/empresas')
        .send(empresa);

      const response = await request(app)
        .get('/api/empresas')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].nombre).toBe(empresa.nombre);
    });
  });

  describe('POST /api/empresas', () => {
    it('should create a new company', async () => {
      const empresa = {
        nombre: 'Nueva Empresa',
        direccion: 'Nueva Dirección',
        telefono: '0987654321',
        email: 'nueva@empresa.com',
        ruc: '98765432109'
      };

      const response = await request(app)
        .post('/api/empresas')
        .send(empresa)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.nombre).toBe(empresa.nombre);
      expect(response.body.ruc).toBe(empresa.ruc);
    });

    it('should return 400 for invalid data', async () => {
      const invalidEmpresa = {
        nombre: 'Empresa Inválida'
        // faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/empresas')
        .send(invalidEmpresa)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should return 400 for duplicate RUC', async () => {
      const empresa1 = {
        nombre: 'Empresa 1',
        direccion: 'Dirección 1',
        telefono: '1234567890',
        email: 'empresa1@test.com',
        ruc: '12345678901'
      };

      await request(app)
        .post('/api/empresas')
        .send(empresa1);

      const empresa2 = {
        nombre: 'Empresa 2',
        direccion: 'Dirección 2',
        telefono: '0987654321',
        email: 'empresa2@test.com',
        ruc: '12345678901' // Mismo RUC
      };

      const response = await request(app)
        .post('/api/empresas')
        .send(empresa2)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });
}); 