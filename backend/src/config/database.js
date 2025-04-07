const sql = require('mssql');

// Verificar que las variables de entorno estén cargadas
console.log('Variables de entorno:', {
    USUARIO_BD: process.env.USUARIO_BD,
    SERVIDOR_BD: process.env.SERVIDOR_BD,
    NOMBRE_BD: process.env.NOMBRE_BD,
    PUERTO: process.env.PUERTO
});

const config = {
    user: process.env.USUARIO_BD,
    password: process.env.CONTRASENA_BD,
    server: process.env.SERVIDOR_BD,
    database: process.env.NOMBRE_BD,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

async function conectarDB() {
    try {
        console.log('Intentando conectar con la configuración:', {
            user: config.user,
            server: config.server,
            database: config.database
        });
        
        await sql.connect(config);
        console.log('Conexión a SQL Server establecida correctamente');
    } catch (error) {
        console.error('Error al conectar a SQL Server:', error);
        process.exit(1);
    }
}

module.exports = {
    sql,
    conectarDB
}; 