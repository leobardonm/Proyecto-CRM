const { pool, getRequest, closeConnection, initializeConnection } = require('../config/test-database');

// Test data
const testData = {
  empresas: [
    { Nombre: 'Empresa Test 1' },
    { Nombre: 'Empresa Test 2' }
  ],
  vendedores: [
    { Nombre: 'Vendedor Test 1', Telefono: '123456789', Email: 'vendedor1@test.com', IdEmpresa: 1 },
    { Nombre: 'Vendedor Test 2', Telefono: '987654321', Email: 'vendedor2@test.com', IdEmpresa: 2 }
  ],
  clientes: [
    { Nombre: 'Cliente Test 1', Direccion: 'Direccion 1', Telefono: '111111111', Email: 'cliente1@test.com' },
    { Nombre: 'Cliente Test 2', Direccion: 'Direccion 2', Telefono: '222222222', Email: 'cliente2@test.com' }
  ],
  productos: [
    { Descripcion: 'Producto Test 1', Precio: 100.00, Stock: 10 },
    { Descripcion: 'Producto Test 2', Precio: 200.00, Stock: 20 }
  ],
  estados: [
    { Id: 1, Descripcion: 'Cancelada' },
    { Id: 2, Descripcion: 'En proceso' },
    { Id: 3, Descripcion: 'Terminada' }
  ]
};

// Initialize test database
const initializeTestDatabase = async () => {
  try {
    await initializeConnection();
    const request = await getRequest();

    // Insert test data in the correct order to maintain referential integrity
    for (const empresa of testData.empresas) {
      await request.query`
        INSERT INTO Empresa (Nombre)
        VALUES (${empresa.Nombre})
      `;
    }

    for (const estado of testData.estados) {
      await request.query`
        INSERT INTO Estado (Id, Descripcion)
        VALUES (${estado.Id}, ${estado.Descripcion})
      `;
    }

    for (const cliente of testData.clientes) {
      await request.query`
        INSERT INTO Cliente (Nombre, Direccion, Telefono, Email)
        VALUES (${cliente.Nombre}, ${cliente.Direccion}, ${cliente.Telefono}, ${cliente.Email})
      `;
    }

    for (const vendedor of testData.vendedores) {
      await request.query`
        INSERT INTO Vendedor (Nombre, Telefono, Email, IdEmpresa)
        VALUES (${vendedor.Nombre}, ${vendedor.Telefono}, ${vendedor.Email}, ${vendedor.IdEmpresa})
      `;
    }

    for (const producto of testData.productos) {
      await request.query`
        INSERT INTO Productos (Descripcion, Precio, Stock)
        VALUES (${producto.Descripcion}, ${producto.Precio}, ${producto.Stock})
      `;
    }

    console.log('Test database initialized successfully');
  } catch (error) {
    console.error('Error initializing test database:', error);
    throw error;
  }
};

// Clean up test database
const cleanupTestDatabase = async () => {
  try {
    const request = await getRequest();

    // Delete all test data in reverse order of dependencies
    await request.query('DELETE FROM NegociacionProductos');
    await request.query('DELETE FROM Negociacion');
    await request.query('DELETE FROM Productos');
    await request.query('DELETE FROM Vendedor');
    await request.query('DELETE FROM Cliente');
    await request.query('DELETE FROM Empresa');
    await request.query('DELETE FROM Estado');

    console.log('Test database cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  } finally {
    await closeConnection();
  }
};

module.exports = {
  initializeTestDatabase,
  cleanupTestDatabase,
  testData
}; 