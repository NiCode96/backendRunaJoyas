import { Router } from "express";
const router = Router();
import ProductoController from "../controller/ProductoController.js";



router.post('/insertarProducto', ProductoController.insertarProducto);
router.post('/actualizarProducto', ProductoController.actualizarProducto);
router.post('/eliminarProducto', ProductoController.eliminarProducto);
router.get('/seleccionarProducto', ProductoController.seleccionarTodosProductos);
router.get('/:id_producto', ProductoController.seleccionarProductoEspecifico);
router.post('/categoriaProducto', ProductoController.seleccionarProductoCategoria);
router.get('/ordenarMayor', ProductoController.seleccionarTodosProductosMayorPrecio);
router.get('/ordenarMenor', ProductoController.seleccionarTodosProductosMenorPrecio);





export default router;