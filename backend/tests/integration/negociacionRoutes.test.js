const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');
const Cliente = require('../../src/models/Cliente');
const Vendedor = require('../../src/models/Vendedor');
const Estado = require('../../src/models/Estado');
const Producto = require('../../src/models/Producto');
const Negociacion = require('../../src/models/Negociacion');

describe('Negociacion Routes Integration Tests', () => {
  let cliente;
  let vendedor;
  let estado;
  let producto;

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

    // Crear datos de prueba
    cliente = await Cliente.create({
      nombre: 'Cliente Test',
      email: 'cliente@test.com',
      telefono: '1234567890'
    });

    vendedor = await Vendedor.create({
      nombre: 'Vendedor Test',
      email: 'vendedor@test.com',
      telefono: '0987654321'
    });

    estado = await Estado.create({
      nombre: 'Estado Test',
      descripcion: 'Descripción Test',
      color: '#FF0000',
      orden: 1
    });

    producto = await Producto.create({
      nombre: 'Producto Test',
      descripcion: 'Descripción Test',
      precio: 100,
      stock: 10
    });
  });

  describe('POST /api/negociaciones', () => {
    it('should create a new negotiation', async () => {
      const negociacionData = {
        cliente: cliente._id,
        vendedor: vendedor._id,
        estado: estado._id,
        productos: [
          {
            producto: producto._id,
            cantidad: 2,
            precioUnitario: 100
          }
        ]
      };

      const response = await request(app)
        .post('/api/negociaciones')
        .send(negociacionData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.cliente).toBe(cliente._id.toString());
      expect(response.body.vendedor).toBe(vendedor._id.toString());
      expect(response.body.montoTotal).toBe(200);
    });

    it('should return 400 for invalid data', async () => {
      const invalidNegociacion = {
        cliente: cliente._id
        // faltan campos requeridos
      };

      const response = await request(app)
        .post('/api/negociaciones')
        .send(invalidNegociacion)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/negociaciones/cliente/:clienteId', () => {
    it('should return negotiations by client', async () => {
      // Crear una negociación
      await Negociacion.create({
        cliente: cliente._id,
        vendedor: vendedor._id,
        estado: estado._id,
        productos: [
          {
            producto: producto._id,
            cantidad: 1,
            precioUnitario: 100
          }
        ]
      });

      const response = await request(app)
        .get(`/api/negociaciones/cliente/${cliente._id}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].cliente).toBe(cliente._id.toString());
    });
  });

  describe('PUT /api/negociaciones/:id/estado', () => {
    it('should update the state of a negotiation', async () => {
      // Crear una negociación
      const negociacion = await Negociacion.create({
        cliente: cliente._id,
        vendedor: vendedor._id,
        estado: estado._id,
        productos: [
          {
            producto: producto._id,
            cantidad: 1,
            precioUnitario: 100
          }
        ]
      });

      // Crear un nuevo estado
      const nuevoEstado = await Estado.create({
        nombre: 'Nuevo Estado',
        descripcion: 'Nueva Descripción',
        color: '#00FF00',
        orden: 2
      });

      const response = await request(app)
        .put(`/api/negociaciones/${negociacion._id}/estado`)
        .send({ estadoId: nuevoEstado._id })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.estado).toBe(nuevoEstado._id.toString());
    });
  });

  describe('Productos en Negociaciones', () => {
    let negociacion;

    beforeEach(async () => {
      // Crear una negociación
      negociacion = await Negociacion.create({
        cliente: cliente._id,
        vendedor: vendedor._id,
        estado: estado._id,
        productos: []
      });
    });

    describe('POST /api/negociaciones/:id/productos', () => {
      it('should add a product to a negotiation', async () => {
        const productoData = {
          producto: producto._id,
          cantidad: 2,
          precioUnitario: 100
        };

        const response = await request(app)
          .post(`/api/negociaciones/${negociacion._id}/productos`)
          .send(productoData)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.productos.length).toBe(1);
        expect(response.body.productos[0].cantidad).toBe(productoData.cantidad);
        expect(response.body.productos[0].precioUnitario).toBe(productoData.precioUnitario);
        expect(response.body.montoTotal).toBe(200);
      });

      it('should return 400 for invalid product data', async () => {
        const invalidProductoData = {
          cantidad: 2
          // faltan campos requeridos
        };

        const response = await request(app)
          .post(`/api/negociaciones/${negociacion._id}/productos`)
          .send(invalidProductoData)
          .expect('Content-Type', /json/)
          .expect(400);

        expect(response.body.message).toBeDefined();
      });
    });

    describe('GET /api/negociaciones/:id/productos', () => {
      it('should return products from a negotiation', async () => {
        // Agregar un producto a la negociación
        await Negociacion.findByIdAndUpdate(
          negociacion._id,
          {
            $push: {
              productos: {
                producto: producto._id,
                cantidad: 1,
                precioUnitario: 100,
                subtotal: 100
              }
            }
          }
        );

        const response = await request(app)
          .get(`/api/negociaciones/${negociacion._id}/productos`)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].cantidad).toBe(1);
        expect(response.body[0].precioUnitario).toBe(100);
      });
    });

    describe('PUT /api/negociaciones/:negociacionId/productos/:productoId', () => {
      it('should update a product in a negotiation', async () => {
        // Agregar un producto a la negociación
        const updatedNegociacion = await Negociacion.findByIdAndUpdate(
          negociacion._id,
          {
            $push: {
              productos: {
                producto: producto._id,
                cantidad: 1,
                precioUnitario: 100,
                subtotal: 100
              }
            }
          },
          { new: true }
        );

        const productoId = updatedNegociacion.productos[0]._id;
        const updateData = {
          cantidad: 3,
          precioUnitario: 100
        };

        const response = await request(app)
          .put(`/api/negociaciones/${negociacion._id}/productos/${productoId}`)
          .send(updateData)
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.productos[0].cantidad).toBe(updateData.cantidad);
        expect(response.body.montoTotal).toBe(300);
      });
    });
  });
}); 