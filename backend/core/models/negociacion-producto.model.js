class NegociacionProducto {
    constructor(idNegociacion, idProducto, cantidad, precio, descripcion) {
        this.idNegociacion = idNegociacion;
        this.idProducto = idProducto;
        this.cantidad = cantidad;
        this.precio = precio;
        this.descripcion = descripcion;
    }
}

module.exports = NegociacionProducto;