import DataBase from "../config/Database.js";

export default class Producto {

    constructor (id_producto,tituloProducto,descripcionProducto, valorProducto,imagenProducto,estadoProducto,categoriaProducto){
this.id_producto = id_producto;
this.tituloProducto = tituloProducto;
this.descripcionProducto = descripcionProducto;
this.valorProducto = valorProducto;
this.imagenProducto = imagenProducto;
this.estadoProducto = estadoProducto;
this.categoriaProducto = categoriaProducto;
    }



    //SELECCION DE PRODUCTOS POR categoriaProducto
    async selectProductoCategoria(categoriaProducto){
        const conexion = DataBase.getInstance();
        const query = 'SELECT * FROM productos where categoriaProducto = ?';
        const param = [categoriaProducto];
        try {
            const resultado = await conexion.ejecutarQuery(query, param);
            if(Array.isArray(resultado) && resultado.length > 0){
                return resultado;
            }else {
                return [];
            }
        } catch (error) {
            throw new Error('Problema al establecer la conexion con la base de datos desde la clase Productos.js')

        }
    }





// ACTUALIZACION DE  PRODUCTO EN LA BASE DE DATOS
  async updateProducto(tituloProducto,descripcionProducto,valorProducto,imagenProducto,id_producto){
    const conexion = DataBase.getInstance();
    const query = 'UPDATE productos SET tituloProducto = ? , descripcionProducto = ?, valorProducto = ? ,  imagenProducto = ? where id_producto = ? ';
    const param = [tituloProducto,descripcionProducto,valorProducto,imagenProducto,id_producto];
try {
    const resultado = await conexion.ejecutarQuery(query,param);
    const filasAfectadas = resultado.affectedRows;
    if (filasAfectadas !== undefined && filasAfectadas !== null) {
      return filasAfectadas;
    } else {
      return resultado;
      
    }
} catch (error) {
    throw new Error('NO se logo actualizar Producto  / Problema al establecer la conexion con la base de datos desde la clase Productos.js')
    
}  
  }








// INSERCION DE NUEVO PRODUCTO EN LA BASE DE DATOS
  async insertProducto(tituloProducto,descripcionProducto, valorProducto,imagenProducto){
    const conexion = DataBase.getInstance();
    const query = 'INSERT INTO productos (tituloProducto,descripcionProducto, valorProducto ,imagenProducto) VALUES (?, ?, ?, ?)';
    const param = [tituloProducto,descripcionProducto,valorProducto,imagenProducto];
try {
    const resultado = await conexion.ejecutarQuery(query,param);
    const filasAfectadas = resultado.affectedRows;
    if (filasAfectadas !== undefined && filasAfectadas !== null) {
      return filasAfectadas;
    } else {
      return resultado;
      
    }
} catch (error) {
    throw new Error('NO se logo ingresar Producto nuevo / Problema al establecer la conexion con la base de datos desde la clase Pacientes.js')
    
}  
  }



    // SELECCION DE TODOS LOS PRODUCTOS DE LA BASE DE DATOS
  async selectProducto(){
    const conexion = DataBase.getInstance();
    const query = 'SELECT * FROM productos WHERE estadoProducto <> 0;';
try {
    const resultado = await conexion.ejecutarQuery(query);
    return resultado;
} catch (error) {
    throw new Error('Problema al establecer la conexion con la base de datos desde la clase Productos.js')
    
}  
  }


    // SELECCION DE TODOS LOS PRODUCTOS DE LA BASE DE DATOS QUE ESTAN EN OFERTA (ESTADO PRODUCTO = 3)
    async selectProductoOferta(){
        const conexion = DataBase.getInstance();
        const query = 'SELECT * FROM productos WHERE estadoProducto = 3;';
        try {
            const resultado = await conexion.ejecutarQuery(query);
            return resultado;
        } catch (error) {
            throw new Error('Problema al establecer la conexion con la base de datos desde la clase Productos.js')

        }
    }






    // SELECCION DE TODOS LOS PRODUCTOS DE LA BASE DE DATOS PRECIO ORDEN DEL MENOR A MAYOR
    async seleccionarMenorPrecio(){
        const conexion = DataBase.getInstance();
        const query = 'SELECT * FROM productos WHERE estadoProducto <> 0';
        try {
            const resultado = await conexion.ejecutarQuery(query);
            return resultado;
        } catch (error) {
            throw new Error('Problema al establecer la conexion con la base de datos desde la clase Productos.js')

        }
    }


    // SELECCION DE TODOS LOS PRODUCTOS DE LA BASE DE DATOS PRECIO ORDEN DEL MAYOR A MENOR
    async seleccionarMayorPrecio(){
        const conexion = DataBase.getInstance();
        const query = 'SELECT * FROM productos WHERE estadoProducto <> 0 ORDER BY valorProducto DESC ;';
        try {
            const resultado = await conexion.ejecutarQuery(query);
            return resultado;
        } catch (error) {
            throw new Error('Problema al establecer la conexion con la base de datos desde la clase Productos.js')

        }
    }



//METODO PARA SELECCIONAR PRODUCTO ESPECIFICO POR ID DE PRODUCTO EN LA BASE DE DATOS
    async selectProductoEspecifico(id_producto){
    const conexion = DataBase.getInstance();
    const query = 'SELECT * FROM productos where id_producto = ?';
    const param = [id_producto];
try {
 const resultado = await conexion.ejecutarQuery(query, param);
  if(resultado){
    return resultado[0];
  }
   
} catch (error) {
    throw new Error('Problema al establecer la conexion con la base de datos desde la clase Productos.js')
    
}  
  }





// ELIMINACION LOGICA DE PRODUCTO EN LA BASE DE DATOS
  async eliminarProducto(id_producto){
    const conexion = DataBase.getInstance();
    const query = 'UPDATE productos SET estadoProducto = 0 where id_producto = ?';
    const param = [id_producto];
try {
    const resultado = await conexion.ejecutarQuery(query,param);
    const filasAfectadas = resultado.affectedRows;
    if (filasAfectadas !== undefined && filasAfectadas !== null) {
      return filasAfectadas;
    } else {
      return resultado;
    }
} catch (error) {
    throw new Error('NO se logo eliminar Producto  / Problema al establecer la conexion con la base de datos desde la clase Pacientes.js')
}  
  }
}