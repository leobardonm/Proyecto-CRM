const vendedorService = require('../services/vendedor.service');

const obtenerVendedores = async (req, res) => {
    try {
        const vendedores = await vendedorService.obtenerTodosLosVendedores();
        res.json(vendedores);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerVendedor = async (req, res) => {
    try {
        const vendedor = await vendedorService.obtenerVendedorPorId(req.params.id);
        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }
        res.json(vendedor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearVendedor = async (req, res) => {
    try {
        const nuevoVendedor = await vendedorService.crearVendedor(req.body);
        res.status(201).json(nuevoVendedor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarVendedor = async (req, res) => {
    try {
        const vendedorActualizado = await vendedorService.actualizarVendedor(req.params.id, req.body);
        if (!vendedorActualizado) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }
        res.json(vendedorActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarVendedor = async (req, res) => {
    try {
        const eliminado = await vendedorService.eliminarVendedor(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Vendedor no encontrado' });
        }
        res.json({ message: 'Vendedor eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerVendedores,
    obtenerVendedor,
    crearVendedor,
    actualizarVendedor,
    eliminarVendedor,
};