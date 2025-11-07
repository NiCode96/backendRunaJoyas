import DataBase from "../config/Database.js";

export default class MercadoPago {

    constructor(id,preference_id, total_amount, paid_amount, order_status, numeroTransaccion_MercadoPago) {
        this._numeroTransaccion_MercadoPago = numeroTransaccion_MercadoPago;
        this._id = id;
        this._preference_id = preference_id;
        this._total_amount = total_amount;
        this._paid_amount = paid_amount;
        this._order_status = order_status;
    }


    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get preference_id() {
        return this._preference_id;
    }

    set preference_id(value) {
        this._preference_id = value;
    }

    get total_amount() {
        return this._total_amount;
    }

    set total_amount(value) {
        this._total_amount = value;
    }

    get paid_amount() {
        return this._paid_amount;
    }

    set paid_amount(value) {
        this._paid_amount = value;
    }

    get order_status() {
        return this._order_status;
    }

    set order_status(value) {
        this._order_status = value;
    }

    get numeroTransaccion_MercadoPago() {
        return this._numeroTransaccion_MercadoPago;
    }

    set numeroTransaccion_MercadoPago(value) {
        this._numeroTransaccion_MercadoPago = value;
    }


    async insertarDataMercadoPago(id, preference_id, total_amount, paid_amount, order_status) {
        try {
            const conexion = DataBase.getInstance();
            const query = 'INSERT INTO mercadoPago_logs (id, preference_id, total_amount, paid_amount, order_status) VALUES (?,?,?,?,?)';
            const param = [id, preference_id, total_amount, paid_amount, order_status];

            const resultado = await conexion.ejecutarQuery(query, param);
            return resultado;
        } catch (error) {
            console.error('Error insertarDataMercadoPago:', error);
            throw error;
        }
    }

}