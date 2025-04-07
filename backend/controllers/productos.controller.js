const productoService = require('../services/producto.service');

const obtenerProductos = async (req, res) => {
    try {
        const productos = await productoService.obtenerTodosLosProductos();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerProducto = async (req, res) => {
    try {
        const producto = await productoService.obtenerProductoPorId(req.params.id);
        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(producto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearProducto = async (req, res) => {
    try {
        const nuevoProducto = await productoService.crearProducto(req.body);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarProducto = async (req, res) => {
    try {
        const productoActualizado = await productoService.actualizarProducto(req.params.id, req.body);
        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(productoActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarProducto = async (req, res) => {
    try {
        const eliminado = await productoService.eliminarProducto(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
};