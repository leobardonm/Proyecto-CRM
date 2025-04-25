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
        // Log the entire request body for debugging
        console.log("REQUEST BODY:", JSON.stringify(req.body, null, 2));
        console.log("PRODUCTOS ARRAY:", JSON.stringify(req.body.productos, null, 2));
        
        // Validate that req.body.productos exists and is a non-empty array
        if (!req.body.productos || !Array.isArray(req.body.productos) || req.body.productos.length === 0) {
            return res.status(400).json({ error: 'No se puede crear una negociación sin productos' });
        }

        // Pass the entire body to the service function
        const nuevaNegociacion = await negociacionService.crearNegociacion(req.body);

        // Remove the separate loop for adding products
        /*
        for (const producto of productos) {
            await negociacionProductoService.agregarProducto({
                IDNegociacion: nuevaNegociacion.IDNegociacion,
                ...producto
            });
        }
        */

        // Assuming the service now returns the complete negotiation with products
        res.status(201).json(nuevaNegociacion);
    } catch (error) {
        console.error('Error al crear la negociación:', error); // Added console log
        res.status(500).json({ error: error.message });
    }
};

const actualizarNegociacion = async (req, res) => {
    const idNegociacion = parseInt(req.params.id);
    const requestBody = req.body;

    try {
        // Check if ONLY EstadoID is present in the body (for drag-and-drop update)
        const keys = Object.keys(requestBody);
        const isEstadoUpdateOnly = keys.length === 1 && keys[0] === 'EstadoID';

        let negociacionActualizada;

        if (isEstadoUpdateOnly) {
            // Call the specific service function for updating only the state
            if (requestBody.EstadoID === undefined) {
                 return res.status(400).json({ error: 'EstadoID es requerido para actualizar el estado.' });
            }
            negociacionActualizada = await negociacionService.actualizarEstadoNegociacion(idNegociacion, requestBody.EstadoID);
        } else {
            // This is a full update (from the edit form)
            // Basic check if products array exists and is valid (if present)
            if (requestBody.productos && !Array.isArray(requestBody.productos)) {
                 return res.status(400).json({ error: 'El campo productos debe ser un array.' });
            }
             // Add other necessary validations for full update if needed (e.g., check for IdCliente, IdVendedor)
             if (requestBody.IdVendedor === undefined || requestBody.IdCliente === undefined) {
                return res.status(400).json({ error: 'IdVendedor e IdCliente son requeridos para la actualización completa.' });
             }

            // Call the service function for updating the full negotiation including products
            negociacionActualizada = await negociacionService.actualizarNegociacion(idNegociacion, requestBody);
        }

        // Check if the update/fetch returned a result (handles case where ID doesn't exist)
        if (!negociacionActualizada) {
             return res.status(404).json({ message: 'Negociación no encontrada o no se pudo actualizar' });
        }

        res.json(negociacionActualizada);

    } catch (error) {
        console.error(`Error al actualizar la negociación ${idNegociacion}:`, error);
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