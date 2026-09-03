import { Router, type Request, type Response } from "express";
import { School, Inventory, SchoolSupply, SupplyRequest, Warehouse } from "../models";
import { createSupplyRequestSchema, updateSupplyRequestStatusSchema } from "../models/supplyRequest.model";
import { RequestStatus } from "../types";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();
router.use(authenticateToken);

/** @swagger
 * tags:
 *   name: Solicitudes
 *   description: Gestión de solicitudes de abastecimiento
 */

/**
 * @swagger
 * /request:
 *   post:
 *     summary: Crear solicitud de abastecimiento
 *     tags: [Solicitudes]
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
 *       201: { description: Solicitud creada }
 *       400: { description: Validación fallida }
 *       404: { description: Institución, suministro escolar o almacén no encontrado }
 */
router.post("/", async (req: Request, res: Response) => {
  const result = createSupplyRequestSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const { schoolId, schoolSupplyId, warehouseId, quantityRequested, notes } = result.data;

    const school = await School.findOne({ where: { id: schoolId, isActive: true } });
    if (!school) return res.status(404).json({ message: "Institución no encontrada" });

    const schoolSupply = await SchoolSupply.findOne({ where: { id: schoolSupplyId, isActive: true } });
    if (!schoolSupply) return res.status(404).json({ message: "Suministro escolar no encontrado" });

    const warehouse = await Warehouse.findOne({ where: { id: warehouseId, isActive: true } });
    if (!warehouse) return res.status(404).json({ message: "Almacén no encontrado" });

    const inventory = await Inventory.findOne({ where: { warehouseId, schoolSupplyId } });
    if (!inventory || inventory.quantity < quantityRequested) {
      return res.status(400).json({ message: "El almacén no tiene inventario suficiente del suministro escolar solicitado" });
    }

    const supplyRequest = await SupplyRequest.create({
      schoolId, schoolSupplyId, warehouseId, quantityRequested,
      status: RequestStatus.PENDIENTE, notes: notes || "",
    });

    inventory.quantity -= quantityRequested;
    await inventory.save();

    return res.status(201).json(supplyRequest);
  } catch (error) {
    return res.status(500).json({ message: "Error al crear la solicitud", error });
  }
});

/**
 * @swagger
 * /request/active:
 *   get:
 *     summary: Listar solicitudes activas
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de solicitudes activas }
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
    return res.status(500).json({ message: "Error al obtener las solicitudes activas", error });
  }
});

/**
 * @swagger
 * /request/all:
 *   get:
 *     summary: Historial completo de solicitudes
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista completa de solicitudes }
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
    return res.status(500).json({ message: "Error al obtener las solicitudes", error });
  }
});

/**
 * @swagger
 * /request/school/{schoolId}:
 *   get:
 *     summary: Historial de solicitudes por institución
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: schoolId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Historial de la institución }
 *       404: { description: Institución no encontrada }
 */
router.get("/school/:schoolId", async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const school = await School.findOne({ where: { id: schoolId, isActive: true } });
    if (!school) return res.status(404).json({ message: "Institución no encontrada" });

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
    return res.status(500).json({ message: "Error al obtener el historial de la institución", error });
  }
});

/**
 * @swagger
 * /request/{id}/status:
 *   patch:
 *     summary: Actualizar estado de una solicitud
 *     tags: [Solicitudes]
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
 *       200: { description: Solicitud actualizada }
 *       400: { description: Estado no permitido }
 *       404: { description: Solicitud no encontrada }
 */
router.patch("/:id/status", async (req: Request, res: Response) => {
  const result = updateSupplyRequestStatusSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const supplyRequest = await SupplyRequest.findOne({ where: { id: req.params.id, isActive: true } });
    if (!supplyRequest) return res.status(404).json({ message: "Solicitud no encontrada" });

    await supplyRequest.update({ status: result.data.status as any });
    return res.json(supplyRequest);
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar la solicitud", error });
  }
});

/**
 * @swagger
 * /request/{id}:
 *   delete:
 *     summary: Eliminar solicitud (baja lógica, solo admin)
 *     tags: [Solicitudes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Solicitud eliminada }
 *       404: { description: Solicitud no encontrada }
 */
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const supplyRequest = await SupplyRequest.findOne({ where: { id: req.params.id, isActive: true } });
    if (!supplyRequest) return res.status(404).json({ message: "Solicitud no encontrada" });

    await supplyRequest.update({ isActive: false });
    return res.json({ message: "Solicitud eliminada lógicamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error al eliminar la solicitud", error });
  }
});

export default router;
