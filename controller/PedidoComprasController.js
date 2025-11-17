import PedidoCompras from '../model/PedidoCompras.js';
import e from "express";

export default class PedidoComprasController {
    constructor() {
    }
//METODO CONTROLLER PARA INSERTAR NUEVO PEDIDO EN LA BASE DE DATOS
    static async insertarPedidoNuevo(req, res) {
        try {
            const {fecha_pedido, nombre_comprador, apellidosComprador, telefono_comprador, identificacion_comprador, direccion_despacho, comuna, regionPais, comentarios} = req.body;
            if (!fecha_pedido || !nombre_comprador || !apellidosComprador || !telefono_comprador || !identificacion_comprador || !direccion_despacho || !comuna  || !regionPais || !comentarios) {
                return res.status(400).send({message:"sindato"});
            }else {
                const pedidoCompra = new PedidoCompras();
                const resultado = await pedidoCompra.insertarPedidoCompra(fecha_pedido, nombre_comprador, apellidosComprador, telefono_comprador, identificacion_comprador, direccion_despacho, comuna, regionPais, comentarios);
                if (resultado.affectedRows > 0) {
                    return res.status(200).send({message:"ok"});
                }else{
                    return res.status(400).send({message:"nosuccess"});
                }
            }
        }catch (e) {
            return res.status(400).json({error: e});
        }
    }





    // METODO CONTROLLER PARA SELECCIONAR TODOS LOS PEDIDOS DESDE LA BASE DE DATOS
    static async seleccionarPedidos(req, res) {
        try {
            const pedidoCompra = new PedidoCompras();
            const dataPedido =  await pedidoCompra.seleccionarPedidosCompras();
            if (dataPedido) {
                return res.json(dataPedido);
            }else{
                return res.status(400).send({error: e});
            }
        }catch (e) {
            return res.status(400).json({error: e});
        }
    }



    //METODO PARA LA BUSQUEDA POR SIMILITUD DE NOMBRES DE LOS PEDIDOS
    static async buscarPedidosPorNombre(req, res) {
        try {
            const {nombre_comprador} = req.body;
            if (!nombre_comprador) {
                return res.status(400).send({message:"sidato"});
            }else {
                const pedidoCompra = new PedidoCompras();
                const dataPedidos = await pedidoCompra.seleccionarPedidoPorNombreComprador(nombre_comprador);
                if (dataPedidos) {
                    return res.json(dataPedidos);
                }
            }
        }catch (e) {
            console.log('Problema detectado en la clase PedidoComprasController.js :  '+e);
            return res.status(400).send({error: e});
        }
    }





    //METODO PARA LA BUSQUEDA POR SIMILITUD DE NOMBRES DE LOS PEDIDOS
    static async buscarPedidosPorEstados(req, res) {
        try {
            const {estado_pedido} = req.body;
            if (!estado_pedido) {
                return res.status(400).send({message:"sidato"});
            }else {
                const pedidoCompra = new PedidoCompras();
                const dataPedidos = await pedidoCompra.seleccionarPedidosPorEstado(estado_pedido)
                if (dataPedidos) {
                    return res.json(dataPedidos);
                }
            }
        }catch (e) {
            console.log('Problema detectado en la clase PedidoComprasController.js :  '+e);
            return res.status(400).send({error: e});
        }
    }
}