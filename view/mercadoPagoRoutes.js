import { Router } from 'express';
import {createOrder, recibirPago} from "../controller/MercadoPagoController.js";

const router = Router();




// RUTA PARA RECONOCER LA RUTA DE PAGAR CON MERCADO PAGO DESDE EL BACKEND
router.get('/', (req, res) => {res.send("Bienvenido a pasarela de Pago")})

// RUTA PARA CREAR LA ORDEN
router.post('/create-order', createOrder);

// WEBHOOK DE ESTADO PAGADO
router.post('/notificacionPago', recibirPago);


// Rutas de retorno para MercadoPago (failure / pending)
// Devuelven un mensaje simple o redirigen al FRONT_URL si está configurada.
router.get('/failure', (req, res) => {
  const front = process.env.FRONT_URL || null;
  if (front) return res.redirect(`${front}/failure`);
  return res.send('Pago fallido - status: failure');
});

router.get('/pending', (req, res) => {
  const front = process.env.FRONT_URL || null;
  if (front) return res.redirect(`${front}/pending`);
  return res.send('Pago pendiente - status: pending');
});


export default router;
