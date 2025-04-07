const clienteService = require('../services/cliente.service');

const obtenerClientes = async (req, res) => {
    try {
        const clientes = await clienteService.obtenerTodosLosClientes();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerCliente = async (req, res) => {
    try {
        const cliente = await clienteService.obtenerClientePorId(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearCliente = async (req, res) => {
    try {
        const nuevoCliente = await clienteService.crearCliente(req.body);
        res.status(201).json(nuevoCliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarCliente = async (req, res) => {
    try {
        const clienteActualizado = await clienteService.actualizarCliente(req.params.id, req.body);
        if (!clienteActualizado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json(clienteActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarCliente = async (req, res) => {
    try {
        const eliminado = await clienteService.eliminarCliente(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
        res.json({ message: 'Cliente eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
};