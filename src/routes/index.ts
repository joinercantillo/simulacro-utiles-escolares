import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import clinicRoutes from "./clinic.routes";
import warehouseRoutes from "./warehouse.routes";
import medicationRoutes from "./medication.routes";
import supplyRequestRoutes from "./supplyRequest.routes";
import inventoryRoutes from "./inventory.routes";
import seederRoutes from "./seeder.routes";

const router = Router();

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

export default router;