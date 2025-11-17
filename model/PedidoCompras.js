import DataBase from "../config/Database.js";


export default class PedidoCompras {
    constructor(id_pedido, fecha_pedido, estado_pedido, nombre_comprador, apellidosComprador, telefono_comprador, identificacion_comprador, direccion_despacho, comuna , regionPais , comentarios, totalPagado) {
        this.id_pedido = id_pedido;
        this.fecha_pedido = fecha_pedido;
        this.estado_pedido = estado_pedido;
        this.nombre_comprador = nombre_comprador;
        this.apellidosComprador = apellidosComprador;
        this.telefono_comprador = telefono_comprador;
        this.identificacion_comprador = identificacion_comprador;
        this.direccion_despacho = direccion_despacho;
        this.comuna = comuna;
        this.regionPais = regionPais;
        this.comentarios = comentarios;
        this.totalPagado = totalPagado;
    }




//METODO PARA LA INSERCION DE NUEVOS PEDIDOS EN LA BASE DE DATOS
    async insertarPedidoCompra(
        fecha_pedido,
        nombre_comprador,
        apellidosComprador,
        telefono_comprador,
        identificacion_comprador,
        direccion_despacho,
        comuna,
        regionPais,
        comentarios,
        totalPagado){

        const conexion = DataBase.getInstance();
        const query = "INSERT INTO pedidoCompras (fecha_pedido, nombre_comprador, apellidosComprador, telefono_comprador, identificacion_comprador, direccion_despacho, comuna, regionPais, comentarios, totalPagado) VALUES (?,?,?,?,?,?,?,?,?,?)";
        const params = [fecha_pedido, nombre_comprador, apellidosComprador, telefono_comprador, identificacion_comprador, direccion_despacho, comuna, regionPais, comentarios, totalPagado];

        try {
            const resultado = await conexion.ejecutarQuery(query,params);
            if(resultado){
                return resultado;
            }
        }catch (e) {
            console.error("Problema a nivel de Modelo / Conflicto generado en la clase PedidoCompras.js ; "  + e);
        }
    }




// METODO PARA SELECCIONAR TODOS LOS PEDIDOS
    async seleccionarPedidosCompras(){
        try {

            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM pedidoCompras";
            const resultado = await conexion.ejecutarQuery(query);

            if(resultado){
                return resultado;
            }
        }catch (e) {
            console.error('Problema ocurrido al conectar con la base de datos a nivel de clase PedidoCompras.js'   + e);
        }
    }



    //METODO PARA BUSCAR PEDIDOS POR SIMILITUD DE NOMBRE DEL COMPRADOR
    async seleccionarPedidoPorNombreComprador(nombre_comprador){
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM pedidoCompras WHERE nombre_comprador LIKE ?;";
            const params = ['%' + nombre_comprador + '%' ];

            const resultado = await conexion.ejecutarQuery(query,params );

            if(resultado){
                return resultado;
            }

        }catch (e) {
            console.log('Problema encontrado a nivel del model en PedidoCompras.js :  ' + e);
        }
    }





    //METODO PARA BUSCAR PEDIDOS POR ESTADO
    async seleccionarPedidosPorEstado(estado_pedido){
        try {
            const conexion = DataBase.getInstance();
            const query = "SELECT * FROM pedidoCompras WHERE estado_pedido = ?;";
            const params = [estado_pedido];

            const resultado = await conexion.ejecutarQuery(query,params );

            if(resultado){
                return resultado;
            }

        }catch (e) {
            console.log('Problema encontrado a nivel del model en PedidoCompras.js :  ' + e);
        }
    }
}