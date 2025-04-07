const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../app');
const Vendedor = require('../../src/models/Vendedor');
const { conectarDB } = require('../../src/config/database');

describe('Vendedor Routes Integration Tests', () => {
  beforeAll(async () => {
    await conectarDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Vendedor.deleteMany({});
  });

  describe('POST /api/vendedores', () => {
    it('should create a new seller', async () => {
      const vendedorData = {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '1234567890',
        empresa: '12345678901'
      };

      const response = await request(app)
        .post('/api/vendedores')
        .send(vendedorData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.nombre).toBe(vendedorData.nombre);
      expect(response.body.email).toBe(vendedorData.email);
      expect(response.body.telefono).toBe(vendedorData.telefono);
      expect(response.body.empresa).toBe(vendedorData.empresa);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        nombre: 'Juan Pérez'
        // faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/vendedores')
        .send(invalidData)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/vendedores', () => {
    it('should return all sellers', async () => {
      // Crear algunos vendedores de prueba
      await Vendedor.create([
        { nombre: 'Vendedor 1', email: 'v1@example.com', telefono: '123', empresa: '123' },
        { nombre: 'Vendedor 2', email: 'v2@example.com', telefono: '456', empresa: '123' }
      ]);

      const response = await request(app)
        .get('/api/vendedores')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.length).toBe(2);
    });
  });

  describe('GET /api/vendedores/empresa/:empresaId', () => {
    it('should return sellers by company', async () => {
      // Primero crear una empresa
      const empresa = {
        nombre: 'Empresa Test',
        direccion: 'Dirección Test'
      };

      const empresaResponse = await request(app)
        .post('/api/empresas')
        .send(empresa);

      // Crear vendedor asociado a la empresa
      const vendedor = {
        nombre: 'Vendedor Empresa',
        email: 'vendedor@empresa.com',
        telefono: '1234567890',
        comision: 10,
        empresa: empresaResponse.body._id
      };

      await request(app)
        .post('/api/vendedores')
        .send(vendedor);

      const response = await request(app)
        .get(`/api/vendedores/empresa/${empresaResponse.body._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].nombre).toBe(vendedor.nombre);
    });
  });
}); 