import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productoRoute from "./view/productoRoutes.js";
import tituloRoutes from "./view/tituloRoutes.js";
import textosRoutes from "./view/textosRoutes.js";
import categoriaRoutes from "./view/categoriaRoutes.js";
import publicacionesRoutes from "./view/publicacionesRoutes.js";
import contactoRouter from "./view/contactoRoutes.js";
import mercadoPagoRouter from "./view/mercadoPagoRoutes.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

const ALLOWLIST = [
  'https://runa-joyas-pruebas1-5yj4.vercel.app',
  'http://localhost:3000'
];

const corsConfig = {
  origin: (origin, cb) => cb(null, !origin || ALLOWLIST.includes(origin)),
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsConfig));

app.get("/", (req, res) => { res.send("Hola mundo"); });
app.use("/pagosMercadoPago", mercadoPagoRouter);
app.use("/producto", productoRoute);
app.use("/titulo", tituloRoutes);
app.use("/textos", textosRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/publicaciones", publicacionesRoutes);
app.use('/contacto', contactoRouter );

app.listen(3001, () => {
  console.log('http://localhost:3001/')
})