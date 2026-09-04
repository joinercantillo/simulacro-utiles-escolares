import { Router, type Request, type Response } from "express";
import { School, Inventory, SchoolSupply, SupplyRequest, Warehouse } from "../models";
import { createSupplyRequestSchema, updateSupplyRequestStatusSchema } from "../models/supplyRequest.model";
import { RequestStatus } from "../types";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();
router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Requests
 *   description: Supply request management
 */

/**
 * @swagger
 * /request:
 *   post:
 *     summary: Create supply request
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [schoolId, schoolSupplyId, warehouseId, quantityRequested]
 *             properties:
 *               schoolId: { type: integer, example: 1 }
 *               schoolSupplyId: { type: integer, example: 1 }
 *               warehouseId: { type: integer, example: 1 }
 *               quantityRequested: { type: integer, example: 20 }
 *               notes: { type: string, example: "Entrega urgente" }
 *     responses:
 *       201: { description: Request created }
 *       400: { description: Validation failed }
 *       404: { description: School, school supply or warehouse not found }
 */
router.post("/", async (req: Request, res: Response) => {
  const result = createSupplyRequestSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const { schoolId, schoolSupplyId, warehouseId, quantityRequested, notes } = result.data;

    const school = await School.findOne({ where: { id: schoolId, isActive: true } });
    if (!school) return res.status(404).json({ message: "School not found" });

    const schoolSupply = await SchoolSupply.findOne({ where: { id: schoolSupplyId, isActive: true } });
    if (!schoolSupply) return res.status(404).json({ message: "School supply not found" });

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    const inventory = await Inventory.findOne({ where: { warehouseId, schoolSupplyId } });
    if (!inventory || inventory.quantity < quantityRequested) {
      return res.status(400).json({ message: "The warehouse does not have enough inventory of the requested school supply" });
    }

    const supplyRequest = await SupplyRequest.create({
      schoolId, schoolSupplyId, warehouseId, quantityRequested,
      status: RequestStatus.PENDIENTE, notes: notes || "",
    });

    inventory.quantity -= quantityRequested;
    await inventory.save();

    return res.status(201).json(supplyRequest);
  } catch (error) {
    return res.status(500).json({ message: "Error creating the request", error });
  }
});

/**
 * @swagger
 * /request/active:
 *   get:
 *     summary: List active requests
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of active requests }
 */
router.get("/active", async (req: Request, res: Response) => {
  try {
    const requests = await SupplyRequest.findAll({
      where: {
        isActive: true,
        status: [RequestStatus.PENDIENTE, RequestStatus.EN_PROCESO, RequestStatus.APROBADA],
      },
      include: [
        { model: School, as: "school" },
        { model: SchoolSupply, as: "schoolSupply" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Error getting active requests", error });
  }
});

/**
 * @swagger
 * /request/all:
 *   get:
 *     summary: Full request history
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Full list of requests }
 */
router.get("/all", async (req: Request, res: Response) => {
  try {
    const requests = await SupplyRequest.findAll({
      where: { isActive: true },
      include: [
        { model: School, as: "school" },
        { model: SchoolSupply, as: "schoolSupply" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });
    return res.json(requests);
  } catch (error) {
    return res.status(500).json({ message: "Error getting the requests", error });
  }
});

/**
 * @swagger
 * /request/school/{schoolId}:
 *   get:
 *     summary: Request history by school
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: School history }
 *       404: { description: School not found }
 */
router.get("/school/:schoolId", async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const school = await School.findOne({ where: { id: schoolId, isActive: true } });
    if (!school) return res.status(404).json({ message: "School not found" });

    const requests = await SupplyRequest.findAll({
      where: { schoolId, isActive: true },
      include: [
        { model: SchoolSupply, as: "schoolSupply" },
        { model: Warehouse, as: "warehouse" },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.json({ school, requests });
  } catch (error) {
    return res.status(500).json({ message: "Error getting the school history", error });
  }
});

/**
 * @swagger
 * /request/{id}/status:
 *   patch:
 *     summary: Update the status of a request
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [pendiente, en_proceso, aprobada, rechazada, completada], example: "aprobada" }
 *     responses:
 *       200: { description: Request updated }
 *       400: { description: Status not allowed }
 *       404: { description: Request not found }
 */
router.patch("/:id/status", async (req: Request, res: Response) => {
  const result = updateSupplyRequestStatusSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Invalid data", errors });
  }

  try {
    const supplyRequest = await SupplyRequest.findOne({ where: { id: req.params.id, isActive: true } });
    if (!supplyRequest) return res.status(404).json({ message: "Request not found" });

    await supplyRequest.update({ status: result.data.status as any });
    return res.json(supplyRequest);
  } catch (error) {
    return res.status(500).json({ message: "Error updating the request", error });
  }
});

/**
 * @swagger
 * /request/{id}:
 *   delete:
 *     summary: Delete request (soft delete, admin only)
 *     tags: [Requests]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Request deleted }
 *       404: { description: Request not found }
 */
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const supplyRequest = await SupplyRequest.findOne({ where: { id: req.params.id, isActive: true } });
    if (!supplyRequest) return res.status(404).json({ message: "Request not found" });

    await supplyRequest.update({ isActive: false });
    return res.json({ message: "Request soft deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting the request", error });
  }
});

export default router;
