const negociacionProductoService = require('../services/negociacion-producto.service');

const obtenerProductosDeNegociacion = async (req, res) => {
    try {
        const productos = await negociacionProductoService.obtenerProductosPorNegociacion(req.params.idNegociacion);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const agregarProductoANegociacion = async (req, res) => {
    try {
        const nuevoProducto = await negociacionProductoService.agregarProducto(req.body);
        res.status(201).json(nuevoProducto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarProductoEnNegociacion = async (req, res) => {
    try {
        const productoActualizado = await negociacionProductoService.actualizarProducto(
            req.params.idNegociacion,
            req.params.idProducto,
            req.body
        );
        if (!productoActualizado) {
            return res.status(404).json({ message: 'Producto no encontrado en la negociación' });
        }
        res.json(productoActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarProductoDeNegociacion = async (req, res) => {
    try {
        const eliminado = await negociacionProductoService.eliminarProducto(req.params.idNegociacion, req.params.idProducto);
        if (!eliminado) {
            return res.status(404).json({ message: 'Producto no encontrado en la negociación' });
        }
        res.json({ message: 'Producto eliminado exitosamente de la negociación' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerProductosDeNegociacion,
    agregarProductoANegociacion,
    actualizarProductoEnNegociacion,
    eliminarProductoDeNegociacion,
};