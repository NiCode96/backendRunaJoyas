import Producto from "../model/Producto.js";

export default class ProductoController {
  constructor() {}

    // SELECCION DE LOS PRODUCTOS DE LA BASE DE DATOS CATEGORIA POR ID
    static async seleccionarProductoCategoria(req, res) {
        try {
            const { categoriaProducto } = req.body;
            console.log(categoriaProducto);
            const producto = new Producto();

            if (!categoriaProducto) {
               return res.status(404).json({message:"sindato"});

            } else {
                const dataProducto = await producto.selectProductoCategoria(categoriaProducto);
                return res.json(dataProducto);
            }
        } catch (error) {
            res.status(500).json({message: "sindato",});
        }
    }




//ACTUALIZAR PRODUCTO EN LA BASE DE DATOS
  static async actualizarProducto(req, res) {
    try {
      console.log(req.body);
      const {
        tituloProducto,
        descripcionProducto,
        valorProducto,
        imagenProducto,
        id_producto
      } = req.body;

      if (
        !tituloProducto ||
        !descripcionProducto ||
        !valorProducto ||
        !imagenProducto||
        !id_producto
      ) {
        return res
          .status(400)
          .json({ message: "Faltan datos obligatorios en el body" });
      }

      const producto = new Producto();
      const resultado = await producto.updateProducto(
        tituloProducto,
        descripcionProducto,
        valorProducto,
        imagenProducto,
        id_producto
      );
      
      return res.json(resultado);
    } catch (error) {
      res.status(500).json({
        error:
          "No se ha podido realizar la consulta desde ProductoController.js",
      });
    }
  }





//INSERTAR NUEVO PRODUCTO EN LA BASE DE DATOS
  static async insertarProducto(req, res) {
    try {
      console.log(req.body);
      const {
        tituloProducto,
        descripcionProducto,
        valorProducto,
        imagenProducto,
      } = req.body;

      if (
        !tituloProducto ||
        !descripcionProducto ||
        !valorProducto ||
        !imagenProducto
      ) {
        return res
          .status(400)
          .json({ message: "Faltan datos obligatorios en el body" });
      }

      const producto = new Producto();
      const resultado = await producto.insertProducto(
        tituloProducto,
        descripcionProducto,
        valorProducto,
        imagenProducto
      );

      return res.json(resultado);
    } catch (error) {
      res.status(500).json({
        error:
          "No se ha podido realizar la consulta desde ProductoController.js",
      });
    }
  }

  // SELECCION DE TODOS LOS PRODUCTOS DE LA BASE DE DATOS
  static async seleccionarTodosProductos(req, res) {
    try {
      const producto = new Producto();
      const dataProducto = await producto.selectProducto();
      return res.json(dataProducto);
    } catch (error) {
      res.status(500).json({
        error:
          "No se ha podido realizar la consulta desde ProductoController.js",
      });
    }
  }




    // SELECCION DE TODOS LOS PRODUCTOS DE LA BASE DE DATOS PRECIO ORDEN DEL MENOR A MAYOR
    static async seleccionarTodosProductosMenorPrecio(req, res) {
        try {
            const producto = new Producto();
            const dataProducto = await producto.seleccionarMenorPrecio();

            if (!dataProducto || (Array.isArray(dataProducto) && dataProducto.length === 0)) {
                return res.status(404).json({message:"sindato"});
            }else {
                return res.json(dataProducto);
            }

        } catch (error) {
            res.status(500).json({
                error:
                    "No se ha podido realizar la consulta desde ProductoController.js",
            });
        }
    }



    // SELECCION DE TODOS LOS PRODUCTOS DE LA BASE DE DATOS PRECIO ORDEN DEL MAYOR A MENOR
    static async seleccionarTodosProductosMayorPrecio(req, res) {
        try {
            const producto = new Producto();
            const dataProducto = await producto.seleccionarMayorPrecio();
            return res.json(dataProducto);
        } catch (error) {
            res.status(500).json({
                error:
                    "No se ha podido realizar la consulta desde ProductoController.js",
            });
        }
    }



  // SELECCION DE LOS PRODUCTOS DE LA BASE DE DATOS ESPECIFICOS POR ID
  // SE USA req.params y NO req.body porque es una peticion get en body solo se usa en PUT Y POST
  static async seleccionarProductoEspecifico(req, res) {
    try {
      const { id_producto } = req.params;
      console.log(id_producto);
      const producto = new Producto();

      if (!id_producto) {
        res
          .status(404)
          .json({
            message:
              "No se ha podido realizar la consulta desde producto controller por falta de informacion desde el fronent para sleccionar producto especifico",
          });
      } else {
        const dataProducto = await producto.selectProductoEspecifico(
          id_producto
        );
        return res.json(dataProducto);
      }
    } catch (error) {
      res.status(500).json({
        error:
          "No se ha podido realizar la consulta desde ProductoController.js",
      });
    }
  }



  static async eliminarProducto(req, res) {
    try {
      console.log(req.body);
      const {
  id_producto
      } = req.body;

      if (
        !id_producto
      ) {
        return res
          .status(400)
          .json({ message: "Faltan datos obligatorios en el body" });
      }

      const producto = new Producto();
      const resultado = await producto.eliminarProducto(id_producto);
      return res.json(resultado);
    } catch (error) {
      res.status(500).json({
        error:
          "No se ha podido realizar la consulta desde ProductoController.js",
      });
    }
  }
}