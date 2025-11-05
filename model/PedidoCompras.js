import DataBase from "../config/Database.js";

export default class PedidoCompras {
    constructor(id_pedido, fecha_pedido, estado_pedido, nombre_comprador, telefono_comprador, identificacion_comprador, direccion_despacho, comentarios) {

        this._estado_pedido = estado_pedido;
        this._id_pedido = id_pedido;
        this._fecha_pedido = fecha_pedido;
        this._nombre_comprador = nombre_comprador;
        this._telefono_comprador = telefono_comprador;
        this._identificacion_comprador = identificacion_comprador;
        this._direccion_despacho = direccion_despacho;
        this._comentarios = comentarios;
    }

    get id_pedido() {
        return this._id_pedido;
    }

    set id_pedido(value) {
        this._id_pedido = value;
    }

    get fecha_pedido() {
        return this._fecha_pedido;
    }

    set fecha_pedido(value) {
        this._fecha_pedido = value;
    }

    get estado_pedido() {
        return this._estado_pedido;
    }

    set estado_pedido(value) {
        this._estado_pedido = value;
    }

    get nombre_comprador() {
        return this._nombre_comprador;
    }

    set nombre_comprador(value) {
        this._nombre_comprador = value;
    }

    get telefono_comprador() {
        return this._telefono_comprador;
    }

    set telefono_comprador(value) {
        this._telefono_comprador = value;
    }

    get identificacion_comprador() {
        return this._identificacion_comprador;
    }

    set identificacion_comprador(value) {
        this._identificacion_comprador = value;
    }

    get direccion_despacho() {
        return this._direccion_despacho;
    }

    set direccion_despacho(value) {
        this._direccion_despacho = value;
    }

    get comentarios() {
        return this._comentarios;
    }

    set comentarios(value) {
        this._comentarios = value;
    }





}