/**
 * MercadoPagoController
 * ---------------------
 * Controlador para:
 * 1) Crear preferencias de pago (Checkout Pro) -> `createOrder`
 * 2) Recibir notificaciones de pago vía Webhook -> `recibirPago`
 *
 * ¿Qué hace cada parte?
 * - Helpers (`buildItems`, `buildPayer`): normalizan datos del carrito y del comprador para el formato que espera Mercado Pago.
 * - `createOrder(req, res)`: recibe el carrito/datos del frontend, arma la `preference` y la crea con el SDK de Mercado Pago.
 *   Devuelve al front los enlaces `init_point`/`sandbox_init_point` para redirigir al checkout.
 * - `recibirPago(req, res)`: endpoint que MP llama *después* del pago (evento webhook).
 *   Con el `paymentId` consulta detalles en la API de MP y aquí debes guardar/actualizar tu pedido en la DB.
 *
 * Dónde se coloca en el backend:
 * - Este archivo exporta funciones que debes montar en tus rutas de Express.
 *   Ejemplo (app.js / routes/pagos.js):
 *
 *     import express from 'express';
 *     import { createOrder, recibirPago } from './MercadoPagoController.js';
 *     const router = express.Router();
 *
 *     // Crea la preferencia de pago (frontend llama aquí antes de redirigir al checkout)
 *     router.post('/pagos/create-order', createOrder);
 *
 *     // Webhook (Mercado Pago enviará POST aquí con eventos de pago)
 *     router.post('/pagos/webhook', recibirPago);
 *
 *     export default router;
 *
 * Recomendaciones:
 * - Configura la variable de entorno MP_NOTIFICATION_URL con la URL pública de tu webhook.
 * - Implementa idempotencia al procesar pagos (guardar `payment_id` y evitar reprocesar el mismo).
 * - Loguea poco en producción y resguarda tokens. Usa HTTPS en producción.
 */
import dotenv from 'dotenv';
import mercadopago, * as mpNamed from 'mercadopago';
import MercadoPago from '../model/MercadoPago.js';


// Carga variables de entorno (MP_ACCESS_TOKEN, FRONT_URL, MP_NOTIFICATION_URL, etc.)
dotenv.config();

/**
 * Normaliza los items del carrito al formato que espera MP.
 * @param {Array} carrito - Lista de productos del carrito (opcional).
 * @param {Object} fallback - Estructura { title, unit_price, quantity } cuando no hay carrito.
 * @param {string} CURRENCY - Código de moneda (ej: 'CLP').
 * @returns {Array} items normalizados para preference.items
 */
function buildItems(carrito, fallback, CURRENCY) {
  if (Array.isArray(carrito) && carrito.length > 0) {
    return carrito.map(p => ({
      title: p.title ?? p.nombre ?? p.name ?? 'Producto',
      unit_price: Number(p.unit_price ?? p.precio ?? p.price ?? 0),
      quantity: Number(p.quantity ?? p.cantidad ?? 1),
      currency_id: CURRENCY,
      picture_url: p.picture_url ?? p.imagen ?? undefined,
      category_id: p.category_id ?? undefined,
    }));
  }
  return [{
    title: fallback.title,
    unit_price: Number(fallback.unit_price),
    currency_id: CURRENCY,
    quantity: Number(fallback.quantity ?? 1),
  }];
}

/**
 * Construye el objeto payer (comprador) para MP.
 * @param {Object} usuario - Datos del usuario { nombre, apellido, email, phone?, address? }.
 * @param {Object} direccion - Dirección alternativa { calle, numero, cp }.
 * @returns {Object|undefined} payer compatible con MP
 */
function buildPayer(usuario, direccion){
  if (!usuario) return undefined;
  return {
    name: usuario.nombre ?? usuario.name ?? undefined,
    surname: usuario.apellido ?? usuario.surname ?? undefined,
    email: usuario.email ?? undefined,
    phone: usuario.phone ? { number: Number(usuario.phone.number ?? usuario.phone.numero ?? 0) } : undefined,
    address: (usuario.address || direccion) ? {
      street_name: usuario.address?.street_name ?? direccion?.calle ?? undefined,
      street_number: Number(usuario.address?.street_number ?? direccion?.numero ?? 0) || undefined,
    } : undefined,
  };
}

/**
 * Crea una preferencia de pago en Mercado Pago.
 *
 * Entrada (req.body):
 * - productosDelCarrito | productos: array de productos { title/nombre, unit_price/precio, quantity/cantidad, ... }
 * - title, unit_price, quantity: fallback si no se envía carrito.
 * - usuario: { id, nombre, apellido, email, phone?, address? }
 * - idPedido, idPedidoSQL: identificador del pedido (se usa como external_reference).
 * - idUsuario: identificador del usuario (alternativo a usuario.id).
 * - direccion: { calle, numero, cp } (opcional).
 * - notification_url: sobreescribe la URL del webhook si se envía.
 *
 * Salida:
 * - 200 OK con { id, init_point, sandbox_init_point } para redirigir al checkout.
 * - 500 en caso de error al crear la preferencia.
 *
 * Notas:
 * - Usa ACCESS_TOKEN desde variables de entorno.
 * - statement_descriptor: texto que ve el cliente en su estado de cuenta.
 * - back_urls: URLs de retorno para success/failure/pending (las usa MP al terminar el flujo).
 */
export const createOrder = async (req, res) => {
    try {
        const {
            title,
            unit_price,
            quantity,
            currency_id,
            productos,               // array de objetos de productos
            productosDelCarrito,     // alias aceptado
            usuario,                 // { id, nombre, apellido, email, phone?, address? }
            idPedido,                // id del pedido
            idPedidoSQL,             // alias aceptado
            idUsuario,               // id del usuario (opcional si viene en usuario.id)
            direccion,               // { calle, numero, cp } opcional
            notification_url         // permite sobreescribir la URL de notificación
        } = req.body || {};

        const CURRENCY = 'CLP';

        // Resolver equivalencias (alias) y defaults desde el body
        const carrito = Array.isArray(productosDelCarrito)
            ? productosDelCarrito
            : (Array.isArray(productos) ? productos : []);

        const idPedidoResolved = idPedido ?? idPedidoSQL ?? null;
        const idUsuarioResolved = idUsuario ?? usuario?.id ?? null;

        const items = buildItems(carrito, { title, unit_price, quantity }, CURRENCY);

        const payer = buildPayer(usuario, direccion);

        const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN_TEST || '';
        if (!ACCESS_TOKEN) {
            return res.status(500).json({ error: 'No hay access token configurado en el servidor' });
        }

        // Construcción de la preference (payload que consume MP)
        const preference = {
            items,
            statement_descriptor: 'RUNA JOYAS',
            ...(payer ? { payer } : {}),
            metadata: {
                idPedido: idPedidoResolved,
                idUsuario: idUsuarioResolved,
            },
            ...(idPedidoResolved ? { external_reference: String(idPedidoResolved) } : {}),
            back_urls: {
                success: process.env.FRONT_URL ? `${process.env.FRONT_URL}/success` : 'http://localhost:3000/success',
                failure: process.env.FRONT_URL ? `${process.env.FRONT_URL}/failure` : 'http://localhost:3000/failure',
                pending: process.env.FRONT_URL ? `${process.env.FRONT_URL}/pending` : 'http://localhost:3000/pending',
            },
            ...(notification_url || process.env.MP_NOTIFICATION_URL ? {
                notification_url: notification_url || process.env.MP_NOTIFICATION_URL
            } : {}),
        };

        // ⚠️ Solo para depuración local. Evitar logs con datos sensibles en producción.
        console.log('Creando preferencia con payload:', JSON.stringify(preference, null, 2));

        let resultBody;
        try {
            // Compatibilidad con SDKs: usa la clase `MercadoPagoConfig/Preference` o el cliente clásico `mercadopago.preferences`
            if (mpNamed.MercadoPagoConfig && mpNamed.Preference) {
                const client = new mpNamed.MercadoPagoConfig({ accessToken: ACCESS_TOKEN });
                const prefClient = new mpNamed.Preference(client);
                const resp = await prefClient.create({ body: preference });
                resultBody = resp.body || resp;
            } else if (mercadopago.preferences) {
                if (typeof mercadopago.configure === 'function') {
                    mercadopago.configure({ access_token: ACCESS_TOKEN });
                }
                try {
                    const resp = await mercadopago.preferences.create({ body: preference });
                    resultBody = resp.body || resp;
                } catch {
                    const resp = await mercadopago.preferences.create(preference);
                    resultBody = resp.body || resp;
                }
            } else {
                throw new Error('SDK de mercadopago no compatible con este controlador');
            }
        } catch (err) { } // <- creación de preferencia

        if (!resultBody) {
            // Si por alguna razón no obtuvimos body, devolvemos error con detalle para depurar
            const details = lastError?.response?.body || lastError?.message || String(lastError || 'No se obtuvo respuesta del SDK');
            console.error('No se pudo crear la preferencia. Detalles:', details);
            return res.status(500).json({ error: 'Error al crear la orden de pago', details });
        }

        res.status(200).json({
            id: resultBody.id,
            init_point: resultBody.init_point,
            sandbox_init_point: resultBody.sandbox_init_point,
        });

    } catch (error) {
        console.error('Error creando preferencia:', error);
        const message = error?.response?.body || error.message || 'Error al crear la orden de pago';
        res.status(500).json({ error: 'Error al crear la orden de pago', details: message });
    }
};


/**
 * Webhook de Mercado Pago (POST).
 *
 * Flujo:
 * 1) MP envía un POST a esta URL con info mínima (id del pago y tipo de evento).
 * 2) Con ese `paymentId`, consultamos el detalle del pago en la API REST de MP (v1).
 * 3) Aquí debes:
 *    - Buscar tu pedido por `external_reference` (lo enviaste en createOrder como idPedido).
 *    - Guardar el pago (payment_id, status, amount, payer.email, etc.).
 *    - Actualizar el estado del pedido (ej: 'pagado' si status === 'approved').
 *    - Evitar reprocesar el mismo pago (idempotencia).
 *
 * Ruteo:
 * - Monta esta función en tu servidor: POST /pagos/webhook
 * - Usa MP_NOTIFICATION_URL para apuntar a este endpoint público.
 *
 * Seguridad:
 * - Verifica el token de MP en la cabecera si usas firma/HMAC (opcional según config).
 * - Responde 200 rápido; maneja reintentos en tu backend si algo falla.
 */
export const recibirPago = async (req, res) => {
    const ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

    if (!ACCESS_TOKEN) {
        return res.status(500).json({ error: 'No hay access token configurado en el servidor' });
    }

    try {
        // --- Payload delwebhook (documentación MP) ---
        // Ejemplo:
        // {
        //   action: 'payment.updated',
        //   api_version: 'v1',
        //   data: { id: '123456' },   // <--- ESTE es el payment_id
        //   date_created: '2021-11-01T02:02:02Z',
        //   id: 'abcdef',             // id del evento, NO del pago
        //   live_mode: false,
        //   type: 'payment',          // o 'merchant_order'
        //   user_id: 2964661140
        // }

        const body = req.body || {};
        const q = req.query || {};

        // --- LOG ADICIONAL: mostrar raw body y headers para depuración del webhook ---
        console.log('--- WEBHOOK MP RAW PAYLOAD ---');
        try {
            console.log('Raw body:', JSON.stringify(body, null, 2));
        } catch (e) {
            console.log('Raw body (non-serializable):', body);
        }
        console.log('Query string:', JSON.stringify(q, null, 2));
        console.log('Headers:', JSON.stringify(req.headers || {}, null, 2));
        console.log('--- END WEBHOOK RAW ---');

        const eventAction   = body?.action || null;     // ej: 'payment.updated'
        const apiVersion    = body?.api_version || null; // ej: 'v1'
        const eventCreated  = body?.date_created || null;
        const eventLive     = body?.live_mode ?? null;
        const eventUserId   = body?.user_id ?? null;
        const eventId       = body?.id ?? null;          // id del EVENTO, no del pago

        // Tipo principal del evento
        // Puede venir en body.type o en querystring como topic/type
        let eventType = body?.type || q?.type || q?.topic || null; // 'payment' | 'merchant_order'

        // En algunos casos MP envía un campo `resource` con la URL del recurso
        const resourceUrl = body?.resource || null; // ej: https://api.mercadopago.com/v1/payments/123456

        // El ID del sujeto del evento
        // Para type==='payment', body.data.id es el payment_id.
        // Para type==='merchant_order', body.data.id es el merchant_order_id.
        let subjectId = body?.data?.id || q?.id || q?.payment_id || null;

        // Declaraciones anticipadas para poder usar en bloques siguientes
        let payment = null;
        let merchantOrder = null;

        // Si el proveedor incluyó ya el objeto merchant_order o payment en el body (útil para pruebas), úsalo directamente
        if (!merchantOrder && body?.merchant_order) {
            merchantOrder = body.merchant_order;
            // si todavía no tenemos subjectId, tratar de extraerlo
            subjectId = subjectId || merchantOrder?.id || null;
        }
        if (!payment && body?.payment) {
            payment = body.payment;
            subjectId = subjectId || payment?.id || null;
        }

        // Si vino `resource`, intenta inferir eventType/subjectId desde ahí
        if (resourceUrl && (!subjectId || !eventType)) {
            try {
                const u = new URL(resourceUrl);
                // .../v1/payments/{id}  OR  .../merchant_orders/{id}
                const parts = u.pathname.split('/').filter(Boolean);
                const last = parts[parts.length - 1];
                const prev = parts[parts.length - 2];
                if (!subjectId) subjectId = last;
                if (!eventType) {
                    eventType = prev === 'payments' ? 'payment' : (prev === 'merchant_orders' ? 'merchant_order' : null);
                }
            } catch {}
        }

        // Si ya tenemos el objeto merchantOrder o payment no es necesario llamar a la API externa
        if (!subjectId && !merchantOrder && !payment) {
            console.warn('Webhook sin subjectId ni entidad incluida en body:', { body, query: req.query });
            return res.status(400).json({ error: 'No se recibió id del recurso (data.id) ni entidad en body' });
        }

        // Log útil (no exponer en producción datos sensibles)
        console.log('Webhook MP recibido', {
            eventId,
            eventAction,
            eventType,
            apiVersion,
            eventCreated,
            eventLive,
            eventUserId,
            body_data_id: body?.data?.id,
            query_id: q?.id,
            query_payment_id: q?.payment_id,
            resourceUrl,
        });

        if (!subjectId && !merchantOrder && !payment) {
            console.warn('Webhook sin subjectId (payment_id o merchant_order_id):', { body, query: req.query });
            return res.status(400).json({ error: 'No se recibió id del recurso (data.id)' });
        }

        // ---------- Consulta de detalles al API de MP ----------
        const headers = {
            Authorization: `Bearer ${ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        };

        // Respuesta consolidada (las variables `payment` y `merchantOrder` ya fueron declaradas anteriormente)
        try {
            // Si no vienen ya incluidos en el body, hacer llamada a la API externa según el tipo
            if (!merchantOrder && !payment && (eventType === 'payment' || (eventAction && eventAction.startsWith('payment.')))) {
                 // Buscar el pago directo por v1/payments/{id}
                 const url = `https://api.mercadopago.com/v1/payments/${subjectId}`;
                 const resp = await fetch(url, { headers });
                 if (!resp.ok) {
                     const text = await resp.text();
                     console.error('Fallo al consultar el pago en la API:', resp.status, text);
                     return res.status(200).json({ received: true, lookup_error: true, type: 'payment' });
                 }
                 payment = await resp.json();
             } else if (!merchantOrder && !payment && (eventType === 'merchant_order' || (eventAction && eventAction.startsWith('merchant_order.')))) {
                 // Buscar la orden y, si existe, sus pagos asociados
                 const moUrl = `https://api.mercadopago.com/merchant_orders/${subjectId}`;
                 const moResp = await fetch(moUrl, { headers });
                 if (!moResp.ok) {
                     const text = await moResp.text();
                     console.error('Fallo al consultar merchant_order:', moResp.status, text);
                     return res.status(200).json({ received: true, lookup_error: true, type: 'merchant_order' });
                 }
                 merchantOrder = await moResp.json();
                 // Si la orden tiene pagos, opcionalmente trae el primero (o el aprobado)
                 const firstPaymentId = merchantOrder?.payments?.[0]?.id;
                 if (firstPaymentId && !payment) {
                     const pUrl = `https://api.mercadopago.com/v1/payments/${firstPaymentId}`;
                     const pResp = await fetch(pUrl, { headers });
                     if (pResp.ok) payment = await pResp.json();
                 }
             }
          } catch (e) {
            console.error('Error inesperado consultando el recurso en MP:', e);
            return res.status(200).json({ received: true, lookup_exception: true });
        }

        // ---------- Logs útiles y tu lógica de negocio ----------
        if (payment) {
            console.log('Pago verificado desde API:', {
                id: payment.id,
                status: payment.status,
                status_detail: payment.status_detail,
                order_id: payment.order?.id || payment.order_id || null,
                payer: {
                    id: payment.payer?.id || null,
                    email: payment.payer?.email || null,
                },
                transaction_amount: payment.transaction_amount,
                currency_id: payment.currency_id,
            });
        }
        if (merchantOrder) {
            console.log('Merchant Order verificada desde API:', {
                id: merchantOrder.id,
                preference_id: merchantOrder.preference_id,
                total_amount: merchantOrder.total_amount,
                paid_amount: merchantOrder.paid_amount,
                order_status: merchantOrder.order_status,
                payments: merchantOrder.payments?.map(p => ({ id: p.id, status: p.status })),
            });
        }


        // Persistir información relevante de la Merchant Order / Payment en la DB
        const mercadoPagoClase = new MercadoPago();
        try {
            // Priorizar merchantOrder si existe, sino inferir desde payment
            const mpId = merchantOrder?.id ?? payment?.order?.id ?? payment?.order_id ?? subjectId;
            const preferenceId = merchantOrder?.preference_id ?? payment?.preference_id ?? null;
            const totalAmount = merchantOrder?.total_amount ?? payment?.transaction_amount ?? null;
            const paidAmount = merchantOrder?.paid_amount ?? (payment?.transaction_amount ?? 0);
            const orderStatus = merchantOrder?.order_status ?? payment?.status ?? null;

            console.log('Guardando en DB - MercadoPago:', { mpId, preferenceId, totalAmount, paidAmount, orderStatus });

            const respuesta = await mercadoPagoClase.insertarDataMercadoPago(mpId, preferenceId, totalAmount, paidAmount, orderStatus);
            console.log('Resultado insertarDataMercadoPago:', respuesta);
        } catch (e) {
            console.error('Error guardando registro MercadoPago en DB:', e);
        }

        // TODO: Persistir en tu DB (pagos/pedidos) e idempotencia
        // - Buscar el pedido por external_reference (usaste idPedido en createOrder)
        // - Guardar payment.id, status, montos, payer.email, etc.
        // - Si status==='approved' => marcar pedido como pagado

        return res.status(200).json({ received: true });

    } catch (err) {
        console.error('Error en recibirPago:', err);
        return res.status(500).json({ error: 'Error interno al procesar webhook' });
    }


};
