import { Router } from "express";
const router = Router();
import ProductoController from "../controller/ProductoController.js";



router.post('/insertarProducto', ProductoController.insertarProducto);
router.post('/actualizarProducto', ProductoController.actualizarProducto);
router.post('/eliminarProducto', ProductoController.eliminarProducto);
router.get('/seleccionarProducto', ProductoController.seleccionarTodosProductos);
router.get('/:id_producto', ProductoController.seleccionarProductoEspecifico);





export default router;