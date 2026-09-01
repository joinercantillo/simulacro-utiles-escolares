import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import clinicRoutes from "./clinic.routes";
import warehouseRoutes from "./warehouse.routes";
import medicationRoutes from "./medication.routes";
import supplyRequestRoutes from "./supplyRequest.routes";
import inventoryRoutes from "./inventory.routes";
import seederRoutes from "./seeder.routes";

const router = Router();

/**
 * Endpoint de verificación de salud de la API.
 * GET /api/health
 * @param _req Request de Express.
 * @param res Response de Express.
 * @returns Respuesta JSON indicando que la API está funcionando.
 */
router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "API RiwiMediCare Plus funcionando" });
});

router.use("/auth", authRoutes);
router.use("/clinics", clinicRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/medications", medicationRoutes);
router.use("/requests", supplyRequestRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/seeders", seederRoutes);

/**
 * Router principal de la API que agrupa las rutas de autenticación, clínicas, almacenes, medicamentos, solicitudes, inventario y seeders.
 */
export default router;