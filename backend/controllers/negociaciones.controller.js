const negociacionService = require('../services/negociacion.service');

const obtenerNegociaciones = async (req, res) => {
    try {
        const negociaciones = await negociacionService.obtenerTodasLasNegociaciones();
        res.json(negociaciones);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerNegociacion = async (req, res) => {
    try {
        const negociacion = await negociacionService.obtenerNegociacionPorId(req.params.id);
        if (!negociacion) {
            return res.status(404).json({ message: 'Negociación no encontrada' });
        }
        res.json(negociacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearNegociacion = async (req, res) => {
    try {
        const nuevaNegociacion = await negociacionService.crearNegociacion(req.body);
        res.status(201).json(nuevaNegociacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarNegociacion = async (req, res) => {
    try {
        const negociacionActualizada = await negociacionService.actualizarNegociacion(req.params.id, req.body);
        if (!negociacionActualizada) {
            return res.status(404).json({ message: 'Negociación no encontrada' });
        }
        res.json(negociacionActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarNegociacion = async (req, res) => {
    try {
        const eliminado = await negociacionService.eliminarNegociacion(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Negociación no encontrada' });
        }
        res.json({ message: 'Negociación eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerVentasMesActual = async (req, res) => {
    try {
        const totalVentas = await negociacionService.obtenerVentasMesActual();
        res.json({ totalVentas });
    } catch (error) {
        console.error('Error al obtener ventas del mes:', error);
        res.status(500).json({ 
            error: 'Error al obtener las ventas del mes',
            details: error.message 
        });
    }
};

module.exports = {
    obtenerNegociaciones,
    obtenerNegociacion,
    crearNegociacion,
    actualizarNegociacion,
    eliminarNegociacion,
    obtenerVentasMesActual
};