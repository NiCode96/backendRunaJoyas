import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productoRoute from "./view/productoRoutes.js";
import tituloRoutes from "./view/tituloRoutes.js";
import textosRoutes from "./view/textosRoutes.js";
import categoriaRoutes from "./view/categoriaRoutes.js";
import publicacionesRoutes from "./view/publicacionesRoutes.js";



const app = express();
app.use(express.json()); // 👈 NECESARIO para leer req.body
app.use(cookieParser()); // 👈 Necesario para leer/escribir cookies (JWT)
app.use(cors({
  origin: "http://localhost:3000", // Frontend Next.js en local
  credentials: true                // Permite enviar/recibir cookies
}))


app.get("/", (req, res) => { res.send("Hola mundo"); });
app.use("/producto", productoRoute);
app.use("/titulo", tituloRoutes);
app.use("/textos", textosRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/publicaciones", publicacionesRoutes);



// app.set("trust proxy", 1); // 👉 Descomenta en producción detrás de proxy (para cookies 'secure')
app.listen(3001, () => {
  console.log('http://localhost:3001/')
})