import express, { Application, Request, Response } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import dotenv from "dotenv";
import sequelize from "./config/database";
import swaggerSpec from "./swagger/swagger";

import authRouter from "./routes/auth.router";
import schoolRouter from "./routes/school.router";
import warehouseRouter from "./routes/warehouse.router";
import schoolSupplyRouter from "./routes/schoolSupply.router";
import supplyRequestRouter from "./routes/supplyRequest.router";
import inventoryRouter from "./routes/inventory.router";
import seederRouter from "./routes/seeder.router";

dotenv.config();

import "./models";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "RiwiSchool Plus API running" });
});

app.use("/api/auth", authRouter);
app.use("/api/school", schoolRouter);
app.use("/api/warehouse", warehouseRouter);
app.use("/api/school-supply", schoolSupplyRouter);
app.use("/api/request", supplyRequestRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/seeder", seederRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

/**
 * Initializes the Express server, connects to the database and starts listening on the configured port.
 * @returns Promise that resolves when the server is ready.
 * @throws If the database cannot be connected, terminates the process.
 */
async function startServer(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("PostgreSQL connection established successfully");

    await sequelize.sync({ alter: false });

    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      console.log(`Swagger documentation at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("Could not connect to the database:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

/**
 * Main Express application of the server.
 * @returns Express application instance and the startServer function that starts it.
 */
export { app, startServer };