const productoService = require('../services/producto.service');

const obtenerProductos = async (req, res) => {
    try {
        console.log('Obteniendo todos los productos...');
        const productos = await productoService.obtenerTodosLosProductos();
        console.log('Productos obtenidos:', productos);
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ 
            error: 'Error al obtener los productos',
            details: error.message 
        });
    }
};

const obtenerProducto = async (req, res) => {
    try {
        console.log('Obteniendo producto con ID:', req.params.id);
        const producto = await productoService.obtenerProductoPorId(req.params.id);
        if (!producto) {
            console.log('Producto no encontrado');
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        console.log('Producto encontrado:', producto);
        res.json(producto);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ 
            error: 'Error al obtener el producto',
            details: error.message 
        });
    }
};

const crearProducto = async (req, res) => {
    try {
        console.log('Creando nuevo producto:', req.body);
        const nuevoProducto = await productoService.crearProducto(req.body);
        console.log('Producto creado:', nuevoProducto);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ 
            error: 'Error al crear el producto',
            details: error.message 
        });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        console.log('Actualizando producto:', req.params.id, req.body);
        const productoActualizado = await productoService.actualizarProducto(req.params.id, req.body);
        if (!productoActualizado) {
            console.log('Producto no encontrado para actualizar');
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        console.log('Producto actualizado:', productoActualizado);
        res.json(productoActualizado);
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ 
            error: 'Error al actualizar el producto',
            details: error.message 
        });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        console.log('Eliminando producto:', req.params.id);
        const eliminado = await productoService.eliminarProducto(req.params.id);
        if (!eliminado) {
            console.log('Producto no encontrado para eliminar');
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        console.log('Producto eliminado exitosamente');
        res.status(204).send();
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ 
            error: 'Error al eliminar el producto',
            details: error.message 
        });
    }
};

module.exports = {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
};