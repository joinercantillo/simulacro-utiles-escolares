import { Router, type Request, type Response } from "express";
import Warehouse, { createWarehouseSchema, updateWarehouseSchema } from "../models/warehouse.model";
import { Inventory, SchoolSupply } from "../models";
import { authenticateToken, authorizeRoles } from "../middlewares/auth";

const router = Router();
router.use(authenticateToken);

/**
 * @swagger
 * /warehouse:
 *   get:
 *     summary: Obtener todos los almacenes
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Lista de almacenes }
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const warehouses = await Warehouse.findAll({
      where: { isActive: true },
      include: [{ model: Inventory, as: "inventories", include: [{ model: SchoolSupply, as: "schoolSupply" }] }],
    });
    res.json(warehouses);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener almacenes", error });
  }
});

/**
 * @swagger
 * /warehouse/{id}:
 *   get:
 *     summary: Obtener almacén por ID con inventario
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Almacén encontrado }
 *       404: { description: Almacén no encontrado }
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const warehouse = await Warehouse.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{ model: Inventory, as: "inventories", include: [{ model: SchoolSupply, as: "schoolSupply" }] }],
    });
    if (!warehouse) return res.status(404).json({ message: "Almacén no encontrado" });
    res.json(warehouse);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el almacén", error });
  }
});

/**
 * @swagger
 * /warehouse:
 *   post:
 *     summary: Crear almacén (solo admin)
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, location, responsibleName, responsibleEmail]
 *             properties:
 *               name: { type: string, example: "Bodega Central" }
 *               location: { type: string, example: "Zona Industrial Norte" }
 *               responsibleName: { type: string, example: "Ana Torres" }
 *               responsibleEmail: { type: string, example: "ana@riwischool.co" }
 *     responses:
 *       201: { description: Almacén creado }
 *       400: { description: Datos inválidos }
 */
router.post("/", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = createWarehouseSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  try {
    const warehouse = await Warehouse.create(result.data);
    res.status(201).json({ message: "Almacén creado", warehouse });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el almacén", error });
  }
});

/**
 * @swagger
 * /warehouse/{id}:
 *   put:
 *     summary: Actualizar almacén (solo admin)
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Almacén actualizado }
 *       400: { description: Datos inválidos }
 *       404: { description: Almacén no encontrado }
 */
router.put("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  const result = updateWarehouseSchema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map(i => ({ campo: i.path.join("."), mensaje: i.message }));
    return res.status(400).json({ message: "Datos inválidos", errors });
  }

  if (Object.keys(result.data).length === 0) {
    return res.status(400).json({ message: "Debe proporcionar al menos un campo para actualizar" });
  }

  try {
    const warehouse = await Warehouse.findOne({ where: { id: req.params.id, isActive: true } });
    if (!warehouse) return res.status(404).json({ message: "Almacén no encontrado" });

    await warehouse.update(result.data);
    res.json({ message: "Almacén actualizado", warehouse });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el almacén", error });
  }
});

/**
 * @swagger
 * /warehouse/{id}:
 *   delete:
 *     summary: Eliminar almacén (baja lógica, solo admin)
 *     tags: [Almacenes]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Almacén eliminado }
 *       404: { description: Almacén no encontrado }
 */
router.delete("/:id", authorizeRoles("admin"), async (req: Request, res: Response) => {
  try {
    const warehouse = await Warehouse.findOne({ where: { id: req.params.id, isActive: true } });
    if (!warehouse) return res.status(404).json({ message: "Almacén no encontrado" });

    await warehouse.update({ isActive: false });
    res.json({ message: "Almacén eliminado lógicamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el almacén", error });
  }
});

export default router;
