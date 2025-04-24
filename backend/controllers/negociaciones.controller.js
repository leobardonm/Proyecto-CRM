const negociacionService = require('../services/negociacion.service');
const negociacionProductoService = require('../services/negociacion-producto.service');

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
        const idNegociacion = parseInt(req.params.id);

        // Validar que la negociación exista
        const negociacionExistente = await negociacionService.obtenerNegociacionPorId(idNegociacion);
        if (!negociacionExistente) {
            return res.status(404).json({ message: 'Negociación no encontrada' });
        }

        // Validar que se proporcionen productos
        if (!productos || !Array.isArray(productos) || productos.length === 0) {
            return res.status(400).json({ error: 'Debe proporcionar al menos un producto' });
        }

        // Validar los datos de los productos
        for (const producto of productos) {
            if (!producto.IDProducto || !producto.Cantidad || !producto.PrecioUnitario) {
                return res.status(400).json({ error: 'Cada producto debe tener ID, cantidad y precio unitario' });
            }
        }

        // Actualizar la negociación
        const negociacionActualizada = await negociacionService.actualizarNegociacion(idNegociacion, negociacionData);

        // Eliminar los productos existentes
        await negociacionProductoService.eliminarProductosDeNegociacion(idNegociacion);

        // Agregar los nuevos productos
        for (const producto of productos) {
            await negociacionProductoService.agregarProducto({
                IDNegociacion: idNegociacion,
                IDProducto: producto.IDProducto,
                Cantidad: producto.Cantidad,
                PrecioUnitario: producto.PrecioUnitario,
                Descripcion: producto.Descripcion || ''
            });
        }

        // Obtener la negociación actualizada con sus productos
        const negociacionCompleta = await negociacionService.obtenerNegociacionPorId(idNegociacion);
        res.json(negociacionCompleta);
    } catch (error) {
        console.error('Error al actualizar la negociación:', error);
        res.status(500).json({ 
            error: 'Error al actualizar la negociación',
            details: error.message 
        });
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