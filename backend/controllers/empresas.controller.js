const empresaService = require('../services/empresa.service');

const obtenerEmpresas = async (req, res) => {
    try {
        const empresas = await empresaService.obtenerTodasLasEmpresas();
        res.json(empresas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const obtenerEmpresa = async (req, res) => {
    try {
        const empresa = await empresaService.obtenerEmpresaPorId(req.params.id);
        if (!empresa) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.json(empresa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const crearEmpresa = async (req, res) => {
    try {
        const nuevaEmpresa = await empresaService.crearEmpresa(req.body);
        res.status(201).json(nuevaEmpresa);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const actualizarEmpresa = async (req, res) => {
    try {
        const empresaActualizada = await empresaService.actualizarEmpresa(req.params.id, req.body);
        if (!empresaActualizada) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.json(empresaActualizada);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const eliminarEmpresa = async (req, res) => {
    try {
        const eliminado = await empresaService.eliminarEmpresa(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: 'Empresa no encontrada' });
        }
        res.json({ message: 'Empresa eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerEmpresas,
    obtenerEmpresa,
    crearEmpresa,
    actualizarEmpresa,
    eliminarEmpresa,
};