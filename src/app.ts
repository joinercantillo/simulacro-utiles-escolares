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

export { app, startServer };