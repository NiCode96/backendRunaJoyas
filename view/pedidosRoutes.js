import { Router } from 'express';
const router = Router();
import PedidoComprasController from "../controller/PedidoComprasController.js";

router.post("/ingresarNuevoPedido", PedidoComprasController.insertarPedidoNuevo);
router.get("/seleccionarPedidos", PedidoComprasController.seleccionarPedidos);
router.post("/seleccionarPorComprador", PedidoComprasController.buscarPedidosPorNombre);
router.post("/seleccionarPorEstados", PedidoComprasController.buscarPedidosPorEstados);



export default router;