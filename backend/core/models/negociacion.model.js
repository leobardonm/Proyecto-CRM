class Negociacion {
    constructor(id, fechaInicio, estadoId, vendedorId, clienteId) {
        this.id = id;
        this.fechaInicio = fechaInicio;
        this.estadoId = estadoId;
        this.vendedorId = vendedorId;
        this.clienteId = clienteId;
    }
}

module.exports = Negociacion;