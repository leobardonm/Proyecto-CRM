const estadoService = require('../services/estado.service');

const obtenerEstados = async (req, res) => {
    try {
        const estados = await estadoService.obtenerTodosLosEstados();
        res.json(estados);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerEstado = async (req, res) => {
    try {
        const estado = await estadoService.obtenerEstadoPorId(req.params.id);
        if (!estado) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.json(estado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearEstado = async (req, res) => {
    try {
        const nuevoEstado = await estadoService.crearEstado(req.body);
        res.status(201).json(nuevoEstado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarEstado = async (req, res) => {
    try {
        const estadoActualizado = await estadoService.actualizarEstado(req.params.id, req.body);
        if (!estadoActualizado) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.json(estadoActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarEstado = async (req, res) => {
    try {
        const eliminado = await estadoService.eliminarEstado(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Estado no encontrado' });
        }
        res.json({ message: 'Estado eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerEstados,
    obtenerEstado,
    crearEstado,
    actualizarEstado,
    eliminarEstado,
};