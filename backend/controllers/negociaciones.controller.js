const negociacionService = require('../services/negociacion.service');
const negociacionProductoService = require('../services/negociacionProducto.service');

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
        const { productos, ...negociacionData } = req.body;

        // Validar que se proporcionen productos
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ error: 'No se puede crear una negociación sin productos' });
        }

        // Crear la negociación
        const nuevaNegociacion = await negociacionService.crearNegociacion(negociacionData);

        // Agregar los productos a la negociación
        for (const producto of productos) {
            await negociacionProductoService.agregarProducto({
                IDNegociacion: nuevaNegociacion.IDNegociacion,
                ...producto
            });
        }

        res.status(201).json(nuevaNegociacion);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarNegociacion = async (req, res) => {
    try {
        const { productos, ...negociacionData } = req.body;

        // Validar que la negociación exista
        const negociacionExistente = await negociacionService.obtenerNegociacionPorId(req.params.id);
        if (!negociacionExistente) {
            return res.status(404).json({ message: 'Negociación no encontrada' });
        }

        // Validar que la negociación tenga productos
        try {
            await negociacionProductoService.validarProductosNegociacion(req.params.id);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        // Actualizar la negociación
        const negociacionActualizada = await negociacionService.actualizarNegociacion(req.params.id, negociacionData);

        // Si se proporcionan nuevos productos, actualizarlos
        if (productos && Array.isArray(productos) && productos.length > 0) {
            // Eliminar los productos existentes
            await negociacionProductoService.eliminarProductosDeNegociacion(req.params.id);

            // Agregar los nuevos productos
            for (const producto of productos) {
                await negociacionProductoService.agregarProducto({
                    IDNegociacion: req.params.id,
                    ...producto
                });
            }
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