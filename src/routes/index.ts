import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import schoolRoutes from "./school.routes";
import warehouseRoutes from "./warehouse.routes";
import schoolSupplyRoutes from "./schoolSupply.routes";
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
  res.json({ status: "ok", message: "API RiwiSchool Plus funcionando" });
});

router.use("/auth", authRoutes);
router.use("/schools", schoolRoutes);
router.use("/warehouses", warehouseRoutes);
router.use("/school-supplies", schoolSupplyRoutes);
router.use("/requests", supplyRequestRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/seeders", seederRoutes);

/**
 * Router principal de la API que agrupa las rutas de autenticación, instituciones, almacenes, suministros escolares, solicitudes, inventario y seeders.
 */
export default router;