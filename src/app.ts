import express, { Application, Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import routes from "./routes";
import swaggerSpec from "./swagger/swagger";

dotenv.config();

import "./models";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api", routes);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

/**
 * Inicializa el servidor Express, conecta la base de datos y comienza a escuchar en el puerto configurado.
 * @returns Promesa que se resuelve cuando el servidor está listo.
 * @throws Si no se puede conectar a la base de datos, termina el proceso.
 */
async function startServer(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL establecida correctamente");

    await sequelize.sync({ alter: false });

    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
      console.log(`Documentación Swagger en http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("No se pudo conectar con la base de datos:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

/**
 * Aplicación Express principal del servidor.
 * @returns Instancia de la aplicación Express y la función startServer que la inicia.
 */
export { app, startServer };